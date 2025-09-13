// async function cekOngkir({ origin, destination, weight, courier, price }) {
//   try {
//     const params = new URLSearchParams();
//     params.append("origin", origin);
//     params.append("destination", destination);
//     params.append("weight", weight);
//     params.append("courier", courier);
//     if (price) params.append("price", price); // optional: "lowest" atau "highest"

//     console.log("🔍 Payload RajaOngkir (form-urlencoded):", params.toString());

//     const response = await axios.post(
//       "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost",
//       params.toString(),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           key: process.env.RAJAONGKIR_API_KEY,
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Error cek ongkir:", error.response?.data || error.message);
//     throw new Error("Gagal cek ongkir RajaOngkir");
//   }
// }

// module.exports = { cekOngkir };

const axios = require("axios");

const RAJAONGKIR_API = "https://rajaongkir.komerce.id/api/v1";

const qs = require("qs"); // untuk encode form data

async function cekOngkir({ origin, destination, weight, courier }) {
  try {
    const payload = qs.stringify({
      origin,
      destination,
      weight,
      courier,
      // price bisa dikosongkan dulu
    });

    console.log("🔍 Payload RajaOngkir:", payload);

    const response = await axios.post(
      `${RAJAONGKIR_API}/calculate/domestic-cost`,
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          key: process.env.RAJAONGKIR_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error cek ongkir:", error.response?.data || error.message);
    throw new Error("Gagal cek ongkir RajaOngkir");
  }
}

module.exports = { cekOngkir };
