"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Produk extends Model {
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
      deskripsi: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      keterangan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Produk",
    }
  );
  return Produk;
};
