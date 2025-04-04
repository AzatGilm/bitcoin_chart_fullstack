require("dotenv").config({ path: "../.env" });
const express = require("express");
const { Pool } = require("pg");
const {
  BitCoinPriceController,
} = require("./controllers/BitCoinPriceController");
const { BitCoinPriceModel } = require("./models/BitCoinPriceModel");
const { ApiClient } = require("./models/ApiClient");
const { db } = require("./models/db");

const app = express();
const port = process.env.API_PORT || 3000;
app.use(express.json);

const apiClient = new ApiClient();
const model = new BitCoinPriceModel(db, apiClient);
const controller = new BitCoinPriceController(model);

app.get("api/prices", async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }
    const result = await controller.getBitcoinPrices(start, end);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Роут для обновления данных
app.post("/api/update-prices", async (req, res) => {
  try {
    await controller.updateBitCoinPrices();
    res.json({ success: true, message: "Prices updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function initDB() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bitcoin_prices(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT,    
      price NUMERIC NOT NULL,
      UNIQUE (timestamp)
      )
    `);
    console.log('DB initialized');
    await controller.updateBitCoinPrices();
  } catch (error) {
    console.error('DB initialization error:',error);
  }
}

app.listen(port, () => {
  console.log(`Server is listening ${port}`);
  initDB();
});
