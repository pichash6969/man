/******************************************************
  Lottery-style UI:
  - 2-digit box on top, 3-digit below (visual)
  - manualDraws array (set start/stop HH:MM:SS, num2, num3)
  - scrolling animation + draw stop handling
  - login/signup, redeem codes, per-user balance
  - place bets, resolve bets on draw stop (2D x100, 3D x1000)
  - result & bet history persisted in localStorage
*******************************************************/

/* ---------- CONFIG: edit draws here (no UI) ---------- */
const manualDraws = [
  // Example: uncomment and set your times
  // { start: "14:30:00", stop: "14:30:05", num2: 45, num3: 789 },
  // { start: "14:31:00", stop: "14:31:05", num2: 12, num3: 345 },
];
/* ---------- Redeem codes (edit as needed) ---------- */
const redeemCodes = { "WELCOME100":100, "BONUS500":500, "LUCKY1000":1000 };

/* ---------- constants ---------- */
const ITEM_HEIGHT = 80;
const MAX2 = 99, MAX3 = 999;
const REPEAT = 3;
const SCROLL_SPEED_2 = 0.9;
const SCROLL_SPEED_3 = 1.4;
const HOLD_AFTER_DRAW_MS = 4000;

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

/* mark manual draws internal flags */
manualDraws.forEach(d => { d.executed = false; d.done = false; });

/* ---------- helpers ---------- */
const pad = (n,len=2)=> n.toString().padStart(len,'0');
function timeToSec(s){ const [h,m,sec]=s.split(':').map(Number); return h*3600 + m*60 + sec; }
function getUsers(){ return JSON.parse(localStorage.getItem('users')||'[]'); }

/* ---------- generate lists ---------- */
function generateNumbers(container, max){
  container.innerHTML = '';
  for(let r=0;r<REPEAT;r++){
    for(let i=0;i<=max;i++){
      const el = document.createElement('div');
      el.className = 'number-item' + ((i%2)?' alt':'');
      el.textContent = pad(i, max===99?2:3);
      container.appendChild(el);
    }
  }
}
generateNumbers(scroll2, MAX2);
generateNumbers(scroll3, MAX3);

const cycleH2 = (MAX2+1)*ITEM_HEIGHT*REPEAT;
const cycleH3 = (MAX3+1)*ITEM_HEIGHT*REPEAT;

/* ---------- scroll animation ---------- */
let off2 = 0, off3 = 0, raf=null, processing=false;
function animate(){
  off2 = (off2 + SCROLL_SPEED_2) % cycleH2;
  off3 = (off3 + SCROLL_SPEED_3) % cycleH3;
  scroll2.style.transform = `translateY(-${off2}px)`;
  scroll3.style.transform = `translateY(-${off3}px)`;
  checkDrawStops();
  raf = requestAnimationFrame(animate);
}
function startAnim(){ if(!raf) raf = requestAnimationFrame(animate); }
function stopAnim(){ if(raf) cancelAnimationFrame(raf); raf=null; }

/* ---------- highlights ---------- */
function clearHi(){
  Array.from(scroll2.children).forEach(c=>c.classList.remove('highlight'));
  Array.from(scroll3.children).forEach(c=>c.classList.remove('highlight'));
}

/* ---------- clock ---------- */
function tick(){
  const d=new Date(); clockDisplay.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  requestAnimationFrame(tick);
}
tick();

/* ---------- history ---------- */
function loadResults(){
  const arr = JSON.parse(localStorage.getItem('resultHistory')||'[]');
  historyList.innerHTML='';
  arr.forEach(r=>{
    const li = document.createElement('li');
    li.textContent = `${r.time} → 2D:${pad(r.num2,2)} | 3D:${pad(r.num3,3)}`;
    historyList.appendChild(li);
  });
}
loadResults();

