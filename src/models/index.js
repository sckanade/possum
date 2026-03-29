const sequelize = require("../config/database");
const createCategory = require("./category");
const createProduct = require("./product");
const createCustomer = require("./customer");
const createSale = require("./sale");
const createSaleItem = require("./saleItem");
const createStoreProfile = require("./storeProfile");

const Category = createCategory(sequelize);
const Product = createProduct(sequelize);
const Customer = createCustomer(sequelize);
const Sale = createSale(sequelize);
const SaleItem = createSaleItem(sequelize);
const StoreProfile = createStoreProfile(sequelize);

Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

Customer.hasMany(Sale, { foreignKey: "customerId", as: "sales" });
Sale.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "items" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId", as: "sale" });

Product.hasMany(SaleItem, { foreignKey: "productId", as: "saleItems" });
SaleItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

module.exports = {
  sequelize,
  Category,
  Product,
  Customer,
  Sale,
  SaleItem,
  StoreProfile
};
