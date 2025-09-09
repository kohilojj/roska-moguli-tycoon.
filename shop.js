
const el = id => document.getElementById(id);
let rahat = 0;
let rps = 0;
let playerName = localStorage.getItem('playerName') || 'Anon';

const shopItems = [
  { id: 'kick', name:'Roskakärry', price:50, rps:1, icon:'🛒', desc:'Perus keräysväline. Hyvä aloitukseen.' },
  { id: 'binbot', name:'Roskisrobotti', price:2000, rps:25, icon:'🤖', desc:'Auttaa keruussa 24/7.' },
  { id: 'smartbox', name:'Älyroskalaatikko', price:10000, rps:100, icon:'📦', desc:'Automatisoi lajittelun.' },
  { id: 'truck', name:'Jäteauto', price:500, rps:10, icon:'🚛', desc:'Nopea keräily kaupungeissa.' },
  { id: 'press', name:'Superpuristin', price:5000, rps:50, icon:'🏗️', desc:'Tiivistää roskat ja nostaa arvoa.' },
  { id: 'recycler', name:'Kierrätyslaitos', price:50000, rps:500, icon:'♻️', desc:'Suuri kierrätysmäärä.' },
  { id: 'incinerator', name:'Polttolaitos', price:200000, rps:2500, icon:'🔥', desc:'Tehokas ja kallis.' },
  { id: 'megateam', name:'Mega-jäteasema', price:1000000, rps:10000, icon:'🏭', desc:'Aloittaa kaupungin puhdistamisen.' },
  { id: 'nanopress', name:'Nanoroskanpuristin', price:10000000, rps:100000, icon:'🧲', desc:'Futuristinen laite.' },
  { id: 'planetclean', name:'Planeetan siivousprojekti', price:1000000000, rps:5000000, icon:'🌍', desc:'Ei kaikille saatavilla.' },
  { id: 'collector', name:'Erikoiskeräilijä', price:7500, rps:70, icon:'🎯', desc:'Kerää harvinaisia esineitä.' },
  { id: 'market', name:'Yksityismarkkinat', price:25000, rps:250, icon:'🏬', desc:'Paremmat hinnat roskille.' },
  { id: 'drone', name:'Dronet', price:40000, rps:400, icon:'🛸', desc:'Ilmaoperaatiot tuovat etumatkaa.' },
  { id: 'fusion', name:'Fusiovoimala', price:25000000, rps:400000, icon:'⚛️', desc:'Tehokas energianlähde.' },
  { id: 'sat', name:'RoskaSatelliitti', price:500000000, rps:2000000, icon:'🛰️', desc:'Globaalin roskan hallinta.' },
  { id: 'mall', name:'RoskaMegaMall', price:75000000, rps:600000, icon:'🛍️', desc:'Tuo rahavirran.' },
  { id: 'ai', name:'AI-lajittelija', price:1200000, rps:12000, icon:'🤖', desc:'Älykäs optimointi.' },
  { id: 'ship', name:'Jätelaiva', price:880000, rps:8800, icon:'🚢', desc:'Kuljettaa miljoonia tonneja.' },
  { id: 'lab', name:'Kehityslaboratorio', price:3333333, rps:33333, icon:'🔬', desc:'Tutkii parempia koneita.' },
  { id: 'vault', name:'RoskaVault', price:99999999, rps:999999, icon:'🏦', desc:'Suuri, turvallinen arvo.' }
];

function format(n){ return n.toLocaleString(); }

function renderShop(){
  const shop = el('shop');
  shop.innerHTML='';
  shopItems.forEach(it=>{
    const tmpl = document.getElementById('shop-card-template');
    const node = tmpl.content.cloneNode(true);
    node.querySelector('.icon').textContent = it.icon;
    node.querySelector('.title').textContent = it.name;
    node.querySelector('.desc').textContent = it.desc;
    node.querySelector('.price').textContent = format(it.price) + ' €';
    const btn = node.querySelector('.buy-btn');
    btn.addEventListener('click', ()=>buy(it.id));
    btn.dataset.id = it.id;
    shop.appendChild(node);
  });
  refreshButtons();
}

function refreshButtons(){
  shopItems.forEach(it=>{
    const btn = document.querySelector('.buy-btn[data-id="'+it.id+'"]');
    if(!btn) return;
    btn.disabled = (rahat < it.price);
  });
}

function buy(id){
  const it = shopItems.find(s=>s.id===id);
  if(!it) return;
  if(rahat < it.price){ flash('Ei tarpeeksi rahaa!'); return; }
  rahat -= it.price;
  rps += it.rps;
  flash('Ostit '+it.name+'!');
  updateInfo();
  refreshButtons();
  // pieni animaatio: kortin välähdys
  const card = document.querySelector('.buy-btn[data-id="'+id+'"]').closest('.shop-card');
  card.animate([{ transform:'scale(1)'},{ transform:'scale(1.04)'},{ transform:'scale(1)' }], { duration:280 });
  // tallennus
  saveState();
}

function flash(text){ el('message') ? el('message').innerText = text : alert(text); setTimeout(()=>{ if(el('message')) el('message').innerText=''; },2000); }

function updateInfo(){
  el('rahat').textContent = format(rahat);
  el('rps').textContent = format(rps);
  el('user').textContent = playerName;
}

function saveState(){
  localStorage.setItem('rahat', rahat);
  localStorage.setItem('rps', rps);
  localStorage.setItem('playerName', playerName);
}

function loadState(){
  rahat = parseInt(localStorage.getItem('rahat')||'0');
  rps = parseInt(localStorage.getItem('rps')||'0');
  playerName = localStorage.getItem('playerName') || playerName;
  updateInfo();
}

window.addEventListener('load', ()=>{ loadState(); renderShop(); setInterval(()=>{ rahat += rps; updateInfo(); },1000); });

