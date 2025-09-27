/*
  Fixed Random Number Generator with Admin Panel
  - Admin password (client-side) is defined here. Change it before publishing.
  - Admin settings stored in localStorage (browser).
  - This is a static-site-friendly approach (works on GitHub Pages).
*/

// === CHANGE THIS PASSWORD BEFORE SHARING YOUR SITE ===
const ADMIN_PASSWORD = "admin123"; // <-- change to your own strong password

// Default settings
const DEFAULT_SETTINGS = {
  showModeLabel: true,
  two: {
    mode: "random", // random | fixed | custom
    fixed: 77,
    min: 0,
    max: 99
  },
  three: {
    mode: "random",
    fixed: 123,
    min: 0,
    max: 999
  }
};

// Load (or create) settings
let settings = loadSettings();

// Elements
const twoDisplay = document.getElementById('twoDigit');
const threeDisplay = document.getElementById('threeDigit');
const gen2 = document.getElementById('gen2');
const gen3 = document.getElementById('gen3');

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminPanel = document.getElementById('adminPanel');
const loginBox = document.getElementById('loginBox');

const status = document.getElementById('status');
const showModeLabel = document.getElementById('showModeLabel');

// Admin controls inputs
const mode2 = document.getElementById('mode2');
const fixed2 = document.getElementById('fixed2');
const min2 = document.getElementById('min2');
const max2 = document.getElementById('max2');

const mode3 = document.getElementById('mode3');
const fixed3 = document.getElementById('fixed3');
const min3 = document.getElementById('min3');
const max3 = document.getElementById('max3');

const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');

// Initialize UI and events
initUI();
gen2.addEventListener('click', () => { twoDisplay.innerText = generateFor('two'); });
gen3.addEventListener('click', () => { threeDisplay.innerText = generateFor('three'); });
loginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);
saveBtn.addEventListener('click', saveFromUI);
resetBtn.addEventListener('click', resetDefaults);

function initUI(){
  // Fill admin inputs with current settings
  mode2.value = settings.two.mode;
  fixed2.value = settings.two.fixed;
  min2.value = settings.two.min;
  max2.value = settings.two.max;

  mode3.value = settings.three.mode;
  fixed3.value = settings.three.fixed;
  min3.value = settings.three.min;
  max3.value = settings.three.max;

  showModeLabel.value = settings.showModeLabel ? 'true' : 'false';
  status.innerText = '';
  // Show mode labels optionally (not used currently in UI but kept for future)
}

function login(){
  const pass = document.getElementById('adminPass').value;
  if(pass === ADMIN_PASSWORD){
    adminPanel.style.display = 'block';
    loginBox.style.display = 'none';
    status.innerText = 'Logged in as admin.';
  } else {
    alert('Wrong password!');
  }
}

function logout(){
  adminPanel.style.display = 'none';
  loginBox.style.display = 'block';
  document.getElementById('adminPass').value = '';
  status.innerText = 'Logged out.';
}

function saveFromUI(){
  // Validate values and update settings
  const s = settings;
  s.showModeLabel = showModeLabel.value === 'true';

  s.two.mode = mode2.value;
  s.two.fixed = clampNumber(parseInt(fixed2.value, 10), 0, 99, s.two.fixed);
  s.two.min = clampNumber(parseInt(min2.value, 10), 0, 99, s.two.min);
  s.two.max = clampNumber(parseInt(max2.value, 10), 0, 99, s.two.max);
  if(s.two.min > s.two.max){ [s.two.min, s.two.max] = [s.two.max, s.two.min]; }

  s.three.mode = mode3.value;
  s.three.fixed = clampNumber(parseInt(fixed3.value, 10), 0, 999, s.three.fixed);
  s.three.min = clampNumber(parseInt(min3.value, 10), 0, 999, s.three.min);
  s.three.max = clampNumber(parseInt(max3.value, 10), 0, 999, s.three.max);
  if(s.three.min > s.three.max){ [s.three.min, s.three.max] = [s.three.max, s.three.min]; }

  settings = s;
  saveSettings();
  status.innerText = '✅ Settings saved to your browser.';
}

function resetDefaults(){
  if(!confirm('Reset settings to defaults?')) return;
  settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  saveSettings();
  initUI();
  status.innerText = '✅ Reset to defaults.';
}

function clampNumber(v, min, max, fallback){
  if(Number.isNaN(v)) return fallback;
  v = Math.floor(v);
  if(v < min) return min;
  if(v > max) return max;
  return v;
}

// Core generator
function generateFor(kind){
  const cfg = settings[kind];
  let n;
  if(cfg.mode === 'fixed'){
    n = cfg.fixed;
  } else if(cfg.mode === 'custom'){
    n = randInt(cfg.min, cfg.max);
  } else { // random full range
    if(kind === 'two') n = randInt(0, 99);
    else n = randInt(0, 999);
  }
  const digits = (kind === 'two') ? 2 : 3;
  return String(n).padStart(digits, '0');
}

function randInt(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Settings persistence
function loadSettings(){
  try{
    const raw = localStorage.getItem('rng_settings_v1');
    if(raw) return JSON.parse(raw);
  }catch(e){
    console.warn('Could not parse settings, using defaults.');
  }
  // Return default copy
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

function saveSettings(){
  try{
    localStorage.setItem('rng_settings_v1', JSON.stringify(settings));
  }catch(e){
    console.error('Failed to save settings to localStorage.');
  }
}

// On first load, show initial values
document.addEventListener('DOMContentLoaded', ()=>{
  // Update UI values to settings so admin sees current state when logging in
  initUI();
});