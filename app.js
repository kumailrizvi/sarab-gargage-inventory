/*
  Sarab Al Madina Garage Inventory
  Multi-user version.
  - If config.js contains Supabase URL + anon key, the app uses Supabase Auth + database.
  - If config.js is empty, it falls back to localStorage for local testing.
*/
const $ = (id) => document.getElementById(id);
const CONFIG = window.SARAB_CONFIG || {};
const USE_SUPABASE = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && window.supabase);
const sb = USE_SUPABASE ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY) : null;
const KEYS = {
  users: 'sam_users_v2',
  session: 'sam_session_v2',
  parts: 'sam_parts_v2',
  jobs: 'sam_jobs_v2',
  vehicles: 'sam_vehicles_v1'
};
const AED = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' });
const today = () => new Date().toISOString().slice(0, 10);
const id = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const get = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = (n) => AED.format(Number(n || 0));
const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const normalizePlatePiece = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
function combinePlate(code, license){
  const c = normalizePlatePiece(code);
  const l = normalizePlatePiece(license);
  return [c, l].filter(Boolean).join(' ');
}
function splitPlate(plate){
  const clean = normalizePlatePiece(plate);
  const parts = clean.split(' ').filter(Boolean);
  if(parts.length <= 1) return { code: '', license: clean };
  return { code: parts[0], license: parts.slice(1).join(' ') };
}


const icons = {
  menu: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
  gauge: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 14a8 8 0 0 1 16 0"/><path d="M12 14l4-4"/><path d="M5 18h14"/><path d="M7 14h.01M17 14h.01"/></svg>',
  box: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  clipboard: '<svg class="icon" viewBox="0 0 24 24"><path d="M9 4h6l1 2h3v15H5V6h3l1-2z"/><path d="M9 13l2 2 4-5"/></svg>',
  wrench: '<svg class="icon" viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-3-3 3-3z"/></svg>',
  chart: '<svg class="icon" viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-9"/></svg>',
  download: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
  settings: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3-.2-.1a1.7 1.7 0 0 0-2 .1 7.5 7.5 0 0 1-1.7.7 1.7 1.7 0 0 0-1.2 1.6V23H9.3v-.2A1.7 1.7 0 0 0 8 21.2a7.5 7.5 0 0 1-1.7-.7 1.7 1.7 0 0 0-2-.1l-.2.1-2-3 .1-.1a1.7 1.7 0 0 0 .3-1.9 7.4 7.4 0 0 1 0-2 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3 .2.1a1.7 1.7 0 0 0 2-.1A7.5 7.5 0 0 1 8 7.8a1.7 1.7 0 0 0 1.2-1.6V6h3.4v.2A1.7 1.7 0 0 0 14 7.8a7.5 7.5 0 0 1 1.7.7 1.7 1.7 0 0 0 2 .1l.2-.1 2 3-.1.1a1.7 1.7 0 0 0-.3 1.9 7.4 7.4 0 0 1 0 2z"/></svg>',
  bell: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
  user: '<svg class="icon" viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
  plus: '<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  cart: '<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M6 6h15l-2 9H8L6 3H3"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>',
  file: '<svg class="icon icon-lg" viewBox="0 0 24 24"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M8 16h8M8 12h8"/></svg>',
  warning: '<svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M12 3l10 18H2L12 3z"/><path d="M12 9v5"/><path d="M12 18h.01"/></svg>',
  car: '<svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M5 11l2-5h10l2 5"/><path d="M3 13h18v5H3z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  check: '<svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  trash: '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/></svg>'
};
const I = (name, cls='') => (icons[name] || icons.box).replace('class="icon', `class="icon ${cls}`);

const seedUsers = [{ id: 'u_demo', name: 'Sarab Al Madina Team', email: 'admin@garage.com', password: 'admin123', role: 'Garage Inventory' }];
const seedParts = [
  { id:'p_oil_filter', name:'Oil Filter', sku:'OF-1001', category:'Engine', location:'Rack A-01', qty:25, threshold:10, cost:18, price:35, supplier:'Bosch', fits:'Toyota Corolla, Nissan Sunny', createdAt:'2026-01-01T00:00:00Z' },
  { id:'p_air_filter', name:'Air Filter', sku:'AF-2001', category:'Engine', location:'Rack A-02', qty:8, threshold:10, cost:22, price:45, supplier:'Toyota', fits:'Toyota Corolla, Honda Civic', createdAt:'2026-01-01T00:00:00Z' },
  { id:'p_brake_pad', name:'Brake Pad Set', sku:'BP-3001', category:'Braking', location:'Rack B-03', qty:4, threshold:5, cost:95, price:180, supplier:'Akebono', fits:'Honda Civic, Toyota Corolla', createdAt:'2026-01-01T00:00:00Z' },
  { id:'p_spark_plug', name:'Spark Plug', sku:'SP-4001', category:'Electrical', location:'Rack C-01', qty:15, threshold:10, cost:12, price:25, supplier:'NGK', fits:'Nissan Sunny, Mitsubishi Lancer', createdAt:'2026-01-01T00:00:00Z' },
  { id:'p_engine_oil', name:'Engine Oil 5W30', sku:'EO-5001', category:'Fluids', location:'Shelf F-02', qty:18, threshold:10, cost:42, price:75, supplier:'Castrol', fits:'Universal', createdAt:'2026-01-01T00:00:00Z' }
];
const seedJobs = [
  { id:'j_1', date: today(), customer:'Walk-in', phone:'', car:'Toyota Corolla', plate:'ABC 123', description:'Oil Change & Filter Replacement + Car Wash', doneBy:'Kumail', labour:80, labourHours:1.5, customCharges:[{name:'Car wash', amount:20}], lines:[{partId:'p_oil_filter',name:'Oil Filter',sku:'OF-1001',qty:1,price:35},{partId:'p_engine_oil',name:'Engine Oil 5W30',sku:'EO-5001',qty:1,price:75}], total:210, createdAt:new Date().toISOString() },
  { id:'j_2', date: today(), customer:'Walk-in', phone:'', car:'Honda Civic', plate:'DUB 456', description:'Brake Pad Replacement', doneBy:'John', labour:160, labourHours:2, lines:[{partId:'p_brake_pad',name:'Brake Pad Set',sku:'BP-3001',qty:1,price:180}], total:340, createdAt:new Date().toISOString() }
];
const seedVehicles = [
  { id:'v_1', modelNumber:'Toyota Hiace 2022', plate:'SMG 101', customer:'Sarab Al Madina', status:'In Use', ownership:'SMG Vehicle', rentRate:0, clientRate:350, notes:'Main fleet van', createdAt:'2026-01-01T00:00:00Z' },
  { id:'v_2', modelNumber:'Nissan Urvan 2021', plate:'SMG 202', customer:'Back-up', status:'Back-up', ownership:'SMG Vehicle', rentRate:0, clientRate:0, notes:'Back-up vehicle', createdAt:'2026-01-01T00:00:00Z' },
  { id:'v_3', modelNumber:'Mitsubishi Canter 2020', plate:'OUT 303', customer:'Client A', status:'In Use', ownership:'Outsource', rentRate:180, clientRate:300, notes:'Outsourced vehicle', createdAt:'2026-01-01T00:00:00Z' }
];

