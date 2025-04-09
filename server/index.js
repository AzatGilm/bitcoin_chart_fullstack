require("dotenv").config({ path: "../.env" });
const cron = require('node-cron');
const express = require("express");
const {
  BitCoinController,
} = require("./controllers/BitCoinPriceController");
const { BitCoinPriceModel } = require("./models/BitCoinPriceModel");
const { ApiClient } = require('./models/ApiClient_new');
console.log(ApiClient);
console.log(require.resolve('./models/ApiClient_new'));
// console.log(require.resolve('./models/apiClient'));

const db = require("./models/db");

const app = express();
const port = process.env.API_PORT || 3000;
app.use(express.json());
const cors = require('cors');
app.use(cors()); 

const apiClient = new ApiClient();
const model = new BitCoinPriceModel(db, apiClient);
const controller = new BitCoinController(model);

app.get("/api/prices", async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }
    const result = await controller.getBitcoinPrices(Number(start), Number(end));
    // console.log("Результат из БД:", result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

  // Ежедневное обновление в 00:01
  cron.schedule('1 0 * * *', async () => {
    console.log('[CRON] Запуск ежедневного обновления...');
    try {
      await controller.updateBitCoinPrices();
    } catch (error) {
      console.error('CRON Ошибка:', error.message);
    }
  }, {
    scheduled: true,
    timezone: "UTC" 
  });
});
