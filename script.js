/******************************************************
  Full integrated JS:
  - scrolling 2D & 3D numbers (smooth)
  - manualDraws array (HH:MM:SS start/stop) -> no UI
  - login/signup, balance per user (localStorage)
  - redeem codes (one-time per code, persisted)
  - place bets (2D & 3D), deduct at placement
  - resolve bets when draw completes (2D x100, 3D x1000)
  - result history persisted (never auto-delete)
******************************************************/

/* ----------------- CONFIG ----------------- */
/* EDIT THIS ARRAY to schedule draws (no UI) */
const manualDraws = [
  // Example draws:
  // { start: "14:30:00", stop: "14:30:05", num2: 45, num3: 789 },
  // { start: "14:31:00", stop: "14:31:05", num2: 12, num3: 345 },
  // Use HH:MM:SS 24-hour format.
];
/* ------------------------------------------ */

/* redeem codes - edit/add here */
const redeemCodes = {
  "WELCOME100": 100,
  "BONUS500": 500,
  "LUCKY1000": 1000
};

/* constants */
const ITEM_HEIGHT = 80;        // must match CSS .scroll-container height
const MAX2 = 99, MAX3 = 999;
const REPEAT_CYCLES = 3;      // how many times we repeat the sequence for smooth looping
const SCROLL_SPEED_2 = 0.9;   // px per frame (adjust)
const SCROLL_SPEED_3 = 1.4;   // px per frame (adjust)
const HOLD_AFTER_DRAW_MS = 5000; // how long to pause on result (ms)

/* ---------- DOM refs ---------- */
const scroll2 = document.getElementById('scroll2');
const scroll3 = document.getElementById('scroll3');
const clockDisplay = document.getElementById('clockDisplay');
const historyList = document.getElementById('historyList');
const userBalanceEl = document.getElementById('userBalance');
const redeemInput = document.getElementById('redeemCodeInput');
const redeemBtn = document.getElementById('redeemBtn');
const redeemMessage = document.getElementById('redeemMessage');

const signupBtn = document.getElementById('signupBtn');
const loginBtn  = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authMessage = document.getElementById('authMessage');

const signupUsername = document.getElementById('signupUsername');
const signupPassword = document.getElementById('signupPassword');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');

const placeBet2Btn = document.getElementById('placeBet2Btn');
const placeBet3Btn = document.getElementById('placeBet3Btn');
const bet2Input = document.getElementById('bet2Digit');
const betAmt2 = document.getElementById('betAmount2');
const bet3Input = document.getElementById('bet3Digit');
const betAmt3 = document.getElementById('betAmount3');
const betHistoryList = document.getElementById('betHistoryList');

/* ---------- state ---------- */
let loggedInUser = localStorage.getItem('loggedInUser') || null;
let userBalance = 1000;

/* ensure manualDraws have executed/done flags persisted in memory (not stored persistently) */
manualDraws.forEach(d => { d.executed = false; d.done = false; });

/* ---------- helpers ---------- */
function pad(n, len=2){ return n.toString().padStart(len,'0'); }
function nowToTimeString(){ return new Date().toLocaleTimeString('en-GB'); } // HH:MM:SS
function timeStrToSeconds(s){ const [h,m,sec]=s.split(':').map(Number); return h*3600 + m*60 + sec; }
function getAllUsers(){ return JSON.parse(localStorage.getItem('users')||'[]'); }

/* ---------- generate numbers in containers ---------- */
function generateNumbers(container, max){
  container.innerHTML = '';
  for(let r=0;r<REPEAT_CYCLES;r++){
    for(let i=0;i<=max;i++){
      const div = document.createElement('div');
      div.className = 'number-item' + ((i%2===0)?'':' alt');
      div.textContent = pad(i, max===99?2:3);
      container.appendChild(div);
    }
  }
}
generateNumbers(scroll2, MAX2);
generateNumbers(scroll3, MAX3);

/* total cycle heights */
const cycleHeight2 = (MAX2 + 1) * ITEM_HEIGHT * REPEAT_CYCLES;
const singleCycle2 = (MAX2 + 1) * ITEM_HEIGHT;
const cycleHeight3 = (MAX3 + 1) * ITEM_HEIGHT * REPEAT_CYCLES;
const singleCycle3 = (MAX3 + 1) * ITEM_HEIGHT;

