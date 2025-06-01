const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("", "root", "", {
  host: "localhost",
  dialect: "mariadb",
  logging: false,
});

async function createDatabase() {
  try {
    await sequelize.query("CREATE DATABASE IF NOT EXISTS nama_database;");
    console.log("Database berhasil dibuat!");
  } catch (error) {
    console.error("Error membuat database:", error);
  } finally {
    await sequelize.close();
  }
}

createDatabase();
