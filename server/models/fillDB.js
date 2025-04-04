const pool = require("../config/db");
require("dotenv").config({ path: "../.env" });
const { getDataFromApi } = require("../api/getData");
const moment = require("moment");

async function fillDB() {
  const client = await pool.connect();
  try {
    // Проверяем пустая ли БД
    const {
      rows: [{ count }],
    } = await client.query(`SELECT COUNT(*) as count FROM bitcoin_prices`);
    const isEmpty = parseInt(count) === 0;

    if (isEmpty) {
      console.log("the table is empty");
      let oneYearAgoDate = moment().subtract(1, "years").valueOf();
      console.log(oneYearAgoDate);

      let nowDate = moment().valueOf();

      const newData = await getDataFromApi(oneYearAgoDate, nowDate, "d1");
      // console.log(newData);

      if (newData?.length > 0) {
        await client.query(`BEGIN`);
        const query = `INSERT INTO bitcoin_prices(timestamp, price)
          VALUES ${newData
            .map(({ time, priceUsd }) => `(${time}, ${parseFloat(priceUsd)})`)
            .join(",")}
          `;
        await client.query(query);
        await client.query("COMMIT");
      } else {
        console.log("Invalid fetching from API ");
      }
    } else {
      // Удаление старых записей
      const oneYearAgoDate = moment().subtract(1, "years").valueOf();
      await client.query("BEGIN");
      const { rowCount: deletedCount } = await client.query(
        "DELETE FROM bitcoin_prices WHERE timestamp < $1",
        [oneYearAgoDate]
      );
      console.log(`deleted ${deletedCount}`);

      // Добавляем свежие после самой старой записи
      const {
        rows: [{ max_timestamp }],
      } = await client.query(
        "SELECT MAX(timestamp) as max_timestamp FROM bitcoin_prices"
      );
      console.log(max_timestamp);
      

      const nowDate = moment().valueOf();
      console.log(nowDate);
      
      const newData = await getDataFromApi(
        max_timestamp || oneYearAgoDate,
        nowDate,
        "d1"
      );

      if (newData?.length > 0) {
        const query = `INSERT INTO bitcoin_prices(timestamp, price)
          VALUES ${newData.map(({ time, priceUsd }) => `(${time}, ${parseFloat(priceUsd)})`)
            .join(",")}
            ON CONFLICT (timestamp) DO NOTHING
          `;
        await client.query(query);
        await client.query("COMMIT");
        console.log(`Added ${newData.length} rows`);
      } else {
        await client.query("COMMIT");
      }
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Ошибка 2:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { getOldestAndEarliestDates };
