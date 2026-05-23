require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 🔌 PostgreSQL Connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "qr_order",   // 👈 MUST match pgAdmin
password: process.env.DB_PASSWORD,
 port: 5433,
});
function verifyToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {

    return res.status(401).json({
      error: "Access denied"
    });

  }

  const token = authHeader.split(" ")[1];

  try {

    const verified = jwt.verify(
      token,
      "secretkey"
    );

    req.user = verified;

    next();

  } catch (err) {

    res.status(403).json({
      error: "Invalid token"
    });

  }

}
// 🔹 Test Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ================= MENU =================

// Get Menu
app.get("/menu", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM menu WHERE available = true"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// ================= ORDERS =================

// Place Order
app.post("/order", async (req, res) => {
  const { items, table } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO orders (items, table_number) VALUES ($1, $2) RETURNING *",
      [JSON.stringify(items), table]
    );

    console.log("Inserted:", result.rows[0]);
    io.emit("newOrder", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// Get All Orders
app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders");
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status
app.put("/order/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2",
      [status, id]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});
app.post("/menu", async (req, res) => {
  const { name, price } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO menu (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});
app.delete("/menu/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM menu WHERE id = $1",
      [id]
    );

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});
app.delete("/orders/:id", async (req, res) => {

  const { id } = req.params;

  try {

    await pool.query(
      "DELETE FROM orders WHERE id = $1",
      [id]
    );

    res.json({
      message: "Order deleted"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Database error"
    });

  }

});
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const hashedPassword =
bcrypt.hashSync("admin123", 10);

app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const result = await pool.query(

      "SELECT * FROM admins WHERE email = $1",

      [email]

    );
console.log(result.rows);
    if (result.rows.length === 0) {

      return res.status(401).json({
        error: "Invalid email"
      });

    }

    const admin = result.rows[0];
console.log(admin);
    const validPassword =
      bcrypt.compareSync(
        password,
        admin.password
        
      );
console.log("Password valid:", validPassword);
    if (!validPassword) {

      return res.status(401).json({
        error: "Invalid password"
      });

    }

    const token = jwt.sign(

      {
        id: admin.id
      },

      "secretkey",

      {
        expiresIn: "1d"
      }

    );

    res.json({
      token
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});
const hash = bcrypt.hashSync("admin123", 10);

console.log(hash);
// 🚀 Start Server
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("Client connected");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.put("/orders/:id", async (req, res) => {

  const { id } = req.params;

  const { status } = req.body;

  try {

    await pool.query(

      "UPDATE orders SET status = $1 WHERE id = $2",

      [status, id]

    );

    io.emit("newOrder");

    res.json({
      message: "Status updated"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "DB error"
    });

  }

});