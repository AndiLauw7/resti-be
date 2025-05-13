"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransaksiItems extends Model {
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
