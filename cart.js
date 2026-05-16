
/**
 * Cart Management System for QR Ordering Website
 *
 * This file handles the client-side cart functionality including:
 * - Loading and displaying the menu
 * - Adding/removing items from the cart
 * - Rendering the cart UI
 * - Placing orders via API
 */

// ====================
// GLOBAL VARIABLES
// ====================

/**
 * Array to store cart items
 * Each item has: id, name, price, quantity
 */
let cart = [];

/**
 * Array to store menu items fetched from the server
 * Each item has: id, name, price
 */
let menu = [];

// ====================
// MENU FUNCTIONS
// ====================

/**
 * Renders the menu items to the DOM
 * Creates HTML elements for each menu item with add to cart buttons
 */
function renderMenu() {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = ""; // Clear existing content

  // Loop through each menu item and create DOM elements
  menu.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";

    // Create HTML structure for menu item
    div.innerHTML = `
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">₹${item.price}</div>
      </div>
      <button onclick="addToCart(${item.id})">Add to Cart</button>
    `;

    menuDiv.appendChild(div);
  });
}

/**
 * Fetches menu data from the server and renders it
 * Makes an API call to localhost:3000/menu
 */
async function loadMenu() {
  try {
    // Fetch menu data from server
    const res = await fetch("http://localhost:3000/menu");

    // Check if response is successful
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // Parse JSON response and store in menu array
    menu = await res.json();

    // Render the menu to the page
    renderMenu();
  } catch (error) {
    console.error("Failed to load menu:", error);
    alert("Failed to load menu. Make sure the server is running on port 3000.");
  }
}

// ====================
// CART FUNCTIONS
// ====================

/**
 * Adds an item to the cart
 * If item already exists, increases quantity; otherwise adds new item
 * @param {number} id - The ID of the menu item to add
 */
function addToCart(id) {
  // Find the item in the menu
  const item = menu.find(i => i.id === id);

  // Check if item already exists in cart
  const existing = cart.find(i => i.id === id);

  if (existing) {
    // Increase quantity if item already in cart
    existing.quantity++;
  } else {
    // Add new item to cart with quantity 1
    cart.push({ ...item, quantity: 1 });
  }

  // Re-render the cart to reflect changes
  renderCart();
}

/**
 * Removes an item from the cart or decreases its quantity
 * If quantity > 1, decreases quantity; otherwise removes item completely
 * @param {number} id - The ID of the cart item to remove
 */
function removeFromCart(id) {
  // Find the item in the cart
  const item = cart.find(i => i.id === id);

  if (item.quantity > 1) {
    // Decrease quantity if more than 1
    item.quantity--;
  } else {
    // Remove item completely if quantity is 1
    cart = cart.filter(i => i.id !== id);
  }

  // Re-render the cart to reflect changes
  renderCart();
}

/**
 * Renders the cart items and totals to the DOM
 * Updates cart display, total price, and item count
 */
function renderCart() {
  const cartDiv = document.getElementById("cart");
  const totalDiv = document.getElementById("total");
  const itemCountDiv = document.getElementById("item-count");

  cartDiv.innerHTML = ""; // Clear existing cart content

  let total = 0;
  let itemCount = 0;

  // Handle empty cart case
  if (cart.length === 0) {
    cartDiv.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    totalDiv.innerText = "Total: ₹0";
    itemCountDiv.innerText = "0";
    return;
  }

  // Loop through cart items and create DOM elements
  cart.forEach(item => {
    // Calculate totals
    total += item.price * item.quantity;
    itemCount += item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";

    // Create HTML structure for cart item
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

  // Update total and item count displays
  totalDiv.innerText = "Total: ₹" + total;
  itemCountDiv.innerText = itemCount;
}

// ====================
// ORDER FUNCTIONS
// ====================

/**
 * Places an order by sending cart data to the server
 * Clears the cart after successful order placement
 */
async function placeOrder() {
  // Check if cart is empty
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  try {
    // Send order data to server
    const response = await fetch("http://localhost:3000/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: cart,
        table: tableNumber  // Hardcoded table number (could be made dynamic)
      })
    });

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse response and show success message
    const data = await response.json();
    alert(data.message || "Order placed!");

    // Clear cart after successful order
    cart = [];
    renderCart();
  } catch (error) {
    console.error("Failed to place order:", error);
    alert("Failed to place order. Make sure the server is running on port 3000.");
  }
}
async function placeOrder() {

  const button = document.getElementById("orderBtn");

  button.disabled = true;

  button.innerText = "Placing Order...";

  try {

    await fetch("/order", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        items: cart,
        table: tableNumber
      })

    });

    alert("Order placed!");

    cart = [];

    renderCart();
    button.innerText = "Order Placed";

  } catch (err) {

    console.error(err);

    alert("Failed to place order");

    button.disabled = false;

    button.innerText = "Place Order";

  }

}
// ====================
// INITIALIZATION
// ====================

// Load menu data and render initial cart state when page loads
loadMenu();
renderCart();
