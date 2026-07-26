const express = require("express");
const pool = require("./config/db"); 
const app = express();
const healthRoutes = require("./routes/healthRoutes");
app.use("/api", healthRoutes);
pool.connect()
    .then(() => {
        console.log("✅ PostgreSQL Connected");
    })
    .catch((err) => {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
    });
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${3000}`);
});
