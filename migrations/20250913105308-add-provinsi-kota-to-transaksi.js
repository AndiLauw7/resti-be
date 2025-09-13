"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Transaksis", "provinsi", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Transaksis", "kota", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Transaksis", "provinsi");
    await queryInterface.removeColumn("Transaksis", "kota");
  },
};