/* ---------- redeem ---------- */
function usedCodes(){ return JSON.parse(localStorage.getItem('usedRedeemCodes')||'[]'); }
function markUsed(code){ const u=usedCodes(); if(!u.includes(code)){ u.push(code); localStorage.setItem('usedRedeemCodes', JSON.stringify(u)); } }
redeemBtn.onclick = ()=>{
  if(!loggedInUser){ alert('Please login to redeem'); return; }
  const code = (redeemInput.value||'').toUpperCase().trim();
  if(!code){ redeemMessage.textContent='Enter a code'; return; }
  if(usedCodes().includes(code)){ redeemMessage.textContent='Code already used'; redeemInput.value=''; return; }
  const val = redeemCodes[code];
  if(!val){ redeemMessage.textContent='Invalid code'; redeemInput.value=''; return; }
  userBalance += val; saveBalance(); markUsed(code);
  redeemMessage.textContent = `+${val} coins added`;
  redeemInput.value='';
  renderBets();
};

/* ---------- auth ---------- */
signupBtn.onclick = ()=>{
  const u = (signupUsername.value||'').trim(), p=(signupPassword.value||'').trim();
  if(!u||!p){ authMessage.textContent='Enter username & password'; return; }
  const users = getUsers();
  if(users.find(x=>x.username===u)){ authMessage.textContent='Username exists'; return; }
  users.push({ username: u, password: p });
  localStorage.setItem('users', JSON.stringify(users));
  authMessage.textContent='Signup done. Please login.';
  signupUsername.value=''; signupPassword.value='';
};
loginBtn.onclick = ()=>{
  const u=(loginUsername.value||'').trim(), p=(loginPassword.value||'').trim();
  const user = getUsers().find(x=>x.username===u && x.password===p);
  if(!user){ authMessage.textContent='Invalid credentials'; return; }
  loggedInUser = u; localStorage.setItem('loggedInUser', loggedInUser);
  authMessage.textContent = `Welcome ${loggedInUser}`;
  loginBtn.style.display='none'; logoutBtn.style.display='inline';
  loadBalance(); renderBets();
  loginUsername.value=''; loginPassword.value='';
};
logoutBtn.onclick = ()=>{
  loggedInUser = null; localStorage.removeItem('loggedInUser');
  authMessage.textContent='Logged out';
  loginBtn.style.display='inline'; logoutBtn.style.display='none';
  userBalance = 1000; userBalanceEl.textContent = `Balance: ${userBalance}`;
  betHistoryList.innerHTML='';
};

/* ---------- balance ---------- */
function loadBalance(){ if(!loggedInUser) return; const b = JSON.parse(localStorage.getItem(`balance_${loggedInUser}`)); if(b!=null) userBalance=b; userBalanceEl.textContent = `${userBalance}`; }
function saveBalance(){ if(!loggedInUser) return; localStorage.setItem(`balance_${loggedInUser}`, userBalance); userBalanceEl.textContent = `${userBalance}`; }

/* ---------- betting ---------- */
function addBet(username, bet){
  const key = `bets_${username}`; const arr = JSON.parse(localStorage.getItem(key)||'[]'); arr.push(bet); localStorage.setItem(key, JSON.stringify(arr));
}
placeBet2Btn.onclick = ()=>{
  if(!loggedInUser){ alert('Login to bet'); return; }
  const n = parseInt(bet2Input.value), a = parseInt(betAmt2.value);
  if(isNaN(n)||n<0||n>99){ alert('2D number invalid'); return; }
  if(isNaN(a)||a<=0||a>userBalance){ alert('Invalid amount'); return; }
  userBalance -= a; saveBalance();
  addBet(loggedInUser, { type:'2-digit', num:n, amount:a, status:'Pending', placedAt:new Date().toLocaleString() });
  bet2Input.value=''; betAmt2.value=''; renderBets();
};
placeBet3Btn.onclick = ()=>{
  if(!loggedInUser){ alert('Login to bet'); return; }
  const n = parseInt(bet3Input.value), a = parseInt(betAmt3.value);
  if(isNaN(n)||n<0||n>999){ alert('3D number invalid'); return; }
  if(isNaN(a)||a<=0||a>userBalance){ alert('Invalid amount'); return; }
  userBalance -= a; saveBalance();
  addBet(loggedInUser, { type:'3-digit', num:n, amount:a, status:'Pending', placedAt:new Date().toLocaleString() });
  bet3Input.value=''; betAmt3.value=''; renderBets();
};
function renderBets(){
  betHistoryList.innerHTML='';
  if(!loggedInUser) return;
  const arr = JSON.parse(localStorage.getItem(`bets_${loggedInUser}`)||'[]');
  arr.forEach(b=>{
    const li = document.createElement('li');
    if(b.type==='2-digit') li.textContent = `2D ${pad(b.num,2)} — ${b.amount} — ${b.status}` + (b.payout?` (payout ${b.payout})`:'');
    else li.textContent = `3D ${pad(b.num,3)} — ${b.amount} — ${b.status}` + (b.payout?` (payout ${b.payout})`:'');
    betHistoryList.appendChild(li);
  });
}

