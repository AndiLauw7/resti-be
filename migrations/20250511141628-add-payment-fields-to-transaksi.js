"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Transaksis", "status", {
      type: Sequelize.ENUM("pending", "paid", "failed"),
      allowNull: false,
      defaultValue: "pending",
    });
    await queryInterface.addColumn("Transaksis", "paymentUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Transaksis", "paymentMethod", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Transaksis", "paymentMethod");
    await queryInterface.removeColumn("Transaksis", "paymentUrl");
    await queryInterface.removeColumn("Transaksis", "status");
  },
};
