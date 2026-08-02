require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db"); 
const app = express();
app.use(express.json());
app.use(cors());

const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes")
const transactionRoutes = require("./routes/transactionRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const depositRoutes = require("./routes/depostRoutes");

app.use("/api", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/balance", balanceRoutes);


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
