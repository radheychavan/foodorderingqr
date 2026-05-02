const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const menu = [
  { id: 1, name: "Pizza", price: 200 },
  { id: 2, name: "Burger", price: 120 },
  { id: 3, name: "Pasta", price: 150 },
  { id: 4, name: "Samosa", price: 20 },
  { id: 5, name: "Fries", price: 100 },
  { id: 6, name: "Diet Coke", price: 40 }
];

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/menu", (req, res) => {
  res.json(menu);
});

app.post("/order", (req, res) => {
  const order = req.body;
  console.log("New Order:", order);
  res.json({ message: "Order received" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
