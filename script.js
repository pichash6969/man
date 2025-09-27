/* ====== Global Reset ====== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: radial-gradient(circle at center, #111 0%, #000 100%);
  color: #f5f5f5;
  min-height: 100vh;
}

/* ====== Navigation ====== */
nav {
  display: flex;
  justify-content: center;
  background: #111;
  padding: 12px;
  border-bottom: 2px solid #ffcc00;
}

nav a {
  color: #ffcc00;
  text-decoration: none;
  margin: 0 15px;
  font-weight: bold;
  transition: color 0.3s;
}

nav a:hover {
  color: #00ff99;
}

/* ====== Clock ====== */
.clock-container {
  text-align: center;
  margin: 20px 0;
}
#clock {
  font-size: 32px;
  font-weight: bold;
  color: #00ff99;
  text-shadow: 0 0 10px #00ff99, 0 0 20px #00ff99;
}

/* ====== Balance Box ====== */
.balance-box {
  text-align: center;
  background: #222;
  color: #ffcc00;
  padding: 10px;
  border: 2px solid #ffcc00;
  border-radius: 10px;
  margin: 10px auto;
  width: fit-content;
  font-size: 20px;
  font-weight: bold;
}

/* ====== Lottery Area ====== */
.lottery-container {
  text-align: center;
  margin-top: 20px;
}

.number-section {
  margin: 20px auto;
}

h2, h3 {
  color: #ffcc00;
  text-shadow: 0 0 5px #ffcc00;
}

/* ====== Scrolling Box ====== */
.scroll-container {
  width: 200px;
  height: 80px;
  margin: 10px auto;
  overflow: hidden;
  border: 3px solid #00ff99;
  border-radius: 12px;
  background: #000;
  position: relative;
}

.scroll-numbers {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  width: 100%;
}

.number-item {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: #00ff99;
  text-shadow: 0 0 10px #00ff99, 0 0 20px #00ff99;
  border-bottom: 1px solid #222;
  width: 100%;
}

/* Highlight effect when stopped */
.highlight {
  color: #ffcc00;
  text-shadow: 0 0 20px #ffcc00, 0 0 30px #ff6600;
  transform: scale(1.2);
}

/* ====== Result History ====== */
.history-container {
  margin: 30px auto;
  padding: 15px;
  max-width: 500px;
  background: #111;
  border: 2px solid #ffcc00;
  border-radius: 12px;
}

.history-container h2 {
  text-align: center;
  margin-bottom: 10px;
}

#resultHistory, #betHistory {
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
}

#resultHistory li, #betHistory li {
  background: #222;
  margin: 5px 0;
  padding: 8px;
  border-radius: 8px;
  color: #f5f5f5;
  font-size: 14px;
}

/* ====== Forms (Login, Betting, Redeem) ====== */
.form-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  background: #111;
  border: 2px solid #ffcc00;
  border-radius: 12px;
}

.form-container h2, .form-container h3 {
  text-align: center;
  margin-bottom: 15px;
  color: #ffcc00;
}

.form-container input, .form-container select {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 2px solid #333;
  border-radius: 8px;
  background: #222;
  color: #f5f5f5;
}

.form-container button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #ff6600, #ffcc00);
  font-weight: bold;
  cursor: pointer;
  color: #000;
  transition: transform 0.2s;
}

.form-container button:hover {
  transform: scale(1.05);
}

/* ====== Scrollbar Customization ====== */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #ffcc00;
  border-radius: 5px;
}
::-webkit-scrollbar-track {
  background: #222;
}
