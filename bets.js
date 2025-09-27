// ======= Bet History =======
let betHistory = JSON.parse(localStorage.getItem('betHistory')) || [];

// ======= Place Bet =======
function placeBet() {
  if (!currentUser) {
    alert('Please login first!');
    return;
  }

  const betType = document.getElementById('betType').value; // 2 or 3
  const betNumber = document.getElementById('betNumber').value.trim();
  const betAmount = parseInt(document.getElementById('betAmount').value);

  const maxNumber = betType === "2" ? 99 : 999;
  const multiplier = betType === "2" ? 100 : 1000;

  if (!betNumber || isNaN(betAmount) || betAmount <= 0) {
    document.getElementById('betStatus').textContent = "Enter valid number & amount";
    return;
  }

  const number = parseInt(betNumber);
  if (number < 0 || number > maxNumber) {
    document.getElementById('betStatus').textContent = `Number must be 0-${maxNumber}`;
    return;
  }

  if (betAmount > currentUser.balance) {
    document.getElementById('betStatus').textContent = "Insufficient balance";
    return;
  }

  // Deduct balance
  currentUser.balance -= betAmount;
  users = users.map(u => u.username === currentUser.username ? currentUser : u);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateBalanceUI();

  // Save bet
  const now = new Date();
  const bet = {
    username: currentUser.username,
    type: betType,
    number: number,
    amount: betAmount,
    multiplier: multiplier,
    time: now.toLocaleString()
  };
  betHistory.unshift(bet);
  localStorage.setItem('betHistory', JSON.stringify(betHistory));
  updateBetHistoryUI();

  document.getElementById('betStatus').textContent = "Bet placed successfully!";
  document.getElementById('betNumber').value = '';
  document.getElementById('betAmount').value = '';
}

// ======= Display Bet History =======
function updateBetHistoryUI() {
  const historyList = document.getElementById('betHistory');
  if (!historyList) return;
  historyList.innerHTML = '';
  betHistory.forEach(bet => {
    const li = document.createElement('li');
    li.textContent = `[${bet.time}] ${bet.username} - ${bet.type}-Digit: ${bet.number} | ${bet.amount} coins`;
    historyList.appendChild(li);
  });
}

// ======= Initialize =======
window.addEventListener('load', () => {
  updateBetHistoryUI();
});
