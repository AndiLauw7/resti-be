// require("dotenv").config();
// console.log("Server Key:", process.env.MIDTRANS_SERVER_KEY);

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('penjualan_db', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mariadb',
  logging: false,
});

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

test();