/* ---------- scroll animation ---------- */
let offset2 = 0, offset3 = 0;
let rafId = null;
let isPaused = false;

function startAnimation(){
  if(rafId) return;
  isPaused = false;
  animate();
}

function stopAnimation(){
  if(rafId) cancelAnimationFrame(rafId);
  rafId = null;
  isPaused = true;
}

function animate(){
  // update only when not paused
  offset2 = (offset2 + SCROLL_SPEED_2) % cycleHeight2;
  offset3 = (offset3 + SCROLL_SPEED_3) % cycleHeight3;

  scroll2.style.transform = `translateY(-${offset2}px)`;
  scroll3.style.transform = `translateY(-${offset3}px)`;

  // check for draws hitting stop time and handle stop once
  checkForDrawStops();

  rafId = requestAnimationFrame(animate);
}

/* ---------- highlight helpers ---------- */
function clearHighlights(){
  Array.from(scroll2.children).forEach(el => el.classList.remove('highlight'));
  Array.from(scroll3.children).forEach(el => el.classList.remove('highlight'));
}
function highlightValue(container, value, max){
  // highlight the FIRST occurrence (first cycle) of the value
  const firstIndex = value; // because first cycle starts at index 0
  const nodeIndex = firstIndex; // first cycle
  const node = container.children[nodeIndex];
  if(node){
    clearHighlights();
    node.classList.add('highlight');
  }
}

/* ---------- clock ---------- */
function updateClock(){
  const d = new Date();
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  clockDisplay.textContent = `${hh}:${mm}:${ss}`;
  requestAnimationFrame(updateClock);
}
updateClock();

/* ---------- load & render history ---------- */
function loadResultHistory(){
  const hist = JSON.parse(localStorage.getItem('resultHistory')||'[]');
  historyList.innerHTML = '';
  hist.forEach(h => {
    const li = document.createElement('li');
    li.textContent = `${h.time} => 2D:${pad(h.num2,2)} | 3D:${pad(h.num3,3)}`;
    historyList.appendChild(li);
  });
}
loadResultHistory();

/* ---------- redeem code (one-time) ---------- */
function getUsedCodes(){ return JSON.parse(localStorage.getItem('usedRedeemCodes')||'[]'); }
function markCodeUsed(code){
  const used = getUsedCodes();
  if(!used.includes(code)){
    used.push(code);
    localStorage.setItem('usedRedeemCodes', JSON.stringify(used));
  }
}
redeemBtn.onclick = ()=>{
  if(!loggedInUser){ alert('Login required to redeem'); return; }
  const code = (redeemInput.value||'').toUpperCase().trim();
  if(!code){ redeemMessage.textContent = 'Enter a code'; return; }
  const used = getUsedCodes();
  if(used.includes(code)){ redeemMessage.textContent = 'Code already used'; redeemInput.value=''; return; }
  const value = redeemCodes[code];
  if(!value){ redeemMessage.textContent = 'Invalid code'; redeemInput.value=''; return; }
  // apply
  userBalance += value;
  saveUserBalance();
  markCodeUsed(code);
  redeemMessage.textContent = `Added ${value} coins to ${loggedInUser}`;
  redeemInput.value='';
  renderBetHistory();
};

/* ---------- user auth & persistence ---------- */
signupBtn.onclick = ()=>{
  const u = (signupUsername.value||'').trim();
  const p = (signupPassword.value||'').trim();
  if(!u||!p){ authMessage.textContent = 'Enter username and password'; return; }
  let users = getAllUsers();
  if(users.find(x=>x.username === u)){ authMessage.textContent = 'Username exists'; return; }
  users.push({ username: u, password: p });
  localStorage.setItem('users', JSON.stringify(users));
  authMessage.textContent = 'Signup success — you can login now';
  signupUsername.value=''; signupPassword.value='';
};

