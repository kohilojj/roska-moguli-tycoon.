
// Basic game logic with daily bonus and prestige, shop and leaderboard (connected to Render backend)
let roskat = 0, rahat = 0, prestige = parseInt(localStorage.getItem('prestige')||0), rps = parseInt(localStorage.getItem('rps')||0), rpk = 1;
let loggedIn = false, playerName = localStorage.getItem('playerName')||'Anon';

const API_URL = "https://roska-moguli-tycoon.onrender.com"; // backend URL

const el = id => document.getElementById(id);

function updateUI(msg='') {
  el('roskat').innerText = Math.floor(roskat);
  el('rahat').innerText = Math.floor(rahat);
  el('prestige').innerText = prestige;
  el('rps').innerText = rps;
  if(msg){ el('message').innerText = msg; setTimeout(()=>el('message').innerText='',2500); }
}

document.getElementById('click-btn').onclick = e => {
  let gain = rpk * (1 + prestige*0.1);
  if(Math.random() < 0.05){ gain *= 10; spawnParticle(e.clientX,e.clientY,'+'+gain+'!'); }
  roskat += gain;
  if(roskat >= 10){ const earned = Math.floor(roskat/10)*5; rahat += earned; roskat %= 10; updateUI('Myit roskia ja sait '+earned+' €'); sendScore(); loadLeaderboard(); saveState(); }
  else updateUI('+'+gain+' roskaa');
  saveState();
};

setInterval(()=>{ if(rps>0){ roskat += rps/1; updateUI(); saveState(); } },1000);

// daily bonus
function giveDailyBonus(){
  const today = new Date().toDateString();
  const last = localStorage.getItem('lastBonus');
  if(today !== last){
    const reward = Math.random()<0.5?1000:10;
    if(reward>100){ rahat += reward; updateUI('Päivittäinen bonus +'+reward+' €!'); }
    else { rps += reward; updateUI('Päivittäinen bonus +'+reward+' RPS!'); }
    localStorage.setItem('lastBonus', today);
    saveState();
  }
}

// prestige reset
function doPrestige(){
  if(rahat < 10000){ updateUI('Tarvitset 10 000€ prestigeen'); return; }
  prestige++; localStorage.setItem('prestige', prestige);
  roskat = 0; rahat = 0; rps = 0; rpk = 1; updateUI('Prestige tehty!'); saveState(); sendScore();
}
document.getElementById('prestige-btn').onclick = doPrestige;

// shop items (pro shop expanded)
const shopItems = [
  {id:'cart',name:'Roskakärry',price:50,rps:1,icon:'🛒',desc:'Perus keräysväline.'},
  {id:'truck',name:'Jäteauto',price:500,rps:10,icon:'🚛',desc:'Nopea keräily kaupungeissa.'},
  {id:'press',name:'Superpuristin',price:5000,rps:50,icon:'🏗️',desc:'Tiivistää roskat.'},
  {id:'robot',name:'Roskisrobotti',price:2000,rps:25,icon:'🤖',desc:'Auttaa keruussa yötä päivää.'},
  {id:'smart',name:'Älyroskalaatikko',price:10000,rps:100,icon:'📦',desc:'Automatisoi lajittelun.'},
  {id:'recycler',name:'Kierrätyslaitos',price:50000,rps:500,icon:'♻️',desc:'Suurta kapasiteettia.'},
  {id:'inc',name:'Polttolaitos',price:200000,rps:2500,icon:'🔥',desc:'Tehokas ja kallis.'},
  {id:'mega',name:'Mega-jäteasema',price:1000000,rps:10000,icon:'🏭',desc:'Aloittaa kaupungin puhdistuksen.'},
  {id:'nano',name:'Nanoroskanpuristin',price:10000000,rps:100000,icon:'🧲',desc:'Futuristista teknologiaa.'},
  {id:'planet',name:'Planeetan siivousprojekti',price:1000000000,rps:5000000,icon:'🌍',desc:'Kaikki peliin.'}
];

function formatN(n){ return n.toLocaleString(); }

function renderShop(){
  const shop = el('shop'); shop.innerHTML='';
  shopItems.forEach(it=>{
    const card = document.createElement('div'); card.className='shop-card';
    card.innerHTML = `<div class="card-top"><div class="icon">${it.icon}</div><div><div class="title">${it.name}</div><div class="desc">${it.desc}</div></div></div>
      <div class="card-footer"><div class="price">${formatN(it.price)} €</div><button class="buy-btn" data-id="${it.id}">Osta</button></div>`;
    shop.appendChild(card);
  });
  refreshShopButtons();
}

function refreshShopButtons(){
  shopItems.forEach(it=>{
    const btn = document.querySelector('.buy-btn[data-id="'+it.id+'"]');
    if(!btn) return; btn.disabled = (rahat < it.price);
  });
}

function buyItem(id){
  const it = shopItems.find(s=>s.id===id); if(!it) return;
  if(rahat < it.price){ updateUI('Ei tarpeeksi rahaa!'); return; }
  rahat -= it.price; rps += it.rps; updateUI('Ostit '+it.name+'!'); saveState(); refreshShopButtons();
  // animation
  const btn = document.querySelector('.buy-btn[data-id="'+id+'"]');
  if(btn){ const card = btn.closest('.shop-card'); card.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:260}); }
  sendScore(); loadLeaderboard();
}

async function loadLeaderboard(){
  try{
    const resp = await fetch(`${API_URL}/leaderboard`);
    const data = await resp.json();
    el('leaders').innerHTML='';
    data.forEach((row,i)=>{ const li = document.createElement('li'); li.innerText = `${i+1}. ${row.name} — ${row.score} €`; el('leaders').appendChild(li); });
  }catch(e){ el('leaders').innerHTML='<li>Ei yhteyttä leaderboardiin</li>'; }
}

async function sendScore(){ if(!loggedIn) return; try{ await fetch(`${API_URL}/submit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:playerName,score:rahat,prestige})}); }catch(e){} }

function spawnParticle(x,y,text){ const p = document.createElement('div'); p.className='particle'; p.innerText = text; document.body.appendChild(p); p.style.left = x+'px'; p.style.top = y+'px'; setTimeout(()=>p.remove(),900); }

// audio mute btn
document.getElementById('mute-btn').onclick = ()=>{ const m = document.getElementById('bg-music'); if(m.paused) m.play(); else m.pause(); }

function saveState(){ localStorage.setItem('rahat',rahat); localStorage.setItem('rps',rps); localStorage.setItem('playerName',playerName); localStorage.setItem('prestige',prestige); }
function loadState(){ rahat = parseInt(localStorage.getItem('rahat')||'0'); rps = parseInt(localStorage.getItem('rps')||'0'); playerName = localStorage.getItem('playerName')||playerName; prestige = parseInt(localStorage.getItem('prestige')||'0'); updateUI(); }

window.addEventListener('load', ()=>{ loadState(); renderShop(); giveDailyBonus(); loadLeaderboard(); setInterval(()=>{ if(rps>0){ rahat += rps; updateUI(); saveState(); } },1000); });

// Google Identity callback - simple
function handleCredentialResponse(res){ try{ const data = JSON.parse(atob(res.credential.split('.')[1])); playerName = data.name; loggedIn = true; localStorage.setItem('playerName',playerName); updateUI('Hei '+playerName+'!'); giveDailyBonus(); sendScore(); }catch(e){} }
window.handleCredentialResponse = handleCredentialResponse;
