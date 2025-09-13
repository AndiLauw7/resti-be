const axios = require("axios");
const BINDERBYTE_API = "https://api.binderbyte.com/v1";

async function trackResi({ courier, awb }) {
  try {
    const response = await axios.get(`${BINDERBYTE_API}/track`, {
      params: {
        api_key: process.env.BINDERBYTE_API_KEY,
        courier,
        awb,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error track resi:", error.message);
    throw new Error("Gagal tracking resi");
  }
}

module.exports = { trackResi };
