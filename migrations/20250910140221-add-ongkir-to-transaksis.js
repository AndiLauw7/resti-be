"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Transaksis", "ongkir", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("Transaksis", "kurir", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Transaksis", "layanan", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Transaksis", "estimasi", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Transaksis", "ongkir");
    await queryInterface.removeColumn("Transaksis", "kurir");
    await queryInterface.removeColumn("Transaksis", "layanan");
    await queryInterface.removeColumn("Transaksis", "estimasi");
  },
};
