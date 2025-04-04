require ('dotenv').config({path: '../.env'});
const express = require("express");
const { Pool } = require("pg");
const pool = require('./config/db');
const { getDataFromApi } = require('./api/getData.js');
const { fillDB } = require('./models/fillDB.js')



const app = express();
const port = process.env.API_PORT || 3000;
console.log(process.env.API_PORT);


app.use(express.json);

app.get("api/prices", async (req, res) => {
  let { start, end, standartPeriod } = req.query;
  let query,
    params = [];
  if (start && end) {
    query = `SELECT timestamp, price FROM bitcoin_prices
      WHERE timestamp BETWEEN $1 AND $2 
      ORDER BY timestamp ASC   
      `;
    params = [start, end];
  } else {
    let intervals = {
      day: "1 DAY",
      week: "1 WEEK",
      month: "1 MONTH",
      year: "1 YEAR",
    };

    if(!standartPeriod || !intervals[standartPeriod]) {
      return res.status(400).json('err: Invalid interval')
    }

    query = `SELECT timestamp, price FROM bitcoin_prices
      WHERE timestamp >= NOW() - INTERVAL "${intervals[standartPeriod]}"
      ORDER BY timestamp ASC   
      `;
  }

  const { rows } = await pool.query(query, params);
  return res.json.rows;
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bitcoin_prices(
      id SERIAL PRIMARY KEY,
      timestamp BIGINT,    
      price NUMERIC NOT NULL,
      UNIQUE (timestamp)
      )
    `);
    console.log('DB created');         
  } catch (error) {
    console.error(error);    
  }
    
}

app.listen(port, () => {
  console.log(`Server is listening ${port}`);
  initDB();
  // getDataFromApi();
  fillDB();
});
