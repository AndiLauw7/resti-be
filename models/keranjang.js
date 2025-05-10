"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class keranjang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      keranjang.belongsTo(models.Pengguna, { foreignKey: "penggunaId" });
      keranjang.belongsTo(models.Produk, { foreignKey: "produkId" });
    }
  }
  keranjang.init(
    {
      penggunaId: DataTypes.INTEGER,
      produkId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      totalHarga: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "keranjang",
    }
  );
  return keranjang;
};
