const sequelize = require("../config/database");
const {
  Category,
  Product,
  Customer,
  Sale,
  SaleItem
} = require("../models");
const { prefixedId } = require("../utils/ids");

const SALES_PATTERN = [
  { daysAgo: 5, hour: 9, quantity: 2 },
  { daysAgo: 5, hour: 13, quantity: 3 },
  { daysAgo: 4, hour: 10, quantity: 4 },
  { daysAgo: 4, hour: 16, quantity: 2 },
  { daysAgo: 3, hour: 11, quantity: 5 },
  { daysAgo: 3, hour: 15, quantity: 4 },
  { daysAgo: 2, hour: 10, quantity: 6 },
  { daysAgo: 2, hour: 14, quantity: 5 },
  { daysAgo: 1, hour: 9, quantity: 7 },
  { daysAgo: 1, hour: 17, quantity: 6 }
];

function buildSoldAt(daysAgo, hour) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function findOrCreateCategory(transaction) {
  const existing = await Category.findOne({
    where: { name: "Forecast Seed" },
    transaction
  });

  if (existing) {
    return existing;
  }

  return Category.create(
    {
      name: "Forecast Seed",
      description: "Kategori seed untuk pengujian forecast"
    },
    { transaction }
  );
}

async function findOrCreateProduct(categoryId, transaction) {
  const existing = await Product.findOne({
    where: { name: "Kopi Forecast" },
    transaction
  });

  if (existing) {
    const nextStock = Math.max(existing.stock, 200);
    if (nextStock !== existing.stock) {
      await existing.update({ stock: nextStock }, { transaction });
    }
    return existing;
  }

  return Product.create(
    {
      id: prefixedId("PRD"),
      name: "Kopi Forecast",
      stock: 200,
      price: 18000,
      categoryId
    },
    { transaction }
  );
}

async function findOrCreateCustomer(transaction) {
  const existing = await Customer.findOne({
    where: { phoneNumber: "whatsapp:+6281111111111" },
    transaction
  });

  if (existing) {
    return existing;
  }

  return Customer.create(
    {
      name: "Pelanggan Forecast",
      phoneNumber: "whatsapp:+6281111111111",
      whatsappOptIn: false
    },
    { transaction }
  );
}

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const result = await sequelize.transaction(async (transaction) => {
      const category = await findOrCreateCategory(transaction);
      const product = await findOrCreateProduct(category.id, transaction);
      const customer = await findOrCreateCustomer(transaction);

      let totalQuantity = 0;

      for (const pattern of SALES_PATTERN) {
        const soldAt = buildSoldAt(pattern.daysAgo, pattern.hour);
        const invoice = `SEED-${soldAt.toISOString().slice(0, 10)}-${pattern.hour}`;

        const existingSale = await Sale.findOne({
          where: { invoiceNumber: invoice },
          transaction
        });

        if (existingSale) {
          continue;
        }

        const subtotal = pattern.quantity * Number(product.price);
        const sale = await Sale.create(
          {
            customerId: customer.id,
            invoiceNumber: invoice,
            subtotal,
            total: subtotal,
            soldAt,
            paymentMethod: "cash"
          },
          { transaction }
        );

        await SaleItem.create(
          {
            saleId: sale.id,
            productId: product.id,
            quantity: pattern.quantity,
            unitPrice: product.price,
            subtotal
          },
          { transaction }
        );

        totalQuantity += pattern.quantity;
      }

      if (totalQuantity > 0) {
        await product.update(
          { stock: product.stock - totalQuantity },
          { transaction }
        );
      }

      return {
        createdSales: SALES_PATTERN.length,
        productId: product.id,
        remainingStock: product.stock - totalQuantity
      };
    });

    console.log("Forecast seed completed:", result);
  } catch (error) {
    console.error("Forecast seed failed:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
