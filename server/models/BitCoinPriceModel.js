const db = require("./db");
const axios = require("axios");

class BitCoinPriceModel {
  constructor(db, apiClient) {
    this.db = db;
    this.apiClient = apiClient;
  }

  async clearExtraData(oneYearAgoDate) {
    try {
      await this.db.query("BEGIN");
      const { rowCount: deletedCount } = await this.db.query(
        "DELETE FROM bitcoin_prices WHERE timestamp < $1",
        [oneYearAgoDate]
      );
      await this.db.query("COMMIT");
      console.log(`deleted ${deletedCount}`);
      
    } catch (error) {
      await this.db.query("ROLLBACK");
      console.log("Ошибка при очистке БД");
      throw error;
    }
  }

  async addRecentData(newData) {
    try {
      if (!newData || newData.length === 0) {
        console.log("No new data to add");
        return 0;
      }

      const values = newData.map(({ time, priceUSD }) => [
        time,
        parseFloat(priceUSD),
      ]);
      const placeholders = values
        .map((item, (index) => `$${index * 2 + 1}, $${index * 2 + 2}`))
        .join(",");
      const flatValues = values.flat();
      const query = `INSERT INTO bitcoin_prices(timestamp, price)
          VALUES ${placeholders}
          ON CONFLICT (timestamp) DO NOTHING
          `;
      const { rowCount } = await this.db.query(query, flatValues);
      console.log(`Добавлено ${rowCount} свежих строк`);
      return rowCount;
    } catch (error) {
      console.error("Ошибка при обновлении данных в БД:", error);
      throw error;
    }
  }

  async fetchFromAPI(start, end, interval = "d1") {
    try {
      const response = await this.apiClient.get("assets/bitcoin/history", {
        params: { start: start, end: end, interval: "d1" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching data from API:", error);
      throw error;
    }
  }

  async getPrices(start, end) {
    try {
      const { rows } = await this.db.query(
        `SELECT timestamp, priceUSD FROM bitcoin_prices
        WHERE timestamp BETWEEN $1 AND $2 
        `,
        [start, end]
      );
      return rows;
    } catch (error) {
      console.log(`Error fetching prices from DB:", error`);
      throw error;
    }
  }

  async getMaxTimestampFromDB() {
    const {
      rows: [{ max_timestamp }],
    } = await db.query(
      `SELECT MAX(timestamp) as max_timestamp FROM bitcoin_prices`
    );
    return max_timestamp;
  }

  async isEmptyDB () {
    const {rows:[{count}]} = await db.query(`SELECT COUNT(*) as count FROM bitcoin_prices`);
    const isEmpty = parseInt(count) === 0;
    return isEmpty;
  }
}

module.exports = { BitCoinPriceModel };
