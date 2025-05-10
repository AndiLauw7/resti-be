"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Pengguna extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Pengguna.hasMany(models.Transaksi, {
        foreignKey: "penggunaId",
      });
      Pengguna.hasMany(models.keranjang, {
        foreignKey: "penggunaId",
      });
    }
  }
  Pengguna.init(
    {
      nama: DataTypes.STRING,
      email: DataTypes.STRING,
      alamat: DataTypes.STRING,
      nohp: DataTypes.STRING,
      image: DataTypes.STRING,
      password: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("admin", "pembeli"),
        allowNull: false,
        defaultValue: "pembeli",
      },
    },
    {
      sequelize,
      modelName: "Pengguna",
    }
  );
  return Pengguna;
};