loginBtn.onclick = ()=>{
  const u = (loginUsername.value||'').trim();
  const p = (loginPassword.value||'').trim();
  let users = getAllUsers();
  const user = users.find(x=>x.username===u && x.password===p);
  if(!user){ authMessage.textContent = 'Invalid credentials'; return; }
  loggedInUser = u;
  localStorage.setItem('loggedInUser', loggedInUser);
  authMessage.textContent = `Welcome ${loggedInUser}`;
  loginUsername.value=''; loginPassword.value='';
  loginBtn.style.display='none';
  logoutBtn.style.display='inline';
  loadUserBalance();
  renderBetHistory();
};

logoutBtn.onclick = ()=>{
  loggedInUser = null;
  localStorage.removeItem('loggedInUser');
  authMessage.textContent = 'Logged out';
  loginBtn.style.display='inline';
  logoutBtn.style.display='none';
  userBalance = 1000;
  userBalanceEl.textContent = `Balance: ${userBalance}`;
  betHistoryList.innerHTML = '';
};

/* balance functions */
function loadUserBalance(){
  if(!loggedInUser) return;
  const b = JSON.parse(localStorage.getItem(`balance_${loggedInUser}`));
  if(b!=null) userBalance = b;
  userBalanceEl.textContent = `Balance: ${userBalance}`;
}
function saveUserBalance(){
  if(!loggedInUser) return;
  localStorage.setItem(`balance_${loggedInUser}`, userBalance);
  userBalanceEl.textContent = `Balance: ${userBalance}`;
}

/* ---------- betting ---------- */
function addBetForUser(username, betObj){
  const key = `bets_${username}`;
  const arr = JSON.parse(localStorage.getItem(key)||'[]');
  arr.push(betObj);
  localStorage.setItem(key, JSON.stringify(arr));
}

placeBet2Btn.onclick = ()=>{
  if(!loggedInUser){ alert('Login to place bets'); return; }
  const n = parseInt(bet2Input.value);
  const amt = parseInt(betAmt2.value);
  if(isNaN(n) || n<0 || n>99){ alert('Enter valid 2-digit number (0-99)'); return; }
  if(isNaN(amt) || amt<=0 || amt>userBalance){ alert('Enter valid amount (<= balance)'); return; }
  // deduct now
  userBalance -= amt; saveUserBalance();
  const bet = { type:'2-digit', num:n, amount:amt, status:'Pending', placedAt: new Date().toLocaleString() };
  addBetForUser(loggedInUser, bet);
  renderBetHistory();
  bet2Input.value=''; betAmt2.value='';
};

placeBet3Btn.onclick = ()=>{
  if(!loggedInUser){ alert('Login to place bets'); return; }
  const n = parseInt(bet3Input.value);
  const amt = parseInt(betAmt3.value);
  if(isNaN(n)||n<0||n>999){ alert('Enter valid 3-digit number (0-999)'); return; }
  if(isNaN(amt) || amt<=0 || amt>userBalance){ alert('Enter valid amount (<= balance)'); return; }
  userBalance -= amt; saveUserBalance();
  const bet = { type:'3-digit', num:n, amount:amt, status:'Pending', placedAt: new Date().toLocaleString() };
  addBetForUser(loggedInUser, bet);
  renderBetHistory();
  bet3Input.value=''; betAmt3.value='';
};

function renderBetHistory(){
  betHistoryList.innerHTML = '';
  if(!loggedInUser) return;
  const arr = JSON.parse(localStorage.getItem(`bets_${loggedInUser}`)||'[]');
  arr.forEach(b=>{
    const li = document.createElement('li');
    if(b.type==='2-digit'){
      li.textContent = `2D ${pad(b.num,2)} — Bet ${b.amount} — ${b.status}` + (b.payout?` (payout ${b.payout})`:'');
    } else {
      li.textContent = `3D ${pad(b.num,3)} — Bet ${b.amount} — ${b.status}` + (b.payout?` (payout ${b.payout})`:'');
    }
    betHistoryList.appendChild(li);
  });
}

