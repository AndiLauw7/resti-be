"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      message.belongsTo(models.Pengguna, {
        foreignKey: "sendId",
        as: "Sender",
      });
      message.belongsTo(models.Pengguna, {
        foreignKey: "receiveId",
        as: "Receiver",
      });
    }
  }
  message.init(
    {
      sendId: DataTypes.INTEGER,
      receiveId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "message",
    }
  );
  return message;
};
