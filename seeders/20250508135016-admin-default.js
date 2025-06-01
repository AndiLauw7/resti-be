"use strict";

const { hashingPassrowd } = require("../src/utils/hashingPassword");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const hashedPassword = await hashingPassrowd("admin123456", 10);
    await queryInterface.bulkInsert("Penggunas", [
      {
        nama: "Admin Utama",
        email: "admin@example.com",
        alamat: "Kantor Pusat",
        nohp: "081234567890",
        image: null,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Penggunas", {
      email: "admin@example.com",
    });
  },
};
