/*
  Fixed Random Number Generator with Admin Panel
  - Admin password (client-side) is defined here. Change it before publishing.
  - Admin settings stored in localStorage (browser).
  - This is a static-site-friendly approach (works on GitHub Pages).
*/

// === CHANGE THIS PASSWORD BEFORE SHARING YOUR SITE ===
const ADMIN_PASSWORD = "1234"; // change this to your password

// Default settings
let settings = {
  two: { mode: "random", fixed: 77, min: 0, max: 99 },
  three: { mode: "random", fixed: 123, min: 0, max: 999 }
};

// Elements
const twoDisplay = document.getElementById("twoDigit");
const threeDisplay = document.getElementById("threeDigit");

const gen2 = document.getElementById("gen2");
const gen3 = document.getElementById("gen3");

const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.getElementById("loginBtn");
const settingsPanel = document.getElementById("settingsPanel");
const adminPassInput = document.getElementById("adminPass");

const mode2 = document.getElementById("mode2");
const fixed2 = document.getElementById("fixed2");
const min2 = document.getElementById("min2");
const max2 = document.getElementById("max2");

const mode3 = document.getElementById("mode3");
const fixed3 = document.getElementById("fixed3");
const min3 = document.getElementById("min3");
const max3 = document.getElementById("max3");

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

// Event listeners
gen2.addEventListener("click", () => { twoDisplay.innerText = generateNumber("two"); });
gen3.addEventListener("click", () => { threeDisplay.innerText = generateNumber("three"); });
loginBtn.addEventListener("click", login);
saveBtn.addEventListener("click", saveSettings);

// Functions
function generateNumber(type) {
  let cfg = settings[type];
  let num;
  if(cfg.mode === "fixed"){
    num = cfg.fixed;
  } else if(cfg.mode === "custom"){
    num = Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min;
  } else {
    if(type==="two") num = Math.floor(Math.random()*100);
    else num = Math.floor(Math.random()*1000);
  }
  return num.toString().padStart(type==="two"?2:3,"0");
}

function login(){
  if(adminPassInput.value === ADMIN_PASSWORD){
    settingsPanel.style.display = "block";
    loginBtn.style.display = "none";
    adminPassInput.style.display = "none";
  } else {
    alert("Wrong password!");
  }
}

function saveSettings(){
  settings.two.mode = mode2.value;
  settings.two.fixed = parseInt(fixed2.value) || settings.two.fixed;
  settings.two.min = parseInt(min2.value) || settings.two.min;
  settings.two.max = parseInt(max2.value) || settings.two.max;

  settings.three.mode = mode3.value;
  settings.three.fixed = parseInt(fixed3.value) || settings.three.fixed;
  settings.three.min = parseInt(min3.value) || settings.three.min;
  settings.three.max = parseInt(max3.value) || settings.three.max;

  status.innerText = "✅ Settings saved!";
}
