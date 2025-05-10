"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransaksiItems extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TransaksiItems.belongsTo(models.Transaksi, { foreignKey: "transaksiId" });
      TransaksiItems.belongsTo(models.Produk, { foreignKey: "produkId" });
    }
  }
  TransaksiItems.init(
    {
      transaksiId: DataTypes.INTEGER,
      produkId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      subtotal: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "TransaksiItems",
    }
  );
  return TransaksiItems;
};