/* ---------- resolve bets for all users ---------- */
function resolveForDraw(num2, num3, drawTime){
  const users = getUsers();
  users.forEach(u=>{
    const key = `bets_${u.username}`; let bets = JSON.parse(localStorage.getItem(key)||'[]'); let changed=false;
    bets = bets.map(b=>{
      if(b.status!=='Pending') return b;
      if(b.type==='2-digit'){
        if(b.num === num2){ b.status='Win'; b.payout = b.amount * 100; const prev = JSON.parse(localStorage.getItem(`balance_${u.username}`))||1000; localStorage.setItem(`balance_${u.username}`, prev + b.payout); }
        else { b.status='Lose'; b.payout = 0; }
      } else {
        if(b.num === num3){ b.status='Win'; b.payout = b.amount * 1000; const prev = JSON.parse(localStorage.getItem(`balance_${u.username}`))||1000; localStorage.setItem(`balance_${u.username}`, prev + b.payout); }
        else { b.status='Lose'; b.payout = 0; }
      }
      b.resolvedAt = drawTime; changed=true; return b;
    });
    if(changed) localStorage.setItem(key, JSON.stringify(bets));
  });
  if(loggedInUser){ loadBalance(); renderBets(); }
}

/* ---------- draw stop handling ---------- */
function saveResult(num2, num3){
  const now = new Date(); const rec = { time: now.toLocaleString(), num2, num3 };
  const arr = JSON.parse(localStorage.getItem('resultHistory')||'[]'); arr.unshift(rec); localStorage.setItem('resultHistory', JSON.stringify(arr)); loadResults();
}
let busy=false;
function checkDrawStops(){
  if(busy) return;
  const now = new Date(); const secs = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  for(const d of manualDraws){
    if(d.executed) continue;
    const start = timeToSec(d.start), stop = timeToSec(d.stop);
    // during start-stop highlight nothing special (scroll keeps), we resolve on passing stop
    if(secs >= stop){
      busy = true;
      stopAnim();
      // snap offsets to show numbers (first cycle)
      off2 = (d.num2 % (MAX2+1)) * ITEM_HEIGHT;
      off3 = (d.num3 % (MAX3+1)) * ITEM_HEIGHT;
      scroll2.style.transform = `translateY(-${off2}px)`; scroll3.style.transform = `translateY(-${off3}px)`;
      clearHi();
      const el2 = scroll2.children[d.num2]; if(el2) el2.classList.add('highlight');
      const el3 = scroll3.children[d.num3]; if(el3) el3.classList.add('highlight');
      const drawTime = new Date().toLocaleString();
      saveResult(d.num2, d.num3);
      resolveForDraw(d.num2, d.num3, drawTime);
      d.executed = true;
      // hold then resume
      setTimeout(()=>{
        if(el2) el2.classList.remove('highlight');
        if(el3) el3.classList.remove('highlight');
        busy=false; startAnim();
      }, HOLD_AFTER_DRAW_MS);
      break;
    }
  }
}

/* ---------- boot ---------- */
function boot(){
  if(!localStorage.getItem('usedRedeemCodes')) localStorage.setItem('usedRedeemCodes', JSON.stringify([]));
  if(loggedInUser){ authMessage.textContent = `Welcome ${loggedInUser}`; loginBtn.style.display='none'; logoutBtn.style.display='inline'; loadBalance(); renderBets(); }
  else userBalanceEl.textContent = `${userBalance}`;
  startAnim();
  setInterval(()=>{ loadResults(); if(!busy) checkDrawStops(); }, 1000);
}
boot();
