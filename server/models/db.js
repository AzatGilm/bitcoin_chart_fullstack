const { Pool } = require('pg');
require('dotenv').config({path:'../.env'});

const pool = new Pool({
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT
});

module.exports = { pool };