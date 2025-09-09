// Mega game script: loads large shop JSON, popup shop with pagination, quests, achievements, events, prestige, daily bonus, leaderboard
let roskat=0, rahat=0, prestige=parseInt(localStorage.getItem('prestige')||0), rps=parseFloat(localStorage.getItem('rps')||0), rpk=1;
let loggedIn=false, playerName=localStorage.getItem('playerName')||'Anon';

const API_URL="https://roska-moguli-tycoon.onrender.com";
const el=id=>document.getElementById(id);

function updateUI(msg=''){ el('roskat').innerText=Math.floor(roskat); el('rahat').innerText=Math.floor(rahat); el('prestige').innerText=prestige; el('rps').innerText=Math.floor(rps); if(msg){ el('message').innerText=msg; setTimeout(()=>el('message').innerText='',2500);} }

// click
document.getElementById('click-btn').onclick = e=>{ let gain = rpk*(1+prestige*0.1); if(Math.random()<0.05) gain*=10; roskat+=gain; updateUI('+'+Math.floor(gain)+' roskaa'); saveState(); };

// sell
document.getElementById('sell-btn').onclick = ()=>{ if(roskat<1){ updateUI('Ei roskia myytäväksi'); return; } const earned=Math.floor(roskat/10)*5; if(earned<=0){ updateUI('Kerää enemmän roskaa'); return; } rahat+=earned; roskat=roskat%10; updateUI('Myit roskia ja sait '+earned+' €'); sendScore(); loadLeaderboard(); saveState(); };

// prestige
document.getElementById('prestige-btn').onclick = ()=>{ if(rahat<10000){ updateUI('Tarvitset 10 000€ prestigeen'); return; } prestige++; localStorage.setItem('prestige',prestige); roskat=0; rahat=0; rps=0; updateUI('Prestige tehty!'); saveState(); sendScore(); };

// daily bonus
function giveDailyBonus(){ const today=new Date().toDateString(); const last=localStorage.getItem('lastBonus'); if(today!==last){ const reward=Math.random()<0.5?1000:10; if(reward>100){ rahat+=reward; updateUI('Päivittäinen bonus +'+reward+' €!'); } else { rps+=reward; updateUI('Päivittäinen bonus +'+reward+' RPS!'); } localStorage.setItem('lastBonus',today); saveState(); } }

// shop modal controls and pagination
const shopModal=document.getElementById('shop-modal');
const openShop=document.getElementById('open-shop');
const closeShop=document.getElementById('close-shop');
const shopItemsContainer=document.getElementById('shop-items');
const shopSearch=document.getElementById('shop-search');
const shopSort=document.getElementById('shop-sort');
const prevPage=document.getElementById('prev-page');
const nextPage=document.getElementById('next-page');
const pageInfo=document.getElementById('page-info');
let shopItems=[];
let currentPage=1;
const PAGE_SIZE=50;
let filteredItems=[];

openShop.onclick = ()=>{ shopModal.setAttribute('aria-hidden','false'); renderPage(); };
closeShop.onclick = ()=>{ shopModal.setAttribute('aria-hidden','true'); };
window.onclick = e=>{ if(e.target===shopModal) shopModal.setAttribute('aria-hidden','true'); };

shopSearch.addEventListener('input', ()=>{ currentPage=1; applyFilterAndSort(); renderPage(); });
shopSort.addEventListener('change', ()=>{ currentPage=1; applyFilterAndSort(); renderPage(); });
prevPage.onclick = ()=>{ if(currentPage>1){ currentPage--; renderPage(); } };
nextPage.onclick = ()=>{ const maxPage=Math.ceil(filteredItems.length/PAGE_SIZE); if(currentPage<maxPage){ currentPage++; renderPage(); } };

function applyFilterAndSort(){
  const q=shopSearch.value.trim().toLowerCase();
  filteredItems = shopItems.filter(it=> it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q));
  const sort=shopSort.value;
  if(sort==='price_asc') filteredItems.sort((a,b)=>a.price-b.price);
  if(sort==='price_desc') filteredItems.sort((a,b)=>b.price-a.price);
}

function renderPage(){
  if(!filteredItems.length) applyFilterAndSort();
  const maxPage=Math.max(1,Math.ceil(filteredItems.length/PAGE_SIZE));
  if(currentPage>maxPage) currentPage=maxPage;
  const start=(currentPage-1)*PAGE_SIZE;
  const pageItems=filteredItems.slice(start,start+PAGE_SIZE);
  shopItemsContainer.innerHTML='';
  pageItems.forEach(it=>{
    const card=document.createElement('div'); card.className='shop-card';
    card.innerHTML=`<div class="card-top"><div class="icon">${it.icon}</div><div><div class="title">${it.name}</div><div class="desc">${it.desc}</div></div></div><div class="card-footer"><div class="price">${it.price.toLocaleString()} €</div><button class="buy-btn" data-id="${it.id}">Osta</button></div>`;
    shopItemsContainer.appendChild(card);
  });
  pageInfo.innerText = `Sivu ${currentPage} / ${maxPage} (${filteredItems.length} tuotetta)`;
  // attach buy handlers
  document.querySelectorAll('.buy-btn').forEach(b=> b.onclick = ()=> buyItem(b.dataset.id));
  // update prev/next disable
  prevPage.disabled = (currentPage===1);
  nextPage.disabled = (currentPage===maxPage);
}

