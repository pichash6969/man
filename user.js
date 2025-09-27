// User management with LocalStorage

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function signup() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  let users = getUsers();

  if (users[username]) {
    document.getElementById("loginStatus").innerText = "User already exists!";
  } else {
    users[username] = { password, balance: 100 }; // new user with 100 coins
    saveUsers(users);
    localStorage.setItem("currentUser", username);
    document.getElementById("loginStatus").innerText = "Signup successful!";
  }
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  let users = getUsers();

  if (users[username] && users[username].password === password) {
    localStorage.setItem("currentUser", username);
    document.getElementById("loginStatus").innerText = "Login successful!";
  } else {
    document.getElementById("loginStatus").innerText = "Invalid credentials!";
  }
}

// Balance display
function showBalance() {
  const user = localStorage.getItem("currentUser");
  if (!user) return;
  let users = getUsers();
  document.getElementById("balance").innerText = users[user].balance;
}

// Redeem codes
const redeemCodes = {
  "FREE100": 100,
  "WELCOME500": 500
};

function redeem() {
  const code = document.getElementById("redeemCode").value;
  const user = localStorage.getItem("currentUser");
  if (!user) {
    document.getElementById("redeemStatus").innerText = "Login required!";
    return;
  }
  let users = getUsers();
  if (redeemCodes[code]) {
    users[user].balance += redeemCodes[code];
    saveUsers(users);
    document.getElementById("redeemStatus").innerText = `+${redeemCodes[code]} coins added!`;
    showBalance();
  } else {
    document.getElementById("redeemStatus").innerText = "Invalid code!";
  }
}

// Auto show balance if element exists
window.onload = () => {
  if (document.getElementById("balance")) showBalance();
  if (document.getElementById("userBalance")) showBalance();
};
