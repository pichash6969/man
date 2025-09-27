// ======= Users Storage =======
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ======= Signup =======
function signup() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const status = document.getElementById('loginStatus');

  if (!username || !password) {
    status.textContent = 'Please enter username & password';
    return;
  }

  if (users.find(u => u.username === username)) {
    status.textContent = 'Username already exists';
    return;
  }

  const user = { username, password, balance: 0 };
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  status.textContent = 'Signup successful!';
  window.location.href = 'index.html';
}

// ======= Login =======
function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const status = document.getElementById('loginStatus');

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    status.textContent = 'Invalid username or password';
    return;
  }

  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  status.textContent = 'Login successful!';
  window.location.href = 'index.html';
}

// ======= Update Balance =======
function updateBalanceUI() {
  const balanceSpan = document.getElementById('balance') || document.getElementById('userBalance');
  if (currentUser && balanceSpan) balanceSpan.textContent = currentUser.balance;
}
updateBalanceUI();

// ======= Redeem Codes =======
const redeemCodes = {
  "FREE100": 100,
  "BONUS500": 500,
  "MEGA1000": 1000
};

function redeem() {
  const codeInput = document.getElementById('redeemCode');
  const status = document.getElementById('redeemStatus');

  if (!currentUser) {
    status.textContent = 'Please login first!';
    return;
  }

  const code = codeInput.value.trim().toUpperCase();
  if (redeemCodes[code]) {
    currentUser.balance += redeemCodes[code];
    updateBalanceUI();
    users = users.map(u => u.username === currentUser.username ? currentUser : u);
    localStorage.setItem('users', JSON.stringify(users));
    status.textContent = `Success! ${redeemCodes[code]} coins added`;
    codeInput.value = '';
  } else {
    status.textContent = 'Invalid redeem code';
  }
}
