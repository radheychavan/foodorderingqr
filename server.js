const express = require("express");
const cors = require("cors");
const path = require("path");
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
  password: "radhey123",
  port: 5433,
});

// 🔹 Test Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 Menu API
const menu = [
  { id: 1, name: "Pizza", price: 200 },
  { id: 2, name: "Burger", price: 120 },
  { id: 3, name: "Pasta", price: 150 },
   { id: 4, name: "samosa", price: 20 },
  { id: 5, name: "Fries", price: 100 },
  { id: 6, name: "Diet coke", price: 40 }
];
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


// 🚀 Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function loadOrders() {
  const res = await fetch("http://localhost:3000/orders");
  const orders = await res.json();

  console.log("ORDERS:", orders); // 👈 ADD THIS

  const container = document.getElementById("orders");
  container.innerHTML = "";

  orders.forEach(order => {
    const div = document.createElement("div");
    div.className = "order";

    const items = JSON.parse(order.items);

    div.innerHTML = `
      <p>Table: ${order.table_number}</p>
      <p>Status: ${order.status}</p>
      <p>Items: ${
        items.map(i => `${i.name} x${i.quantity}`).join(", ")
      }</p>
    `;

    container.appendChild(div);
  });
}