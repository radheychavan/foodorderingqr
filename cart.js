
const menu = [
  { id: 1, name: "Pizza", price: 200 },
  { id: 2, name: "Burger", price: 120 },
  { id: 3, name: "Pasta", price: 150 },
  { id: 4, name: "samosa", price: 20 },
  { id: 5, name: "Fries", price: 100 },
  { id: 6, name: "Diet coke", price: 40 }
];

let cart = [];

// 🔹 Display Menu
function renderMenu() {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = "";

  menu.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">₹${item.price}</div>
      </div>
      <button onclick="addToCart(${item.id})">Add</button>
    `;

    menuDiv.appendChild(div);
  });
}

// 🔹 Add to Cart
function addToCart(id) {
  const item = menu.find(i => i.id === id);

  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  renderCart();
}

// 🔹 Remove from Cart
function removeFromCart(id) {
  const item = cart.find(i => i.id === id);

  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart = cart.filter(i => i.id !== id);
  }

  renderCart();
}

// 🔹 Render Cart
function renderCart() {
  const cartDiv = document.getElementById("cart");
  const totalDiv = document.getElementById("total");
  const itemCountDiv = document.getElementById("item-count");

  cartDiv.innerHTML = "";

  let total = 0;
  let itemCount = 0;

  if (cart.length === 0) {
    cartDiv.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    totalDiv.innerText = "Total: ₹0";
    itemCountDiv.innerText = "0";
    return;
  }

  cart.forEach(item => {
    total += item.price * item.quantity;
    itemCount += item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-details">Quantity: ${item.quantity} × ₹${item.price}</div>
        <div class="cart-item-total">₹${item.price * item.quantity}</div>
      </div>
      <div>
        <button onclick="addToCart(${item.id})">+</button>
        <button onclick="removeFromCart(${item.id})">-</button>
      </div>
    `;

    cartDiv.appendChild(div);
  });

  totalDiv.innerText = "Total: ₹" + total;
  itemCountDiv.innerText = itemCount;
}

async function placeOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const response = await fetch("http://localhost:3000/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: cart,
      table: 1
    })
  });

  const data = await response.json();
  alert(data.message || "Order placed!");

  cart = [];
  renderCart();
}

// Initial load
renderMenu();
renderCart();
