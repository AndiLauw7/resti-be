"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("penggunas", "provinsi", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("penggunas", "kota", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("penggunas", "kecamatan", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("penggunas", "kodePos", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("penggunas", "provinsi");
    await queryInterface.removeColumn("penggunas", "kota");
    await queryInterface.removeColumn("penggunas", "kecamatan");
    await queryInterface.removeColumn("penggunas", "kodePos");
  },
};
