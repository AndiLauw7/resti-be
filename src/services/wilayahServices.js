const axios = require("axios");
const BINDERBYTE_API = "https://api.binderbyte.com/wilayah";

async function getProvinces() {
  try {
    const response = await axios.get(`${BINDERBYTE_API}/provinsi`, {
      params: { api_key: process.env.BINDERBYTE_API_KEY },
    });
    return response.data;
  } catch (error) {
    console.error("Error ambil provinsi:", error.message);
    throw new Error("Gagal ambil daftar provinsi");
  }
}

async function getCities(id_provinsi) {
  try {
    const response = await axios.get(`${BINDERBYTE_API}/kabupaten`, {
      params: {
        api_key: process.env.BINDERBYTE_API_KEY,
        id_provinsi,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error ambil kabupaten:", error.message);
    throw new Error("Gagal ambil daftar kabupaten");
  }
}

module.exports = { getProvinces, getCities };