function buyItem(id){ const it = shopItems.find(s=>s.id===id); if(!it) return; if(rahat<it.price){ updateUI('Ei tarpeeksi rahaa!'); return; } rahat-=it.price; rps+=it.rps; updateUI('Ostit '+it.name+'!'); saveState(); sendScore(); loadLeaderboard(); }

// load shop JSON (10k items)
async function loadShop(){
  try{
    const resp = await fetch('shopItems.json');
    shopItems = await resp.json();
    // enrich items: add icons and desc if missing
    shopItems.forEach((it,i)=>{ if(!it.id) it.id='item'+i; if(!it.icon) it.icon = ['🛒','🚛','🏗️','🤖','♻️'][i%5]; if(!it.desc) it.desc='Tuote #' + (i+1); });
    applyFilterAndSort();
    // preview: show 5 cheapest in short preview
    const preview = shopItems.slice(0,5).map(it=>`${it.name} - ${it.price.toLocaleString()} €`).join('<br>');
    document.getElementById('shop-short-preview').innerHTML = preview;
  }catch(e){ console.error('shop load error',e); }
}

// achievements (simple)
let achievements = JSON.parse(localStorage.getItem('achievements')||'[]');
function grantAchievement(key, text){ if(achievements.includes(key)) return; achievements.push(key); localStorage.setItem('achievements', JSON.stringify(achievements)); const ul = document.getElementById('achievements'); const li = document.createElement('li'); li.innerText = text; ul.appendChild(li); }

function loadAchievements(){ const ul = document.getElementById('achievements'); ul.innerHTML=''; achievements.forEach(k=> ul.appendChild(Object.assign(document.createElement('li'), {innerText: k}))); }

// quests simple generator
let quests = JSON.parse(localStorage.getItem('quests')||'[]');
function genQuest(){ const qid = 'q'+Math.floor(Math.random()*1000000); const q = { id: qid, text: 'Kerää '+(1000 + Math.floor(Math.random()*9000))+' roskaa', done:false, rew: 500 + Math.floor(Math.random()*4500) }; quests.push(q); localStorage.setItem('quests', JSON.stringify(quests)); renderQuests(); }
function renderQuests(){ const ul = document.getElementById('quests'); ul.innerHTML=''; quests.forEach(q=>{ const li=document.createElement('li'); li.innerText = q.text + (q.done?' ✅':''); const btn=document.createElement('button'); btn.innerText='Vaihda'; btn.onclick=()=>{ if(!q.done){ if(roskat>=parseInt(q.text.match(/\d+/)[0])){ roskat -= parseInt(q.text.match(/\d+/)[0]); rahat += q.rew; q.done=true; localStorage.setItem('quests', JSON.stringify(quests)); updateUI('Quest valmis! Palkinto '+q.rew+' €'); saveState(); } else updateUI('Ei tarpeeksi roskaa questiin'); } renderQuests(); }; li.appendChild(btn); ul.appendChild(li); }); }

// events: random spawn small bonus
function maybeSpawnEvent(){ if(Math.random() < 0.08){ const bonus = 100 + Math.floor(Math.random()*900); rahat += bonus; updateUI('Random event! Sait '+bonus+' €'); saveState(); } }
setInterval(()=> maybeSpawnEvent(), 15000);

// leaderboard functions
async function loadLeaderboard(){ try{ const resp = await fetch(`${API_URL}/leaderboard`); const data = await resp.json(); const ul = document.getElementById('leaders'); ul.innerHTML=''; data.forEach((r,i)=>{ const li=document.createElement('li'); li.innerText = `${i+1}. ${r.name} — ${r.score} €`; ul.appendChild(li); }); }catch(e){ document.getElementById('leaders').innerHTML = '<li>Ei yhteyttä leaderboardiin</li>'; } }
async function sendScore(){ if(!loggedIn) return; try{ await fetch(`${API_URL}/submit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:playerName,score:rahat,prestige})}); }catch(e){} }

// save/load
function saveState(){ localStorage.setItem('rahat',rahat); localStorage.setItem('rps',rps); localStorage.setItem('playerName',playerName); localStorage.setItem('prestige',prestige); localStorage.setItem('roskat',roskat); }
function loadState(){ rahat = parseFloat(localStorage.getItem('rahat')||'0'); rps = parseFloat(localStorage.getItem('rps')||'0'); playerName = localStorage.getItem('playerName')||playerName; prestige = parseInt(localStorage.getItem('prestige')||'0'); roskat = parseFloat(localStorage.getItem('roskat')||'0'); updateUI(); }

// on load
window.addEventListener('load', ()=>{ loadState(); loadShop(); renderQuests(); loadAchievements(); giveDailyBonus(); loadLeaderboard(); setInterval(()=>{ if(rps>0){ roskat += rps/1; saveState(); updateUI(); } },1000); setInterval(()=>{ genQuest(); }, 60000); });

// Google identity callback
function handleCredentialResponse(res){ try{ const data = JSON.parse(atob(res.credential.split('.')[1])); playerName = data.name; loggedIn = true; localStorage.setItem('playerName',playerName); updateUI('Hei '+playerName+'!'); giveDailyBonus(); sendScore(); }catch(e){} }
window.handleCredentialResponse = handleCredentialResponse;
