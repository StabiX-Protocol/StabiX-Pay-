require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const jwt = require("jsonwebtoken");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const result = await pool.query(
      `SELECT id
       FROM users
       WHERE stbx_uid = $1`,
      [decoded.stbx_uid]
    );

    if (result.rows.length === 0) {
      return next(new Error("User not found"));
    }

socket.userId = result.rows[0].id;
next();
} catch (err) {
console.error("SOCKET AUTH ERROR:", err.message);
next(new Error("Invalid socket authentication"));
}
});
app.set("io", io);
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
const messageRoutes = require("./routes/messageRoutes");
const blockRoutes = require("./routes/blockRoutes");

app.use("/api", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/withdraws", withdrawRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/validator", validatorRoutes);
app.use("/api/blocks", blockRoutes);
io.on("connection", (socket) => {
  console.log("🔵 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log(
      "🔴 Socket disconnected:",
      socket.id
    );
  });
});

pool.connect()
.then(() => {
console.log("✅ Server Start");
})
.catch((err) => {
console.error("❌ Server Connection Failed");
console.error(err.message);
});

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
console.log(`Server running on http://0.0.0.0:${PORT}`);
});