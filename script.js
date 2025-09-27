<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lottery - Home</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Navigation -->
  <nav>
    <a href="index.html">🏠 Home</a>
    <a href="login.html">🔑 Login</a>
    <a href="balance.html">💰 Balance</a>
    <a href="betting.html">🎲 Betting</a>
  </nav>

  <!-- Clock -->
  <div class="clock-container">
    <h1 id="clock"></h1>
  </div>

  <!-- Balance -->
  <div class="balance-box">
    Balance: <span id="userBalance">0</span> coins
  </div>

  <!-- Lottery Area -->
  <div class="lottery-container">
    <h2>🎰 Virtual Lottery 🎰</h2>

    <!-- 2-Digit Draw -->
    <div class="number-section">
      <h3>2-Digit Draw</h3>
      <div class="scroll-container">
        <div class="scroll-numbers" id="scroll-2digit"></div>
      </div>
    </div>

    <!-- 3-Digit Draw -->
    <div class="number-section">
      <h3>3-Digit Draw</h3>
      <div class="scroll-container">
        <div class="scroll-numbers" id="scroll-3digit"></div>
      </div>
    </div>
  </div>

  <!-- Result History -->
  <div class="history-container">
    <h2>📜 Result History</h2>
    <ul id="resultHistory"></ul>
  </div>

  <script src="script.js"></script>
  <script src="user.js"></script>
</body>
</html>
