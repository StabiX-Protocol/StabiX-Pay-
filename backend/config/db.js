const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "StabiX",
    password: "Sumedh@1012",
    port: 5432,
});

module.exports = pool;