const state = { user:null, view:'dashboard', parts:[], jobs:[], vehicles:[], filters:{ q:'', category:'All', stock:'All' }, vehicleHistoryQuery:'', fleetFilter:'' };
function ensureLocalData(){ if(!localStorage.getItem(KEYS.users)) set(KEYS.users, seedUsers); if(!localStorage.getItem(KEYS.parts)) set(KEYS.parts, seedParts); if(!localStorage.getItem(KEYS.jobs)) set(KEYS.jobs, seedJobs); set(KEYS.vehicles, seedVehicles); if(!localStorage.getItem(KEYS.vehicles)) set(KEYS.vehicles, seedVehicles); }
function loadLocalData(){ state.user = get(KEYS.session, null); state.parts = get(KEYS.parts, []); state.jobs = get(KEYS.jobs, []); state.vehicles = get(KEYS.vehicles, []); }
async function loadSupabaseSession(){
  const { data, error } = await sb.auth.getSession();
  if(error) console.warn(error);
  const session = data?.session;
  state.user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.name || 'Sarab Al Madina Team',
    role: 'Garage Inventory'
  } : null;
}
async function fetchRows(table){
  const { data, error } = await sb.from(table).select('id,data').order(table === 'jobs' ? 'created_at' : 'updated_at', { ascending:false });
  if(error){ console.error(error); toast(`Could not load ${table}`); return []; }
  return (data || []).map(r => ({ id:r.id, ...r.data }));
}
async function loadRemoteData(){
  state.parts = await fetchRows('parts');
  state.jobs = await fetchRows('jobs');
  state.vehicles = await fetchRows('vehicles');
  if(state.parts.length === 0){
    state.parts = seedParts.map(p => ({...p}));
    await saveParts();
  }
  if(state.vehicles.length === 0){
    state.vehicles = seedVehicles.map(v => ({...v}));
    await saveVehicles();
  }
}
function loadData(){ if(USE_SUPABASE) return; loadLocalData(); }
async function saveParts(){
  if(!USE_SUPABASE){ set(KEYS.parts, state.parts); return; }
  const rows = state.parts.map(p => ({ id:p.id, data:p, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('parts').upsert(rows);
  if(error){ console.error(error); toast('Could not save inventory'); }
}
async function saveJobs(){
  if(!USE_SUPABASE){ set(KEYS.jobs, state.jobs); return; }
  const rows = state.jobs.map(j => ({ id:j.id, data:j, created_at:j.createdAt || new Date().toISOString() }));
  const { error } = await sb.from('jobs').upsert(rows);
  if(error){ console.error(error); toast('Could not save job history'); }
}
async function saveVehicles(){
  if(!USE_SUPABASE){ set(KEYS.vehicles, state.vehicles); return; }
  const rows = state.vehicles.map(v => ({ id:v.id, data:v, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('vehicles').upsert(rows);
  if(error){ console.error(error); toast('Could not save fleet vehicles'); }
}
async function deleteRemoteRow(table, id){
  if(!USE_SUPABASE) return;
  const { error } = await sb.from(table).delete().eq('id', id);
  if(error){ console.error(error); toast(`Could not delete ${table}`); }
}
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'), 2400); }
function hydrateStaticIcons(){ document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icons[el.dataset.icon] || ''; }); }

async function init(){
  hydrateStaticIcons(); bindGlobal();
  if(USE_SUPABASE){
    await loadSupabaseSession();
    if(state.user){ await loadRemoteData(); showApp(); } else showAuth();
  } else {
    ensureLocalData(); loadLocalData();
    if(state.user) showApp(); else showAuth();
  }
}
function bindGlobal(){
  $('loginTab').onclick=()=>toggleAuth('login');
  if($('signupTab')) $('signupTab').onclick=(e)=>{ e.preventDefault(); toast('Sign up is disabled for now. Ask admin to create the login.'); };
  $('loginForm').onsubmit=login; $('signupForm').onsubmit=signup; $('logoutBtn').onclick=logout;
  $('partForm').onsubmit=savePartFromForm; $('restockForm').onsubmit=saveRestock;
  $('mobileMenu').onclick=()=> $('sidebar').classList.toggle('open');
  document.querySelectorAll('.nav').forEach(btn => btn.onclick=()=>go(btn.dataset.view));
}
function toggleAuth(mode){ $('loginTab').classList.toggle('active', mode==='login'); $('signupTab').classList.toggle('active', mode==='signup'); $('loginForm').classList.toggle('hidden', mode!=='login'); $('signupForm').classList.toggle('hidden', mode!=='signup'); }
function showAuth(){ $('authScreen').classList.remove('hidden'); $('appShell').classList.add('hidden'); }
function showApp(){ $('authScreen').classList.add('hidden'); $('appShell').classList.remove('hidden'); $('userName').textContent = 'Sarab Al Madina Team'; render(); }
async function login(e){
  e.preventDefault();
  const email=$('loginEmail').value.trim().toLowerCase(); const pass=$('loginPassword').value;
  if(USE_SUPABASE){
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if(error) return toast(error.message || 'Wrong email or password');
    await loadSupabaseSession();
    await loadRemoteData();
    showApp();
    return;
  }
  const users=get(KEYS.users, seedUsers); const user=users.find(u=>u.email.toLowerCase()===email && u.password===pass); if(!user) return toast('Wrong email or password'); state.user={id:user.id,name:user.name,email:user.email,role:user.role||'Garage Inventory'}; set(KEYS.session,state.user); showApp();
}
async function signup(e){
  e.preventDefault();
  const email=$('signupEmail').value.trim().toLowerCase(); const password=$('signupPassword').value; const name=$('signupName').value.trim() || 'Sarab Al Madina Team';
  if(USE_SUPABASE){
    const { data, error } = await sb.auth.signUp({ email, password, options:{ data:{ name } } });
    if(error) return toast(error.message || 'Could not create account');
    toast('Account created. Check email if confirmation is enabled, then login.');
    toggleAuth('login');
    $('loginEmail').value = email;
    $('loginPassword').value = '';
    return;
  }
  const users=get(KEYS.users, []); if(users.some(u=>u.email.toLowerCase()===email)) return toast('This email already exists'); const user={id:id('u'),name,email,password,role:'Garage Inventory'}; users.push(user); set(KEYS.users, users); state.user={id:user.id,name:user.name,email:user.email,role:user.role}; set(KEYS.session,state.user); showApp();
}
async function logout(){
  if(USE_SUPABASE) await sb.auth.signOut();
  localStorage.removeItem(KEYS.session); state.user=null; showAuth();
}
function go(view){ state.view=view; document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active', b.dataset.view===view)); $('sidebar').classList.remove('open'); render(); }

function defaultStaffName(){
  const name = String(state.user?.name || '').trim();
  if(name && name !== 'Sarab Al Madina Team') return name;
  const email = String(state.user?.email || '').split('@')[0].trim();
  return email || '';
}
function stats(){
  const totalUnits = state.parts.reduce((a,p)=>a+Number(p.qty||0),0);
  const low = state.parts.filter(p=>Number(p.qty)<=Number(p.threshold));
  const todayJobs = state.jobs.filter(j=>j.date===today());
  const partsUsedToday = todayJobs.reduce((a,j)=>a+j.lines.reduce((x,l)=>x+Number(l.qty),0),0);
  const costValue = state.parts.reduce((a,p)=>a+(Number(p.qty||0)*Number(p.cost||0)),0);
  const salesValue = state.parts.reduce((a,p)=>a+(Number(p.qty||0)*Number(p.price||0)),0);
  return { totalUnits, lowCount: low.length, todayJobs: todayJobs.length, partsUsedToday, costValue, salesValue };
}
function render(){ if(!USE_SUPABASE) loadData(); const s=stats(); const page=$('page'); const views={dashboard:dashboardHTML, inventory:inventoryHTML, fleet:fleetHTML, job:jobHTML, used:usedHTML, reports:reportsHTML, export:exportHTML, settings:settingsHTML}; page.innerHTML=(views[state.view]||dashboardHTML)(s); bindPageEvents(); hydrateStaticIcons(); }
function kpi(title,num,sub,icon,warn=false){ const tone=warn?'orange':''; const moneyClass=String(num).includes('AED')?'money':''; return `<section class="card kpi"><div><h3>${title}</h3><div class="num ${tone} ${moneyClass}">${num}</div><p>${sub}</p></div><div class="kpi-icon ${warn?'warn':''}">${I(icon,'icon-xl')}</div></section>`; }
function dashboardHTML(s){
  const recentJobs=state.jobs.slice(0,4);
  return `<div class="kpis">${kpi('Total Parts',s.totalUnits,'All units in inventory','box')}${kpi('Low Stock',s.lowCount,'Parts need restocking','warning',s.lowCount>0)}${kpi('Jobs Today',s.todayJobs,'Jobs logged today','clipboard')}${kpi('Parts Used Today',s.partsUsedToday,'Total parts used','wrench')}${kpi('Inventory Cost Value',money(s.costValue),'Current buying cost value','chart')}</div>
  <section class="panel quick"><div class="section-title"><h3>Quick Actions</h3></div><div class="quick-grid"><button class="btn primary large-btn" onclick="openPartDialog()">${I('plus')} Add Part</button><button class="btn primary large-btn" onclick="go('job')">${I('clipboard')} Log Job</button><button class="btn primary large-btn" onclick="openRestockDialog()">${I('cart')} Restock</button><button class="btn primary large-btn" onclick="go('export')">${I('file')} Export CSV</button></div></section>
  ${plateHistoryPanelHTML('Quickly search a plate number from the dashboard and see all work done for that vehicle.')}
  <div class="dashboard-stack"><section class="panel"><div class="section-title"><h3>Inventory Overview</h3><button class="mini-btn" onclick="go('inventory')">View All Inventory</button></div>${inventoryTable(state.parts.slice(0,5), true)}</section><section class="panel"><div class="section-title"><h3>Recent Jobs</h3><button class="mini-btn" onclick="go('used')">View All Jobs</button></div>${recentJobs.length?`<div class="jobs-list compact-jobs">${recentJobs.map(jobRow).join('')}</div>`:'<div class="empty">No jobs logged yet.</div>'}</section></div>`;
}
function filteredInventoryParts(){
  return state.parts.filter(p=>{
    const q=String(state.filters.q || '').trim().toLowerCase();
    const haystack=[p.name,p.sku,p.category,p.location,p.supplier,p.fits,p.ordered ? 'ordered' : '', Number(p.qty||0)===0 ? 'finished out of stock' : ''].join(' ').toLowerCase();
    const matches=!q || haystack.includes(q);
    const cat=state.filters.category==='All' || p.category===state.filters.category;
    const stock=state.filters.stock==='All'
      || (state.filters.stock==='Low' && Number(p.qty)<=Number(p.threshold) && Number(p.qty)>0)
      || (state.filters.stock==='In Stock' && Number(p.qty)>0)
      || (state.filters.stock==='Finished' && Number(p.qty)===0);
    return matches && cat && stock;
  });
}
function renderInventoryResults(){
  const target=$('inventoryResults');
  if(target) target.innerHTML = inventoryTable(filteredInventoryParts(), false);
}
function inventoryHTML(){
  const cats=['All',...new Set(state.parts.map(p=>p.category))];
  const filtered=filteredInventoryParts();
  return `<div class="page-head"><div><h1>Inventory</h1><p class="muted">Add, search, edit, delete, import and restock garage parts.</p></div><div class="head-actions"><button class="btn light" onclick="importInventoryCSV()">${I('download','icon-sm')} Import CSV</button><button class="btn primary" onclick="openPartDialog()">${I('plus','icon-sm')} Add Part</button></div></div>
  <section class="panel"><div class="filters"><input id="searchInput" placeholder="Search by part, SKU, supplier, car..." value="${esc(state.filters.q)}" autocomplete="off"><select id="categoryFilter">${cats.map(c=>`<option ${c===state.filters.category?'selected':''}>${c}</option>`).join('')}</select><select id="stockFilter">${['All','Low','In Stock','Finished'].map(x=>`<option ${x===state.filters.stock?'selected':''}>${x}</option>`).join('')}</select><button class="btn light" onclick="exportInventory()">${I('download','icon-sm')} CSV</button></div><div id="inventoryResults">${inventoryTable(filtered, false)}</div></section>`;
}
function inventoryTable(parts, compact=false){
  if(!parts.length) return '<div class="empty">No parts found.</div>';
  return `<div class="table-wrap"><table><thead><tr><th>Part Name</th><th>SKU</th><th>Stock</th><th>Ordered?</th><th>Low Alert</th><th>Cost Value</th><th>Last Used</th><th>History</th></tr></thead><tbody>${parts.map(p=>{
    const used=lastUsed(p.id);
    const qty=Number(p.qty||0);
    const finished=qty===0;
    const low=qty<=Number(p.threshold||0);
    const orderedBadge = finished
      ? `<button class="order-flag ${p.ordered?'ordered':''}" onclick="toggleOrdered('${p.id}')">${p.ordered?'Ordered ✓':'Need to order?'}</button>`
      : '<span class="muted">—</span>';
    return `<tr class="${finished?'finished-row':''}"><td><b>${esc(p.name)}</b><br><small class="muted">${esc(p.category)} · ${esc(p.location||'No shelf')}</small></td><td>${esc(p.sku)}</td><td class="status ${finished?'zero':low?'low':'ok'}">${finished?'0 · Finished':p.qty}</td><td>${orderedBadge}</td><td class="status ${low?'low':'ok'}">${p.threshold}</td><td>${money(qty*Number(p.cost))}</td><td>${used}</td><td>${compact?`<button class="mini-btn" onclick="viewPartUsage('${p.id}')">History</button>`:`<button class="mini-btn" onclick="viewPartUsage('${p.id}')">History</button> <button class="mini-btn" onclick="openPartDialog('${p.id}')">Edit</button> <button class="mini-btn" onclick="openRestockDialog('${p.id}')">Restock</button> <button class="mini-btn danger" onclick="deletePart('${p.id}')">Delete</button>`}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function lastUsed(partId){ const j=state.jobs.find(job=>job.lines.some(l=>l.partId===partId)); if(!j) return '<span class="muted">Never</span>'; return j.date===today()?'<span class="ok">Today</span>':esc(j.date); }
function jobRow(j){ return `<div class="job-row"><div><b>${esc(j.plate)}</b><small class="muted">${esc(j.car)}</small></div><div><b>${esc(j.description||'Job done')}</b><small class="muted">Done by: ${esc(j.doneBy || '—')} · Parts used: ${j.lines.map(l=>`${esc(l.name)} x ${l.qty}`).join(', ') || 'No parts'}</small></div><button class="mini-btn" onclick="viewJob('${j.id}')">History</button></div>`; }
function jobHTML(){
  return `<div class="page-head"><div><h1>Log Job</h1><p class="muted">When a car comes in, log the job here. Selected parts will automatically reduce inventory.</p></div></div>
  <div class="job-layout"><section class="panel"><form id="jobForm" class="grid"><div class="grid two"><label>Customer name<input id="jobCustomer" placeholder="Walk-in customer"></label><label>Phone<input id="jobPhone" placeholder="+971..."></label><label>Car model<input id="jobCar" required placeholder="Toyota Corolla"></label><div class="plate-fields"><label>Plate code<input id="jobPlateCode" required placeholder="R" maxlength="8"></label><label>License number<input id="jobPlateNumber" required placeholder="14534"></label></div><label>Date<input id="jobDate" type="date" value="${today()}" required></label><label>Done by / Staff name<input id="jobDoneBy" required placeholder="Kumail / John" value="${esc(defaultStaffName())}"></label></div><label>What job was done?<textarea id="jobDescription" required placeholder="Oil change, brake pad replacement, AC repair..."></textarea></label><div class="section-title"><h3>Parts Used</h3><button id="addLineBtn" class="mini-btn" type="button">${I('plus','icon-sm')} Add another part</button></div><div id="partLines" class="part-lines"></div><div class="section-title custom-title"><div><h3>Custom Charges</h3><p class="muted small-note">Use this for car wash, diagnosis, towing, polishing, or anything not in inventory.</p></div><button id="addCustomBtn" class="mini-btn" type="button">${I('plus','icon-sm')} Add custom charge</button></div><div id="customCharges" class="custom-lines"></div><div class="section-title labour-title"><div><h3>Labor</h3><p class="muted small-note">Add this after selecting parts and any extra charges.</p></div></div><div class="grid two labour-grid"><label>Labor hours<input id="jobLabourHours" type="number" min="0" step="0.25" value="0" placeholder="2.5"></label><label>Labor charge (AED)<input id="jobLabour" type="number" min="0" step="0.01" value="0" placeholder="50"></label></div><div id="jobSummary" class="summary-box"></div><button class="btn primary large-btn" type="submit">${I('clipboard')} Save Job & Update Inventory</button></form></section><aside class="panel"><h3>Simple Rule</h3><p class="muted">Example: if stock has 10 oil filters and you use 1 in this job, the system automatically changes stock to 9.</p><div class="cost-card"><small>Inventory Cost Value</small><strong>${money(stats().costValue)}</strong></div><h3>Low Stock Now</h3>${state.parts.filter(p=>Number(p.qty)<=Number(p.threshold)).slice(0,6).map(p=>`<div class="pill orange">${esc(p.name)} · ${p.qty} left</div>`).join('') || '<p class="muted">No low stock items.</p>'}</aside></div>`;
}
function plateHistoryData(){
  const plateQuery = String(state.vehicleHistoryQuery || '').trim().toUpperCase();
  const exactPlateJobs = plateQuery
    ? state.jobs.filter(j => String(j.plate || '').toUpperCase().includes(plateQuery))
    : [];
  const historyPartsTotal = exactPlateJobs.reduce((a,j)=>a+j.lines.reduce((x,l)=>x+(Number(l.qty||0)*Number(l.price||0)),0),0);
  const historyLabourTotal = exactPlateJobs.reduce((a,j)=>a+Number(j.labour||0),0);
  const historyCustomTotal = exactPlateJobs.reduce((a,j)=>a+(j.customCharges||[]).reduce((x,c)=>x+Number(c.amount||0),0),0);
  const historyGrandTotal = exactPlateJobs.reduce((a,j)=>a+Number(j.total||0),0);
  return { plateQuery, exactPlateJobs, historyPartsTotal, historyLabourTotal, historyCustomTotal, historyGrandTotal };
}
function plateHistoryResultsHTML(){
  const { plateQuery, exactPlateJobs, historyPartsTotal, historyLabourTotal, historyCustomTotal, historyGrandTotal } = plateHistoryData();
  return `${plateQuery ? `<div class="history-summary"><div><span>Jobs Found</span><b>${exactPlateJobs.length}</b></div><div><span>Parts Total</span><b>${money(historyPartsTotal)}</b></div><div><span>Custom Charges</span><b>${money(historyCustomTotal)}</b></div><div><span>Labor</span><b>${money(historyLabourTotal)}</b></div><div><span>Total Spent</span><b>${money(historyGrandTotal)}</b></div></div>` : `<div class="empty compact-empty">Enter a plate number above to view that vehicle's full history.</div>`}
    ${plateQuery && exactPlateJobs.length ? `<div class="table-wrap history-table"><table><thead><tr><th>Date</th><th>Plate</th><th>Car</th><th>Job Done</th><th>Done By</th><th>Parts Used</th><th>Custom</th><th>Labor</th><th>Total</th><th>History</th></tr></thead><tbody>${exactPlateJobs.map(j=>{ const customText=(j.customCharges||[]).map(c=>`${esc(c.name)} ${money(c.amount)}`).join('<br>') || '<span class="muted">—</span>'; const partsText=j.lines.map(l=>`${esc(l.name)} x ${l.qty} · ${money(Number(l.qty||0)*Number(l.price||0))}`).join('<br>') || '<span class="muted">No parts</span>'; return `<tr><td>${esc(j.date)}</td><td><b>${esc(j.plate)}</b></td><td>${esc(j.car)}</td><td>${esc(j.description)}</td><td>${esc(j.doneBy || '—')}</td><td>${partsText}</td><td>${customText}</td><td>${money(j.labour)}<br><small class="muted">${Number(j.labourHours||0)} hrs</small></td><td><b>${money(j.total)}</b></td><td><button class="mini-btn" onclick="viewJob('${j.id}')">Open</button></td></tr>`; }).join('')}</tbody></table></div>` : ''}
    ${plateQuery && !exactPlateJobs.length ? `<div class="empty">No history found for plate: ${esc(plateQuery)}</div>` : ''}`;
}
function renderPlateHistoryResults(){
  const target = $('plateHistoryResults');
  if(target) target.innerHTML = plateHistoryResultsHTML();
}
function plateHistoryPanelHTML(location=''){
  const locationNote = location ? `<p class="muted small-note">${esc(location)}</p>` : '<p class="muted small-note">Type a plate number to see every job, part, custom charge, labor charge, and total for that car.</p>';
  return `<section class="panel plate-history-panel">
    <div class="section-title"><div><h3>History by Number Plate</h3>${locationNote}</div></div>
    <div class="history-search"><input id="plateHistorySearch" placeholder="Search plate number, e.g. R 14534" value="${esc(state.vehicleHistoryQuery || '')}" autocomplete="off"><button class="btn light" type="button" onclick="exportPlateHistoryCSV()">${I('download','icon-sm')} Export CSV</button><button class="btn light" type="button" onclick="clearPlateHistorySearch()">Clear</button></div>
    <div id="plateHistoryResults">${plateHistoryResultsHTML()}</div>
  </section>`;
}

function usedHTML(){
  const plateQuery = String(state.vehicleHistoryQuery || '').trim().toUpperCase();
  const matchingJobs = plateQuery
    ? state.jobs.filter(j => String(j.plate || '').toUpperCase().includes(plateQuery))
    : state.jobs;
  const usage=[];
  matchingJobs.forEach(j=>{
    const customText=(j.customCharges||[]).map(c=>`${c.name} ${money(c.amount)}`).join('; ');
    if(j.lines.length){
      j.lines.forEach(l=>usage.push({...l, date:j.date, plate:j.plate, car:j.car, job:j.description, doneBy:j.doneBy, customText, labour:j.labour, total:j.total, jobId:j.id}));
    } else {
      usage.push({name:'No inventory part', sku:'', qty:0, price:0, date:j.date, plate:j.plate, car:j.car, job:j.description, doneBy:j.doneBy, customText, labour:j.labour, total:j.total, jobId:j.id});
    }
  });
  return `<div class="page-head"><div><h1>Parts Used</h1><p class="muted">Search by number plate and see the full work history for that vehicle.</p></div><button class="btn primary" onclick="exportUsage()">${I('download','icon-sm')} Export Parts Used</button></div>
  ${plateHistoryPanelHTML()}
  <section class="panel" style="margin-top:20px"><div class="section-title"><h3>${plateQuery ? `Jobs Matching ${esc(plateQuery)}` : 'Completed Jobs'}</h3><button class="mini-btn" onclick="go('job')">Log New Job</button></div>${matchingJobs.length?`<div class="jobs-list">${matchingJobs.map(j=>`<div class="job-row"><div><b>${esc(j.plate)}</b><small class="muted">${esc(j.car)} · ${esc(j.date)}</small></div><div><b>${esc(j.description)}</b><small class="muted">Done by: ${esc(j.doneBy || '—')} · ${j.lines.map(l=>`${esc(l.name)} x ${l.qty}`).join(', ') || 'No parts used'}</small></div><div><button class="mini-btn" onclick="viewPlateHistory('${esc(j.plate)}')">Plate History</button> <button class="mini-btn" onclick="viewJob('${j.id}')">Open</button> <button class="mini-btn danger" onclick="deleteJob('${j.id}')">Delete / Return Stock</button></div></div>`).join('')}</div>`:'<div class="empty">No jobs found.</div>'}</section>
  <section class="panel" style="margin-top:20px"><div class="section-title"><h3>${plateQuery ? `Part Usage for ${esc(plateQuery)}` : 'Part Usage Log'}</h3></div>${usage.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Plate</th><th>Car</th><th>Job</th><th>Done By</th><th>Part</th><th>Qty</th><th>Item Price</th><th>Custom Charge</th><th>Labor Charge</th><th>Total</th></tr></thead><tbody>${usage.map(u=>`<tr><td>${esc(u.date)}</td><td>${esc(u.plate)}</td><td>${esc(u.car)}</td><td>${esc(u.job)}</td><td>${esc(u.doneBy || '—')}</td><td>${esc(u.name)}<br><small class="muted">${esc(u.sku)}</small></td><td>${u.qty}</td><td>${money(u.price)}</td><td>${u.customText?esc(u.customText):money(0)}</td><td>${money(u.labour)}</td><td>${money(u.total)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No parts used yet.</div>'}</section>`;
}
function reportsHTML(s){
  const month = state.reportMonth || today().slice(0,7);
  const jobs = state.jobs.filter(j => (j.date || '').slice(0,7) === month);
  const revenue = jobs.reduce((a,j)=>a+Number(j.total||0),0);
  const partsIssued = jobs.reduce((a,j)=>a+j.lines.reduce((x,l)=>x+Number(l.qty||0),0),0);
  const labourHours = jobs.reduce((a,j)=>a+Number(j.labourHours||0),0);
  const labourRevenue = jobs.reduce((a,j)=>a+Number(j.labour||0),0);
  const customRevenue = jobs.reduce((a,j)=>a+(j.customCharges||[]).reduce((x,c)=>x+Number(c.amount||0),0),0);
  const partRows=[];
  jobs.forEach(j=>{
    const customText=(j.customCharges||[]).map(c=>`${c.name} ${money(c.amount)}`).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines.length){
      j.lines.forEach(l=>partRows.push({date:j.date, plate:j.plate, car:j.car, job:j.description, doneBy:j.doneBy, name:l.name, sku:l.sku, qty:l.qty, itemPrice:Number(l.price||0), customText, customTotal, labour:Number(j.labour||0), total:Number(j.total||0)}));
    } else {
      partRows.push({date:j.date, plate:j.plate, car:j.car, job:j.description, doneBy:j.doneBy, name:'No inventory part', sku:'', qty:0, itemPrice:0, customText, customTotal, labour:Number(j.labour||0), total:Number(j.total||0)});
    }
  });
  const vehicleCounts={}; jobs.forEach(j=>{ const key=(j.car||'Unknown').trim() || 'Unknown'; vehicleCounts[key]=(vehicleCounts[key]||0)+1; });
  const topVehicle=Object.entries(vehicleCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'No jobs yet';
  return `<div class="page-head"><div><h1>Monthly Report</h1><p class="muted">Final monthly report for parts used, job sales, and labor hours.</p></div><div class="report-controls"><input id="reportMonth" type="month" value="${esc(month)}"><button class="btn light" onclick="exportMonthlyReport()">${I('download','icon-sm')} Export Monthly CSV</button></div></div>
  <div class="report-hero"><div><small>Revenue Summary</small><h2>${money(revenue)}</h2><p>Job revenue for ${esc(month)} including parts and labor.</p></div><div class="report-stat"><span>Total Parts Issued</span><b>${partsIssued}</b></div><div class="report-stat"><span>Labor Hours</span><b>${labourHours}</b></div><div class="report-stat"><span>Top Vehicle</span><b>${esc(topVehicle)}</b></div></div>
  <div style="margin-top:20px">${plateHistoryPanelHTML('Search any number plate while reviewing reports to see the full work history for that vehicle.')}</div>
  <div class="kpis report-kpis">${kpi('Inventory Cost Value',money(s.costValue),'Current buying cost value','chart')}${kpi('Labor Revenue',money(labourRevenue),'Labor charges this month','clipboard')}${kpi('Custom Charges',money(customRevenue),'Non-inventory charges','file')}${kpi('Jobs Completed',jobs.length,'Jobs this month','check')}</div>
  <section class="panel" style="margin-top:20px"><div class="section-title"><h3>Monthly Parts Used</h3></div>${partRows.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Plate</th><th>Car</th><th>Job</th><th>Done By</th><th>Part</th><th>Qty</th><th>Item Price</th><th>Custom Charge</th><th>Labor Charge</th><th>Total</th></tr></thead><tbody>${partRows.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.plate)}</td><td>${esc(r.car)}</td><td>${esc(r.job)}</td><td>${esc(r.doneBy || '—')}</td><td>${esc(r.name)}<br><small class="muted">${esc(r.sku)}</small></td><td>${r.qty}</td><td>${money(r.itemPrice)}</td><td>${r.customText?esc(r.customText):money(0)}</td><td>${money(r.labour)}</td><td>${money(r.total)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No jobs in this month yet.</div>'}</section>
  <section class="panel" style="margin-top:20px"><div class="section-title"><h3>Vehicle Logs</h3><button class="mini-btn" onclick="go('used')">View Job History</button></div>${jobs.length?`<div class="jobs-list">${jobs.map(jobRow).join('')}</div>`:'<div class="empty">No vehicle logs for this month.</div>'}</section>`;
}

function filteredFleetVehicles(){
  const q = String(state.fleetFilter || '').trim().toLowerCase();
  return state.vehicles.filter(v => {
    const haystack = [v.modelNumber, v.plate, v.customer, v.status, v.ownership, v.notes].join(' ').toLowerCase();
    return !q || haystack.includes(q);
  });
}
function renderFleetResults(){
  const target = $('fleetResults');
  if(target){
    const vehicles = filteredFleetVehicles();
    target.innerHTML = vehicles.length ? fleetTable(vehicles) : '<div class="empty">No fleet vehicles found.</div>';
  }
}
function fleetHTML(){
  const vehicles = filteredFleetVehicles();
  const inUse = state.vehicles.filter(v => v.status === 'In Use').length;
  const spare = state.vehicles.filter(v => v.status === 'Spare').length;
  const backup = state.vehicles.filter(v => v.status === 'Back-up').length;
  const monthlyRentCost = state.vehicles.reduce((a,v)=>a+(v.ownership === 'Outsource' ? Number(v.rentRate||0) : 0),0);
  const monthlyClientRevenue = state.vehicles.reduce((a,v)=>a+(v.status === 'In Use' ? Number(v.clientRate||0) : 0),0);
  return `<div class="page-head"><div><h1>Fleet</h1><p class="muted">Track SMG vehicles, outsourced vehicles, customers, status, rent cost, and client rate.</p></div><button class="btn primary" onclick="startAddVehicle()">${I('plus','icon-sm')} Add Vehicle</button></div>
  <div class="fleet-hero"><div><small>Fleet Revenue View</small><h2>${money(monthlyClientRevenue)}</h2><p>Client rate total for vehicles marked In Use.</p></div><div><span>Total Fleet</span><b>${state.vehicles.length}</b></div><div><span>In Use</span><b>${inUse}</b></div><div><span>Spare / Backup</span><b>${spare + backup}</b></div><div><span>Outsource Rent</span><b>${money(monthlyRentCost)}</b></div></div>
  <div class="fleet-layout improved"><section id="fleetFormPanel" class="panel fleet-form-card"><div class="section-title"><div><h3>Vehicle Details</h3><p class="muted small-note">Add or edit one vehicle. Plate is split into code + license number, for example R 14534.</p></div></div>
    <form id="fleetForm" class="grid two">
      <input id="fleetId" type="hidden">
      <label>Model number / vehicle model<input id="fleetModel" required placeholder="Toyota Hiace 2022"></label>
      <div class="plate-fields"><label>Plate code<input id="fleetPlateCode" required placeholder="R" maxlength="8"></label><label>License number<input id="fleetPlateNumber" required placeholder="14534"></label></div>
      <label>Customer<input id="fleetCustomer" placeholder="Customer / client name"></label>
      <label>Status<select id="fleetStatus"><option>In Use</option><option>Spare</option><option>Back-up</option></select></label>
      <label>Vehicle type<select id="fleetOwnership"><option>SMG Vehicle</option><option>Outsource</option></select></label>
      <label>Outsource rent rate (AED)<input id="fleetRentRate" type="number" min="0" step="0.01" value="0" placeholder="Only if outsourced"></label>
      <label>Client rate we give vehicle for (AED)<input id="fleetClientRate" type="number" min="0" step="0.01" value="0" placeholder="Rate charged to client if in use"></label>
      <label class="wide">Notes<input id="fleetNotes" placeholder="Any extra note"></label>
      <div class="modal-actions wide"><button type="button" class="btn light" onclick="clearFleetForm()">Clear</button><button class="btn primary" type="submit">Save Vehicle</button></div>
    </form></section>
    <section class="panel fleet-list-card"><div class="section-title"><div><h3>Fleet List</h3><p class="muted small-note">Search updates instantly while typing.</p></div><button class="mini-btn" onclick="exportFleet()">Export Fleet CSV</button></div><input id="fleetSearch" placeholder="Search by plate, model, customer, status..." value="${esc(state.fleetFilter || '')}" autocomplete="off" class="fleet-search"><div id="fleetResults">${vehicles.length ? fleetTable(vehicles) : '<div class="empty">No fleet vehicles found.</div>'}</div></section></div>`;
}
function fleetTable(vehicles){
  return `<div class="fleet-cards">${vehicles.map(v=>`<article class="fleet-card"><div class="fleet-card-main"><div><span class="fleet-plate">${esc(v.plate)}</span><h3>${esc(v.modelNumber)}</h3><p class="muted">${esc(v.customer || 'No customer added')}</p></div><span class="pill ${v.status === 'In Use' ? 'green' : v.status === 'Back-up' ? 'orange' : ''}">${esc(v.status)}</span></div><div class="fleet-meta"><div><small>Type</small><b>${esc(v.ownership)}</b></div><div><small>Rent Rate</small><b>${v.ownership === 'Outsource' ? money(v.rentRate) : '—'}</b></div><div><small>Client Rate</small><b>${v.status === 'In Use' ? money(v.clientRate) : '—'}</b></div></div>${v.notes ? `<p class="fleet-notes">${esc(v.notes)}</p>` : ''}<div class="fleet-actions"><button class="mini-btn" onclick="editFleetVehicle('${v.id}')">Edit</button><button class="mini-btn danger" onclick="deleteFleetVehicle('${v.id}')">Delete</button></div></article>`).join('')}</div>`;
}
async function saveFleetVehicle(e){
  e.preventDefault();
  const vehicle = {
    id: $('fleetId').value || id('v'),
    modelNumber: $('fleetModel').value.trim(),
    plate: combinePlate($('fleetPlateCode').value, $('fleetPlateNumber').value),
    plateCode: normalizePlatePiece($('fleetPlateCode').value),
    plateNumber: normalizePlatePiece($('fleetPlateNumber').value),
    customer: $('fleetCustomer').value.trim(),
    status: $('fleetStatus').value,
    ownership: $('fleetOwnership').value,
    rentRate: Number($('fleetRentRate').value || 0),
    clientRate: Number($('fleetClientRate').value || 0),
    notes: $('fleetNotes').value.trim(),
    createdAt: state.vehicles.find(v=>v.id===$('fleetId').value)?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(!vehicle.modelNumber || !vehicle.plate) return toast('Model and plate code/license number are required');
  const idx = state.vehicles.findIndex(v => v.id === vehicle.id);
  if(idx >= 0) state.vehicles[idx] = vehicle; else state.vehicles.unshift(vehicle);
  await saveVehicles();
  toast('Fleet vehicle saved');
  render();
}
function editFleetVehicle(vehicleId){
  const v = state.vehicles.find(x=>x.id===vehicleId);
  if(!v) return;
  $('fleetId').value = v.id;
  $('fleetModel').value = v.modelNumber || '';
  const plateParts = splitPlate(v.plate || '');
  $('fleetPlateCode').value = v.plateCode || plateParts.code || '';
  $('fleetPlateNumber').value = v.plateNumber || plateParts.license || '';
  $('fleetCustomer').value = v.customer || '';
  $('fleetStatus').value = v.status || 'In Use';
  $('fleetOwnership').value = v.ownership || 'SMG Vehicle';
  $('fleetRentRate').value = v.rentRate || 0;
  $('fleetClientRate').value = v.clientRate || 0;
  $('fleetNotes').value = v.notes || '';
  window.scrollTo({top:0, behavior:'smooth'});
}
function clearFleetForm(){
  if(state.view !== 'fleet') { go('fleet'); return; }
  ['fleetId','fleetModel','fleetPlateCode','fleetPlateNumber','fleetCustomer','fleetNotes'].forEach(id => { if($(id)) $(id).value=''; });
  if($('fleetStatus')) $('fleetStatus').value='In Use';
  if($('fleetOwnership')) $('fleetOwnership').value='SMG Vehicle';
  if($('fleetRentRate')) $('fleetRentRate').value=0;
  if($('fleetClientRate')) $('fleetClientRate').value=0;
  scrollToFleetForm();
}
function scrollToFleetForm(){
  setTimeout(()=>{
    const panel = $('fleetFormPanel');
    if(panel) panel.scrollIntoView({behavior:'smooth', block:'start'});
    if($('fleetModel')) $('fleetModel').focus();
  }, 50);
}
function startAddVehicle(){
  if(state.view !== 'fleet') { go('fleet'); setTimeout(clearFleetForm, 80); return; }
  clearFleetForm();
}
async function deleteFleetVehicle(vehicleId){
  if(!confirm('Delete this fleet vehicle?')) return;
  state.vehicles = state.vehicles.filter(v=>v.id!==vehicleId);
  await saveVehicles();
  await deleteRemoteRow('vehicles', vehicleId);
  toast('Fleet vehicle deleted');
  render();
}
function exportFleet(){
  downloadCSV('sarab-fleet.csv', [
    ['Model Number','Plate Code','License Number','Number Plate','Customer','Status','Vehicle Type','Outsource Rent Rate AED','Client Rate AED','Total AED','Notes'],
    ...state.vehicles.map(v=>{
      const parts=splitPlate(v.plate);
      const rent=Number(v.ownership === 'Outsource' ? v.rentRate || 0 : 0);
      const client=Number(v.status === 'In Use' ? v.clientRate || 0 : 0);
      const total=client-rent;
      return [v.modelNumber,v.plateCode || parts.code,v.plateNumber || parts.license,v.plate,v.customer,v.status,v.ownership,rent,client,total,v.notes];
    })
  ]);
}

function exportHTML(){ return `<div class="page-head"><div><h1>Export CSV</h1><p class="muted">Download records for Excel, accounting, backup, or Supabase migration.</p></div></div><div class="export-grid"><section class="card export-card"><h2>Inventory CSV</h2><p class="muted">All parts, quantities, cost value and shelf location.</p><button class="btn primary full" onclick="exportInventory()">${I('download','icon-sm')} Export Inventory</button></section><section class="card export-card"><h2>Jobs CSV</h2><p class="muted">All jobs, cars, labour, totals and parts used.</p><button class="btn primary full" onclick="exportJobs()">${I('download','icon-sm')} Export Jobs</button></section><section class="card export-card"><h2>Parts Used CSV</h2><p class="muted">Every part used against every vehicle/job.</p><button class="btn primary full" onclick="exportUsage()">${I('download','icon-sm')} Export Parts Used</button></section><section class="card export-card"><h2>Fleet CSV</h2><p class="muted">All fleet vehicles, status, rent rate and client rate.</p><button class="btn primary full" onclick="exportFleet()">${I('download','icon-sm')} Export Fleet</button></section></div>`; }
function settingsHTML(){ return `<div class="page-head"><div><h1>Settings</h1><p class="muted">Local demo settings and migration notes.</p></div></div><section class="card settings-card"><h2>Current user</h2><p><b>${esc(state.user?.name||'')}</b><br>${esc(state.user?.email||'')}</p><p class="muted">Storage mode: ${USE_SUPABASE ? 'Supabase shared database' : 'localStorage local demo'}. If Supabase is connected, anyone with a login can use the same garage inventory from any device.</p><button class="btn danger" onclick="resetDemo()">Reset demo data</button></section>`; }

function bindPageEvents(){
  if($('searchInput')) $('searchInput').oninput=e=>{state.filters.q=e.target.value; renderInventoryResults();};
  if($('categoryFilter')) $('categoryFilter').onchange=e=>{state.filters.category=e.target.value; renderInventoryResults();};
  if($('stockFilter')) $('stockFilter').onchange=e=>{state.filters.stock=e.target.value; renderInventoryResults();};
  if($('reportMonth')) $('reportMonth').onchange=e=>{state.reportMonth=e.target.value; render();};
  if($('plateHistorySearch')) $('plateHistorySearch').oninput=e=>{state.vehicleHistoryQuery=e.target.value; renderPlateHistoryResults();};
  if($('fleetForm')){ $('fleetForm').onsubmit=saveFleetVehicle; if($('fleetSearch')) $('fleetSearch').oninput=e=>{state.fleetFilter=e.target.value; renderFleetResults();}; }
  if($('jobForm')){ $('addLineBtn').onclick=()=>addPartLine(); $('addCustomBtn').onclick=()=>addCustomCharge(); $('jobLabour').oninput=updateJobSummary; $('jobLabourHours').oninput=updateJobSummary; addPartLine(); addCustomCharge('', 0); updateJobSummary(); $('jobForm').onsubmit=saveJob; }
}
function addPartLine(selected='', qty=1){
  const wrap=$('partLines');
  if(!wrap) return;
  const selectedPart = state.parts.find(p=>p.id===selected) || state.parts[0];
  const div=document.createElement('div');
  div.className='part-line';
  div.innerHTML=`<label>Part<select class="linePart">${state.parts.map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''}>${esc(p.name)} — stock ${p.qty} — selling ${money(p.price)}</option>`).join('')}</select><small class="line-price-note">Selling price: ${money(selectedPart?.price || 0)} each</small></label><label>Qty<input class="lineQty" type="number" min="1" step="1" value="${qty}"></label><button type="button" class="btn danger">Remove</button>`;
  const select = div.querySelector('.linePart');
  const qtyInput = div.querySelector('.lineQty');
  const note = div.querySelector('.line-price-note');
  const refreshLine = () => {
    const part = state.parts.find(p=>p.id===select.value);
    const q = Number(qtyInput.value || 0);
    note.textContent = part ? `Selling price: ${money(part.price)} each${q > 1 ? ` · Line total: ${money(Number(part.price || 0) * q)}` : ''}` : '';
    updateJobSummary();
  };
  div.querySelector('button').onclick=()=>{div.remove(); updateJobSummary();};
  select.onchange=refreshLine;
  qtyInput.oninput=refreshLine;
  wrap.appendChild(div);
  refreshLine();
}
function addCustomCharge(name='', amount=0){ const wrap=$('customCharges'); if(!wrap) return; const div=document.createElement('div'); div.className='custom-line'; div.innerHTML=`<label>Charge name<input class="customName" placeholder="Car wash" value="${esc(name)}"></label><label>Amount AED<input class="customAmount" type="number" min="0" step="0.01" placeholder="20" value="${amount || ''}"></label><button type="button" class="btn danger">Remove</button>`; div.querySelector('button').onclick=()=>{div.remove(); updateJobSummary();}; div.querySelectorAll('input').forEach(x=>x.oninput=updateJobSummary); wrap.appendChild(div); updateJobSummary(); }
function getJobLines(){ return [...document.querySelectorAll('.part-line')].map(row=>{ const p=state.parts.find(x=>x.id===row.querySelector('.linePart').value); const qty=Number(row.querySelector('.lineQty').value || 0); return p?{partId:p.id,name:p.name,sku:p.sku,qty,price:Number(p.price)}:null; }).filter(x=>x&&x.qty>0); }
function getCustomCharges(){ return [...document.querySelectorAll('.custom-line')].map(row=>({ name: row.querySelector('.customName').value.trim(), amount: Number(row.querySelector('.customAmount').value || 0) })).filter(x=>x.name && x.amount>0); }
function updateJobSummary(){ const lines=getJobLines(); const customCharges=getCustomCharges(); const partsTotal=lines.reduce((a,l)=>a+(l.qty*l.price),0); const customTotal=customCharges.reduce((a,c)=>a+c.amount,0); const labour=Number($('jobLabour')?.value||0); const hours=Number($('jobLabourHours')?.value||0); if($('jobSummary')) $('jobSummary').innerHTML=`<span>Parts total: ${money(partsTotal)}</span><span>Labor hours: ${hours || 0}</span><span>Labor charge: ${money(labour)}</span><span>Custom charges: ${money(customTotal)}</span><span>Job total: ${money(partsTotal+labour+customTotal)}</span>`; }
async function saveJob(e){ e.preventDefault(); const lines=getJobLines(); const customCharges=getCustomCharges(); for(const l of lines){ const p=state.parts.find(x=>x.id===l.partId); if(!p || Number(p.qty)<Number(l.qty)) return toast(`Not enough stock for ${l.name}`); } lines.forEach(l=>{ const p=state.parts.find(x=>x.id===l.partId); p.qty=Number(p.qty)-Number(l.qty); if(Number(p.qty)===0 && typeof p.ordered !== 'boolean') p.ordered=false; }); const labour=Number($('jobLabour').value||0); const labourHours=Number($('jobLabourHours').value||0); const partsTotal=lines.reduce((a,l)=>a+(l.qty*l.price),0); const customTotal=customCharges.reduce((a,c)=>a+c.amount,0); const total=partsTotal+labour+customTotal; const job={ id:id('j'), customer:$('jobCustomer').value.trim() || 'Walk-in', phone:$('jobPhone').value.trim(), car:$('jobCar').value.trim(), plate: combinePlate($('jobPlateCode').value, $('jobPlateNumber').value), date:$('jobDate').value, labour, labourHours, customCharges, description:$('jobDescription').value.trim(), doneBy:$('jobDoneBy').value.trim() || defaultStaffName(), lines, total, createdAt:new Date().toISOString() }; state.jobs.unshift(job); await saveJobs(); await saveParts(); toast('Job saved. Inventory updated.'); go('used'); }
async function deleteJob(jobId){ if(!confirm('Delete this job and return the parts back to inventory?')) return; const job=state.jobs.find(j=>j.id===jobId); if(job) job.lines.forEach(l=>{ const p=state.parts.find(x=>x.id===l.partId); if(p) p.qty=Number(p.qty)+Number(l.qty); }); state.jobs=state.jobs.filter(j=>j.id!==jobId); await saveJobs(); await saveParts(); await deleteRemoteRow('jobs', jobId); toast('Job deleted and stock returned'); render(); }
function viewJob(jobId){ const j=state.jobs.find(x=>x.id===jobId); if(!j) return; $('jobDialogTitle').textContent=`${j.plate} · ${j.car}`; $('jobDialogBody').innerHTML=`<div class="part-detail"><p><b>Date:</b> ${esc(j.date)}</p><p><b>Customer:</b> ${esc(j.customer||'N/A')} ${j.phone?` · ${esc(j.phone)}`:''}</p><p><b>Job:</b> ${esc(j.description)}</p><p><b>Done by:</b> ${esc(j.doneBy || '—')}</p><p><b>Parts used:</b></p>${j.lines.length?`<div class="table-wrap"><table><thead><tr><th>Part</th><th>SKU</th><th>Qty</th><th>Price</th></tr></thead><tbody>${j.lines.map(l=>`<tr><td>${esc(l.name)}</td><td>${esc(l.sku)}</td><td>${l.qty}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No parts used.</p>'}${(j.customCharges||[]).length?`<p><b>Custom charges:</b></p><div class="table-wrap"><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>${(j.customCharges||[]).map(c=>`<tr><td>${esc(c.name)}</td><td>${money(c.amount)}</td></tr>`).join('')}</tbody></table></div>`:''}<div class="summary-box"><span>Labor hours: ${Number(j.labourHours||0)}</span><span>Labor charge: ${money(j.labour)}</span><span>Custom charges: ${money((j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0))}</span><span>Total: ${money(j.total)}</span></div></div>`; $('jobDialog').showModal(); }
function closeJobDialog(){ $('jobDialog').close(); }
function viewPartUsage(partId){ const p=state.parts.find(x=>x.id===partId); const jobs=state.jobs.filter(j=>j.lines.some(l=>l.partId===partId)); $('jobDialogTitle').textContent=`Where used: ${p?.name || 'Part'}`; $('jobDialogBody').innerHTML=jobs.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Plate</th><th>Car</th><th>Job</th><th>Qty</th></tr></thead><tbody>${jobs.map(j=>{const line=j.lines.find(l=>l.partId===partId); return `<tr><td>${esc(j.date)}</td><td>${esc(j.plate)}</td><td>${esc(j.car)}</td><td>${esc(j.description)}</td><td>${line.qty}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">This part has not been used in any job yet.</div>'; $('jobDialog').showModal(); }

function openPartDialog(partId=''){ const p=state.parts.find(x=>x.id===partId); $('partDialogTitle').textContent=p?'Edit Part':'Add Part'; $('partId').value=p?.id||''; $('partName').value=p?.name||''; $('partSku').value=p?.sku||''; $('partCategory').value=p?.category||'Engine'; $('partLocation').value=p?.location||''; $('partQty').value=p?.qty??0; $('partThreshold').value=p?.threshold??5; $('partCost').value=p?.cost??0; $('partPrice').value=p?.price??0; $('partSupplier').value=p?.supplier||''; $('partFits').value=p?.fits||''; $('partDialog').showModal(); }
function closePartDialog(){ $('partDialog').close(); }
async function savePartFromForm(e){ e.preventDefault(); const existing=state.parts.find(p=>p.id===$('partId').value); const qty=Number($('partQty').value); const part={ id:$('partId').value || id('p'), name:$('partName').value.trim(), sku:$('partSku').value.trim(), category:$('partCategory').value, location:$('partLocation').value.trim(), qty, threshold:Number($('partThreshold').value), cost:Number($('partCost').value), price:Number($('partPrice').value), supplier:$('partSupplier').value.trim(), fits:$('partFits').value.trim(), ordered: qty===0 ? Boolean(existing?.ordered) : false, createdAt: existing?.createdAt || new Date().toISOString() }; const idx=state.parts.findIndex(p=>p.id===part.id); if(idx>=0) state.parts[idx]=part; else state.parts.unshift(part); await saveParts(); closePartDialog(); toast('Part saved'); render(); }
function openRestockDialog(partId=''){ $('restockPart').innerHTML=state.parts.map(p=>`<option value="${p.id}" ${p.id===partId?'selected':''}>${esc(p.name)} — stock ${p.qty}</option>`).join(''); $('restockQty').value=1; $('restockDialog').showModal(); }
function closeRestockDialog(){ $('restockDialog').close(); }
async function saveRestock(e){ e.preventDefault(); const p=state.parts.find(x=>x.id===$('restockPart').value); if(p){ p.qty=Number(p.qty)+Number($('restockQty').value||0); if(Number(p.qty)>0) p.ordered=false; } await saveParts(); closeRestockDialog(); toast('Stock added'); render(); }
async function deletePart(partId){ const used=state.jobs.some(j=>j.lines.some(l=>l.partId===partId)); if(used) return toast('Cannot delete: this part is used in a job history'); if(!confirm('Delete this part from inventory?')) return; state.parts=state.parts.filter(p=>p.id!==partId); await saveParts(); await deleteRemoteRow('parts', partId); toast('Part deleted'); render(); }


async function toggleOrdered(partId){
  const p=state.parts.find(x=>x.id===partId);
  if(!p) return;
  if(Number(p.qty||0)>0) return toast('This part is still in stock');
  p.ordered=!Boolean(p.ordered);
  await saveParts();
  toast(p.ordered ? 'Marked as ordered' : 'Marked as not ordered');
  render();
}


function viewPlateHistory(plate){
  state.vehicleHistoryQuery = String(plate || '').toUpperCase();
  const input = $('plateHistorySearch');
  if(input){ input.value = state.vehicleHistoryQuery; renderPlateHistoryResults(); input.focus(); }
  else render();
}
function clearPlateHistorySearch(){
  state.vehicleHistoryQuery = '';
  const input = $('plateHistorySearch');
  if(input){ input.value = ''; renderPlateHistoryResults(); input.focus(); }
  else render();
}

function exportPlateHistoryCSV(){
  const { plateQuery, exactPlateJobs } = plateHistoryData();
  if(!plateQuery) return toast('Search a plate first');
  if(!exactPlateJobs.length) return toast('No plate history to export');
  const rows=[['Date','Done By','Customer','Phone','Plate','Car','Job','Part','Qty','Item Price AED','Parts Line Total AED','Custom Charge','Custom Charge AED','Labor Hours','Labor Charge AED','Total AED']];
  exactPlateJobs.forEach(j=>{
    const customNames=(j.customCharges||[]).map(c=>c.name).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines.length){
      j.lines.forEach(l=>rows.push([j.date,j.doneBy||'',j.customer,j.phone,j.plate,j.car,j.description,l.name,l.qty,l.price,Number(l.qty)*Number(l.price||0),customNames,customTotal,j.labourHours||0,j.labour,j.total]));
    } else {
      rows.push([j.date,j.doneBy||'',j.customer,j.phone,j.plate,j.car,j.description,'',0,0,0,customNames,customTotal,j.labourHours||0,j.labour,j.total]);
    }
  });
  downloadCSV(`sarab-plate-history-${plateQuery.replace(/\s+/g,'-')}.csv`, rows);
}

function csvEscape(v){ return `"${String(v??'').replace(/"/g,'""')}"`; }
function downloadCSV(name, rows){ const csv=rows.map(r=>r.map(csvEscape).join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }
function exportInventory(){ downloadCSV('sarab-inventory.csv', [['Part Name','SKU','Category','Stock','Ordered?','Low Stock Alert','Location','Supplier','Fits','Buying Cost AED','Selling Price AED','Inventory Cost Value AED'], ...state.parts.map(p=>[p.name,p.sku,p.category,p.qty,p.ordered?'Yes':'No',p.threshold,p.location,p.supplier,p.fits,p.cost,p.price,Number(p.qty)*Number(p.cost)])]); }

function parseCSV(text){
  const rows=[];
  let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i], next=text[i+1];
    if(ch==='"'){
      if(quoted && next==='"'){ cell+='"'; i++; }
      else quoted=!quoted;
    } else if(ch===',' && !quoted){ row.push(cell.trim()); cell=''; }
    else if((ch==='\n' || ch==='\r') && !quoted){
      if(ch==='\r' && next==='\n') i++;
      row.push(cell.trim()); cell='';
      if(row.some(v=>v!=='')) rows.push(row);
      row=[];
    } else cell+=ch;
  }
  row.push(cell.trim());
  if(row.some(v=>v!=='')) rows.push(row);
  return rows;
}
function normalizeHeader(h){ return String(h||'').toLowerCase().replace(/[^a-z0-9]/g,''); }
function firstValue(obj, keys, fallback=''){
  for(const key of keys){
    const value=obj[normalizeHeader(key)];
    if(value !== undefined && value !== '') return value;
  }
  return fallback;
}
function toNumber(value, fallback=0){
  const n=Number(String(value ?? '').replace(/[^0-9.-]/g,''));
  return Number.isFinite(n) ? n : fallback;
}
function importInventoryCSV(){
  const input=document.createElement('input');
  input.type='file';
  input.accept='.csv,text/csv';
  input.onchange=async()=>{
    const file=input.files?.[0];
    if(!file) return;
    try{
      const text=await file.text();
      const rows=parseCSV(text);
      if(rows.length < 2) return toast('CSV is empty or missing rows');
      const headers=rows[0].map(normalizeHeader);
      let imported=0, updated=0, skipped=0;
      rows.slice(1).forEach(cols=>{
        const obj={}; headers.forEach((h,i)=>obj[h]=cols[i] ?? '');
        const name=firstValue(obj,['Part Name','Name','Part']);
        const sku=firstValue(obj,['SKU','Part SKU','Code']);
        if(!name || !sku){ skipped++; return; }
        const qty=toNumber(firstValue(obj,['Stock','Stock Quantity','Qty','Quantity']),0);
        const existing=state.parts.find(p=>String(p.sku).toLowerCase()===String(sku).toLowerCase());
        const part={
          id: existing?.id || id('p'),
          name,
          sku,
          category:firstValue(obj,['Category'], existing?.category || 'Other'),
          location:firstValue(obj,['Location','Shelf','Location Shelf'], existing?.location || ''),
          qty,
          threshold:toNumber(firstValue(obj,['Low Stock Alert','Low Alert','Threshold'], existing?.threshold ?? 5),5),
          cost:toNumber(firstValue(obj,['Buying Cost AED','Buying Cost','Cost','Cost AED'], existing?.cost ?? 0),0),
          price:toNumber(firstValue(obj,['Selling Price AED','Selling Price','Price','Price AED'], existing?.price ?? 0),0),
          supplier:firstValue(obj,['Supplier'], existing?.supplier || ''),
          fits:firstValue(obj,['Fits','Fits These Cars','Car','Compatible Cars'], existing?.fits || ''),
          ordered:String(firstValue(obj,['Ordered?','Ordered'], existing?.ordered ? 'Yes' : '')).toLowerCase().startsWith('y'),
          createdAt: existing?.createdAt || new Date().toISOString()
        };
        if(Number(part.qty)>0) part.ordered=false;
        const idx=state.parts.findIndex(p=>p.id===part.id);
        if(idx>=0){ state.parts[idx]=part; updated++; }
        else { state.parts.unshift(part); imported++; }
      });
      await saveParts();
      toast(`CSV imported: ${imported} new, ${updated} updated, ${skipped} skipped`);
      render();
    }catch(err){ console.error(err); toast('Could not import CSV'); }
  };
  input.click();
}
function exportJobs(){
  const rows=[['Date','Done By','Customer','Phone','Plate','Car','Job','Part','Qty','Item Price AED','Parts Line Total AED','Custom Charge','Custom Charge AED','Labor Hours','Labor Charge AED','Total AED']];
  state.jobs.forEach(j=>{
    const customNames=(j.customCharges||[]).map(c=>c.name).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines.length){
      j.lines.forEach(l=>rows.push([j.date,j.doneBy||'',j.customer,j.phone,j.plate,j.car,j.description,l.name,l.qty,l.price,Number(l.qty)*Number(l.price||0),customNames,customTotal,j.labourHours||0,j.labour,j.total]));
    } else {
      rows.push([j.date,j.doneBy||'',j.customer,j.phone,j.plate,j.car,j.description,'',0,0,0,customNames,customTotal,j.labourHours||0,j.labour,j.total]);
    }
  });
  downloadCSV('sarab-jobs.csv', rows);
}
function exportUsage(){
  const rows=[['Date','Done By','Plate','Car','Job','Part','SKU','Qty','Item Price AED','Custom Charge','Custom Charge AED','Labor Charge AED','Total AED']];
  state.jobs.forEach(j=>{
    const customNames=(j.customCharges||[]).map(c=>c.name).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines.length){
      j.lines.forEach(l=>rows.push([j.date,j.doneBy||'',j.plate,j.car,j.description,l.name,l.sku,l.qty,l.price,customNames,customTotal,j.labour,j.total]));
    } else {
      rows.push([j.date,j.doneBy||'',j.plate,j.car,j.description,'','',0,0,customNames,customTotal,j.labour,j.total]);
    }
  });
  downloadCSV('sarab-parts-used.csv', rows);
}

function exportMonthlyReport(){
  const month = state.reportMonth || today().slice(0,7);
  const rows=[['Date','Done By','Plate','Car','Job','Part','Qty','Item Price AED','Custom Charge','Custom Charge AED','Labor Charge AED','Total AED']];
  state.jobs.filter(j => (j.date || '').slice(0,7) === month).forEach(j=>{
    const customNames=(j.customCharges||[]).map(c=>c.name).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines.length){ j.lines.forEach(l=>rows.push([j.date,j.doneBy||'',j.plate,j.car,j.description,l.name,l.qty,l.price,customNames,customTotal,j.labour,j.total])); }
    else rows.push([j.date,j.doneBy||'',j.plate,j.car,j.description,'',0,0,customNames,customTotal,j.labour,j.total]);
  });
  downloadCSV(`sarab-monthly-report-${month}.csv`, rows);
}
async function resetDemo(){ if(!confirm('Reset all demo data?')) return; if(USE_SUPABASE){ await sb.from('parts').delete().neq('id','__never__'); await sb.from('jobs').delete().neq('id','__never__'); await sb.from('vehicles').delete().neq('id','__never__'); state.parts=seedParts.map(p=>({...p})); state.jobs=seedJobs.map(j=>({...j})); state.vehicles=seedVehicles.map(v=>({...v})); await saveParts(); await saveJobs(); await saveVehicles(); } else { set(KEYS.parts, seedParts); set(KEYS.jobs, seedJobs); set(KEYS.vehicles, seedVehicles); } state.filters={q:'',category:'All',stock:'All'}; state.vehicleHistoryQuery=''; toast('Demo data reset'); render(); }

window.viewPlateHistory=viewPlateHistory; window.clearPlateHistorySearch=clearPlateHistorySearch; window.exportPlateHistoryCSV=exportPlateHistoryCSV; window.startAddVehicle=startAddVehicle; window.toggleOrdered=toggleOrdered; window.go=go; window.openPartDialog=openPartDialog; window.closePartDialog=closePartDialog; window.openRestockDialog=openRestockDialog; window.closeRestockDialog=closeRestockDialog; window.viewPartUsage=viewPartUsage; window.viewJob=viewJob; window.closeJobDialog=closeJobDialog; window.deleteJob=deleteJob; window.deletePart=deletePart; window.exportInventory=exportInventory; window.importInventoryCSV=importInventoryCSV; window.exportJobs=exportJobs; window.exportUsage=exportUsage; window.exportMonthlyReport=exportMonthlyReport; window.exportFleet=exportFleet; window.editFleetVehicle=editFleetVehicle; window.deleteFleetVehicle=deleteFleetVehicle; window.clearFleetForm=clearFleetForm; window.resetDemo=resetDemo;
init();
