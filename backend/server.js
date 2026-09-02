require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const app = express();
app.use(express.json({
  type: "application/json"
}));
app.use(cors());
const rateLimiter = require("express-rate-limit");
const path = require("path");
app.use("/uploads/profile-images",express.static(path.join(__dirname, "uploads/profile-images")));

const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes")
const transactionRoutes = require("./routes/transactionRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const depositRoutes = require("./routes/depostRoutes");
const withdrawRoutes = require("./routes/withdrawRoutes");
const validatorRoutes = require("./routes/validatorRoutes");

app.use("/api", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/withdraws", withdrawRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/validator", validatorRoutes);

pool.connect()
.then(() => {
console.log("✅ Server Start");
})
.catch((err) => {
console.error("❌ Server Connection Failed");
console.error(err.message);
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
console.log(`Server running on http://0.0.0.0:${PORT}`);
});