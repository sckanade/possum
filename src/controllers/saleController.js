const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { Customer, Product, Sale, SaleItem } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { validateRequired } = require("../middlewares/validate");
const { invoiceNumber } = require("../utils/ids");
const { sendPurchaseNotification } = require("../services/whatsappService");

const DEFAULT_CUSTOMER_NAME = "anon";
const DEFAULT_PHONE_NUMBER = "+620000000000";

function normalizeCustomerPayload(customer = {}) {
  const normalizedName = String(customer.name || "").trim() || DEFAULT_CUSTOMER_NAME;
  const normalizedPhone = String(customer.phoneNumber || "").trim() || DEFAULT_PHONE_NUMBER;
  const isDefaultPhone = normalizedPhone === DEFAULT_PHONE_NUMBER;

  return {
    name: normalizedName,
    phoneNumber: normalizedPhone,
    whatsappOptIn: isDefaultPhone ? false : customer.whatsappOptIn ?? true
  };
}

const saleInclude = [
  { model: Customer, as: "customer" },
  {
    model: SaleItem,
    as: "items",
    include: [{ model: Product, as: "product" }]
  }
];

const listSales = asyncHandler(async (_req, res) => {
  const sales = await Sale.findAll({
    include: saleInclude,
    order: [["soldAt", "DESC"]]
  });

  res.json(sales);
});

const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findByPk(req.params.saleId, {
    include: saleInclude
  });

  if (!sale) {
    throw new AppError(404, "Sale not found");
  }

  res.json(sale);
});

const createSale = asyncHandler(async (req, res) => {
  validateRequired(["customer", "items"], req.body);

  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    throw new AppError(400, "Sale items must be a non-empty array");
  }

  const normalizedCustomer = normalizeCustomerPayload(req.body.customer);

  const result = await sequelize.transaction(async (transaction) => {
    let customer = await Customer.findOne({
      where: { phoneNumber: normalizedCustomer.phoneNumber },
      transaction
    });

    if (!customer) {
      customer = await Customer.create(
        {
          name: normalizedCustomer.name,
          phoneNumber: normalizedCustomer.phoneNumber,
          whatsappOptIn: normalizedCustomer.whatsappOptIn
        },
        { transaction }
      );
    } else if (
      customer.name !== normalizedCustomer.name ||
      customer.whatsappOptIn !== normalizedCustomer.whatsappOptIn
    ) {
      await customer.update(
        {
          name: normalizedCustomer.name,
          whatsappOptIn: normalizedCustomer.whatsappOptIn
        },
        { transaction }
      );
    }

    const productIds = req.body.items.map((item) => item.productId);
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      transaction
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    const saleItems = req.body.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new AppError(404, `Product not found: ${item.productId}`);
      }

      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        throw new AppError(400, "Item quantity must be at least 1");
      }

      if (product.stock < quantity) {
        throw new AppError(400, `Insufficient stock for product ${product.name}`);
      }

      const unitPrice = Number(product.price);
      return {
        product,
        quantity,
        unitPrice,
        subtotal: unitPrice * quantity
      };
    });

    const subtotal = saleItems.reduce((total, item) => total + item.subtotal, 0);

    const sale = await Sale.create(
      {
        customerId: customer.id,
        invoiceNumber: invoiceNumber(),
        subtotal,
        total: subtotal,
        soldAt: req.body.soldAt || new Date(),
        paymentMethod: req.body.paymentMethod || "cash"
      },
      { transaction }
    );

    for (const item of saleItems) {
      await SaleItem.create(
        {
          saleId: sale.id,
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        },
        { transaction }
      );

      await item.product.update(
        { stock: item.product.stock - item.quantity },
        { transaction }
      );
    }

    return sale;
  });

  const savedSale = await Sale.findByPk(result.id, { include: saleInclude });
  let notification = {
    delivered: false,
    reason: "Notification skipped"
  };

  if (savedSale.customer && savedSale.customer.whatsappOptIn) {
    notification = await sendPurchaseNotification({
      to: savedSale.customer.phoneNumber,
      customerName: savedSale.customer.name,
      invoiceNumber: savedSale.invoiceNumber,
      total: savedSale.total
    });
  }

  res.status(201).json({
    sale: savedSale,
    notification
  });
});

module.exports = {
  listSales,
  getSale,
  createSale
};