/* ---------- resolve bets for ALL users when a draw completes ---------- */
function resolveBetsForDraw(num2, num3, drawTime){
  const users = getAllUsers();
  users.forEach(u=>{
    const key = `bets_${u.username}`;
    let bets = JSON.parse(localStorage.getItem(key)||'[]');
    let changed = false;
    bets = bets.map(b=>{
      if(b.status === 'Pending'){
        if(b.type==='2-digit'){
          if(b.num === num2){
            b.status = 'Win';
            b.payout = b.amount * 100;
            // credit user's balance
            const prev = JSON.parse(localStorage.getItem(`balance_${u.username}`));
            const bal = (prev != null) ? prev : 1000;
            localStorage.setItem(`balance_${u.username}`, bal + b.payout);
          } else {
            b.status = 'Lose';
            b.payout = 0;
          }
          b.resolvedAt = drawTime;
          changed = true;
        } else if(b.type === '3-digit'){
          if(b.num === num3){
            b.status = 'Win';
            b.payout = b.amount * 1000;
            const prev = JSON.parse(localStorage.getItem(`balance_${u.username}`));
            const bal = (prev != null) ? prev : 1000;
            localStorage.setItem(`balance_${u.username}`, bal + b.payout);
          } else {
            b.status = 'Lose';
            b.payout = 0;
          }
          b.resolvedAt = drawTime;
          changed = true;
        }
      }
      return b;
    });
    if(changed) localStorage.setItem(key, JSON.stringify(bets));
  });

  // refresh UI for logged-in user (balance and bet history)
  if(loggedInUser){
    loadUserBalance();
    renderBetHistory();
  }
}

/* ---------- draw logic: stop at draw.stop -> show result, save history, resolve bets ---------- */
function saveResult(num2, num3){
  const now = new Date();
  const rec = { time: now.toLocaleString(), num2, num3 };
  const hist = JSON.parse(localStorage.getItem('resultHistory')||'[]');
  hist.unshift(rec);
  localStorage.setItem('resultHistory', JSON.stringify(hist));
  loadResultHistory();
}

/* check for draws that have reached stop time and handle them */
let processingDraw = false;
function checkForDrawStops(){
  if(processingDraw) return;
  const now = new Date();
  const currSecs = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();

  for(const d of manualDraws){
    if(d.executed) continue;
    const startSec = timeStrToSeconds(d.start);
    const stopSec = timeStrToSeconds(d.stop);

    // If we've passed stopSec -> trigger stop actions once
    if(currSecs >= stopSec){
      processingDraw = true;
      // pause animation
      stopAnimation();

      // set offsets so exact number is visible (we show first-cycle occurrence)
      offset2 = (d.num2 % (MAX2+1)) * ITEM_HEIGHT;
      offset3 = (d.num3 % (MAX3+1)) * ITEM_HEIGHT;
      scroll2.style.transform = `translateY(-${offset2}px)`;
      scroll3.style.transform = `translateY(-${offset3}px)`;

      // highlight
      clearHighlights();
      // highlight first-cycle element (index = num)
      const el2 = scroll2.children[d.num2];
      const el3 = scroll3.children[d.num3];
      if(el2) el2.classList.add('highlight');
      if(el3) el3.classList.add('highlight');

      // save result & resolve bets
      const drawTime = new Date().toLocaleString();
      saveResult(d.num2, d.num3);
      resolveBetsForDraw(d.num2, d.num3, drawTime);

      d.executed = true; // mark so not repeat

      // hold for a short time then resume
      setTimeout(()=>{
        // clear highlight (keep result in history)
        if(el2) el2.classList.remove('highlight');
        if(el3) el3.classList.remove('highlight');
        processingDraw = false;
        startAnimation();
      }, HOLD_AFTER_DRAW_MS);

      break; // handle one draw at a time
    }
  }
}

/* ---------- utility: load data on boot ---------- */
function boot(){
  // restore used codes array if missing
  if(!localStorage.getItem('usedRedeemCodes')) localStorage.setItem('usedRedeemCodes', JSON.stringify([]));

  // initial logged-in UI
  if(loggedInUser){
    authMessage.textContent = `Welcome ${loggedInUser}`;
    loginBtn.style.display='none';
    logoutBtn.style.display='inline';
    loadUserBalance();
    renderBetHistory();
  } else {
    userBalanceEl.textContent = `Balance: ${userBalance}`;
  }

  // start scroll
  startAnimation();

  // start a timer to check manual draws frequently (we already check inside animate loop but also as a backup)
  setInterval(()=> {
    // update any UI things if needed
    loadResultHistory();
    if(!processingDraw) checkForDrawStops();
  }, 1000);
}

boot();
