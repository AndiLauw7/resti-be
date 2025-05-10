"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Produk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Produk.belongsTo(models.Kategori, { foreignKey: "kategoriId" });
      Produk.hasMany(models.TransaksiItems, { foreignKey: "produkId" });
      Produk.hasMany(models.TransaksiItems, { foreignKey: "produkId" });
    }
  }
  Produk.init(
    {
      nama: DataTypes.STRING,
      harga: DataTypes.DECIMAL,
      stok: DataTypes.INTEGER,
      kategoriId: DataTypes.INTEGER,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Produk",
    }
  );
  return Produk;
};
