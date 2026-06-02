/*
  Sarab Al Madina Portal
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
  vehicles: 'sam_vehicles_v1',
  staff: 'sam_staff_v1',
  logs: 'sam_logs_v1',
  tickets: 'sam_tickets_v1',
  clients: 'sam_clients_v1',
  replacements: 'sam_replacements_v1',
  employees: 'sam_employees_v1',
  employeeTickets: 'sam_employee_tickets_v1',
  salik: 'sam_salik_v1'
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
  car: '<svg class="icon icon-lg fleet-nav-icon" viewBox="0 0 24 24"><path d="M5 11l2-5h10l2 5"/><path d="M3 13h18v5H3z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  check: '<svg class="icon icon-xl" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
  trash: '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 15h10l1-15"/></svg>'
};
const I = (name, cls='') => (icons[name] || icons.box).replace('class="icon', `class="icon ${cls}`);

const seedUsers = [{ id: 'u_demo', name: 'Sarab Al Madina Team', email: 'admin@garage.com', password: 'admin123', role: 'Garage Inventory' }];
const seedStaff = [
  { id:'staff_kumail', name:'Kumail', createdAt:'2026-01-01T00:00:00Z' },
  { id:'staff_john', name:'John', createdAt:'2026-01-01T00:00:00Z' },
  { id:'staff_ahmed', name:'Ahmed', createdAt:'2026-01-01T00:00:00Z' }
];
const seedParts = [
  { id:'p_oil_filter', name:'Oil Filter', sku:'OF-1001', category:'Engine', location:'Rack A-01', qty:25, threshold:10, cost:18, price:35, supplier:'Bosch', fits:'Toyota Corolla, Nissan Sunny', createdAt:'2026-01-01T00:00:00Z' },
  { id:'p_air_filter', name:'Air Filter', sku:'AF-2001', category:'Engine', location:'Rack A-02', qty:8, threshold:10, cost:22, price:45, supplier:'Toyota', fits:'Toyota Corolla, Honda Civic', createdAt:'2026-01-01T00:00:00Z' },
  { id:'p_brake_pad', name:'Brake Pad Set', sku:'BP-3001', category:'Braking', location:'Rack B-03', qty:4, threshold:5, cost:95, price:180, supplier:'Akebono', fits:'Honda Civic, Toyota Corolla', createdAt:'2026-01-01T00:00:00Z' },
  { id:'p_spark_plug', name:'Spark Plug', sku:'SP-4001', category:'Electrical', location:'Rack C-01', qty:15, threshold:10, cost:12, price:25, supplier:'NGK', fits:'Nissan Sunny, Mitsubishi Lancer', createdAt:'2026-01-01T00:00:00Z' },
  { id:'p_engine_oil', name:'Engine Oil 5W30', sku:'EO-5001', category:'Fluids', location:'Shelf F-02', qty:18, threshold:10, cost:42, price:75, supplier:'Castrol', fits:'Universal', createdAt:'2026-01-01T00:00:00Z' }
];
const seedJobs = [
  { id:'j_1', date: today(), customer:'Walk-in', phone:'', car:'Toyota Corolla', plate:'ABC 123', description:'Oil Change & Filter Replacement + Car Wash', status:'Done Completed', doneBy:'Kumail', labour:80, labourHours:1.5, customCharges:[{name:'Car wash', amount:20}], lines:[{partId:'p_oil_filter',name:'Oil Filter',sku:'OF-1001',qty:1,price:35},{partId:'p_engine_oil',name:'Engine Oil 5W30',sku:'EO-5001',qty:1,price:75}], total:210, createdAt:new Date().toISOString() },
  { id:'j_2', date: today(), customer:'Walk-in', phone:'', car:'Honda Civic', plate:'DUB 456', description:'Brake Pad Replacement', status:'Done Completed', doneBy:'John', labour:160, labourHours:2, lines:[{partId:'p_brake_pad',name:'Brake Pad Set',sku:'BP-3001',qty:1,price:180}], total:340, createdAt:new Date().toISOString() }
];
const seedVehicles = [
  { id:'v_1', modelNumber:'Toyota Hiace 2022', plate:'SMG 101', customer:'Sarab Al Madina', status:'In Use', ownership:'SMG Vehicle', rentRate:0, clientRate:350, notes:'Main fleet van', createdAt:'2026-01-01T00:00:00Z' },
  { id:'v_2', modelNumber:'Nissan Urvan 2021', plate:'SMG 202', customer:'Back-up', status:'Back-up', ownership:'SMG Vehicle', rentRate:0, clientRate:0, notes:'Back-up vehicle', createdAt:'2026-01-01T00:00:00Z' },
  { id:'v_3', modelNumber:'Mitsubishi Canter 2020', plate:'OUT 303', customer:'Client A', status:'In Use', ownership:'Outsource', rentRate:180, clientRate:300, notes:'Outsourced vehicle', createdAt:'2026-01-01T00:00:00Z' }
];



const seedClients = [
  { id:'client_sarab', name:'Sarab Al Madina', contractStart:'2026-01-01', contractEnd:'2026-12-31', contactPerson:'', phone:'', email:'', notes:'Main internal fleet client', createdAt:'2026-01-01T00:00:00Z' },
  { id:'client_align', name:'ALIGN', contractStart:'2026-01-01', contractEnd:'2026-12-31', contactPerson:'', phone:'', email:'', notes:'Imported from fleet records', createdAt:'2026-01-01T00:00:00Z' },
  { id:'client_g4s', name:'G4S', contractStart:'2026-01-01', contractEnd:'2026-12-31', contactPerson:'', phone:'', email:'', notes:'Imported from fleet records', createdAt:'2026-01-01T00:00:00Z' }
];

const TICKET_STATUSES = ['Open','In Progress','Pending','Resolved'];
const TICKET_PRIORITIES = ['Low','Medium','High','Critical'];
const TICKET_CATEGORIES = ['Vehicle Issue','Maintenance Request','Accident / Damage','Driver Complaint','Client Request','Document / Permit','Other'];
const TICKET_FLEET_LOOKUP = {"26907(OS)":{"client":"ALIGN","vtype":"HIACE(OS)","provider":"MS-TOURISM"},"91336":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"52186":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"91938":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"21984":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"30953":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"68012":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"62097":{"client":"ALIGN","vtype":"OYSTER","provider":"SMG"},"91483":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"67664(OS)":{"client":"ALIGN","vtype":"HI ROOF(OS)","provider":"ABDAL"},"23020":{"client":"ALIGN","vtype":"HIACE","provider":"SMG"},"36467":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"60382":{"client":"ALIGN","vtype":"HIACE","provider":"SMG"},"84423":{"client":"ALIGN","vtype":"COASTER","provider":"SMG"},"56709":{"client":"ALIGN","vtype":"COASTER","provider":"SMG"},"28560":{"client":"ALIGN","vtype":"COASTER","provider":"SMG"},"26528":{"client":"ALIGN","vtype":"COASTER","provider":"SMG"},"28579":{"client":"ALIGN","vtype":"COASTER","provider":"SMG"},"76609":{"client":"ALIGN","vtype":"COASTER","provider":"SMG"},"23024":{"client":"ALIGN","vtype":"COASTER","provider":"SMG"},"92096":{"client":"ALIGN","vtype":"OYSTER","provider":"SMG"},"46120":{"client":"ALIGN","vtype":"OYSTER","provider":"SMG"},"65941":{"client":"ALIGN","vtype":"OYSTER","provider":"SMG"},"85690":{"client":"ALIGN","vtype":"OYSTER","provider":"SMG"},"67342":{"client":"ALIGN","vtype":"OYSTER","provider":"SMG"},"44296(OS)":{"client":"ALIGN","vtype":"COASTER(OS)","provider":"SANA PASSENGER"},"79660":{"client":"ALIGN","vtype":"ASHOK","provider":"SMG"},"43078":{"client":"ALIGN","vtype":"ASHOK","provider":"SMG"},"10315":{"client":"ALIGN","vtype":"ASHOK","provider":"SMG"},"43127":{"client":"ALIGN","vtype":"ASHOK","provider":"SMG"},"68836(OS)":{"client":"ALIGN","vtype":"ASHOK(OS)","provider":"KING APEX"},"64741(OS)":{"client":"ALIGN","vtype":"ASHOK(OS)","provider":"KING APEX"},"84393(OS)":{"client":"ALIGN","vtype":"ASHOK(OS)","provider":"KING APEX"},"39771":{"client":"ALIGN","vtype":"ASHOK","provider":"SMG"},"76097":{"client":"ALIGN","vtype":"ASHOK","provider":"SMG"},"62987":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"51859":{"client":"ALIGN","vtype":"MID ROOF","provider":"SMG"},"16332(OS)":{"client":"ALIGN","vtype":"COASTER(OS)","provider":"AL MAQBOL"},"17387":{"client":"ALIGN","vtype":"HIACE","provider":"SMG"},"90260(OS)":{"client":"ALIGN","vtype":"MID ROOF(OS)","provider":"CH KHURRAM"},"27267(OS)":{"client":"ALIGN","vtype":"HIACE(OS)","provider":"AL AROBA"},"76796":{"client":"ALIGN","vtype":"COASTER","provider":"SMG"},"63154":{"client":"ALIGN","vtype":"HIACE","provider":"SMG"},"29780":{"client":"ALIGN","vtype":"HIACE","provider":"SMG"},"62866(OS)":{"client":"ALIGN","vtype":"MID ROOF(OS)","provider":"NOOR ETITIHAD"},"34472":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"24405":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"72308":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"18707":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"73787":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"40968":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"92968":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"22431":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"74531":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"42556":{"client":"TMAX","vtype":"MID ROOF","provider":"SMG"},"89359":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"43712":{"client":"TMAX","vtype":"HIACE","provider":"SMG"},"19202":{"client":"TMAX","vtype":"HIACE","provider":"SMG"},"42018":{"client":"TMAX","vtype":"COASTER","provider":"SMG"},"30540":{"client":"TMAX","vtype":"HIACE","provider":"SMG"},"62935":{"client":"TMAX","vtype":"HIACE","provider":"SMG"},"34459":{"client":"TMAX","vtype":"HIACE","provider":"SMG"},"14204(OS)":{"client":"HEMAYA","vtype":"HI ROOF(OS)","provider":"NOOR ETITIHAD"},"34758":{"client":"HEMAYA","vtype":"MID ROOF","provider":"SMG"},"69765":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"89964":{"client":"HEMAYA","vtype":"OYSTER","provider":"SMG"},"69216":{"client":"HEMAYA","vtype":"OYSTER","provider":"SMG"},"56707":{"client":"HEMAYA","vtype":"COASTER 25S","provider":"SMG"},"60812(OS)":{"client":"HEMAYA","vtype":"COASTER(OS)","provider":"AL MAQBOL"},"90967(OS)":{"client":"HEMAYA","vtype":"ROSA(OS)","provider":"REEM AL SAKHRA"},"67427(OS)":{"client":"HEMAYA","vtype":"ROSA(OS)","provider":"GHANI"},"77529":{"client":"HEMAYA","vtype":"MID ROOF","provider":"SMG"},"91485":{"client":"HEMAYA","vtype":"MID ROOF","provider":"SMG"},"49563":{"client":"HEMAYA","vtype":"ROSA","provider":"SMG"},"48100":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"48101":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"43093":{"client":"HEMAYA","vtype":"ASHOK","provider":"SMG"},"38575":{"client":"HEMAYA","vtype":"ASHOK","provider":"SMG"},"19203":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"71846":{"client":"HEMAYA","vtype":"ROSA","provider":"SMG"},"87967":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"98523":{"client":"HEMAYA","vtype":"MID ROOF","provider":"SMG"},"71614":{"client":"HEMAYA","vtype":"ROSA","provider":"SMG"},"43681":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"60383":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"72898":{"client":"HEMAYA","vtype":"ASHOK","provider":"SMG"},"94475":{"client":"HEMAYA","vtype":"ASHOK","provider":"SMG"},"70543(OS)":{"client":"HEMAYA","vtype":"COASTER(OS)","provider":"KHAYBER"},"76438":{"client":"HEMAYA","vtype":"COASTER","provider":"SMG"},"60673":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"61260":{"client":"HEMAYA","vtype":"HIACE","provider":"SMG"},"44956(OS)":{"client":"HEMAYA","vtype":"COASTER(OS)","provider":"KHAYBER"},"20354(OS)":{"client":"HEMAYA","vtype":"COASTER(OS)","provider":"AL MUSAFR PASSENGER"},"98148":{"client":"HEMAYA","vtype":"COASTER","provider":"SMG"},"23021":{"client":"G4S","vtype":"HIACE","provider":"SMG"},"79724":{"client":"G4S","vtype":"MID ROOF","provider":"SMG"},"94016":{"client":"G4S","vtype":"ASHOK","provider":"SMG"},"77589":{"client":"G4S","vtype":"COASTER","provider":"SMG"},"55925":{"client":"G4S","vtype":"ROSA","provider":"SMG"},"51780":{"client":"G4S","vtype":"COASTER","provider":"SMG"},"53735":{"client":"G4S","vtype":"COASTER","provider":"SMG"},"61038":{"client":"G4S","vtype":"OYSTER","provider":"SMG"},"18477(OS)":{"client":"G4S","vtype":"ROSA(OS)","provider":"DISCOUNT"},"57642":{"client":"G4S","vtype":"MID ROOF","provider":"SMG"},"51216":{"client":"G4S","vtype":"MID ROOF","provider":"SMG"},"26489":{"client":"G4S","vtype":"HI ROOF","provider":"SMG"},"55075":{"client":"G4S","vtype":"OYSTER","provider":"SMG"},"55077":{"client":"G4S","vtype":"OYSTER","provider":"SMG"},"97474":{"client":"G4S","vtype":"ROSA","provider":"SMG"},"77527":{"client":"G4S","vtype":"MID ROOF","provider":"SMG"},"21374":{"client":"G4S","vtype":"MID ROOF","provider":"SMG"},"65144":{"client":"G4S","vtype":"HI ROOF","provider":"SMG"},"43954":{"client":"G4S","vtype":"MID ROOF","provider":"SMG"},"37754":{"client":"G4S","vtype":"MID ROOF","provider":"SMG"},"42027(OS)":{"client":"G4S","vtype":"HIACE(OS)","provider":"KING APEX"},"25376":{"client":"G4S","vtype":"ROSA","provider":"SMG"},"10215":{"client":"G4S","vtype":"NISSAN MICRO","provider":"SMG"},"46651":{"client":"G4S","vtype":"OYSTER","provider":"SMG"},"30133":{"client":"G4S","vtype":"OYSTER","provider":"SMG"},"49188":{"client":"G4S","vtype":"HIACE","provider":"SMG"},"93436(OS)":{"client":"G4S","vtype":"ASHOK(OS)","provider":"Dreem Journy"},"34081":{"client":"G4S","vtype":"OYSTER","provider":"SMG"},"21596":{"client":"G4S","vtype":"OYSTER","provider":"SMG"},"91269(OS)":{"client":"G4S","vtype":"HI ROOF(OS)","provider":"EXECUTIVE LODGES"},"43870":{"client":"G4S","vtype":"MID ROOF","provider":"SMG"},"44362(OS)":{"client":"GOLDEN","vtype":"MID ROOF(OS)","provider":"KHAYBER"},"51203":{"client":"GOLDEN","vtype":"NISSAN CAR","provider":"SMG"},"30954":{"client":"GOLDEN","vtype":"MID ROOF","provider":"SMG"},"51205":{"client":"GOLDEN","vtype":"NISSAN CAR","provider":"SMG"},"80320":{"client":"GOLDEN","vtype":"NISSAN CAR","provider":"SMG"},"77618":{"client":"GOLDEN","vtype":"COROLLA","provider":"SMG"},"57128":{"client":"GOLDEN","vtype":"COASTER","provider":"SMG"},"83060":{"client":"GOLDEN","vtype":"HIACE","provider":"SMG"},"64150":{"client":"GOLDEN","vtype":"NISSAN CAR","provider":"SMG"},"83065":{"client":"GOLDEN","vtype":"COROLLA","provider":"SMG"},"47655":{"client":"STAR FM","vtype":"HIACE","provider":"SMG"},"77528":{"client":"STAR FM","vtype":"MID ROOF","provider":"SMG"},"34763":{"client":"STAR FM","vtype":"MID ROOF","provider":"SMG"},"48635":{"client":"STAR FM","vtype":"MID ROOF","provider":"SMG"},"45807":{"client":"STAR FM","vtype":"MID ROOF","provider":"SMG"},"74151":{"client":"STAR SERVCIES","vtype":"MID ROOF","provider":"SMG"},"74152":{"client":"STAR SERVCIES","vtype":"HI ROOF","provider":"SMG"},"91939":{"client":"STAR SERVCIES","vtype":"MID ROOF","provider":"SMG"},"50732":{"client":"STAR SERVCIES","vtype":"MID ROOF","provider":"SMG"},"63617":{"client":"STAR SERVCIES","vtype":"HI ROOF","provider":"SMG"},"35729":{"client":"IBEX","vtype":"COASTER 25S","provider":"SMG"},"48634":{"client":"IBEX","vtype":"COASTER","provider":"SMG"},"77530":{"client":"IBEX","vtype":"MID ROOF","provider":"SMG"},"25043(OS)":{"client":"IBEX","vtype":"MID ROOF(OS)","provider":"KHAYBER"},"20417":{"client":"IBEX","vtype":"ROSA","provider":"SMG"},"78449":{"client":"DURRANI PASSENGER","vtype":"ASHOK","provider":"SMG"},"32629":{"client":"DURRANI PASSENGER","vtype":"ASHOK","provider":"SMG"},"59419":{"client":"DURRANI PASSENGER","vtype":"ASHOK","provider":"SMG"},"57318":{"client":"DURRANI PASSENGER","vtype":"ASHOK","provider":"SMG"},"30267":{"client":"DURRANI PASSENGER","vtype":"ASHOK","provider":"SMG"},"18546":{"client":"SUPER YACHT","vtype":"MAXUS","provider":"SMG"},"85729":{"client":"SUPER YACHT","vtype":"OYSTER","provider":"SMG"},"29850(OS)":{"client":"SUPER YACHT","vtype":"COASTER(OS)","provider":"ARBIAN"},"91501":{"client":"ULTIMATE SECURITY","vtype":"COASTER","provider":"SMG"},"98303":{"client":"ULTIMATE SECURITY","vtype":"COASTER","provider":"SMG"},"44476":{"client":"ULTIMATE SECURITY","vtype":"HIACE","provider":"SMG"},"27367(OS)":{"client":"RSK SECURITY","vtype":"MID ROOF(OS)","provider":"AL AROBA"},"92598":{"client":"T B S SECURITY","vtype":"HIACE","provider":"SMG"},"90687":{"client":"THRIVE SECURITY","vtype":"HIACE","provider":"SMG"},"70563(OS)":{"client":"112","vtype":"MID ROOF(OS)","provider":"KHAYBER"},"97159":{"client":"BBQ","vtype":"HIACE","provider":"SMG"},"69728":{"client":"DRAGONS SEC","vtype":"HIACE","provider":"SMG"},"94502":{"client":"YARD CAR","vtype":"COROLLA","provider":"SMG"},"88697":{"client":"YARD CAR","vtype":"NISSAN CAR","provider":"SMG"},"13286":{"client":"CH-HOME","vtype":"LAND CRUSER","provider":"SMG"},"42868":{"client":"CH-HOME-1","vtype":"HIGHLANDER","provider":"SMG"},"83042":{"client":"OFFICE","vtype":"COROLLA","provider":"SMG"},"42658":{"client":"SPARE","vtype":"COASTER","provider":"SMG"},"42017":{"client":"SPARE","vtype":"COASTER 25S","provider":"SMG"},"93597":{"client":"SPARE","vtype":"ROSA","provider":"SMG"},"51204":{"client":"SPARE","vtype":"NISSAN CAR","provider":"SMG"},"18710":{"client":"SPARE","vtype":"COASTER","provider":"SMG"},"77495":{"client":"SPARE","vtype":"COASTER","provider":"SMG"},"72658":{"client":"SPARE","vtype":"ASHOK","provider":"SMG"},"18712":{"client":"SPARE","vtype":"MAXUS","provider":"SMG"},"97142":{"client":"SPARE","vtype":"HIACE","provider":"SMG"},"91484":{"client":"SPARE","vtype":"MID ROOF","provider":"SMG"},"99287(OS)":{"client":"SPARE","vtype":"HIACE(OS)","provider":"KHAYBER"},"69406(OS)":{"client":"SPARE","vtype":"COASTER(OS)","provider":"KHAYBER"},"63844":{"client":"HEMAYA","vtype":"ASHOK","provider":"SMG"},"16571":{"client":"SPARE","vtype":"MAXUS","provider":"SMG"},"79506":{"client":"SPARE","vtype":"ASHOK","provider":"SMG"},"64315":{"client":"SPARE","vtype":"ASHOK","provider":"SMG"},"92032(OS)":{"client":"SPARE","vtype":"ASHOK","provider":"MS-TOURISM"}};
const importedComplaintTickets = [
  { id:'fcp_004_21596', ticketNo:'FCP-004', date:'2026-04-20', client:'G4S', plate:'AUH-1-21596', vehicle:'OYSTER', category:'Windscreen / Glass', priority:'Critical', status:'Open', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Abu Dhabi', description:'Windscreen / Glass issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-04-20T00:00:00Z' },
  { id:'fcp_005_55925', ticketNo:'FCP-005', date:'2026-05-04', client:'G4S', plate:'AUH-255925', vehicle:'ROSA', category:'Tyres', priority:'Medium', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Abu Dhabi', description:'Tyres issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-04T00:00:00Z' },
  { id:'fcp_006_29780', ticketNo:'FCP-006', date:'2026-05-05', client:'ALIGN', plate:'DXB H-29780', vehicle:'HIACE', category:'Safety (Seat Belts / Mirrors)', priority:'High', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Dubai', description:'Safety issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-05T00:00:00Z' },
  { id:'fcp_007_34578', ticketNo:'FCP-007', date:'2026-05-05', client:'HEMAYA', plate:'DXB L-34578', vehicle:'MID ROOF', category:'Interior / Hygiene', priority:'Critical', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Dubai', description:'Interior / Hygiene issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-05T00:00:00Z' },
  { id:'fcp_008_18710', ticketNo:'FCP-008', date:'2026-05-06', client:'SPARE', plate:'DXB R 18710', vehicle:'COASTER', category:'Steering', priority:'Critical', status:'In Progress', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Dubai', description:'Steering issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-06T00:00:00Z' },
  { id:'fcp_009_55075', ticketNo:'FCP-009', date:'2026-05-08', client:'G4S', plate:'55075', vehicle:'OYSTER', category:'AC / Climate Control', priority:'Medium', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Abu Dhabi', description:'AC / Climate Control issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-08T00:00:00Z' },
  { id:'fcp_020_77589', ticketNo:'FCP-020', date:'2026-05-03', client:'G4S', plate:'DXB R 77589', vehicle:'COASTER', category:'Odometer / Instruments', priority:'High', status:'In Progress', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Dubai', description:'Odometer / Instruments issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-03T00:00:00Z' },
  { id:'fcp_010_30133', ticketNo:'FCP-010', date:'2026-05-02', client:'G4S', plate:'AD-1-30133', vehicle:'OYSTER', category:'Electrical / Indicators', priority:'Medium', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Abu Dhabi', description:'Electrical / Indicators issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-02T00:00:00Z' },
  { id:'fcp_010_48100', ticketNo:'FCP-010', date:'2026-05-09', client:'HEMAYA', plate:'48100', vehicle:'HIACE', category:'Tyres', priority:'High', status:'Open', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'RAS AL KHAIMA', description:'Tyres issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' },
  { id:'fcp_011_63154', ticketNo:'FCP-011', date:'2026-05-09', client:'ALIGN', plate:'63154', vehicle:'HIACE', category:'Tyres', priority:'High', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'JABEL ALI', description:'Tyres issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' },
  { id:'fcp_012_26528', ticketNo:'FCP-012', date:'2026-05-09', client:'ALIGN', plate:'26528', vehicle:'COASTER', category:'Tyres', priority:'Critical', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'JABEL ALI', description:'Tyres issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' },
  { id:'fcp_013_74531', ticketNo:'FCP-013', date:'2026-05-09', client:'TMAX', plate:'74531', vehicle:'COASTER', category:'Electrical / Indicators', priority:'Critical', status:'Open', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Jabel Ali', description:'Electrical / Indicators issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' },
  { id:'fcp_014_63617', ticketNo:'FCP-014', date:'2026-05-09', client:'STAR SERVICES', plate:'63617', vehicle:'HI ROOF', category:'AC / Climate Control', priority:'High', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'DIP 1', description:'AC / Climate Control issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' },
  { id:'fcp_015_79724', ticketNo:'FCP-015', date:'2026-05-09', client:'G4S', plate:'79724', vehicle:'MID ROOF', category:'Engine / Mechanical', priority:'High', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Al Qouz', description:'Engine / Mechanical issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' },
  { id:'fcp_016_28579', ticketNo:'FCP-016', date:'2026-05-09', client:'ALIGN', plate:'28579', vehicle:'COASTER', category:'Tyres', priority:'Critical', status:'Resolved', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'—', description:'Tyres issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' },
  { id:'fcp_017_22431', ticketNo:'FCP-017', date:'2026-05-09', client:'TMAX', plate:'22431', vehicle:'COASTER', category:'AC / Climate Control', priority:'High', status:'Open', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'Jabel Ali', description:'AC / Climate Control issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' },
  { id:'fcp_018_91484', ticketNo:'FCP-018', date:'2026-05-09', client:'SPARE', plate:'91484', vehicle:'MID ROOF', category:'Engine / Mechanical', priority:'High', status:'Open', requestedBy:'Imported complaint list', assignedTo:'Unassigned', provider:'SMG', location:'JABEL ALI', description:'Engine / Mechanical issue reported from complaint list.', action:'Imported from client complaint list.', slaDays:7, escalated:false, createdAt:'2026-05-09T00:00:00Z' }
];
const seedTickets = [
  { id:'t_1', ticketNo:'REQ-001', date:today(), client:'ALIGN', plate:'18710', vehicle:'Mitsubishi Rosa', category:'Vehicle Issue', priority:'High', status:'Open', requestedBy:'Fleet Manager', assignedTo:'Unassigned', provider:'SMG', location:'Garage', description:'AC not cooling properly.', action:'Awaiting inspection', slaDays:3, escalated:false, createdAt:new Date().toISOString() },
  { id:'t_2', ticketNo:'REQ-002', date:today(), client:'G4S', plate:'23021', vehicle:'Toyota Hiace', category:'Maintenance Request', priority:'Medium', status:'In Progress', requestedBy:'Operations', assignedTo:'Ahmed', provider:'SMG', location:'Abu Dhabi', description:'Routine service request.', action:'Technician assigned', slaDays:7, escalated:false, createdAt:new Date().toISOString() },
  ...importedComplaintTickets
];

const state = { user:null, view:'dashboard', parts:[], jobs:[], vehicles:[], clients:[], employees:[], staff:[], logs:[], tickets:[], filters:{ q:'', category:'All', stock:'All' }, inventorySort:{key:'name',dir:'asc'}, vehicleHistoryQuery:'', fleetFilter:'', clientFilter:'', selectedClient:'', summarySearch:'', activityQuery:'', activitySection:'All', ticketTab:'dashboard', ticketSearch:'', ticketStatus:'All', ticketPriority:'All', fleetSubView:'list', replacementMonth:today().slice(0,7), replacementClient:'', replacementVehicleSearch:'', replacementUndoStack:[], replacementDirty:false, replacementUnlockedMonths:[], vehicleHistorySearch:'', replacements:[], employeeType:'All', employeeSearch:'', editingEmployeeId:'', employeeTicketSearch:'', editingEmployeeTicketId:'', salikSearch:'' };
function duplicateKey(value){ return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ''); }
function plateDuplicateKey(value){ return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, ''); }
function inventoryDuplicate(part){
  return state.parts.find(p => p.id !== part.id && (duplicateKey(p.sku) === duplicateKey(part.sku) || duplicateKey(p.name) === duplicateKey(part.name)));
}
function fleetDuplicate(vehicle){
  return state.vehicles.find(v => v.id !== vehicle.id && plateDuplicateKey(v.plate) === plateDuplicateKey(vehicle.plate));
}
const JOB_STATUSES = ['Not Started','Pending','Work Being Done','Done Completed'];
const REGISTERED_COMPANIES = ['MBR1','MBR2','Garage','AHU','Travel & Tourism'];
const EMPLOYEE_TYPES = ['SMG','Outsourced'];
const EMPLOYEE_VISA_STATUS = ['MBR1','MBR2','Garage','AHU','Travel & Tourism'];
const UAE_PERMIT_CATEGORIES = ['Abu Dhabi Permit','Dubai Permit','Sharjah Permit','Ajman Permit','Umm Al Quwain Permit','Ras Al Khaimah Permit','Fujairah Permit'];
function extractYearFromModel(model=''){
  const match = String(model || '').match(/\b(19\d{2}|20\d{2})\b/);
  return match ? match[1] : '';
}
function modelWithoutYear(model=''){
  return String(model || '').replace(/\b(19\d{2}|20\d{2})\b/g, '').replace(/\s{2,}/g, ' ').trim();
}
function normalizeFleetVehicles(){
  let changed = false;
  state.vehicles.forEach(v => {
    if(!v.year){ const y = extractYearFromModel(v.modelNumber); if(y){ v.year = y; v.modelNumber = modelWithoutYear(v.modelNumber); changed = true; } }
    if(v.ownership === 'Outsource') {
      if(v.registeredCompany) { v.registeredCompany = ''; changed = true; }
    } else if(!v.registeredCompany) { v.registeredCompany = 'Garage'; changed = true; }
    if(!v.fuelChip) { v.fuelChip = 'No'; changed = true; }
    if(!v.assignedDriver) { v.assignedDriver = 'Without driver'; changed = true; }
    if(v.ownership !== 'Outsource' && v.vendorName) { v.vendorName = ''; changed = true; }
    if(v.ownership !== 'Outsource' && (v.outsourceStartDate || v.outsourceEndDate)) { v.outsourceStartDate = ''; v.outsourceEndDate = ''; changed = true; }
    if(v.status === 'Off-hire' && (Number(v.rentRate || 0) !== 0 || Number(v.clientRate || 0) !== 0)) { v.rentRate = 0; v.clientRate = 0; changed = true; }
  });
  return changed;
}
const jobStatus = (j) => j?.status || 'Done Completed';
const JOB_LOCK_PIN = '3100';
const isJobLocked = (j) => jobStatus(j) === 'Done Completed';
function hasJobOverride(jobId){ return (state.jobEditOverrideIds || []).includes(jobId); }
function markJobOverride(jobId){ if(!state.jobEditOverrideIds) state.jobEditOverrideIds=[]; if(!state.jobEditOverrideIds.includes(jobId)) state.jobEditOverrideIds.push(jobId); }
function requireJobOverride(job, action='edit'){
  if(!job || !isJobLocked(job) || hasJobOverride(job.id)) return true;
  const pin = prompt(`This job card is Done Completed and locked. Enter override PIN 3100 to ${action}.`);
  if(pin === JOB_LOCK_PIN){ markJobOverride(job.id); toast('Override accepted. Job card unlocked for this session.'); return true; }
  toast('Wrong override PIN. Job card remains locked.');
  return false;
}
function existingJobNumbersForDate(date=today()){
  const compact = String(date || today()).replace(/-/g,'');
  return state.jobs.map(j => String(j.jobCardId || '')).filter(x => x.startsWith(`JC-${compact}-`)).map(x => Number(x.split('-').pop())).filter(Boolean);
}
function nextJobCardId(date=today()){
  const compact = String(date || today()).replace(/-/g,'');
  const next = Math.max(0, ...existingJobNumbersForDate(date)) + 1;
  return `JC-${compact}-${String(next).padStart(4,'0')}`;
}
function ensureJobCardId(job){
  if(!job) return '';
  if(!job.jobCardId) job.jobCardId = nextJobCardId(job.date || today());
  return job.jobCardId;
}
function normalizeJobs(){
  let changed = false;
  state.jobs.forEach(j => { if(!j.jobCardId){ ensureJobCardId(j); changed = true; } });
  return changed;
}
function jobCardOptionsHTML(){
  return state.jobs.length
    ? state.jobs.map(j => `<option value="${esc(j.id)}">${esc(ensureJobCardId(j))} — ${esc(j.plate || 'No plate')} — ${esc(j.description || 'Job')}</option>`).join('')
    : '';
}
function statusCounts(){
  return JOB_STATUSES.reduce((acc,status)=>{
    acc[status] = state.jobs.filter(j => jobStatus(j) === status).length;
    return acc;
  }, {});
}
function statusPill(status){
  const safe = status || 'Done Completed';
  const cls = safe === 'Done Completed' ? 'green' : safe === 'Pending' ? 'orange' : safe === 'Work Being Done' ? 'blue' : 'gray';
  return `<span class="pill ${cls}">${esc(safe)}</span>`;
}

function statusSelect(jobId, current=''){
  const value = current || 'Done Completed';
  const job = state.jobs.find(j => j.id === jobId);
  const locked = job && isJobLocked(job) && !hasJobOverride(job.id);
  const lockedClass = locked ? ' locked-job-select' : '';
  const select = `<select class="job-status-select${lockedClass}" data-current-status="${esc(value)}" onchange="updateJobStatus('${esc(jobId)}', this.value)">${JOB_STATUSES.map(status => `<option value="${esc(status)}" ${status === value ? 'selected' : ''}>${esc(status)}</option>`).join('')}</select>`;
  return locked ? `${select}<span class="completed-job-locked">Locked</span>` : select;
}
async function updateJobStatus(jobId, newStatus){
  if(!JOB_STATUSES.includes(newStatus)) return toast('Invalid job status');
  const job = state.jobs.find(j => j.id === jobId);
  if(!job) return toast('Job not found');
  const previousStatus = jobStatus(job);
  if(isJobLocked(job) && newStatus !== previousStatus && !requireJobOverride(job, 'change the status')){ render(); return; }
  job.status = newStatus;
  job.updatedAt = new Date().toISOString();
  await saveJobs();
  await logAction('Updated job status', 'Job Card', ensureJobCardId(job), `${job.plate || ''} → ${newStatus}`, job.doneBy || state.user?.name);
  toast(`Job status changed to ${newStatus}`);
  const dialog = $('jobDialog');
  if(dialog && dialog.open){
    viewJob(jobId);
    return;
  }
  render();
}
function ensureLocalData(){ if(!localStorage.getItem(KEYS.users)) set(KEYS.users, seedUsers); if(!localStorage.getItem(KEYS.parts)) set(KEYS.parts, seedParts); if(!localStorage.getItem(KEYS.jobs)) set(KEYS.jobs, seedJobs); if(!localStorage.getItem(KEYS.vehicles)) set(KEYS.vehicles, seedVehicles); if(!localStorage.getItem(KEYS.staff)) set(KEYS.staff, seedStaff); if(!localStorage.getItem(KEYS.logs)) set(KEYS.logs, []); if(!localStorage.getItem(KEYS.tickets)) set(KEYS.tickets, seedTickets); if(!localStorage.getItem(KEYS.clients)) set(KEYS.clients, seedClients); if(!localStorage.getItem(KEYS.replacements)) set(KEYS.replacements, []); if(!localStorage.getItem(KEYS.employees)) set(KEYS.employees, []); if(!localStorage.getItem(KEYS.employeeTickets)) set(KEYS.employeeTickets, []); if(!localStorage.getItem(KEYS.salik)) set(KEYS.salik, []); }
function loadLocalData(){ state.user = get(KEYS.session, null); state.parts = get(KEYS.parts, []); state.jobs = get(KEYS.jobs, []); state.vehicles = get(KEYS.vehicles, []); state.clients = get(KEYS.clients, []); state.employees = get(KEYS.employees, []); state.staff = get(KEYS.staff, []); state.logs = get(KEYS.logs, []); state.tickets = get(KEYS.tickets, []); state.replacements = get(KEYS.replacements, []); state.employeeTickets = get(KEYS.employeeTickets, []); state.salik = get(KEYS.salik, []); }
function mergeImportedComplaintTickets(){
  const existing = new Set((state.tickets || []).map(t => `${String(t.ticketNo||'').toLowerCase()}|${String(t.plate||'').replace(/\s+/g,'').toLowerCase()}|${String(t.category||'').toLowerCase()}`));
  const missing = importedComplaintTickets.filter(t => !existing.has(`${String(t.ticketNo||'').toLowerCase()}|${String(t.plate||'').replace(/\s+/g,'').toLowerCase()}|${String(t.category||'').toLowerCase()}`));
  if(missing.length){
    state.tickets = [...(state.tickets || []), ...missing.map(t => ({...t}))];
    return true;
  }
  return false;
}
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
async function fetchRows(table, options={}){
  const { data, error } = await sb.from(table).select('id,data').order(table === 'jobs' ? 'created_at' : 'updated_at', { ascending:false });
  if(error){ console.error(error); if(!options.quiet) toast(`Could not load ${table}`); return []; }
  return (data || []).map(r => ({ id:r.id, ...r.data }));
}
async function loadRemoteData(){
  state.parts = await fetchRows('parts');
  state.jobs = await fetchRows('jobs');
  const jobIdsAdded = normalizeJobs();
  state.vehicles = await fetchRows('vehicles');
  state.clients = await fetchRows('clients', { quiet:true });
  state.employees = await fetchRows('employees', { quiet:true });
  state.replacements = await fetchRows('replacements', { quiet:true });
  state.employeeTickets = await fetchRows('employee_tickets', { quiet:true });
  state.salik = await fetchRows('salik', { quiet:true });
  const fleetNormalized = normalizeFleetVehicles();
  state.staff = await fetchRows('staff', { quiet:true });
  state.logs = await fetchRows('logs', { quiet:true });
  state.tickets = await fetchRows('tickets', { quiet:true });
  if(state.tickets.length === 0){ state.tickets = seedTickets.map(t => ({...t})); await saveTickets(); }
  else if(mergeImportedComplaintTickets()){ await saveTickets(); }
  if(jobIdsAdded) await saveJobs();
  if(fleetNormalized) await saveVehicles();
  if(state.parts.length === 0){
    state.parts = seedParts.map(p => ({...p}));
    await saveParts();
  }
  if(state.vehicles.length === 0){
    state.vehicles = seedVehicles.map(v => ({...v}));
    await saveVehicles();
  }
  if(state.clients.length === 0){
    state.clients = seedClients.map(c => ({...c}));
    await saveClients();
  }
  // Staff list comes only from the staff table. If empty, dropdown stays empty until you add a person.
}
function loadData(){ if(USE_SUPABASE) return; loadLocalData(); if(mergeImportedComplaintTickets()) set(KEYS.tickets, state.tickets); if(normalizeJobs()) set(KEYS.jobs, state.jobs); if(normalizeFleetVehicles()) set(KEYS.vehicles, state.vehicles); }
async function saveParts(){
  if(!USE_SUPABASE){ set(KEYS.parts, state.parts); return; }
  const rows = state.parts.map(p => ({ id:p.id, data:p, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('parts').upsert(rows);
  if(error){ console.error(error); toast('Could not save inventory'); } else markRemoteSnapshot();
}
async function saveJobs(){
  if(!USE_SUPABASE){ set(KEYS.jobs, state.jobs); return; }
  const rows = state.jobs.map(j => ({ id:j.id, data:j, created_at:j.createdAt || new Date().toISOString() }));
  const { error } = await sb.from('jobs').upsert(rows);
  if(error){ console.error(error); toast('Could not save job history'); } else markRemoteSnapshot();
}
async function saveVehicles(){
  if(!USE_SUPABASE){ set(KEYS.vehicles, state.vehicles); return; }
  const rows = state.vehicles.map(v => ({ id:v.id, data:v, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('vehicles').upsert(rows);
  if(error){ console.error(error); toast('Could not save fleet vehicles'); } else markRemoteSnapshot();
}
async function saveStaff(){
  hydrateStaffFromJobs();
  if(!USE_SUPABASE){ set(KEYS.staff, state.staff); return; }
  const rows = state.staff.map(x => ({ id:x.id, data:x, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('staff').upsert(rows);
  if(error){ console.warn('Could not save staff list. Run updated schema if you want staff list shared in Supabase.', error); } else markRemoteSnapshot();
}
async function saveLogs(){
  if(!USE_SUPABASE){ set(KEYS.logs, state.logs); return; }
  const rows = state.logs.map(x => ({ id:x.id, data:x, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('logs').upsert(rows);
  if(error){ console.warn('Could not save activity log. Run updated schema if you want activity log shared in Supabase.', error); } else markRemoteSnapshot();
}
async function saveTickets(){
  if(!USE_SUPABASE){ set(KEYS.tickets, state.tickets); return; }
  const rows = state.tickets.map(t => ({ id:t.id, data:t, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('tickets').upsert(rows);
  if(error){ console.warn('Could not save tickets. Run updated schema for the ticketing system.', error); } else markRemoteSnapshot();
}

async function saveClients(){
  if(!USE_SUPABASE){ set(KEYS.clients, state.clients); return; }
  const rows = state.clients.map(c => ({ id:c.id, data:c, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('clients').upsert(rows);
  if(error){ console.warn('Could not save clients. Run updated schema for the clients table.', error); } else markRemoteSnapshot();
}

async function saveEmployees(){
  if(!USE_SUPABASE){ set(KEYS.employees, state.employees); return; }
  const rows = state.employees.map(e => ({ id:e.id, data:e, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('employees').upsert(rows);
  if(error){ console.warn('Could not save employees. Run updated schema for the employees table.', error); toast('Could not save employees. Run updated schema.'); } else markRemoteSnapshot();
}


async function saveEmployeeTickets(){
  if(!USE_SUPABASE){ set(KEYS.employeeTickets, state.employeeTickets); return; }
  const rows = (state.employeeTickets || []).map(t => ({ id:t.id, data:t, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('employee_tickets').upsert(rows);
  if(error){ console.warn('Could not save employee tickets. Run updated schema for employee_tickets.', error); } else markRemoteSnapshot();
}

async function saveSalik(){
  if(!USE_SUPABASE){ set(KEYS.salik, state.salik); return; }
  const rows = (state.salik || []).map(r => ({ id:r.id, data:r, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('salik').upsert(rows);
  if(error){ console.warn('Could not save SALIK. Run updated schema for salik.', error); } else markRemoteSnapshot();
}

async function saveReplacements(){
  if(!USE_SUPABASE){ set(KEYS.replacements, state.replacements); return; }
  const rows = state.replacements.map(r => ({ id:r.id, data:r, updated_at:new Date().toISOString() }));
  const { error } = await sb.from('replacements').upsert(rows);
  if(error){ console.warn('Could not save replacements. Run updated schema for the replacements table.', error); } else markRemoteSnapshot();
}

async function deleteRemoteRow(table, id){
  if(!USE_SUPABASE) return;
  const { error } = await sb.from(table).delete().eq('id', id);
  if(error){ console.error(error); toast(`Could not delete ${table}`); }
}
function toast(msg){ const t=$('toast'); t.classList.remove('refresh-toast'); t.textContent=msg; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'), 2400); }
let remoteSignature = '';
let updateToastVisible = false;
let remoteWatcherTimer = null;
function stableDataSignature(items){ return (items || []).map(x => JSON.stringify(x)).sort().join('|'); }
function currentSharedSignature(){
  return ['parts','jobs','vehicles','clients','tickets','staff','replacements','employees','employeeTickets','salik'].map(k => `${k}:${stableDataSignature(state[k])}`).join('||');
}
function markRemoteSnapshot(){ remoteSignature = currentSharedSignature(); }
async function fetchRemoteSignature(){
  if(!USE_SUPABASE) return '';
  const tables = [['parts','parts'],['jobs','jobs'],['vehicles','vehicles'],['clients','clients'],['tickets','tickets'],['staff','staff'],['replacements','replacements'],['employees','employees'],['employeeTickets','employee_tickets'],['salik','salik']];
  const pieces = [];
  for(const [key, table] of tables){
    const { data, error } = await sb.from(table).select('id,data');
    if(error){ console.warn('Signature skipped table', table, error.message || error); continue; }
    pieces.push(`${key}:${(data || []).map(r => JSON.stringify({id:r.id,...r.data})).sort().join('|')}`);
  }
  return pieces.join('||');
}
function showRefreshToast(){
  if(updateToastVisible) return;
  updateToastVisible = true;
  const t = $('toast');
  t.classList.add('refresh-toast');
  t.innerHTML = '<span>New update available from another user.</span><button type="button" onclick="location.reload()">Refresh</button>';
  t.classList.remove('hidden');
}
function startRemoteUpdateWatcher(){
  if(!USE_SUPABASE || remoteWatcherTimer) return;
  markRemoteSnapshot();
  remoteWatcherTimer = setInterval(async()=>{
    try{
      const sig = await fetchRemoteSignature();
      if(!remoteSignature){ remoteSignature = sig; return; }
      if(sig && sig !== remoteSignature) showRefreshToast();
    }catch(err){ console.warn('Update watcher skipped', err); }
  }, 20000);
}
async function logAction(action, section, reference='', details='', staff=''){
  const entry = {
    id: id('log'),
    timestamp: new Date().toISOString(),
    action,
    section,
    reference,
    details,
    staff: staff || state.user?.name || state.user?.email || '—'
  };
  state.logs.unshift(entry);
  state.logs = state.logs.slice(0, 1500);
  await saveLogs();
}
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
  document.querySelectorAll('.subnav').forEach(btn => btn.onclick=()=>go(btn.dataset.view));
}
function toggleAuth(mode){ $('loginTab').classList.toggle('active', mode==='login'); $('signupTab').classList.toggle('active', mode==='signup'); $('loginForm').classList.toggle('hidden', mode!=='login'); $('signupForm').classList.toggle('hidden', mode!=='signup'); }
function showAuth(){ $('authScreen').classList.remove('hidden'); $('appShell').classList.add('hidden'); }
function showApp(){ $('authScreen').classList.add('hidden'); $('appShell').classList.remove('hidden'); $('userName').textContent = 'Sarab Al Madina Team'; render(); if(USE_SUPABASE){ markRemoteSnapshot(); startRemoteUpdateWatcher(); } }
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
function go(view){ state.view=view; document.querySelectorAll('.subnav').forEach(b=>b.classList.toggle('active', b.dataset.view===view)); document.querySelectorAll('.nav').forEach(b=>{ const v=b.dataset.view; const active = v===view || (v==='fleet' && ['fleet','fleetSummary','replacements','vehicleHistory','salik'].includes(view)); b.classList.toggle('active', active || (v==='employees' && ['employees','employeeHistory','employeeTickets'].includes(view)) || (v==='job' && ['job','used'].includes(view))); }); $('sidebar').classList.remove('open'); render(); }
function goInventory(stock='All'){ state.filters.stock=stock; state.view='inventory'; document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active', b.dataset.view==='inventory')); $('sidebar').classList.remove('open'); render(); }
function goJobs(){ state.view='used'; document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active', b.dataset.view==='job')); document.querySelectorAll('.subnav').forEach(b=>b.classList.toggle('active', b.dataset.view==='job')); document.querySelectorAll('.subnav').forEach(b=>b.classList.toggle('active', b.dataset.view==='used')); $('sidebar').classList.remove('open'); render(); }

function defaultStaffName(){
  const name = String(state.user?.name || '').trim();
  if(name && name !== 'Sarab Al Madina Team') return name;
  const email = String(state.user?.email || '').split('@')[0].trim();
  return email || '';
}

function normalizeStaffName(name){ return String(name || '').trim().replace(/\s+/g, ' '); }
function staffNames(){
  const names = new Map();
  (state.staff || []).forEach(x => {
    const n = normalizeStaffName(typeof x === 'string' ? x : x.name);
    if(n) names.set(n.toLowerCase(), n);
  });
  return [...names.values()].sort((a,b)=>a.localeCompare(b));
}
function staffOptionsHTML(){ return staffNames().map(n => `<option value="${esc(n)}"></option>`).join(''); }
async function addStaffName(name){
  const clean = normalizeStaffName(name);
  if(!clean) return '';
  if(!(state.staff || []).some(x => normalizeStaffName(x.name).toLowerCase() === clean.toLowerCase())){
    state.staff.push({ id:id('staff'), name:clean, createdAt:new Date().toISOString() });
    await saveStaff();
    await logAction('Added staff member', 'Staff', clean, 'Added to employee dropdown', state.user?.name);
  }
  return clean;
}
async function addStaffFromPrompt(){
  const name = prompt('Enter employee/staff name');
  const clean = await addStaffName(name);
  if(!clean) return;
  const list = $('staffNameList');
  const sel = $('jobDoneBySelect');
  if(sel){ sel.innerHTML = '<option value="">Choose employee</option>' + staffNames().map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join(''); sel.value = clean; }
  toast(`${clean} added to staff list`);
}
function hydrateStaffFromJobs(){
  // Intentionally disabled: old job names should not repopulate the employee dropdown.
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
function render(){ if(!USE_SUPABASE) loadData(); const s=stats(); const page=$('page'); const views={dashboard:dashboardHTML, clients:clientsHTML, inventory:inventoryHTML, employees:employeesHTML, employeeHistory:employeeHistoryHTML, employeeTickets:employeeTicketsHTML, fleet:fleetHTML, fleetSummary:fleetSummaryHTML, replacements:replacementsHTML, vehicleHistory:vehicleHistoryHTML, salik:salikHTML, tickets:ticketsHTML, job:jobHTML, used:usedHTML, expiry:expiryHTML, reports:reportsHTML, activity:activityHTML, export:exportHTML, settings:settingsHTML}; page.innerHTML=(views[state.view]||dashboardHTML)(s); bindPageEvents(); hydrateStaticIcons(); updateExpiryNavBadge(); }
function kpi(title,num,sub,icon,warn=false,action=''){ const tone=warn?'orange':''; const moneyClass=String(num).includes('AED')?'money':''; const click=action ? ` onclick="${action}" role="button" tabindex="0"` : ''; return `<section class="card kpi ${action ? 'clickable-kpi' : ''}"${click}><div><h3>${title}</h3><div class="num ${tone} ${moneyClass}">${num}</div><p>${sub}</p></div><div class="kpi-icon ${warn?'warn':''}">${I(icon,'icon-xl')}</div></section>`; }
function statusSummaryCard(){
  const c = statusCounts();
  return `<section class="card kpi status-kpi clickable-kpi" onclick="go('used')" role="button" tabindex="0"><div class="status-kpi-body"><h3>Job Status</h3><div class="status-mini-grid"><div><b>${c['Done Completed'] || 0}</b><span>Done</span></div><div><b>${c['Pending'] || 0}</b><span>Pending</span></div><div><b>${c['Not Started'] || 0}</b><span>Not Started</span></div><div><b>${c['Work Being Done'] || 0}</b><span>Working</span></div></div></div><div class="kpi-icon">${I('clipboard','icon-xl')}</div></section>`;
}

function daysUntilDate(dateStr){
  if(!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if(Number.isNaN(target.getTime())) return null;
  const now = new Date(`${today()}T00:00:00`);
  return Math.ceil((target - now) / 86400000);
}
function expiryNeedsAction(dateStr, daysBefore){
  const d = daysUntilDate(dateStr);
  return d !== null && d <= daysBefore;
}
function actionNeededItems(){
  const items=[];
  const add=(module,type,owner,date,threshold,detail,goTo)=>{
    const days = daysUntilDate(date);
    if(days === null || days > threshold) return;
    items.push({ module, type, owner: owner || '—', date, days, detail: detail || '', goTo: goTo || '' });
  };
  (state.employees||[]).forEach(e=>{
    const employeeName = e.name || 'Employee';
    if((e.type||'SMG') === 'SMG'){
      add('Employees','Passport expiry',employeeName,e.passportExpiryDate,30,'SMG employee passport expires within 30 days','employees');
      add('Employees','Driver license expiry',employeeName,e.drivingLicenseExpiryDate,30,'SMG employee driving license expires within 30 days','employees');
    }
    if(e.hasActivePermit) add('Employees',`${e.permitCategory || 'Employee permit'} expiry`,employeeName,e.permitExpiryDate,7,'Employee active permit expires within 7 days','employees');
  });
  (state.vehicles||[]).forEach(v=>{
    if(v.hasActivePermit) add('Fleet',`${v.permitCategory || 'Vehicle permit'} expiry`,v.plate || v.modelNumber || 'Vehicle',v.permitExpiryDate,7,`${v.modelNumber || ''} ${v.customer ? '• '+v.customer : ''}`.trim(),'fleet');
    if((v.ownership || 'SMG Vehicle') !== 'Outsource') add('Fleet','Vehicle registration expiry',v.plate || v.modelNumber || 'Vehicle',v.registrationExpiryDate,30,`${v.modelNumber || ''} ${v.customer ? '• '+v.customer : ''}`.trim(),'fleet');
  });
  (state.clients||[]).forEach(c=>{
    add('Clients','Contract expiry',c.name || 'Client',c.contractEnd,30,'Client contract expires within 30 days','clients');
  });
  (state.employeeTickets||[]).forEach(t=>{
    if(ticketLeaveOverstay(t)){
      items.push({ module:'Employees', type:'Leave overstay', owner:t.employee || 'Employee', date:t.leaveEndDate || '', days: Number(ticketOverstayDays(t) || 0), detail:`Return to duty not completed / late by ${ticketOverstayDays(t)} day${ticketOverstayDays(t)===1?'':'s'}`, goTo:'employeeTickets' });
    }
  });
  (state.tickets||[]).forEach(t=>{
    const daysOpen = ticketDaysOpen(t);
    const sla = Number(t.slaDays || 7);
    if(t.status !== 'Resolved' && daysOpen > sla){
      items.push({ module:'Ticketing', type:'SLA overdue', owner:t.ticketNo || t.plate || 'Ticket', date:t.date || '', days: daysOpen - sla, detail:`${t.category || 'Ticket'} overdue by ${daysOpen - sla} day${daysOpen - sla === 1 ? '' : 's'}`, goTo:'tickets' });
    }
  });
  return items.sort((a,b)=>{
    const ad = a.date ? new Date(a.date).getTime() : 0;
    const bd = b.date ? new Date(b.date).getTime() : 0;
    if(a.days < 0 && b.days >= 0) return -1;
    if(b.days < 0 && a.days >= 0) return 1;
    return ad - bd;
  });
}
function employeeAlertItems(){ return actionNeededItems().filter(x=>x.module==='Employees' || x.module==='Fleet'); }
function updateExpiryNavBadge(){
  const el=$('expiryNavText');
  if(el){ const count=actionNeededItems().length; el.textContent = count ? `Expiry (${count})` : 'Expiry'; }
}
function ticketDetailsCard(){
  const open=(state.tickets||[]).filter(t=>t.status !== 'Resolved').length;
  const escalated=(state.tickets||[]).filter(t=>t.escalated || (t.status !== 'Resolved' && ticketDaysOpen(t) > Number(t.slaDays || 7))).length;
  const pending=(state.tickets||[]).filter(t=>t.status === 'Pending' || t.status === 'Open' || t.status === 'In Progress').length;
  return `<section class="card kpi status-kpi clickable-kpi" onclick="go('tickets')" role="button" tabindex="0"><div class="status-kpi-body"><h3>Ticketing Details</h3><div class="status-mini-grid"><div><b>${open}</b><span>Open</span></div><div><b>${pending}</b><span>Pending</span></div><div><b>${escalated}</b><span>Escalated</span></div><div><b>${(state.tickets||[]).length}</b><span>Total</span></div></div></div><div class="kpi-icon">${I('file','icon-xl')}</div></section>`;
}
function employeeAlertsCard(){
  const alerts=employeeAlertItems();
  return `<section class="card kpi clickable-kpi" onclick="go('expiry')" role="button" tabindex="0"><div><h3>Employee Alerts</h3><div class="num ${alerts.length?'orange':''}">${alerts.length}</div><p>${alerts.length ? 'Expiry/action needed' : 'No expiry alerts'}</p></div><div class="kpi-icon ${alerts.length?'warn':''}">${I('warning','icon-xl')}</div></section>`;
}
function dashboardHTML(s){
  const recentJobs=state.jobs.slice(0,4);
  return `<div class="kpis">${ticketDetailsCard()}${kpi('Jobs Today',s.todayJobs,'Jobs logged today','clipboard',false,"goJobs()")}${employeeAlertsCard()}${statusSummaryCard()}</div>
  <section class="panel quick"><div class="section-title"><h3>Quick Actions</h3></div><div class="quick-grid"><button class="btn primary large-btn" onclick="openPartDialog()">${I('plus')} Add Part</button><button class="btn primary large-btn" onclick="go('job')">${I('clipboard')} Raise Job Card</button><button class="btn primary large-btn" onclick="go('tickets')">${I('file')} Ticketing</button><button class="btn primary large-btn" onclick="openRestockDialog()">${I('cart')} Restock</button><button class="btn primary large-btn" onclick="go('export')">${I('file')} Export CSV</button></div></section>
  ${plateHistoryPanelHTML('Quickly search a plate number from the dashboard and see all work done for that vehicle.')}
  <div class="dashboard-stack"><section class="panel"><div class="section-title"><h3>Inventory Overview</h3><div class="section-actions"><button class="mini-btn" onclick="exportDashboardInventory()">CSV</button><button class="mini-btn" onclick="go('inventory')">View All Inventory</button></div></div>${inventoryTable(state.parts.slice(0,5), true)}</section><section class="panel recent-jobs-panel"><div class="section-title"><h3>Recent Jobs</h3><div class="section-actions"><button class="mini-btn" onclick="exportDashboardJobs()">CSV</button><button class="mini-btn" onclick="go('used')">View All Jobs</button></div></div>${recentJobs.length?`<div class="recent-job-list-clean">${recentJobs.map(dashboardJobRow).join('')}</div>`:'<div class="empty">No jobs logged yet.</div>'}</section></div>`;
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
function sortedInventoryParts(parts){
  const sort = state.inventorySort || {key:'name', dir:'asc'};
  const dir = sort.dir === 'desc' ? -1 : 1;
  const val = (p) => {
    if(sort.key === 'stock') return Number(p.qty || 0);
    if(sort.key === 'threshold') return Number(p.threshold || 0);
    if(sort.key === 'costValue') return Number(p.qty || 0) * Number(p.cost || 0);
    if(sort.key === 'lastUsed') return lastUsedPlain(p.id) || '';
    if(sort.key === 'ordered') return p.ordered ? 1 : 0;
    return String(p[sort.key] || '').toLowerCase();
  };
  return [...parts].sort((a,b)=>{
    const av=val(a), bv=val(b);
    if(typeof av === 'number' && typeof bv === 'number') return (av-bv)*dir;
    return String(av).localeCompare(String(bv), undefined, {numeric:true, sensitivity:'base'})*dir;
  });
}
function setInventorySort(key){
  const current = state.inventorySort || {};
  state.inventorySort = { key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' };
  renderInventoryResults();
}
function sortIcon(key){
  const sort = state.inventorySort || {};
  if(sort.key !== key) return '';
  return sort.dir === 'asc' ? ' ▲' : ' ▼';
}
function nextSerialNumber(){
  const serials = (state.parts || []).map(p=>String(p.sku || '').trim()).filter(Boolean);
  let best = null;
  serials.forEach(sn=>{
    const m = sn.match(/^(.*?)(\d+)(\D*)$/);
    if(!m) return;
    const n = Number(m[2]);
    if(!best || n > best.n) best = {prefix:m[1], num:m[2], suffix:m[3], n};
  });
  if(best){
    const next = String(best.n + 1).padStart(best.num.length, '0');
    return `${best.prefix}${next}${best.suffix}`;
  }
  return serials.length ? String(serials.length + 1) : '1';
}
function renderInventoryResults(){
  const target=$('inventoryResults');
  if(target) target.innerHTML = inventoryTable(sortedInventoryParts(filteredInventoryParts()), false);
}

function normName(name){ return String(name || '').trim().replace(/\s+/g,' '); }
function clientKey(name){ return normName(name).toLowerCase(); }
function allClients(){
  const map = new Map();
  (state.clients || []).forEach(c => { const name=normName(c.name); if(name) map.set(clientKey(name), {...c, name}); });
  (state.vehicles || []).forEach(v => {
    const name=normName(v.customer);
    if(!name) return;
    if(!map.has(clientKey(name))) map.set(clientKey(name), { id:`fleet_client_${clientKey(name).replace(/[^a-z0-9]+/g,'_')}`, name, contractStart:'', contractEnd:'', contactPerson:'', phone:'', email:'', notes:'Pulled from fleet records', fromFleet:true });
  });
  return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
function clientVehicles(name){
  const key=clientKey(name);
  return state.vehicles.filter(v=>clientKey(v.customer)===key);
}
function clientTickets(name){
  const key=clientKey(name);
  return state.tickets.filter(t=>clientKey(t.client)===key);
}
function clientRevenue(name){
  return clientVehicles(name).reduce((a,v)=>a+(v.status === 'In Use' ? Number(v.clientRate||0) : 0),0);
}
function contractStatus(c){
  if(!c.contractEnd) return '<span class="pill gray">No contract date</span>';
  const days=Math.ceil((new Date(c.contractEnd)-new Date(today()))/86400000);
  if(days < 0) return '<span class="pill red">Expired</span>';
  if(days <= 30) return '<span class="pill orange">Expiring soon</span>';
  return '<span class="pill green">Active</span>';
}
function clientOverviewHTML(client){
  if(!client) return '<section class="panel client-overview redesigned"><div class="empty">Select a client to see their contract, linked fleet, tickets and revenue.</div></section>';
  const vehicles=clientVehicles(client.name);
  const tickets=clientTickets(client.name);
  const openTickets=tickets.filter(t=>t.status!=='Resolved');
  const inUse=vehicles.filter(v=>v.status==='In Use').length;
  const outsource=vehicles.filter(v=>v.ownership==='Outsource').length;
  const revenue=clientRevenue(client.name);
  const activeFleet=vehicles.filter(v=>v.status==='In Use');
  return `<section class="panel client-overview redesigned">
    <div class="client-profile-hero">
      <div>
        <span class="eyebrow">Client Overview</span>
        <h2>${esc(client.name)}</h2>
        <p>Contract: <b>${esc(client.contractStart || '—')}</b> → <b>${esc(client.contractEnd || '—')}</b></p>
      </div>
      <div class="client-hero-actions">
        ${contractStatus(client)}
        <button class="mini-btn" onclick="editClient('${esc(client.name)}')">Edit</button>
        <button class="mini-btn danger" onclick="deleteClient('${esc(client.id || '')}','${esc(client.name)}')">Remove</button>
      </div>
    </div>
    <div class="client-summary-grid redesigned">
      <div><span>Total Fleet</span><b>${vehicles.length}</b></div>
      <div><span>In Use</span><b>${inUse}</b></div>
      <div><span>Outsource</span><b>${outsource}</b></div>
      <div><span>Monthly Revenue</span><b>${money(revenue)}</b></div>
      <div><span>Open Tickets</span><b>${openTickets.length}</b></div>
    </div>
    <div class="client-detail-grid redesigned">
      <div><small>Contact Person</small><b>${esc(client.contactPerson || '—')}</b></div>
      <div><small>Phone</small><b>${esc(client.phone || '—')}</b></div>
      <div><small>Email</small><b>${esc(client.email || '—')}</b></div>
      <div><small>Notes</small><b>${esc(client.notes || '—')}</b></div>
    </div>
    <div class="client-linked two-columns">
      <div>
        <h4>Linked Fleet</h4>
        ${vehicles.length?`<div class="client-linked-list">${vehicles.slice(0,8).map(v=>`<div class="client-linked-row"><div><span class="fleet-plate">${esc(v.plate)}</span><b>${esc(modelWithoutYear(v.modelNumber) || 'Vehicle')}${v.year?` · ${esc(v.year)}`:''}</b><small>${esc(v.status || '')} · ${esc(v.ownership || '')}</small></div><strong>${money(v.status==='In Use'?v.clientRate:0)}</strong></div>`).join('')}</div>`:'<div class="empty compact-empty">No vehicles linked to this client yet.</div>'}
      </div>
      <div>
        <h4>Open Tickets</h4>
        ${openTickets.length?`<div class="client-linked-list">${openTickets.slice(0,6).map(t=>`<div class="client-linked-row"><div><b>${esc(t.ticketNo || 'Ticket')}</b><small>${esc(t.plate || '')} · ${esc(t.category || 'Request')}</small></div><div>${ticketStatusPill(t.status)} ${ticketPriorityPill(t.priority)}</div></div>`).join('')}</div>`:'<div class="empty compact-empty">No open tickets for this client.</div>'}
      </div>
    </div>
  </section>`;
}
function clientsHTML(){
  const clients=allClients();
  const q=String(state.clientFilter||'').trim().toLowerCase();
  const filtered=clients.filter(c=>!q || [c.name,c.contractStart,c.contractEnd,c.contactPerson,c.phone,c.email,c.notes].join(' ').toLowerCase().includes(q));
  const selected=clients.find(c=>clientKey(c.name)===clientKey(state.selectedClient)) || filtered[0];
  if(selected && !state.selectedClient) state.selectedClient=selected.name;
  const totalRevenue=clients.reduce((a,c)=>a+clientRevenue(c.name),0);
  const activeContracts=clients.filter(c=>c.contractEnd && new Date(c.contractEnd) >= new Date(today())).length;
  const expiringSoon=clients.filter(c=>{ if(!c.contractEnd) return false; const days=Math.ceil((new Date(c.contractEnd)-new Date(today()))/86400000); return days>=0 && days<=30; }).length;
  return `<div class="page-head clients-head"><div><h1>Clients</h1><p class="muted">Manage client contracts and see linked fleet, revenue, and tickets.</p></div><div class="head-actions"><button class="btn light" onclick="exportClients()">${I('download','icon-sm')} Export CSV</button><button class="btn primary" onclick="clearClientForm()">${I('plus','icon-sm')} Add Client</button></div></div>
  <div class="client-top-metrics"><div><span>Total Clients</span><b>${clients.length}</b></div><div><span>Active Contracts</span><b>${activeContracts}</b></div><div><span>Expiring Soon</span><b>${expiringSoon}</b></div><div><span>Monthly Revenue</span><b>${money(totalRevenue)}</b></div></div>
  <div class="clients-layout redesigned">
    <section class="panel client-form-card redesigned"><div class="section-title"><div><h3>Add / Edit Client</h3><p class="muted small-note">If the client already exists, the contract end date will be extended to the later date.</p></div></div>
      <form id="clientForm" class="grid two"><input id="clientId" type="hidden"><label class="wide">Client name<input id="clientName" required placeholder="ALIGN / G4S / Trumax"></label><label>Contract start<input id="clientContractStart" type="date"></label><label>Contract end<input id="clientContractEnd" type="date"></label><label>Contact person<input id="clientContact" placeholder="Manager name"></label><label>Phone<input id="clientPhone" placeholder="+971..."></label><label class="wide">Email<input id="clientEmail" type="email" placeholder="client@example.com"></label><label class="wide">Notes<input id="clientNotes" placeholder="Payment terms, special instructions, renewal notes"></label><div class="modal-actions wide client-form-actions"><button type="button" class="btn light" onclick="clearClientForm()">Clear</button><button class="btn primary" type="submit">Save Client</button></div></form></section>
    <section class="panel client-list-card redesigned"><div class="section-title"><div><h3>Client List</h3><p class="muted small-note">Search, edit, or remove clients. Linked fleet count and revenue is shown on each card.</p></div></div><input id="clientSearch" placeholder="Search client, date, contact..." value="${esc(state.clientFilter||'')}" autocomplete="off" class="fleet-search"><div class="client-list redesigned">${filtered.map(c=>{ const vehicles=clientVehicles(c.name); const active=clientKey(c.name)===clientKey(selected?.name); const inUse=vehicles.filter(v=>v.status==='In Use').length; return `<article class="client-card ${active?'active':''}"><button class="client-card-main" onclick="selectClient('${esc(c.name)}')"><div><b>${esc(c.name)}</b><small>${esc(c.contractEnd ? 'Contract till '+c.contractEnd : 'No contract date')} · ${vehicles.length} vehicle${vehicles.length===1?'':'s'} · ${inUse} in use · ${money(clientRevenue(c.name))}</small></div>${contractStatus(c)}</button><div class="client-card-actions"><button class="mini-btn" onclick="editClient('${esc(c.name)}')">Edit</button><button class="mini-btn danger" onclick="deleteClient('${esc(c.id || '')}','${esc(c.name)}')">Remove</button></div></article>`; }).join('') || '<div class="empty">No clients found.</div>'}</div></section>
  </div>`;
}
async function saveClient(e){
  e.preventDefault();
  const name=normName($('clientName').value);
  if(!name) return toast('Client name is required');
  const formId = $('clientId').value;
  const existingById = formId ? state.clients.find(c=>c.id===formId) : null;
  const existingByName=state.clients.find(c=>clientKey(c.name)===clientKey(name));
  const existing=existingById || existingByName;
  const start=$('clientContractStart').value;
  const end=$('clientContractEnd').value;
  const client={
    id: existing?.id || id('client'),
    name,
    contractStart: existing?.contractStart && start ? (existing.contractStart < start ? existing.contractStart : start) : (start || existing?.contractStart || ''),
    contractEnd: existing?.contractEnd && end ? (existing.contractEnd > end ? existing.contractEnd : end) : (end || existing?.contractEnd || ''),
    contactPerson: $('clientContact').value.trim() || existing?.contactPerson || '',
    phone: $('clientPhone').value.trim() || existing?.phone || '',
    email: $('clientEmail').value.trim() || existing?.email || '',
    notes: $('clientNotes').value.trim() || existing?.notes || '',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const idx=state.clients.findIndex(c=>c.id===client.id);
  if(idx>=0) state.clients[idx]=client; else state.clients.unshift(client);
  state.selectedClient=name;
  await saveClients();
  await logAction(existing?'Updated client contract':'Added client','Clients', name, `Contract till ${client.contractEnd || '—'}`, state.user?.name);
  toast(existing ? 'Client updated / contract amended' : 'Client added');
  render();
}
function selectClient(name){ state.selectedClient=name; render(); }
function editClient(name){
  if(state.view!=='clients'){ state.view='clients'; render(); setTimeout(()=>editClient(name),50); return; }
  const c=allClients().find(x=>clientKey(x.name)===clientKey(name));
  if(!c) return;
  $('clientId').value=c.fromFleet ? '' : (c.id||''); $('clientName').value=c.name||''; $('clientContractStart').value=c.contractStart||''; $('clientContractEnd').value=c.contractEnd||''; $('clientContact').value=c.contactPerson||''; $('clientPhone').value=c.phone||''; $('clientEmail').value=c.email||''; $('clientNotes').value=c.notes||'';
  state.selectedClient=c.name;
  $('clientName')?.scrollIntoView({behavior:'smooth', block:'center'});
  $('clientName')?.focus();
}
async function deleteClient(clientId, name){
  const cleanName=normName(name);
  const existing=state.clients.find(c=>c.id===clientId) || state.clients.find(c=>clientKey(c.name)===clientKey(cleanName));
  if(!existing){ toast('This client is pulled from fleet. Change the fleet customer name to remove it.'); return; }
  const vehicles=clientVehicles(existing.name).length;
  if(!confirm(`Remove ${existing.name} from the client database? Linked fleet vehicles will stay unchanged (${vehicles} vehicle${vehicles===1?'':'s'}).`)) return;
  state.clients=state.clients.filter(c=>c.id!==existing.id);
  await saveClients();
  await deleteRemoteRow('clients', existing.id);
  await logAction('Removed client','Clients', existing.name, `Linked fleet kept: ${vehicles}`, state.user?.name);
  if(clientKey(state.selectedClient)===clientKey(existing.name)) state.selectedClient='';
  toast('Client removed');
  render();
}
function clearClientForm(){
  if(state.view!=='clients'){ go('clients'); return; }
  ['clientId','clientName','clientContractStart','clientContractEnd','clientContact','clientPhone','clientEmail','clientNotes'].forEach(id=>{ if($(id)) $(id).value=''; });
  setTimeout(()=>{$('clientName')?.focus();},50);
}
function exportClients(){
  const rows=[['Client','Contract Start','Contract End','Contract Status','Contact','Phone','Email','Linked Vehicles','In Use Vehicles','Monthly Client Revenue AED','Open Tickets','Notes']];
  allClients().forEach(c=>{
    const vehicles=clientVehicles(c.name); const inUse=vehicles.filter(v=>v.status==='In Use').length; const tickets=clientTickets(c.name).filter(t=>t.status!=='Resolved').length;
    rows.push([c.name,c.contractStart||'',c.contractEnd||'',c.contractEnd ? (new Date(c.contractEnd) < new Date(today()) ? 'Expired' : 'Active') : 'No date',c.contactPerson||'',c.phone||'',c.email||'',vehicles.length,inUse,clientRevenue(c.name),tickets,c.notes||'']);
  });
  downloadCSV('sarab-clients.csv', rows);
}

function inventoryHTML(){
  const cats=['All',...new Set(state.parts.map(p=>p.category))];
  const filtered=sortedInventoryParts(filteredInventoryParts());
  return `<div class="page-head"><div><h1>Inventory</h1><p class="muted">Add, search, edit, delete, import and restock garage parts.</p></div><div class="head-actions"><button class="btn light" onclick="importInventoryCSV()">${I('download','icon-sm')} Import CSV</button><button class="btn primary" onclick="openPartDialog()">${I('plus','icon-sm')} Add Part</button></div></div>
  <section class="panel"><div class="filters"><input id="searchInput" placeholder="Search by part, serial number, supplier, car..." value="${esc(state.filters.q)}" autocomplete="off"><select id="categoryFilter">${cats.map(c=>`<option ${c===state.filters.category?'selected':''}>${c}</option>`).join('')}</select><select id="stockFilter">${['All','Low','In Stock','Finished'].map(x=>`<option ${x===state.filters.stock?'selected':''}>${x}</option>`).join('')}</select><button class="btn light" onclick="exportInventory()">${I('download','icon-sm')} CSV</button></div><div id="inventoryResults">${inventoryTable(filtered, false)}</div></section>`;
}
function inventoryTable(parts, compact=false){
  if(!parts.length) return '<div class="empty">No parts found.</div>';
  return `<div class="table-wrap"><table><thead><tr><th class="sortable" onclick="setInventorySort('name')">Part Name${sortIcon('name')}</th><th class="sortable" onclick="setInventorySort('sku')">Serial Number${sortIcon('sku')}</th><th class="sortable" onclick="setInventorySort('stock')">Stock${sortIcon('stock')}</th><th class="sortable" onclick="setInventorySort('ordered')">Ordered?${sortIcon('ordered')}</th><th class="sortable" onclick="setInventorySort('threshold')">Low Alert${sortIcon('threshold')}</th><th class="sortable" onclick="setInventorySort('costValue')">Cost Value${sortIcon('costValue')}</th><th class="sortable" onclick="setInventorySort('lastUsed')">Last Used${sortIcon('lastUsed')}</th><th>History</th></tr></thead><tbody>${parts.map(p=>{
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
function jobRow(j){
  const jid = ensureJobCardId(j);
  return `<div class="job-row"><div><b>${esc(j.plate)}</b><small class="muted">${esc(j.car)}</small><small class="job-card-id">${esc(jid)}</small></div><div><b>${esc(j.description||'Job card')}</b><small class="muted">Done by: ${esc(j.doneBy || '—')} · Parts used: ${j.lines.map(l=>`${esc(l.name)} x ${l.qty}`).join(', ') || 'No parts'}</small><div class="status-inline">${statusPill(jobStatus(j))}${statusSelect(j.id, jobStatus(j))}</div></div><div class="job-row-actions"><button class="mini-btn" onclick="loadJobCardForEdit('${j.id}')">Edit</button><button class="mini-btn" onclick="viewJob('${j.id}')">History</button></div></div>`;
}

function dashboardJobRow(j){
  const jid = ensureJobCardId(j);
  const parts = j.lines && j.lines.length ? j.lines.map(l=>`${esc(l.name)} x ${l.qty}`).join(', ') : 'No parts';
  return `<div class="dash-job-row">
    <div class="dash-job-plate"><b>${esc(j.plate)}</b><small>${esc(j.car || 'No car model')}</small><small class="job-card-id">${esc(jid)}</small></div>
    <div class="dash-job-main"><b>${esc(j.description || 'Job card')}</b><small>Done by: ${esc(j.doneBy || '—')}</small><small>Parts: ${parts}</small></div>
    <div class="dash-job-status">${statusPill(jobStatus(j))}${statusSelect(j.id, jobStatus(j))}</div>
    <div class="dash-job-actions"><button class="mini-btn" onclick="loadJobCardForEdit('${j.id}')">Edit</button><button class="mini-btn" onclick="viewJob('${j.id}')">History</button></div>
  </div>`;
}


function fleetVehicleOptionsHTML(){
  return state.vehicles.length
    ? state.vehicles.map(v => `<option value="${esc(v.id)}">${esc(v.plate)} — ${esc(v.modelNumber)}${v.customer ? ` · ${esc(v.customer)}` : ''}</option>`).join('')
    : '';
}
function matchingFleetVehiclesForJob(){
  const code = $('jobPlateCode') ? $('jobPlateCode').value : '';
  const number = $('jobPlateNumber') ? $('jobPlateNumber').value : '';
  const query = combinePlate(code, number).toLowerCase();
  if(!query) return [];
  return state.vehicles.filter(v => {
    const haystack = [v.plate, v.modelNumber, v.customer].join(' ').toLowerCase();
    return haystack.includes(query) || String(v.plate || '').toLowerCase().replace(/\s+/g,'').includes(query.replace(/\s+/g,''));
  }).slice(0, 5);
}
function fillJobFromFleet(vehicleId){
  const v = state.vehicles.find(x => x.id === vehicleId);
  if(!v) return;
  const parts = splitPlate(v.plate);
  if($('jobPlateCode')) $('jobPlateCode').value = v.plateCode || parts.code || '';
  if($('jobPlateNumber')) $('jobPlateNumber').value = v.plateNumber || parts.license || '';
  if($('jobCar')) $('jobCar').value = v.modelNumber || '';
  if($('jobCustomer')) $('jobCustomer').value = v.customer || $('jobCustomer').value || 'Walk-in';
  if($('jobFleetSelect')) $('jobFleetSelect').value = vehicleId;
  updateFleetPlateSuggestions();
  toast(`Selected fleet vehicle ${v.plate}`);
}
function updateFleetPlateSuggestions(){
  const box = $('jobFleetMatches');
  if(!box) return;
  const matches = matchingFleetVehiclesForJob();
  if(!matches.length){
    box.innerHTML = '<span class="muted">No matching fleet vehicle yet. You can still type a new plate manually.</span>';
    return;
  }
  box.innerHTML = `<span class="muted">Fleet match found:</span> ${matches.map(v => `<button type="button" class="fleet-match-btn" onclick="fillJobFromFleet('${v.id}')">${esc(v.plate)} · ${esc(v.modelNumber)}</button>`).join('')}`;
}
function jobHTML(){
  const upcomingId = nextJobCardId();
  return `<div class="page-head"><div><h1>Raise Job Card</h1><p class="muted">Create a new job card or edit an existing one. Selected parts will automatically reduce inventory.</p></div></div>
  <div class="job-layout"><section class="panel"><form id="jobForm" class="grid"><input id="jobEditId" type="hidden" value=""><div class="job-card-tools"><div><span class="muted">Mode</span><div class="mode-buttons"><button id="newJobModeBtn" type="button" class="mini-btn">Create New</button><label class="edit-job-select">Edit Existing<select id="jobEditSelect"><option value="">Choose job card...</option>${jobCardOptionsHTML()}</select></label></div></div><div class="job-id-preview"><span>Job Card ID</span><b id="jobCardPreview">${esc(upcomingId)}</b></div></div><div class="grid two"><label>Customer name<input id="jobCustomer" placeholder="Walk-in customer"></label><label>Phone<input id="jobPhone" placeholder="+971..."></label><label>Car model<input id="jobCar" required placeholder="Toyota Corolla"></label><label>Choose from fleet <select id="jobFleetSelect"><option value="">Type manually / not in fleet</option>${fleetVehicleOptionsHTML()}</select></label><div class="plate-fields wide job-plate-row"><label>Plate code<input id="jobPlateCode" required placeholder="R" maxlength="8"></label><label>License number<input id="jobPlateNumber" required placeholder="14534"></label></div><div id="jobFleetMatches" class="fleet-match-box wide"><span class="muted">Type a plate or choose from fleet above.</span></div><label>Date<input id="jobDate" type="date" value="${today()}" required></label><label>Job status<select id="jobStatus">${JOB_STATUSES.map(x=>`<option>${x}</option>`).join('')}</select></label><div class="staff-row-clean wide"><label>Done by / Staff name<select id="jobDoneBySelect" required><option value="">Choose employee</option>${staffNames().map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select></label><button type="button" class="mini-btn add-staff-btn" onclick="addStaffFromPrompt()">${I('plus','icon-sm')} Add person</button></div></div><label>What job was done?<textarea id="jobDescription" required placeholder="Oil change, brake pad replacement, AC repair..."></textarea></label><div class="section-title"><h3>Parts Used</h3><button id="addLineBtn" class="mini-btn" type="button">${I('plus','icon-sm')} Add another part</button></div><div id="partLines" class="part-lines"></div><div class="section-title custom-title"><div><h3>Custom Charges</h3><p class="muted small-note">Use this for car wash, diagnosis, towing, polishing, or anything not in inventory.</p></div><button id="addCustomBtn" class="mini-btn" type="button">${I('plus','icon-sm')} Add custom charge</button></div><div id="customCharges" class="custom-lines"></div><div class="section-title labour-title"><div><h3>Labor</h3><p class="muted small-note">Add this after selecting parts and any extra charges.</p></div></div><div class="grid two labour-grid"><label>Labor hours<input id="jobLabourHours" type="number" min="0" step="0.25" value="0" placeholder="2.5"></label><label>Labor charge (AED)<input id="jobLabour" type="number" min="0" step="0.01" value="0" placeholder="50"></label></div><div id="jobSummary" class="summary-box"></div><button class="btn primary large-btn" type="submit">${I('clipboard')} Save Job Card & Update Inventory</button></form></section><aside class="panel"><h3>Simple Rule</h3><p class="muted">Example: if stock has 10 oil filters and you use 1 in this job card, the system automatically changes stock to 9.</p><div class="cost-card"><small>Inventory Cost Value</small><strong>${money(stats().costValue)}</strong></div><h3>Low Stock Now</h3>${state.parts.filter(p=>Number(p.qty)<=Number(p.threshold)).slice(0,6).map(p=>`<div class="pill orange">${esc(p.name)} · ${p.qty} left</div>`).join('') || '<p class="muted">No low stock items.</p>'}</aside></div>`;
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
    ${plateQuery && exactPlateJobs.length ? `<div class="table-wrap history-table"><table><thead><tr><th>Job ID</th><th>Date</th><th>Plate</th><th>Car</th><th>Job Done</th><th>Status</th><th>Done By</th><th>Parts Used</th><th>Custom</th><th>Labor</th><th>Total</th><th>History</th></tr></thead><tbody>${exactPlateJobs.map(j=>{ const customText=(j.customCharges||[]).map(c=>`${esc(c.name)} ${money(c.amount)}`).join('<br>') || '<span class="muted">—</span>'; const partsText=j.lines.map(l=>`${esc(l.name)} x ${l.qty} · ${money(Number(l.qty||0)*Number(l.price||0))}`).join('<br>') || '<span class="muted">No parts</span>'; return `<tr><td>${esc(ensureJobCardId(j))}</td><td>${esc(j.date)}</td><td><b>${esc(j.plate)}</b></td><td>${esc(j.car)}</td><td>${esc(j.description)}</td><td><div class="status-cell">${statusPill(jobStatus(j))}${statusSelect(j.id, jobStatus(j))}</div></td><td>${esc(j.doneBy || '—')}</td><td>${partsText}</td><td>${customText}</td><td>${money(j.labour)}<br><small class="muted">${Number(j.labourHours||0)} hrs</small></td><td><b>${money(j.total)}</b></td><td><button class="mini-btn" onclick="loadJobCardForEdit('${j.id}')">Edit</button> <button class="mini-btn" onclick="viewJob('${j.id}')">Open</button></td></tr>`; }).join('')}</tbody></table></div>` : ''}
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


function compactPartsList(job){
  return (job.lines && job.lines.length)
    ? job.lines.map(l => `${esc(l.name)} x ${l.qty}`).join(', ')
    : 'No parts used';
}
function usageRowsForJobs(jobs){
  const rows=[];
  jobs.forEach(j=>{
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines && j.lines.length){
      j.lines.forEach(l=>rows.push({
        jobId:j.id,
        jobCardId:ensureJobCardId(j),
        date:j.date,
        plate:j.plate,
        car:j.car,
        job:j.description,
        status:jobStatus(j),
        doneBy:j.doneBy,
        name:l.name,
        sku:l.sku,
        qty:Number(l.qty||0),
        price:Number(l.price||0),
        lineTotal:Number(l.qty||0)*Number(l.price||0),
        customTotal,
        labour:Number(j.labour||0),
        total:Number(j.total||0)
      }));
    } else {
      rows.push({
        jobId:j.id,
        jobCardId:ensureJobCardId(j),
        date:j.date,
        plate:j.plate,
        car:j.car,
        job:j.description,
        status:jobStatus(j),
        doneBy:j.doneBy,
        name:'No inventory part',
        sku:'',
        qty:0,
        price:0,
        lineTotal:0,
        customTotal,
        labour:Number(j.labour||0),
        total:Number(j.total||0)
      });
    }
  });
  return rows;
}
function activityHTML(){
  const sections = ['All','Job Card','Inventory','Fleet','Staff','Auth'];
  const q = String(state.activityQuery || '').trim().toLowerCase();
  const filtered = state.logs.filter(log => {
    const sectionOk = state.activitySection === 'All' || log.section === state.activitySection;
    const haystack = [log.action, log.section, log.reference, log.details, log.staff].join(' ').toLowerCase();
    return sectionOk && (!q || haystack.includes(q));
  });
  return `<div class="page-head"><div><h1>Activity Log</h1><p class="muted">Track who did what across job cards, inventory, fleet, and staff changes.</p></div><button class="btn light" onclick="exportActivity()">${I('download','icon-sm')} Export Activity CSV</button></div>
  <section class="panel"><div class="filters activity-filters"><input id="activitySearch" placeholder="Search by action, staff, reference..." value="${esc(state.activityQuery)}" autocomplete="off"><select id="activitySection">${sections.map(x=>`<option ${x===state.activitySection?'selected':''}>${x}</option>`).join('')}</select></div>
  ${filtered.length?`<div class="table-wrap clean-table"><table class="activity-table"><thead><tr><th>Date / Time</th><th>Staff</th><th>Action</th><th>Section</th><th>Reference</th><th>Details</th></tr></thead><tbody>${filtered.map(log=>`<tr><td><b>${esc(new Date(log.timestamp).toLocaleDateString())}</b><br><small class="muted">${esc(new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}))}</small></td><td>${esc(log.staff || '—')}</td><td>${esc(log.action)}</td><td>${esc(log.section)}</td><td>${esc(log.reference || '—')}</td><td>${esc(log.details || '—')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No activity logged yet.</div>'}</section>`;
}

function usedHTML(){
  const plateQuery = String(state.vehicleHistoryQuery || '').trim().toUpperCase();
  const q = String(state.jobOverviewSearch || '').trim().toLowerCase();
  const statusFilter = state.jobOverviewStatus || 'All';
  const staffFilter = state.jobOverviewStaff || 'All';
  const dateFilter = state.jobOverviewDate || '';
  let matchingJobs = (plateQuery
    ? state.jobs.filter(j => String(j.plate || '').toUpperCase().includes(plateQuery))
    : state.jobs).slice();
  matchingJobs = matchingJobs.filter(j=>{
    const text=[ensureJobCardId(j),j.plate,j.car,j.description,j.doneBy,compactPartsList(j)].join(' ').toLowerCase();
    return (!q || text.includes(q)) && (statusFilter==='All' || jobStatus(j)===statusFilter) && (staffFilter==='All' || String(j.doneBy||'—')===staffFilter) && (!dateFilter || j.date===dateFilter);
  });
  const usage = usageRowsForJobs(matchingJobs);
  const staffOptions = ['All', ...new Set((state.jobs||[]).map(j=>j.doneBy||'—').filter(Boolean))];
  return `<div class="page-head"><div><h1>Job Card Overview</h1><p class="muted">Search by number plate and review job cards and part usage in a cleaner layout.</p></div><div class="head-actions"><button class="btn light" onclick="exportUsage()">${I('download','icon-sm')} Export Parts Used</button><button class="btn primary" onclick="go('job')">Raise Job Card</button></div></div>
  ${plateHistoryPanelHTML()}
  <section class="panel spaced-panel"><div class="section-title"><h3>${plateQuery ? `Jobs Matching ${esc(plateQuery)}` : 'All Jobs'}</h3><small class="muted">${matchingJobs.length} job card${matchingJobs.length===1?'':'s'}</small></div>
  <div class="job-overview-filters"><input id="jobOverviewSearch" placeholder="Search job card, plate, staff, parts..." value="${esc(state.jobOverviewSearch||'')}" autocomplete="off"><select id="jobOverviewStatus"><option>All</option>${JOB_STATUSES.map(x=>`<option ${statusFilter===x?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="jobOverviewStaff">${staffOptions.map(x=>`<option ${staffFilter===x?'selected':''}>${esc(x)}</option>`).join('')}</select><input id="jobOverviewDate" type="date" value="${esc(dateFilter)}"><button class="mini-btn" onclick="state.jobOverviewSearch='';state.jobOverviewStatus='All';state.jobOverviewStaff='All';state.jobOverviewDate='';render();">Reset</button></div>
  ${matchingJobs.length?`<div class="table-wrap clean-table"><table class="jobs-clean-table"><thead><tr><th>Job Card</th><th>Vehicle</th><th>Job / Staff</th><th>Status</th><th>Parts</th><th>Actions</th></tr></thead><tbody>${matchingJobs.map(j=>`<tr><td><b>${esc(ensureJobCardId(j))}</b><br><small class="muted">${esc(j.date)}</small></td><td><b>${esc(j.plate || '—')}</b><br><small class="muted">${esc(j.car || 'No car')}</small></td><td><b>${esc(j.description || 'Job card')}</b><br><small class="muted">Done by: ${esc(j.doneBy || '—')}</small></td><td><div class="status-stack">${statusPill(jobStatus(j))}${statusSelect(j.id, jobStatus(j))}</div></td><td><small class="muted table-wrap-text">${compactPartsList(j)}</small></td><td><div class="action-wrap"><button class="mini-btn" onclick="viewPlateHistory('${esc(j.plate)}')">Plate History</button><button class="mini-btn" onclick="loadJobCardForEdit('${j.id}')">Edit</button><button class="mini-btn" onclick="viewJob('${j.id}')">Open</button><button class="mini-btn danger" onclick="deleteJob('${j.id}')">Delete / Return Stock</button></div></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No jobs found.</div>'}</section>
  <section class="panel spaced-panel"><div class="section-title"><h3>${plateQuery ? `Part Usage for ${esc(plateQuery)}` : 'Part Usage Log'}</h3><small class="muted">${usage.length} line item${usage.length===1?'':'s'}</small></div>${usage.length?`<div class="table-wrap clean-table"><table class="usage-clean-table"><thead><tr><th>Job Card</th><th>Vehicle / Job</th><th>Part</th><th>Qty</th><th>Item Price</th><th>Charges</th><th>Status</th><th>Done By</th></tr></thead><tbody>${usage.map(u=>`<tr><td><b>${esc(u.jobCardId)}</b><br><small class="muted">${esc(u.date)}</small></td><td><b>${esc(u.plate)}</b><br><small class="muted">${esc(u.car)} · ${esc(u.job)}</small></td><td><b>${esc(u.name)}</b>${u.sku?`<br><small class="muted">${esc(u.sku)}</small>`:''}</td><td>${u.qty}</td><td>${money(u.price)}</td><td><div class="charge-stack"><span>Custom: ${money(u.customTotal)}</span><span>Labor: ${money(u.labour)}</span><b>Total: ${money(u.total)}</b></div></td><td><div class="status-stack">${statusPill(u.status)}${u.jobId ? statusSelect(u.jobId, u.status) : ''}</div></td><td>${esc(u.doneBy || '—')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No parts used yet.</div>'}</section>`;
}


function expiryStatusBadge(days){
  if(days < 0) return `<span class="badge danger">Expired ${Math.abs(days)}d ago</span>`;
  if(days === 0) return `<span class="badge danger">Due today</span>`;
  if(days <= 7) return `<span class="badge warn">${days}d left</span>`;
  return `<span class="badge soft">${days}d left</span>`;
}
function expiryHTML(){
  const items = actionNeededItems();
  const q = String(state.expirySearch || '').toLowerCase().trim();
  const module = state.expiryModule || 'All';
  const filtered = items.filter(x=>{
    const text=[x.module,x.type,x.owner,x.date,x.detail].join(' ').toLowerCase();
    return (!q || text.includes(q)) && (module==='All' || x.module===module);
  });
  const counts = items.reduce((a,x)=>{ a[x.module]=(a[x.module]||0)+1; return a; },{});
  const expired = items.filter(x=>x.days<0).length;
  const due7 = items.filter(x=>x.days>=0 && x.days<=7).length;
  const due30 = items.filter(x=>x.days>7 && x.days<=30).length;
  return `<div class="page-head"><div><h1>Expiry & Action Needed</h1><p class="muted">All upcoming expiries and action-needed items across employees, fleet, clients, tickets, and permits.</p></div><div class="head-actions"><button class="btn light" onclick="exportExpiryCSV()">${I('download','icon-sm')} Export CSV</button></div></div>
  <div class="kpis report-kpis expiry-kpis"><section class="card compact-kpi"><b class="${items.length?'orange':''}">${items.length}</b><span>Total action needed</span></section><section class="card compact-kpi"><b class="${expired?'orange':''}">${expired}</b><span>Expired / overdue</span></section><section class="card compact-kpi"><b>${due7}</b><span>Due within 7 days</span></section><section class="card compact-kpi"><b>${due30}</b><span>Due within 30 days</span></section></div>
  <section class="panel"><div class="expiry-toolbar"><input id="expirySearch" class="search-input" placeholder="Search owner, plate, employee, client, expiry type..." value="${esc(state.expirySearch||'')}"><select id="expiryModule"><option ${module==='All'?'selected':''}>All</option><option ${module==='Employees'?'selected':''}>Employees</option><option ${module==='Fleet'?'selected':''}>Fleet</option><option ${module==='Clients'?'selected':''}>Clients</option><option ${module==='Ticketing'?'selected':''}>Ticketing</option></select></div>
  <div class="expiry-module-chips"><span>Employees: <b>${counts.Employees||0}</b></span><span>Fleet: <b>${counts.Fleet||0}</b></span><span>Clients: <b>${counts.Clients||0}</b></span><span>Ticketing: <b>${counts.Ticketing||0}</b></span></div>
  <div class="table-wrap"><table class="expiry-table"><thead><tr><th>Section</th><th>Action needed</th><th>Owner / Vehicle / Employee</th><th>Expiry / due date</th><th>Status</th><th>Details</th><th>Open</th></tr></thead><tbody>${filtered.map(x=>`<tr><td><b>${esc(x.module)}</b></td><td>${esc(x.type)}</td><td>${esc(x.owner)}</td><td>${esc(x.date || '—')}</td><td>${expiryStatusBadge(Number(x.days||0))}</td><td>${esc(x.detail||'—')}</td><td><button class="mini-btn" onclick="go('${esc(x.goTo||'dashboard')}')">Open</button></td></tr>`).join('') || '<tr><td colspan="7"><div class="empty">No expiry or action-needed items found.</div></td></tr>'}</tbody></table></div></section>`;
}
function exportExpiryCSV(){
  const rows=[['Section','Action Needed','Owner / Vehicle / Employee','Expiry / Due Date','Days','Details']];
  actionNeededItems().forEach(x=>rows.push([x.module,x.type,x.owner,x.date,x.days,x.detail]));
  downloadCSV('sarab-expiry-action-needed.csv', rows);
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
      j.lines.forEach(l=>partRows.push({date:j.date, plate:j.plate, car:j.car, job:j.description, status:jobStatus(j), doneBy:j.doneBy, jobId:j.id, name:l.name, sku:l.sku, qty:l.qty, itemPrice:Number(l.price||0), customText, customTotal, labour:Number(j.labour||0), total:Number(j.total||0)}));
    } else {
      partRows.push({date:j.date, plate:j.plate, car:j.car, job:j.description, status:jobStatus(j), doneBy:j.doneBy, jobId:j.id, name:'No inventory part', sku:'', qty:0, itemPrice:0, customText, customTotal, labour:Number(j.labour||0), total:Number(j.total||0)});
    }
  });
  const vehicleCounts={}; jobs.forEach(j=>{ const key=(j.car||'Unknown').trim() || 'Unknown'; vehicleCounts[key]=(vehicleCounts[key]||0)+1; });
  const topVehicle=Object.entries(vehicleCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'No jobs yet';
  return `<div class="page-head"><div><h1>Monthly Report</h1><p class="muted">Final monthly report for parts used, job sales, and labor hours.</p></div><div class="report-controls"><input id="reportMonth" type="month" value="${esc(month)}"><button class="btn light" onclick="exportMonthlyReport()">${I('download','icon-sm')} Export Monthly CSV</button></div></div>
  <div class="report-hero"><div><small>Revenue Summary</small><h2>${money(revenue)}</h2><p>Job revenue for ${esc(month)} including parts and labor.</p></div><div class="report-stat"><span>Total Parts Issued</span><b>${partsIssued}</b></div><div class="report-stat"><span>Labor Hours</span><b>${labourHours}</b></div><div class="report-stat"><span>Top Vehicle</span><b>${esc(topVehicle)}</b></div></div>
  <div style="margin-top:20px">${plateHistoryPanelHTML('Search any number plate while reviewing reports to see the full work history for that vehicle.')}</div>
  <div class="kpis report-kpis">${kpi('Inventory Cost Value',money(s.costValue),'Current buying cost value','chart')}${kpi('Labor Revenue',money(labourRevenue),'Labor charges this month','clipboard')}${kpi('Custom Charges',money(customRevenue),'Non-inventory charges','file')}${kpi('Jobs Completed',jobs.length,'Jobs this month','check')}</div>
  <section class="panel" style="margin-top:20px"><div class="section-title"><h3>Monthly Parts Used</h3></div>${partRows.length?`<div class="table-wrap"><table><thead><tr><th>Job ID</th><th>Date</th><th>Plate</th><th>Car</th><th>Job</th><th>Status</th><th>Done By</th><th>Part</th><th>Qty</th><th>Item Price</th><th>Custom Charge</th><th>Labor Charge</th><th>Total</th></tr></thead><tbody>${partRows.map(r=>`<tr><td>${esc(r.jobId ? ensureJobCardId(state.jobs.find(j=>j.id===r.jobId)) : "")}</td><td>${esc(r.date)}</td><td>${esc(r.plate)}</td><td>${esc(r.car)}</td><td>${esc(r.job)}</td><td>${statusPill(r.status)}${r.jobId ? statusSelect(r.jobId, r.status) : ''}</td><td>${esc(r.doneBy || '—')}</td><td>${esc(r.name)}<br><small class="muted">${esc(r.sku)}</small></td><td>${r.qty}</td><td>${money(r.itemPrice)}</td><td>${r.customText?esc(r.customText):money(0)}</td><td>${money(r.labour)}</td><td>${money(r.total)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No jobs in this month yet.</div>'}</section>
  <section class="panel" style="margin-top:20px"><div class="section-title"><h3>Vehicle Logs</h3><button class="mini-btn" onclick="go('used')">View Job History</button></div>${jobs.length?`<div class="jobs-list">${jobs.map(jobRow).join('')}</div>`:'<div class="empty">No vehicle logs for this month.</div>'}</section>`;
}

function filteredFleetVehicles(){
  const q = String(state.fleetFilter || '').trim().toLowerCase();
  return state.vehicles.filter(v => {
    const haystack = [v.modelNumber, v.year, v.plate, v.customer, v.status, v.ownership, v.registeredCompany, v.fuelChip, v.vendorName, v.outsourceStartDate, v.outsourceEndDate, v.assignedDriver, v.notes].join(' ').toLowerCase();
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
function fleetSubnavHeader(active){
  const tabs = [
    ['fleet','Fleet List'],
    ['fleetSummary','Client wise summary'],
    ['replacements','Replacements'],
    ['vehicleHistory','Vehicle History'],
    ['salik','SALIK']
  ];
  return `<div class="fleet-page-tabs">${tabs.map(([view,label])=>`<button class="tab ${active===view?'active':''}" onclick="go('${view}')">${label}</button>`).join('')}</div>`;
}
function fleetClientName(v){ return normName(v.customer || 'Unassigned'); }
function fleetVehicleType(v){ return String(v.modelNumber || v.vtype || 'Vehicle').trim() || 'Vehicle'; }
function fleetIsOutsourced(v){ return String(v.ownership || '').toLowerCase().includes('outsource') || String(v.plate || '').toUpperCase().includes('(OS)'); }
function fleetClientSummaryRows(){
  const map = {};
  state.vehicles.forEach(v=>{
    const c = fleetClientName(v);
    if(!map[c]) map[c]={name:c,total:0,inUse:0,own:0,outsource:0,offHire:0,revenue:0,types:{}, locations:new Set()};
    const r=map[c];
    r.total++;
    if(v.status==='In Use') r.inUse++;
    if(v.status==='Off-hire') r.offHire++;
    if(fleetIsOutsourced(v)) r.outsource++; else r.own++;
    if(v.status==='In Use') r.revenue += Number(v.clientRate || 0);
    const type=fleetVehicleType(v);
    r.types[type]=(r.types[type]||0)+1;
    if(v.location) r.locations.add(v.location);
  });
  return Object.values(map).map(r=>({ ...r, typesArr:Object.entries(r.types).sort((a,b)=>b[1]-a[1]), locationsArr:[...r.locations] }));
}
function filteredFleetSummaryRows(){
  const client = $('summaryClientFilter')?.value ?? state.summaryClient ?? '';
  const search = $('summarySearch')?.value ?? state.summarySearch ?? '';
  const own = $('summaryOwnershipFilter')?.value || state.summaryOwnership || '';
  const sort = $('summarySortFilter')?.value || state.summarySort || 'total-desc';
  state.summaryClient = client;
  state.summarySearch = search;
  state.summaryOwnership = own;
  state.summarySort = sort;
  const q=String(search || '').trim().toLowerCase();
  let vehicles = state.vehicles.slice();
  if(client) vehicles = vehicles.filter(v=>clientKey(fleetClientName(v))===clientKey(client));
  if(q) vehicles = vehicles.filter(v=>[fleetClientName(v), v.plate, v.modelNumber, v.year, v.status, v.ownership, v.registeredCompany, v.assignedDriver].join(' ').toLowerCase().includes(q));
  if(own==='own') vehicles = vehicles.filter(v=>!fleetIsOutsourced(v));
  if(own==='outsource') vehicles = vehicles.filter(v=>fleetIsOutsourced(v));
  const oldVehicles = state.vehicles;
  state.vehicles = vehicles;
  let rows = fleetClientSummaryRows();
  state.vehicles = oldVehicles;
  rows.sort((a,b)=>{
    if(sort==='total-asc') return a.total-b.total;
    if(sort==='inuse-desc') return b.inUse-a.inUse;
    if(sort==='outsource-desc') return b.outsource-a.outsource;
    if(sort==='name-asc') return a.name.localeCompare(b.name);
    return b.total-a.total;
  });
  return rows;
}
function selectedSummaryVehicles(){
  const client = state.summaryClient || '';
  const q=String(state.summarySearch || '').trim().toLowerCase();
  let vehicles=state.vehicles.slice();
  if(client) vehicles=vehicles.filter(v=>clientKey(fleetClientName(v))===clientKey(client));
  if(q) vehicles=vehicles.filter(v=>[fleetClientName(v), v.plate, v.modelNumber, v.year, v.status, v.ownership, v.registeredCompany, v.assignedDriver].join(' ').toLowerCase().includes(q));
  if(state.summaryOwnership==='own') vehicles=vehicles.filter(v=>!fleetIsOutsourced(v));
  if(state.summaryOwnership==='outsource') vehicles=vehicles.filter(v=>fleetIsOutsourced(v));
  return vehicles.sort((a,b)=>fleetClientName(a).localeCompare(fleetClientName(b)) || String(a.plate||'').localeCompare(String(b.plate||'')));
}
function fleetSummaryVehicleDetails(){
  const vehicles=selectedSummaryVehicles();
  if(!state.summaryClient && !state.summarySearch) return '<div class="empty">Select or search a client to see the detailed vehicle list.</div>';
  if(!vehicles.length) return '<div class="empty">No vehicles found for this client/search.</div>';
  return `<div class="client-vehicle-detail-list">${vehicles.map(v=>`<article class="fleet-mini-card"><div><span class="fleet-plate">${esc(v.plate || '—')}</span><h4>${esc(modelWithoutYear(v.modelNumber) || v.modelNumber || 'Vehicle')}</h4><p class="muted">${esc(fleetClientName(v))}${v.year?` · ${esc(v.year)}`:''}</p></div><div class="fleet-mini-meta"><span>${esc(v.status || '—')}</span><span>${fleetIsOutsourced(v)?'Outsource':'SMG Vehicle'}</span><b>${money(v.status==='In Use'?Number(v.clientRate||0):0)}</b></div></article>`).join('')}</div>`;
}
function fleetSummaryHTML(){
  const rows = filteredFleetSummaryRows();
  const clients = [...new Set(state.vehicles.map(fleetClientName))].sort((a,b)=>a.localeCompare(b));
  const totalVehicles = rows.reduce((a,r)=>a+r.total,0);
  const totalOwn = rows.reduce((a,r)=>a+r.own,0);
  const totalOut = rows.reduce((a,r)=>a+r.outsource,0);
  const totalRevenue = rows.reduce((a,r)=>a+r.revenue,0);
  const selectedName = state.summaryClient || (rows.length===1 ? rows[0].name : '');
  const selectedRow = rows.find(r=>clientKey(r.name)===clientKey(selectedName));
  return `<div class="page-head"><div><h1>Fleet</h1><p class="muted">Client-wise fleet summary.</p></div><div class="head-actions"><button class="btn light" onclick="exportFleetSummaryCSV()">${I('download','icon-sm')} Export CSV</button></div></div>
    ${fleetSubnavHeader('fleetSummary')}
    <div class="fleet-hero summary-hero"><div><small>Client-wise fleet view</small><h2>${totalVehicles}</h2><p>Total vehicles in the filtered view.</p></div><div><span>Clients</span><b>${rows.length}</b></div><div><span>Own Fleet</span><b>${totalOwn}</b></div><div><span>Outsourced</span><b>${totalOut}</b></div><div><span>Monthly Revenue</span><b>${money(totalRevenue)}</b></div></div>
    <section class="panel fleet-summary-panel fleet-list-like-summary"><div class="section-title"><div><h3>Client wise summary</h3><p class="muted small-note">Search by client, plate, vehicle, status, company, or ownership. Click a client to see their vehicle breakdown.</p></div></div>
      <div class="filters fleet-summary-filters redesigned-summary-filters"><input id="summarySearch" placeholder="Search client, plate, vehicle..." value="${esc(state.summarySearch || '')}" autocomplete="off"><select id="summaryClientFilter"><option value="">All clients</option>${clients.map(c=>`<option value="${esc(c)}" ${state.summaryClient===c?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="summaryOwnershipFilter"><option value="">Own + Outsourced</option><option value="own" ${state.summaryOwnership==='own'?'selected':''}>Own only</option><option value="outsource" ${state.summaryOwnership==='outsource'?'selected':''}>Outsourced only</option></select><select id="summarySortFilter"><option value="total-desc" ${state.summarySort==='total-desc'?'selected':''}>Sort: most vehicles</option><option value="total-asc" ${state.summarySort==='total-asc'?'selected':''}>Sort: fewest vehicles</option><option value="inuse-desc" ${state.summarySort==='inuse-desc'?'selected':''}>Sort: most in use</option><option value="outsource-desc" ${state.summarySort==='outsource-desc'?'selected':''}>Sort: most outsourced</option><option value="name-asc" ${state.summarySort==='name-asc'?'selected':''}>Sort: name A-Z</option></select><button class="btn light" onclick="resetFleetSummaryFilters()">Reset</button></div>
      ${selectedName ? `<div class="summary-breakdown-card"><div><small>Selected Client</small><h2>${esc(selectedName)}</h2><p>${selectedRow ? `${selectedRow.total} vehicles · ${selectedRow.inUse} in use · ${selectedRow.outsource} outsourced` : 'Vehicle breakdown'}</p></div>${fleetSummaryVehicleDetails()}</div>` : ''}
      ${fleetSummaryCards(rows)}
    </section>`;
}
function fleetSummaryCards(rows){
  return `<div class="fleet-summary-list clean-like-fleet">${rows.map(r=>{ const typeTotal=(r.typesArr||[]).reduce((a,x)=>a+Number(x[1]||0),0); return `<article class="fleet-summary-row ${state.summaryClient===r.name?'selected':''}" onclick="state.summaryClient='${esc(r.name)}'; render()"><div><h3>${esc(r.name)}</h3><p class="muted">${r.total} vehicles · ${r.inUse} in use · ${r.outsource} outsourced</p><div class="summary-type-line">${(r.typesArr||[]).map(([t,n])=>`<span>${esc(t)} × ${n}</span>`).join('') || '<span>No type data</span>'}${typeTotal && typeTotal < r.total ? `<span>Other / blank × ${r.total-typeTotal}</span>` : ''}</div></div><div class="summary-row-metrics"><div><small>Total</small><b>${r.total}</b></div><div><small>Own</small><b>${r.own}</b></div><div><small>Outsource</small><b>${r.outsource}</b></div><div><small>Revenue</small><b>${money(r.revenue)}</b></div></div></article>`; }).join('') || '<div class="empty">No fleet summary found.</div>'}</div>`;
}
function fleetSummaryTable(rows){
  return `<div class="table-wrap"><table><thead><tr><th>Client</th><th>Total</th><th>In Use</th><th>Own</th><th>Outsourced</th><th>Off-hire</th><th>Monthly Revenue</th><th>Top Vehicle Types</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.name)}</b></td><td>${r.total}</td><td>${r.inUse}</td><td>${r.own}</td><td>${r.outsource}</td><td>${r.offHire}</td><td>${money(r.revenue)}</td><td>${r.typesArr.slice(0,4).map(([t,n])=>`${esc(t)} (${n})`).join(', ')}</td></tr>`).join('') || '<tr><td colspan="8">No records found.</td></tr>'}</tbody></table></div>`;
}
function resetFleetSummaryFilters(){ state.summaryClient=''; state.summarySearch=''; state.summaryOwnership=''; state.summarySort='total-desc'; render(); }
function exportFleetSummaryCSV(){
  const rows=[['Client','Total Vehicles','In Use','Own Fleet','Outsourced','Off-hire','Monthly Revenue AED','Vehicle Types']];
  fleetClientSummaryRows().forEach(r=>rows.push([r.name,r.total,r.inUse,r.own,r.outsource,r.offHire,r.revenue,r.typesArr.map(([t,n])=>`${t} (${n})`).join('; ')]));
  downloadCSV('sarab-fleet-client-wise-summary.csv', rows);
}
function daysInMonth(month){ const [y,m]=String(month || today().slice(0,7)).split('-').map(Number); return new Date(y, m, 0).getDate(); }
function replacementClients(){ return [...new Set(state.vehicles.map(fleetClientName))].sort((a,b)=>a.localeCompare(b)); }
function replacementVehicles(){
  let vehicles = state.vehicles.slice();
  if(state.replacementClient) vehicles = vehicles.filter(v=>clientKey(fleetClientName(v))===clientKey(state.replacementClient));
  const q=String(state.replacementVehicleSearch || '').trim().toLowerCase();
  if(q) vehicles=vehicles.filter(v=>[v.plate, v.modelNumber, v.year, fleetClientName(v), v.status, v.ownership].join(' ').toLowerCase().includes(q));
  return vehicles.sort((a,b)=>fleetClientName(a).localeCompare(fleetClientName(b)) || String(a.plate||'').localeCompare(String(b.plate||'')));
}
function replacementFleetDatalist(){
  return `<datalist id="replacementFleetOptions">${state.vehicles.map(v=>`<option value="${esc(v.plate || '')}">${esc(v.plate || '')} — ${esc(modelWithoutYear(v.modelNumber)||'Vehicle')} · ${esc(fleetClientName(v))}</option>`).join('')}</datalist>`;
}
function replacementCellId(month, vehicleId, day){ return `rep_${month}_${vehicleId}_${day}`.replace(/[^a-zA-Z0-9_-]/g,'_'); }
function replacementValue(month, vehicleId, day){ return (state.replacements || []).find(r=>!r.type && r.month===month && r.vehicleId===vehicleId && Number(r.day)===Number(day))?.value || ''; }
function currentReplacementCellSnapshot(){
  const snapshot={};
  document.querySelectorAll('.rep-cell').forEach(cell=>{
    snapshot[`${cell.dataset.vehicle}_${cell.dataset.day}`]=cell.value || '';
  });
  return snapshot;
}
function restoreReplacementSnapshot(snapshot){
  if(!snapshot) return;
  document.querySelectorAll('.rep-cell').forEach(cell=>{
    const k=`${cell.dataset.vehicle}_${cell.dataset.day}`;
    const val=snapshot[k] || '';
    cell.value = val;
    cell.classList.toggle('is-tick', val==='✓');
    cell.classList.toggle('has-value', Boolean(val));
  });
  state.replacementDirty=true;
  toast('Undo applied. Click Save to keep it.');
}
function stageReplacementCellInput(cell){
  if(!cell) return;
  if(!guardReplacementEdit()){ cell.blur(); return; }
  const clean=String(cell.value || '').trim();
  if(clean && clean !== '✓'){
    const match=state.vehicles.find(v=>String(v.plate||'').toLowerCase()===clean.toLowerCase());
    if(match) cell.value=match.plate || clean;
  }
  cell.classList.toggle('is-tick', cell.value==='✓');
  cell.classList.toggle('has-value', Boolean(String(cell.value||'').trim()));
  state.replacementDirty=true;
}
function toggleReplacementTick(input){
  if(!input) return;
  const month=state.replacementMonth || today().slice(0,7);
  if(!canEditReplacementMonth(month)){ toast('This month is locked. Use Override PIN to edit.'); return; }
  if(!state.replacementUndoStack) state.replacementUndoStack=[];
  state.replacementUndoStack.push(currentReplacementCellSnapshot());
  input.value = input.value === '✓' ? '' : '✓';
  stageReplacementCellInput(input);
}
async function saveReplacementCell(vehicleId, day, value){
  const month = state.replacementMonth || today().slice(0,7);
  const v = state.vehicles.find(x=>x.id===vehicleId);
  const clean = String(value || '').trim();
  const rid = replacementCellId(month, vehicleId, day);
  const idx=(state.replacements || []).findIndex(r=>r.id===rid);
  if(clean){
    const row={ id:rid, month, day:Number(day), vehicleId, plate:v?.plate||'', client:fleetClientName(v||{}), vehicle:v?.modelNumber||'', value:clean, updatedAt:new Date().toISOString(), updatedBy:state.user?.name||state.user?.email||'—' };
    if(idx>=0) state.replacements[idx]=row; else state.replacements.push(row);
  } else if(idx>=0){
    state.replacements.splice(idx,1);
    await deleteRemoteRow('replacements', rid);
  }
}
async function saveReplacementTable(){
  const month=state.replacementMonth || today().slice(0,7);
  if(!canEditReplacementMonth(month)){ toast('This month is locked. Use Override PIN to edit.'); return; }
  const cells=[...document.querySelectorAll('.rep-cell')];
  for(const cell of cells){ await saveReplacementCell(cell.dataset.vehicle, cell.dataset.day, cell.value); }
  await saveReplacements();
  state.replacementDirty=false;
  toast('Replacements saved');
}
function tickReplacementCell(btn){
  const input = btn?.closest('td')?.querySelector('.rep-cell') || btn;
  toggleReplacementTick(input);
}
function pickReplacementFromFleet(input){
  const q=String(input.value || '').trim().toLowerCase();
  if(q && q !== '✓'){
    const match=state.vehicles.find(v=>String(v.plate||'').toLowerCase()===q || String(v.plate||'').toLowerCase().includes(q));
    if(match && input.value.length>1) input.value=match.plate || input.value;
  }
  stageReplacementCellInput(input);
}
function replacementCellKeydown(event, input){
  if(!guardReplacementEdit()){ event.preventDefault(); return; }
  const key = event.key;
  if(key === 'Enter'){
    event.preventDefault();
    toggleReplacementTick(input);
    return;
  }
  if((input.value === '✓') && key && key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey){
    input.value = '';
    input.classList.remove('is-tick','has-value');
  }
}
function clearVisibleReplacementCells(){
  const month=state.replacementMonth || today().slice(0,7);
  if(!canEditReplacementMonth(month)){ toast('This month is locked. Use Override PIN to edit.'); return; }
  const cells=[...document.querySelectorAll('.rep-cell')];
  if(!cells.length){ toast('No visible replacement cells to clear'); return; }
  if(!confirm('Clear all visible replacement cells for the selected filters/month? Click Save after clearing.')) return;
  if(!state.replacementUndoStack) state.replacementUndoStack=[];
  state.replacementUndoStack.push(currentReplacementCellSnapshot());
  cells.forEach(cell=>{ cell.value=''; stageReplacementCellInput(cell); });
  toast('Visible replacement cells cleared. Click Save to keep it.');
}


function replacementLockId(month){ return `rep_lock_${month}`.replace(/[^a-zA-Z0-9_-]/g,'_'); }
function replacementLockRow(month){ return (state.replacements || []).find(r=>r.id===replacementLockId(month) || (r.kind==='lock' && r.month===month)); }
function isReplacementMonthLocked(month){ return Boolean(replacementLockRow(month)); }
function isReplacementMonthUnlocked(month){ return (state.replacementUnlockedMonths || []).includes(month); }
function canEditReplacementMonth(month){ return !isReplacementMonthLocked(month) || isReplacementMonthUnlocked(month); }
function isPastReplacementMonth(month){
  const now = today().slice(0,7);
  return String(month || '') < now;
}
async function lockReplacementMonth(){
  const month=state.replacementMonth || today().slice(0,7);
  if(!isPastReplacementMonth(month) && !confirm('This month has not ended yet. Lock it anyway?')) return;
  if(isReplacementMonthLocked(month)){ toast('Month is already locked'); return; }
  state.replacements.push({ id: replacementLockId(month), kind:'lock', month, value:'LOCKED', lockedAt:new Date().toISOString(), lockedBy:state.user?.name||state.user?.email||'—' });
  await saveReplacements();
  toast(`Month ${month} locked`);
  render();
}
function unlockReplacementMonth(){
  const month=state.replacementMonth || today().slice(0,7);
  const pin=prompt('Enter override PIN to edit this locked month');
  if(pin !== '3100') { toast('Wrong override PIN'); return; }
  if(!state.replacementUnlockedMonths) state.replacementUnlockedMonths=[];
  if(!state.replacementUnlockedMonths.includes(month)) state.replacementUnlockedMonths.push(month);
  toast(`Override enabled for ${month}. You can edit until you leave/reload this page.`);
  render();
}

const REPLACEMENT_LOCK_PIN = '3100';
function replacementLockId(month){ return `rep_lock_${String(month || '').replace(/[^0-9-]/g,'_')}`; }
function replacementLockRow(month){ return (state.replacements || []).find(r => r.id === replacementLockId(month) || ((r.kind==='lock' || r.type==='lock') && r.month===month)); }
function isReplacementMonthLocked(month){ const r=replacementLockRow(month); return Boolean(r && (r.locked || r.kind==='lock' || r.type==='lock')); }
function canEditReplacementMonth(month){ return !isReplacementMonthLocked(month) || sessionStorage.getItem(`replacement_unlock_${month}`) === 'yes'; }
function replacementLockNotice(month){
  if(!isReplacementMonthLocked(month)) return '';
  const unlocked = canEditReplacementMonth(month);
  return `<div class="lock-notice ${unlocked?'unlocked':''}"><b>${unlocked?'Override active':'Month locked'}</b><span>${unlocked?'You can edit this month until the page is refreshed.':'This month cannot be edited unless you enter the override PIN.'}</span>${!unlocked?`<button class="mini-btn" onclick="unlockReplacementMonth()">Unlock with PIN</button>`:''}</div>`;
}
async function lockReplacementMonth(){
  const month = state.replacementMonth || today().slice(0,7);
  if(!confirm(`Lock ${month}? Once locked, it cannot be edited without the override PIN.`)) return;
  const row = { id: replacementLockId(month), type:'lock', month, locked:true, lockedAt:new Date().toISOString(), lockedBy:state.user?.name||state.user?.email||'—' };
  const idx = (state.replacements || []).findIndex(r=>r.id===row.id);
  if(idx>=0) state.replacements[idx]=row; else state.replacements.push(row);
  await saveReplacements();
  sessionStorage.removeItem(`replacement_unlock_${month}`);
  toast(`Month ${month} locked`);
  render();
}
function unlockReplacementMonth(){
  const month = state.replacementMonth || today().slice(0,7);
  const pin = prompt('Enter override PIN to edit this locked month');
  if(pin === REPLACEMENT_LOCK_PIN){
    sessionStorage.setItem(`replacement_unlock_${month}`, 'yes');
    toast('Override accepted. You can edit this month now.');
    render();
  } else if(pin !== null){
    toast('Wrong PIN');
  }
}
function guardReplacementEdit(){
  const month = state.replacementMonth || today().slice(0,7);
  if(canEditReplacementMonth(month)) return true;
  toast('This month is locked. Use override PIN to edit.');
  return false;
}

function replacementsHTML(){
  const clients=replacementClients();
  if(!state.replacementMonth) state.replacementMonth=today().slice(0,7);
  const vehicles=replacementVehicles();
  const days=daysInMonth(state.replacementMonth);
  const locked=isReplacementMonthLocked(state.replacementMonth);
  const editable=canEditReplacementMonth(state.replacementMonth);
  const lock= replacementLockRow(state.replacementMonth);
  return `<div class="page-head"><div><h1>Fleet</h1><p class="muted">Replacement register by client and month.</p></div><div class="head-actions"><button class="btn light" onclick="exportReplacementsCSV()">${I('download','icon-sm')} Export CSV</button><button class="btn primary" onclick="saveReplacementTable()">Save Replacements</button></div></div>
    ${fleetSubnavHeader('replacements')}
    <section class="panel replacements-panel"><div class="section-title"><div><h3>Replacements</h3><p class="muted small-note">Choose all clients or one client. Use ✓ for normal use, or type/select a replacement plate from the existing fleet list.</p></div></div>
      <div class="replacement-lockbar ${locked && !editable ? 'locked' : ''}"><div><b>${locked && !editable ? 'Month locked' : locked && editable ? 'Override active' : 'Month open'}</b><span>${locked && !editable ? `Locked by ${esc(lock?.lockedBy || '—')} on ${esc((lock?.lockedAt || '').slice(0,10))}` : locked && editable ? 'This month is unlocked for editing with the override PIN.' : 'You can edit and save this replacement register.'}</span></div><div>${locked && !editable ? `<button class="btn light" onclick="unlockReplacementMonth()">Override PIN</button>` : locked && editable ? `<button class="btn light" onclick="lockReplacementMonth()">Re-lock Month</button>` : `<button class="btn light" onclick="lockReplacementMonth()">Lock Month</button>`}</div></div>
      <div class="filters replacement-filters upgraded"><label>Client<select id="replacementClient"><option value="">All clients</option>${clients.map(c=>`<option value="${esc(c)}" ${state.replacementClient===c?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label>Search vehicle<input id="replacementVehicleSearch" placeholder="Plate, model, client..." value="${esc(state.replacementVehicleSearch || '')}" autocomplete="off"></label><label>Month<input id="replacementMonth" type="month" value="${esc(state.replacementMonth)}"></label><button class="btn light" onclick="markVisibleReplacementDays()" ${!editable?'disabled':''}>Fill blanks with ✓</button><button class="btn light" onclick="clearVisibleReplacementCells()" ${!editable?'disabled':''}>Clear all</button><button class="btn light" onclick="undoReplacementFill()" ${!editable?'disabled':''}>Undo</button><button class="btn primary" onclick="saveReplacementTable()" ${!editable?'disabled':''}>Save</button></div>
      ${replacementFleetDatalist()}${vehicles.length ? replacementMatrix(vehicles, days, editable) : '<div class="empty">No vehicles found for this filter.</div>'}
    </section>`;
}
function replacementMatrix(vehicles, days, editable=true){
  const month=state.replacementMonth || today().slice(0,7);
  const dayHeads=Array.from({length:days},(_,i)=>`<th class="rep-day-head">${i+1}</th>`).join('');
  return `<div class="replacement-help-line"><span><b>Tip:</b> each row is one vehicle. Double-click a day cell to mark ✓, or just type a replacement plate. Press Enter to toggle ✓.</span><span>${vehicles.length} vehicle${vehicles.length===1?'':'s'} shown</span></div>
  <div class="replacement-scroll"><table class="replacement-table fixed-replacement-table"><thead><tr><th class="sticky-col rep-vehicle-head">Client / Vehicle</th><th class="sticky-col-2">Plate</th>${dayHeads}</tr></thead><tbody>
  ${vehicles.map(v=>`<tr><td class="sticky-col rep-vehicle"><b>${esc(fleetClientName(v))}</b><small>${esc(modelWithoutYear(v.modelNumber)||'Vehicle')} ${v.year?`· ${esc(v.year)}`:''}</small></td><td class="sticky-col-2"><span class="fleet-plate">${esc(v.plate || '—')}</span></td>${Array.from({length:days},(_,i)=>{ const d=i+1; const val=replacementValue(month,v.id,d); const isTick=val==='✓'; return `<td class="rep-cell-wrap ${!editable?'locked-cell':''}"><input class="rep-cell ${isTick?'is-tick':''} ${val?'has-value':''}" data-vehicle="${esc(v.id)}" data-day="${d}" value="${esc(val)}" placeholder="" title="Enter ✓ or type replacement plate" list="replacementFleetOptions" onkeydown="replacementCellKeydown(event,this)" ondblclick="toggleReplacementTick(this)" oninput="stageReplacementCellInput(this)" onchange="pickReplacementFromFleet(this)" ${!editable?'disabled':''}></td>`; }).join('')}</tr>`).join('')}
  </tbody></table></div>`;
}

function markVisibleReplacementDays(){
  const month=state.replacementMonth || today().slice(0,7);
  if(!canEditReplacementMonth(month)){ toast('This month is locked. Use Override PIN to edit.'); return; }
  const cells=[...document.querySelectorAll('.rep-cell')];
  if(!state.replacementUndoStack) state.replacementUndoStack=[];
  state.replacementUndoStack.push(currentReplacementCellSnapshot());
  cells.forEach(cell=>{ if(!String(cell.value||'').trim()){ cell.value='✓'; stageReplacementCellInput(cell); } });
  toast('Visible blanks filled with ✓. Click Save to keep it.');
}
function undoReplacementFill(){
  if(!guardReplacementEdit()) return;
  const snapshot=(state.replacementUndoStack || []).pop();
  if(!snapshot){ toast('Nothing to undo'); return; }
  restoreReplacementSnapshot(snapshot);
}
function exportReplacementsCSV(){
  const month=state.replacementMonth || today().slice(0,7);
  const vehicles=replacementVehicles();
  const days=daysInMonth(month);
  const headers=['Client','Vehicle','Year','Plate', ...Array.from({length:days},(_,i)=>`Day ${i+1}`)];
  const rows=[headers];
  vehicles.forEach(v=>rows.push([fleetClientName(v), modelWithoutYear(v.modelNumber)||'', v.year||'', v.plate||'', ...Array.from({length:days},(_,i)=>replacementValue(month,v.id,i+1))]));
  downloadCSV(`sarab-replacements-${month}-${state.replacementClient||'all'}.csv`, rows);
}


function vehicleHistoryRows(){
  const q=String(state.vehicleHistorySearch || '').trim().toLowerCase();
  let vehicles=state.vehicles.slice();
  if(q){
    vehicles=vehicles.filter(v=>{
      const historyText = vehicleAssignmentTimeline(v).map(r=>`${r.client} ${r.from} ${r.to} ${r.note||''}`).join(' ');
      return [v.plate,v.modelNumber,v.year,fleetClientName(v),v.customer,v.status,v.ownership,v.notes,historyText]
        .join(' ').toLowerCase().includes(q);
    });
  }
  return vehicles.sort((a,b)=>String(a.plate||'').localeCompare(String(b.plate||'')));
}
function vehicleClientChangeEvents(v){
  const plateKey=String(v.plate||'').trim().toLowerCase();
  return (state.logs || [])
    .filter(log=>{
      const ref=String(log.reference || log.ref || '').trim().toLowerCase();
      const details=String(log.details || '');
      return ref === plateKey && /changed vehicle client/i.test(String(log.action || '')) && details.includes('→');
    })
    .map(log=>{
      const [fromClient='', toClient=''] = String(log.details || '').split('→').map(x=>x.trim());
      return {
        date:(log.timestamp || log.createdAt || log.time || '').slice(0,10) || 'Not recorded',
        fromClient: fromClient || 'Unassigned',
        toClient: toClient || 'Unassigned',
        by:log.staff || log.user || '—'
      };
    })
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}
function displayDateRangeValue(value){
  const clean=String(value || '').slice(0,10);
  return clean || 'Not recorded';
}
function normalizeAssignmentHistory(v){
  const currentClient = fleetClientName(v) || 'Unassigned';
  const stored = Array.isArray(v.assignmentHistory) ? v.assignmentHistory : [];
  const normalized = stored
    .map(x=>({
      client: normName(x.client || x.customer || 'Unassigned') || 'Unassigned',
      from: displayDateRangeValue(x.from || x.fromDate || x.startDate || x.date),
      to: x.to || x.toDate || x.endDate || '',
      note: x.note || x.source || '',
      changedBy: x.changedBy || ''
    }))
    .filter(x=>x.client);
  if(normalized.length) return normalized;

  const created = displayDateRangeValue(v.assignmentStartDate || v.outsourceStartDate || v.createdAt || today());
  const events = vehicleClientChangeEvents(v).filter(e=>e.date && e.date !== 'Not recorded');
  if(!events.length) return [{ client:currentClient, from:created, to:'', note:'Current fleet record' }];

  const periods=[];
  events.forEach((ev, idx)=>{
    if(idx===0){
      periods.push({ client: ev.fromClient || 'Unassigned', from: created, to: ev.date, note:'Before recorded client change', changedBy: ev.by || '' });
    }
    const next=events[idx+1];
    periods.push({ client: ev.toClient || currentClient, from: ev.date, to: next ? next.date : '', note:'Fleet client changed', changedBy: ev.by || '' });
  });
  const last=periods[periods.length-1];
  if(last && clientKey(last.client) !== clientKey(currentClient)){
    periods.push({ client: currentClient, from: displayDateRangeValue(v.updatedAt || today()), to:'', note:'Current fleet record' });
  }
  return periods.filter(x=>x.client);
}
function vehicleAssignmentTimeline(v){
  const currentClient = fleetClientName(v) || 'Unassigned';
  const periods = normalizeAssignmentHistory(v);
  if(!periods.length) return [{ from:'Not recorded', to:'Present', client:currentClient, note:'Current fleet record' }];
  const clean = periods.map((p, idx)=>({
    client: p.client || 'Unassigned',
    from: displayDateRangeValue(p.from),
    to: p.to ? displayDateRangeValue(p.to) : 'Present',
    note: p.note || (idx === periods.length-1 ? 'Current assignment' : 'Past assignment'),
    changedBy: p.changedBy || ''
  }));
  const last = clean[clean.length-1];
  if(last && clientKey(last.client) !== clientKey(currentClient)){
    clean.push({ client:currentClient, from:displayDateRangeValue(v.updatedAt || today()), to:'Present', note:'Current fleet record' });
  }
  return clean;
}
function vehicleHistoryResultsHTML(){
  const vehicles=vehicleHistoryRows();
  return `<div class="table-wrap vehicle-history-table-wrap"><table class="vehicle-history-table"><thead><tr><th></th><th>Plate</th><th>Vehicle</th><th>Current Client</th><th>Current From</th><th>Current To</th><th>Status</th></tr></thead><tbody>${vehicles.map(vehicleHistoryRow).join('') || '<tr><td colspan="7">No vehicles found.</td></tr>'}</tbody></table></div>`;
}
function renderVehicleHistoryResults(){
  const el=$('vehicleHistoryResults');
  if(el) el.innerHTML = vehicleHistoryResultsHTML();
}
function vehicleHistoryHTML(){
  return `<div class="page-head"><div><h1>Fleet</h1><p class="muted">Vehicle assignment history by client.</p></div><div class="head-actions"><button class="btn light" onclick="exportVehicleHistoryCSV()">${I('download','icon-sm')} Export CSV</button></div></div>
  ${fleetSubnavHeader('vehicleHistory')}
  <section class="panel vehicle-history-panel vehicle-history-table-panel"><div class="section-title"><div><h3>Vehicle History</h3><p class="muted small-note">This shows which client had each vehicle, with start and end dates. When the client changes in Fleet, the previous client period is closed and a new one starts.</p></div></div>
  <input id="vehicleHistorySearch" class="fleet-search" placeholder="Search plate, vehicle, or client..." value="${esc(state.vehicleHistorySearch || '')}" autocomplete="off">
  <div id="vehicleHistoryResults">${vehicleHistoryResultsHTML()}</div></section>`;
}
function vehicleHistoryRow(v){
  const open = state.vehicleHistoryOpen === v.id;
  const timeline=[...vehicleAssignmentTimeline(v), ...fleetPermitHistoryRows(v), ...vehicleTicketHistoryRows(v)];
  const currentClient = fleetClientName(v) || 'Unassigned';
  const current = [...timeline].reverse().find(r=>clientKey(r.client)===clientKey(currentClient)) || timeline[timeline.length-1] || {from:'Not recorded', to:'Present', client:currentClient};
  const historyRows = timeline.slice().reverse().map((r,idx)=>`<tr class="vh-detail-row"><td></td><td colspan="2"><b>${esc(r.client)}</b><small>${idx===0?'Current / latest period':'Past period'}${r.changedBy ? ` · Changed by ${esc(r.changedBy)}` : ''}${r.note ? ` · ${esc(r.note)}` : ''}</small></td><td><b>From</b><small>${esc(r.from)}</small></td><td><b>To</b><small>${esc(r.to || 'Present')}</small></td><td colspan="2"></td></tr>`).join('');
  return `<tr class="vh-main-row" onclick="toggleVehicleHistory('${esc(v.id)}')"><td><button class="mini-btn vh-arrow" type="button">${open?'▾':'▸'}</button></td><td><span class="fleet-plate">${esc(v.plate || '—')}</span></td><td><b>${esc(modelWithoutYear(v.modelNumber)||v.modelNumber||'Vehicle')}</b><small>${v.year?esc(v.year):''}</small></td><td><b>${esc(currentClient)}</b></td><td>${esc(current.from)}</td><td>${esc(current.to || 'Present')}</td><td><span class="pill ${v.status==='In Use'?'green':v.status==='Off-hire'?'red':'orange'}">${esc(v.status||'—')}</span></td></tr>${open ? historyRows : ''}`;
}
function toggleVehicleHistory(vehicleId){
  state.vehicleHistoryOpen = state.vehicleHistoryOpen === vehicleId ? '' : vehicleId;
  renderVehicleHistoryResults();
}
function exportVehicleHistoryCSV(){
  const rows=[['Plate','Vehicle','Year','Client','From Date','To Date','Notes','Changed By']];
  vehicleHistoryRows().forEach(v=>{
    [...vehicleAssignmentTimeline(v), ...fleetPermitHistoryRows(v), ...vehicleTicketHistoryRows(v)].forEach(r=>rows.push([v.plate||'', modelWithoutYear(v.modelNumber)||v.modelNumber||'', v.year||'', r.client, r.from, r.to || 'Present', r.note||'', r.changedBy||'']));
  });
  downloadCSV('sarab-vehicle-client-history.csv', rows);
}


function fleetDriverOptionsHTML(selected=''){
  const names = ['Without driver', ...new Set((state.employees || []).map(e=>String(e.name || '').trim()).filter(Boolean))];
  if(selected && !names.some(n=>n.toLowerCase()===String(selected).toLowerCase())) names.push(selected);
  return names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
}
function isFleetOutsourceForm(){ return $('fleetOwnership') && $('fleetOwnership').value === 'Outsource'; }

function fleetHTML(){
  const vehicles = filteredFleetVehicles();
  const inUse = state.vehicles.filter(v => v.status === 'In Use').length;
  const spare = state.vehicles.filter(v => v.status === 'Spare').length;
  const backup = state.vehicles.filter(v => v.status === 'Back-up').length;
  const monthlyRentCost = state.vehicles.reduce((a,v)=>a+(v.ownership === 'Outsource' && v.status !== 'Off-hire' ? Number(v.rentRate||0) : 0),0);
  const monthlyClientRevenue = state.vehicles.reduce((a,v)=>a+(v.status === 'In Use' ? Number(v.clientRate||0) : 0),0);
  return `<div class="page-head"><div><h1>Fleet</h1><p class="muted">Track SMG vehicles, outsourced vehicles, customers, status, rent cost, and client rate.</p></div><div class="head-actions"><button class="btn light" onclick="importFleetCSV()">${I('download','icon-sm')} Import CSV</button><button class="btn primary" onclick="startAddVehicle()">${I('plus','icon-sm')} Add Vehicle</button></div></div>
  ${fleetSubnavHeader('fleet')}
  <div class="fleet-hero"><div><small>Fleet Revenue View</small><h2>${money(monthlyClientRevenue)}</h2><p>Client rate total for vehicles marked In Use.</p></div><div><span>Total Fleet</span><b>${state.vehicles.length}</b></div><div><span>In Use</span><b>${inUse}</b></div><div><span>Spare / Backup</span><b>${spare + backup}</b></div><div><span>Outsource Rent</span><b>${money(monthlyRentCost)}</b></div></div>
  <div class="fleet-layout improved"><section id="fleetFormPanel" class="panel fleet-form-card"><div class="section-title"><div><h3>Vehicle Details</h3><p class="muted small-note">Add or edit one vehicle. Plate is split into code + plate number, for example R 14534. If year is typed inside model, the app separates it automatically.</p></div></div>
    <form id="fleetForm" class="grid two">
      <input id="fleetId" type="hidden">
      <label>Vehicle model<input id="fleetModel" required placeholder="Toyota Hiace"></label>
      <label>Year<input id="fleetYear" type="number" min="1980" max="2100" step="1" placeholder="2022"></label>
      <label>Registered company<select id="fleetRegisteredCompany"><option value="">Not applicable / outsourced</option>${REGISTERED_COMPANIES.map(x=>`<option>${x}</option>`).join('')}</select><small id="fleetRegisteredCompanyNote" class="muted tiny hidden">Outsourced vehicles do not need a registered company.</small></label>
      <label>Fuel chip<select id="fleetFuelChip"><option value="Yes">Has company fuel chip</option><option value="No">No company fuel chip</option></select></label>
      <label id="fleetRegistrationExpiryWrap">Vehicle registration expiry<input id="fleetRegistrationExpiryDate" type="date"><small class="muted tiny">SMG vehicles only. Alert appears within 1 month.</small></label>
      <div class="plate-fields"><label>Plate code<input id="fleetPlateCode" required placeholder="R" maxlength="8"></label><label>Plate number<input id="fleetPlateNumber" required placeholder="14534"></label></div>
      <label>Customer<input id="fleetCustomer" placeholder="Customer / client name"></label>
      <label>Assigned driver<input id="fleetAssignedDriver" list="fleetDriverOptions" placeholder="Without driver / employee name"><datalist id="fleetDriverOptions">${fleetDriverOptionsHTML()}</datalist></label><label class="checkbox-line permit-toggle-line"><input id="fleetHasActivePermit" type="checkbox" onchange="toggleFleetPermitFields()"/> Active permit</label><div id="fleetPermitFields" class="grid two permit-fields wide hidden"><label>Permit category<select id="fleetPermitCategory">${permitOptionsHTML()}</select></label><label>Permit expiry date<input id="fleetPermitExpiryDate" type="date"></label></div>
      <label>Status<select id="fleetStatus"><option>In Use</option><option>Spare</option><option>Back-up</option><option>Off-hire</option></select></label>
      <label>Vehicle type<select id="fleetOwnership"><option>SMG Vehicle</option><option>Outsource</option></select></label>
      <div id="fleetVendorWrap" class="wide hidden outsource-fields"><label>Vendor name of outsourced vehicle<input id="fleetVendorName" placeholder="Vendor / supplier name"></label><div class="grid two outsource-date-grid"><label>Start date<input id="fleetOutsourceStartDate" type="date"></label><label>End date<input id="fleetOutsourceEndDate" type="date"></label></div></div>
      <label>Outsource rent rate (AED)<input id="fleetRentRate" type="number" min="0" step="0.01" value="0" placeholder="Only if outsourced"></label>
      <label>Client rate we give vehicle for (AED)<input id="fleetClientRate" type="number" min="0" step="0.01" value="0" placeholder="Rate charged to client if in use"></label>
      <label class="wide">Notes<input id="fleetNotes" placeholder="Any extra note"></label>
      <div class="modal-actions wide"><button type="button" class="btn light" onclick="clearFleetForm()">Clear</button><button class="btn primary" type="submit">Save Vehicle</button></div>
    </form></section>
    <section class="panel fleet-list-card"><div class="section-title"><div><h3>Fleet List</h3><p class="muted small-note">Search updates instantly while typing.</p></div><button class="mini-btn" onclick="exportFleet()">Export Fleet CSV</button></div><input id="fleetSearch" placeholder="Search by plate, model, customer, status..." value="${esc(state.fleetFilter || '')}" autocomplete="off" class="fleet-search"><div id="fleetResults">${vehicles.length ? fleetTable(vehicles) : '<div class="empty">No fleet vehicles found.</div>'}</div></section></div>`;
}

function fleetRegistrationAlertHTML(v){
  if((v.ownership || 'SMG Vehicle') === 'Outsource') return '<span class="muted">—</span>';
  if(!v.registrationExpiryDate) return '<span class="muted">No date</span>';
  return expiryNeedsAction(v.registrationExpiryDate,30) ? actionNeededBadge(`Registration ${v.registrationExpiryDate}`) : `<span class="pill green">Valid till ${esc(v.registrationExpiryDate)}</span>`;
}
function compactPlateKey(value){
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
function vehicleRelatedTickets(v){
  const vehiclePlate = compactPlateKey(v.plate || combinePlate(v.plateCode, v.plateNumber));
  const vehicleModel = String(modelWithoutYear(v.modelNumber) || v.modelNumber || '').toLowerCase();
  return (state.tickets || []).filter(t=>{
    const ticketPlate = compactPlateKey(t.plate || t.plateNumber || '');
    const ticketVehicle = String(t.vehicle || '').toLowerCase();
    const plateMatch = vehiclePlate && ticketPlate && (ticketPlate.includes(vehiclePlate) || vehiclePlate.includes(ticketPlate));
    const modelMatch = vehicleModel && ticketVehicle && (ticketVehicle.includes(vehicleModel) || vehicleModel.includes(ticketVehicle));
    return plateMatch || (plateMatch && modelMatch);
  });
}
function fleetPermitHistoryRows(v){
  const rows=[];
  if(v.hasActivePermit){
    rows.push({client:fleetClientName(v) || 'Unassigned', from:v.updatedAt ? String(v.updatedAt).slice(0,10) : today(), to:v.permitExpiryDate || '—', note:`Active permit: ${v.permitCategory || 'Permit'}`, changedBy:'Fleet'});
  }
  return rows;
}
function vehicleTicketHistoryRows(v){
  return vehicleRelatedTickets(v).map(t=>({
    client:t.client || fleetClientName(v) || 'Unassigned',
    from:t.date || (t.createdAt ? String(t.createdAt).slice(0,10) : '—'),
    to:t.status === 'Resolved' ? (t.updatedAt ? String(t.updatedAt).slice(0,10) : (t.date || '—')) : 'Open',
    note:`Ticket ${t.ticketNo || t.id || ''}: ${t.category || 'Request'} · ${t.status || 'Open'}${t.description ? ' · '+t.description : ''}`.trim(),
    changedBy:t.assignedTo || t.requestedBy || 'Ticketing'
  }));
}
function fleetTable(vehicles){
  return `<div class="fleet-cards">${vehicles.map(v=>{
    const year = v.year || extractYearFromModel(v.modelNumber);
    const model = modelWithoutYear(v.modelNumber);
    const regAlert = fleetRegistrationAlertHTML(v);
    return `<article class="fleet-card"><div class="fleet-card-main"><div><span class="fleet-plate">${esc(v.plate)}</span><h3>${esc(model)}${year ? ` <span class="fleet-year">${esc(year)}</span>` : ''}</h3><p class="muted">${esc(v.customer || 'No customer added')}</p></div><span class="pill ${v.status === 'In Use' ? 'green' : v.status === 'Back-up' ? 'orange' : v.status === 'Off-hire' ? 'red' : ''}">${esc(v.status)}</span></div><div class="fleet-alert-row">${regAlert}${v.hasActivePermit && expiryNeedsAction(v.permitExpiryDate,7) ? actionNeededBadge(`${v.permitCategory || 'Permit'} ${v.permitExpiryDate || ''}`) : ''}</div><div class="fleet-meta fleet-meta-expanded"><div><small>Registered Co.</small><b>${v.ownership === 'Outsource' ? '—' : esc(v.registeredCompany || 'Garage')}</b></div><div><small>Registration Expiry</small><b>${v.ownership === 'Outsource' ? '—' : esc(v.registrationExpiryDate || '—')}</b></div><div><small>Fuel Chip</small><b>${esc(v.fuelChip === 'Yes' ? 'Yes' : 'No')}</b></div><div><small>Assigned Driver</small><b>${esc(v.assignedDriver || 'Without driver')}</b></div><div><small>Permit</small><b>${v.hasActivePermit ? `${esc(v.permitCategory || 'Permit')} · ${esc(v.permitExpiryDate || '—')}` : '—'}</b></div><div><small>Type</small><b>${esc(v.ownership)}</b></div><div><small>Vendor</small><b>${v.ownership === 'Outsource' ? esc(v.vendorName || '—') : '—'}</b></div><div><small>Outsource Dates</small><b>${v.ownership === 'Outsource' ? `${esc(v.outsourceStartDate || '—')} → ${esc(v.outsourceEndDate || '—')}` : '—'}</b></div><div><small>Rent Rate</small><b>${v.ownership === 'Outsource' && v.status !== 'Off-hire' ? money(v.rentRate) : '—'}</b></div><div><small>Client Rate</small><b>${v.status === 'In Use' ? money(v.clientRate) : '—'}</b></div></div>${v.notes ? `<p class="fleet-notes">${esc(v.notes)}</p>` : ''}<div class="fleet-actions"><button class="mini-btn" onclick="editFleetVehicle('${v.id}')">Edit</button><button class="mini-btn danger" onclick="deleteFleetVehicle('${v.id}')">Delete</button></div></article>`;
  }).join('')}</div>`;
}

async function syncClientFromFleetVehicle(vehicle){
  const name=normName(vehicle.customer);
  if(!name) return;
  const existing=state.clients.find(c=>clientKey(c.name)===clientKey(name));
  if(existing) return;
  state.clients.unshift({ id:id('client'), name, contractStart:'', contractEnd:'', contactPerson:'', phone:'', email:'', notes:'Auto-added from fleet', createdAt:new Date().toISOString() });
  await saveClients();
}

async function saveFleetVehicle(e){
  e.preventDefault();
  const rawModel = $('fleetModel').value.trim();
  const autoYear = $('fleetYear').value || extractYearFromModel(rawModel);
  const cleanModel = modelWithoutYear(rawModel);
  const vehicle = {
    id: $('fleetId').value || id('v'),
    modelNumber: cleanModel,
    plate: combinePlate($('fleetPlateCode').value, $('fleetPlateNumber').value),
    plateCode: normalizePlatePiece($('fleetPlateCode').value),
    plateNumber: normalizePlatePiece($('fleetPlateNumber').value),
    year: autoYear,
    registeredCompany: $('fleetOwnership').value === 'Outsource' ? '' : $('fleetRegisteredCompany').value,
    registrationExpiryDate: $('fleetOwnership').value === 'Outsource' ? '' : ($('fleetRegistrationExpiryDate')?.value || ''),
    fuelChip: $('fleetFuelChip').value,
    assignedDriver: ($('fleetAssignedDriver')?.value || 'Without driver').trim() || 'Without driver',
    hasActivePermit: $('fleetHasActivePermit') ? $('fleetHasActivePermit').checked : false,
    permitCategory: $('fleetHasActivePermit')?.checked && $('fleetPermitCategory') ? $('fleetPermitCategory').value : '',
    permitExpiryDate: $('fleetHasActivePermit')?.checked && $('fleetPermitExpiryDate') ? $('fleetPermitExpiryDate').value : '',
    vendorName: $('fleetOwnership').value === 'Outsource' ? $('fleetVendorName').value.trim() : '',
    outsourceStartDate: $('fleetOwnership').value === 'Outsource' ? $('fleetOutsourceStartDate').value : '',
    outsourceEndDate: $('fleetOwnership').value === 'Outsource' ? $('fleetOutsourceEndDate').value : '',
    customer: $('fleetCustomer').value.trim(),
    status: $('fleetStatus').value,
    ownership: $('fleetOwnership').value,
    rentRate: $('fleetStatus').value === 'Off-hire' ? 0 : Number($('fleetRentRate').value || 0),
    clientRate: $('fleetStatus').value === 'Off-hire' ? 0 : Number($('fleetClientRate').value || 0),
    notes: $('fleetNotes').value.trim(),
    createdAt: state.vehicles.find(v=>v.id===$('fleetId').value)?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignmentHistory: []
  };
  if(!vehicle.modelNumber || !vehicle.plate) return toast('Model and plate code/plate number are required');
  const duplicate = fleetDuplicate(vehicle);
  if(vehicle.hasActivePermit && (!vehicle.permitCategory || !vehicle.permitExpiryDate)) return toast('Permit category and expiry date are required when active permit is ticked');
  if(duplicate) return toast(`Duplicate fleet vehicle blocked: ${duplicate.plate} already exists`);
  const idx = state.vehicles.findIndex(v => v.id === vehicle.id);
  const previousVehicle = idx >= 0 ? state.vehicles[idx] : null;
  const previousClient = previousVehicle ? fleetClientName(previousVehicle) : '';
  const nextClient = fleetClientName(vehicle) || 'Unassigned';
  const changedDate = today();
  if(previousVehicle){
    const history = normalizeAssignmentHistory(previousVehicle).map(x=>({...x}));
    if(clientKey(previousClient) !== clientKey(nextClient)){
      if(!history.length){
        history.push({ client: previousClient || 'Unassigned', from: displayDateRangeValue(previousVehicle.createdAt || changedDate), to:'', note:'Original assignment' });
      }
      const last = history[history.length-1];
      if(last && !last.to) last.to = changedDate;
      history.push({ client: nextClient, from: changedDate, to:'', note:'Client changed from Fleet page', changedBy: state.user?.name || state.user?.email || '—' });
    }
    vehicle.assignmentHistory = history;
  } else {
    vehicle.assignmentHistory = [{ client: nextClient, from: changedDate, to:'', note:'Vehicle added to fleet', changedBy: state.user?.name || state.user?.email || '—' }];
  }
  if(idx >= 0) state.vehicles[idx] = vehicle; else state.vehicles.unshift(vehicle);
  await saveVehicles();
  await syncClientFromFleetVehicle(vehicle);
  if(previousVehicle && clientKey(previousClient) !== clientKey(nextClient)){
    await logAction('Changed vehicle client', 'Fleet', vehicle.plate, `${previousClient || '—'} → ${nextClient || '—'}`, state.user?.name);
  }
  await logAction(idx >= 0 ? 'Updated fleet vehicle' : 'Added fleet vehicle', 'Fleet', vehicle.plate, `${vehicle.modelNumber}${vehicle.year ? ' ' + vehicle.year : ''} · ${vehicle.status}`, state.user?.name);
  toast('Fleet vehicle saved');
  render();
}
function editFleetVehicle(vehicleId){
  const v = state.vehicles.find(x=>x.id===vehicleId);
  if(!v) return;
  $('fleetId').value = v.id;
  $('fleetModel').value = modelWithoutYear(v.modelNumber || '');
  $('fleetYear').value = v.year || extractYearFromModel(v.modelNumber || '');
  $('fleetRegisteredCompany').value = v.ownership === 'Outsource' ? '' : (v.registeredCompany || 'Garage');
  $('fleetFuelChip').value = v.fuelChip || 'No';
  if($('fleetRegistrationExpiryDate')) $('fleetRegistrationExpiryDate').value = v.registrationExpiryDate || '';
  if($('fleetAssignedDriver')) $('fleetAssignedDriver').value = v.assignedDriver || 'Without driver';
  if($('fleetHasActivePermit')) $('fleetHasActivePermit').checked = Boolean(v.hasActivePermit);
  if($('fleetPermitCategory')) $('fleetPermitCategory').value = v.permitCategory || '';
  if($('fleetPermitExpiryDate')) $('fleetPermitExpiryDate').value = v.permitExpiryDate || '';
  toggleFleetPermitFields();
  const plateParts = splitPlate(v.plate || '');
  $('fleetPlateCode').value = v.plateCode || plateParts.code || '';
  $('fleetPlateNumber').value = v.plateNumber || plateParts.license || '';
  $('fleetCustomer').value = v.customer || '';
  $('fleetStatus').value = v.status || 'In Use';
  $('fleetOwnership').value = v.ownership || 'SMG Vehicle';
  $('fleetVendorName').value = v.vendorName || '';
  if($('fleetOutsourceStartDate')) $('fleetOutsourceStartDate').value = v.outsourceStartDate || '';
  if($('fleetOutsourceEndDate')) $('fleetOutsourceEndDate').value = v.outsourceEndDate || '';
  toggleFleetVendorField();
  $('fleetRentRate').value = v.rentRate || 0;
  $('fleetClientRate').value = v.clientRate || 0;
  $('fleetNotes').value = v.notes || '';
  window.scrollTo({top:0, behavior:'smooth'});
}
function clearFleetForm(){
  if(state.view !== 'fleet') { go('fleet'); return; }
  ['fleetId','fleetModel','fleetYear','fleetPlateCode','fleetPlateNumber','fleetCustomer','fleetAssignedDriver','fleetVendorName','fleetOutsourceStartDate','fleetOutsourceEndDate','fleetPermitCategory','fleetPermitExpiryDate','fleetRegistrationExpiryDate','fleetNotes'].forEach(id => { if($(id)) $(id).value=''; });
  if($('fleetStatus')) $('fleetStatus').value='In Use';
  if($('fleetRegisteredCompany')) $('fleetRegisteredCompany').value='Garage';
  if($('fleetAssignedDriver')) $('fleetAssignedDriver').value='Without driver';
  if($('fleetFuelChip')) $('fleetFuelChip').value='No';
  if($('fleetHasActivePermit')) $('fleetHasActivePermit').checked=false;
  toggleFleetPermitFields();
  if($('fleetOwnership')) $('fleetOwnership').value='SMG Vehicle';
  toggleFleetVendorField();
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
  const removed = state.vehicles.find(v=>v.id===vehicleId);
  state.vehicles = state.vehicles.filter(v=>v.id!==vehicleId);
  await saveVehicles();
  await deleteRemoteRow('vehicles', vehicleId);
  if(removed) await logAction('Deleted fleet vehicle', 'Fleet', removed.plate, removed.modelNumber, state.user?.name);
  toast('Fleet vehicle deleted');
  render();
}

function importFleetCSV(){
  const input=document.createElement('input');
  input.type='file';
  input.accept='.csv,text/csv';
  input.onchange=async()=>{
    const file=input.files?.[0];
    if(!file) return;
    try{
      const rows=parseCSV(await file.text());
      if(rows.length < 2) return toast('CSV is empty or missing rows');
      const headers=rows[0].map(normalizeHeader);
      let imported=0, updated=0, skipped=0;
      for(const cols of rows.slice(1)){
        const obj={}; headers.forEach((h,i)=>obj[h]=cols[i] ?? '');
        const plate=normalizePlatePiece(firstValue(obj,['Number Plate','Plate','Plate Number','Vehicle Plate']));
        const modelRaw=firstValue(obj,['Vehicle Model','Model','Vehicle','Car']);
        const customer=firstValue(obj,['Customer','Client','Client Name']);
        if(!plate || !modelRaw){ skipped++; continue; }
        const existing=state.vehicles.find(v=>plateDuplicateKey(v.plate)===plateDuplicateKey(plate));
        const parts=splitPlate(plate);
        const status=firstValue(obj,['Status'], existing?.status || 'In Use');
        const ownership=firstValue(obj,['Vehicle Type','Type','Ownership'], existing?.ownership || 'SMG Vehicle');
        const vehicle={
          id: existing?.id || id('v'),
          modelNumber:modelWithoutYear(modelRaw),
          year:firstValue(obj,['Year'], existing?.year || extractYearFromModel(modelRaw)),
          registeredCompany: ownership === 'Outsource' ? '' : firstValue(obj,['Registered Company','Company'], existing?.registeredCompany || 'Garage'),
          fuelChip:firstValue(obj,['Fuel Chip','Company Fuel Chip'], existing?.fuelChip || 'No'),
          assignedDriver:firstValue(obj,['Assigned Driver','Driver','Assigned Employee'], existing?.assignedDriver || 'Without driver'),
          hasActivePermit:['yes','true','1','active'].includes(String(firstValue(obj,['Active Permit','Has Active Permit'], existing?.hasActivePermit ? 'Yes' : '')).trim().toLowerCase()),
          permitCategory:firstValue(obj,['Permit Category','Permit Type'], existing?.permitCategory || ''),
          permitExpiryDate:firstValue(obj,['Permit Expiry Date','Permit Expiry'], existing?.permitExpiryDate || ''),
          registrationExpiryDate:firstValue(obj,['Vehicle Registration Expiry','Registration Expiry','Vehicle Registration Expiry Date'], existing?.registrationExpiryDate || ''),
          plate,
          plateCode:firstValue(obj,['Plate Code'], existing?.plateCode || parts.code),
          plateNumber:firstValue(obj,['Plate Number','License Number'], existing?.plateNumber || parts.license),
          customer,
          status,
          ownership,
          vendorName: ownership === 'Outsource' ? firstValue(obj,['Vendor Name','Vendor','Supplier'], existing?.vendorName || '') : '',
          outsourceStartDate: ownership === 'Outsource' ? firstValue(obj,['Outsource Start Date','Start Date'], existing?.outsourceStartDate || '') : '',
          outsourceEndDate: ownership === 'Outsource' ? firstValue(obj,['Outsource End Date','End Date'], existing?.outsourceEndDate || '') : '',
          rentRate: status === 'Off-hire' ? 0 : toNumber(firstValue(obj,['Outsource Rent Rate AED','Rent Rate','Rent'], existing?.rentRate ?? 0),0),
          clientRate: status === 'Off-hire' ? 0 : toNumber(firstValue(obj,['Client Rate AED','Client Rate','Rate'], existing?.clientRate ?? 0),0),
          notes:firstValue(obj,['Notes'], existing?.notes || ''),
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt:new Date().toISOString()
        };
        const idx=state.vehicles.findIndex(v=>v.id===vehicle.id);
        if(idx>=0){ state.vehicles[idx]=vehicle; updated++; } else { state.vehicles.unshift(vehicle); imported++; }
        await syncClientFromFleetVehicle(vehicle);
      }
      await saveVehicles();
      await saveClients();
      await logAction('Imported fleet CSV','Fleet','CSV Import',`${imported} new, ${updated} updated, ${skipped} skipped`,state.user?.name);
      toast(`Fleet CSV imported: ${imported} new, ${updated} updated, ${skipped} skipped`);
      render();
    }catch(err){ console.error(err); toast('Could not import fleet CSV'); }
  };
  input.click();
}

function exportFleet(){
  downloadCSV('sarab-fleet.csv', [
    ['Vehicle Model','Year','Registered Company','Vehicle Registration Expiry','Fuel Chip','Plate Code','Plate Number','Number Plate','Customer','Assigned Driver','Active Permit','Permit Category','Permit Expiry Date','Status','Vehicle Type','Vendor Name','Outsource Start Date','Outsource End Date','Outsource Rent Rate AED','Client Rate AED','Total AED','Notes'],
    ...state.vehicles.map(v=>{
      const parts=splitPlate(v.plate);
      const rent=Number(v.ownership === 'Outsource' && v.status !== 'Off-hire' ? v.rentRate || 0 : 0);
      const client=Number(v.status === 'In Use' ? v.clientRate || 0 : 0);
      const total=client-rent;
      return [modelWithoutYear(v.modelNumber),v.year || extractYearFromModel(v.modelNumber),v.ownership === 'Outsource' ? '' : (v.registeredCompany || 'Garage'),v.ownership === 'Outsource' ? '' : (v.registrationExpiryDate || ''),v.fuelChip || 'No',v.plateCode || parts.code,v.plateNumber || parts.license,v.plate,v.customer,v.assignedDriver || 'Without driver',v.hasActivePermit?'Yes':'No',v.permitCategory||'',v.permitExpiryDate||'',v.status,v.ownership,v.ownership === 'Outsource' ? (v.vendorName || '') : '',v.ownership === 'Outsource' ? (v.outsourceStartDate || '') : '',v.ownership === 'Outsource' ? (v.outsourceEndDate || '') : '',rent,client,total,v.notes];
    })
  ]);
}


function nextTicketNo(){
  const nums = state.tickets.map(t => Number(String(t.ticketNo || '').replace(/\D/g,''))).filter(Boolean);
  return `REQ-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3,'0')}`;
}
function ticketDaysOpen(t){
  const start = new Date(t.date || t.createdAt || today());
  const now = new Date();
  return Math.max(0, Math.floor((now - start) / 86400000));
}
function ticketStats(){
  const total = state.tickets.length;
  const open = state.tickets.filter(t=>t.status==='Open').length;
  const progress = state.tickets.filter(t=>t.status==='In Progress').length;
  const pending = state.tickets.filter(t=>t.status==='Pending').length;
  const resolved = state.tickets.filter(t=>t.status==='Resolved').length;
  const escalated = state.tickets.filter(t=>t.status!=='Resolved' && (t.escalated || ticketDaysOpen(t) > Number(t.slaDays || 7))).length;
  return {total, open, progress, pending, resolved, escalated};
}
function ticketStatusPill(status){
  const cls = status === 'Resolved' ? 'green' : status === 'Pending' ? 'orange' : status === 'In Progress' ? 'blue' : 'gray';
  return `<span class="pill ${cls}">${esc(status || 'Open')}</span>`;
}
function ticketPriorityPill(priority){
  const cls = priority === 'Critical' ? 'red' : priority === 'High' ? 'orange' : priority === 'Medium' ? 'blue' : 'green';
  return `<span class="pill ${cls}">${esc(priority || 'Medium')}</span>`;
}
function ticketOptions(options, selected=''){
  return options.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join('');
}
function ticketFleetRecords(){
  const records = [];
  const seen = new Set();
  (state.vehicles || []).forEach(v => {
    const plate = normalizePlatePiece(v.plate || combinePlate(v.plateCode, v.plateNumber));
    if(!plate) return;
    const key = plate.replace(/\s+/g,'').toLowerCase();
    seen.add(key);
    const vehicle = `${v.modelNumber || ''}${v.year ? ' ' + v.year : ''}`.trim() || 'Vehicle';
    const client = v.customer || '';
    const provider = v.ownership === 'Outsource' ? (v.vendorName || v.provider || '') : (v.provider || 'SMG');
    records.push({ source:'fleet', id:v.id, plate, vehicle, client, provider, label:`${plate} — ${vehicle}${client ? ' · ' + client : ''}` });
  });
  Object.entries(TICKET_FLEET_LOOKUP || {}).forEach(([plateRaw, info]) => {
    const plate = normalizePlatePiece(plateRaw);
    const key = plate.replace(/\s+/g,'').toLowerCase();
    if(seen.has(key)) return;
    const vehicle = info.vtype || 'Vehicle';
    const client = info.client || '';
    const provider = info.provider || '';
    records.push({ source:'lookup', id:plate, plate, vehicle, client, provider, label:`${plate} — ${vehicle}${client ? ' · ' + client : ''}` });
  });
  return records.sort((a,b)=>a.label.localeCompare(b.label));
}
function ticketFleetOptionsHTML(){
  return ticketFleetRecords().map(r=>`<option value="${esc(r.label)}"></option>`).join('');
}
function findTicketFleetRecord(value){
  const q = String(value || '').trim().toLowerCase();
  if(!q) return null;
  const compact = q.replace(/\s+/g,'');
  return ticketFleetRecords().find(r =>
    r.label.toLowerCase() === q ||
    r.plate.toLowerCase() === q ||
    r.plate.toLowerCase().replace(/\s+/g,'') === compact
  ) || null;
}
function filteredTickets(){
  const q = String(state.ticketSearch || '').trim().toLowerCase();
  return state.tickets.filter(t=>{
    const haystack = [t.ticketNo,t.client,t.plate,t.vehicle,t.category,t.description,t.status,t.priority,t.assignedTo,t.provider,t.location,t.requestedBy].join(' ').toLowerCase();
    const statusOk = state.ticketStatus === 'All' || t.status === state.ticketStatus;
    const priorityOk = state.ticketPriority === 'All' || t.priority === state.ticketPriority;
    return (!q || haystack.includes(q)) && statusOk && priorityOk;
  });
}
function switchTicketTab(tab){ state.ticketTab = tab; render(); }
function ticketTabsHTML(){
  const tabs = [['dashboard','Dashboard'],['new','Raise Request'],['tracker','All Tickets'],['escalations','Escalations'],['reports','Reports']];
  return `<div class="ticket-tabs">${tabs.map(([id,label])=>`<button type="button" class="ticket-tab ${state.ticketTab===id?'active':''}" onclick="switchTicketTab('${id}')">${label}</button>`).join('')}</div>`;
}
function ticketsHTML(){
  return `<div class="page-head"><div><h1>Ticketing</h1><p class="muted">Raise requests, monitor open issues, assign staff/providers, and track escalations.</p></div><button class="btn light" onclick="exportTickets()">${I('download','icon-sm')} Export Tickets CSV</button></div>${ticketTabsHTML()}<div id="ticketContent">${ticketTabContentHTML()}</div>`;
}
function ticketTabContentHTML(){
  if(state.ticketTab==='new') return ticketFormHTML();
  if(state.ticketTab==='tracker') return ticketTrackerHTML();
  if(state.ticketTab==='escalations') return ticketEscalationsHTML();
  if(state.ticketTab==='reports') return ticketReportsHTML();
  return ticketDashboardHTML();
}
function ticketDashboardHTML(){
  const s = ticketStats();
  const recent = state.tickets.slice(0,5);
  return `<div class="ticket-metrics"><section class="ticket-metric"><span>Total Requests</span><b>${s.total}</b></section><section class="ticket-metric"><span>In Progress</span><b class="orange">${s.progress}</b></section><section class="ticket-metric"><span>Resolved</span><b class="ok">${s.resolved}</b></section><section class="ticket-metric"><span>Pending</span><b class="low">${s.pending}</b></section><section class="ticket-metric"><span>Escalated</span><b class="low">${s.escalated}</b></section></div><section class="panel"><div class="section-title"><h3>Recent Requests</h3><button class="mini-btn" onclick="switchTicketTab('tracker')">View All</button></div>${recent.length?`<div class="ticket-list">${recent.map(ticketRowHTML).join('')}</div>`:'<div class="empty">No requests yet.</div>'}</section><section class="panel"><div class="section-title"><h3>Quick Actions</h3></div><div class="quick-grid"><button class="btn primary large-btn" onclick="switchTicketTab('new')">${I('plus')} Raise Request</button><button class="btn primary large-btn" onclick="switchTicketTab('tracker')">${I('clipboard')} View Pipeline</button><button class="btn primary large-btn" onclick="switchTicketTab('escalations')">${I('warning')} Escalations</button></div></section>`;
}
function ticketTrackerHTML(){
  return `<section class="panel"><div class="section-title"><h3>All Tickets</h3><button class="mini-btn" onclick="switchTicketTab('new')">New Request</button></div><div class="filters ticket-filters"><input id="ticketSearch" placeholder="Search ticket, plate, client, issue..." value="${esc(state.ticketSearch)}" autocomplete="off"><select id="ticketStatusFilter">${['All',...TICKET_STATUSES].map(x=>`<option ${x===state.ticketStatus?'selected':''}>${x}</option>`).join('')}</select><select id="ticketPriorityFilter">${['All',...TICKET_PRIORITIES].map(x=>`<option ${x===state.ticketPriority?'selected':''}>${x}</option>`).join('')}</select></div><div id="ticketListResults">${ticketListHTML(filteredTickets())}</div></section>`;
}
function renderTicketListOnly(){ const target=$('ticketListResults'); if(target) target.innerHTML = ticketListHTML(filteredTickets()); }
function ticketListHTML(rows){ return rows.length ? `<div class="ticket-list">${rows.map(ticketRowHTML).join('')}</div>` : '<div class="empty">No tickets found.</div>'; }
function ticketRowHTML(t){
  const overdue = t.status !== 'Resolved' && ticketDaysOpen(t) > Number(t.slaDays || 7);
  const over = t.status !== 'Resolved' && (t.escalated || overdue);
  const escBadge = t.escalated ? '<span class="pill red">Escalated</span>' : (overdue ? '<span class="pill red">SLA Breached</span>' : '');
  return `<article class="ticket-row ${over?'ticket-overdue':''}"><div class="ticket-id"><b>${esc(t.ticketNo)}</b><small>${esc(t.date || '')}</small></div><div class="ticket-main"><h3>${esc(t.category || 'Request')} · ${esc(t.plate || 'No plate')}</h3><p>${esc(t.vehicle || 'No vehicle')} · ${esc(t.client || 'No client')} · ${esc(t.location || 'No location')}</p><p class="muted">${esc(t.description || '')}</p><div class="ticket-badges">${ticketStatusPill(t.status)}${ticketPriorityPill(t.priority)}${escBadge}</div></div><div class="ticket-side"><small>Assigned to</small><b>${esc(t.assignedTo || 'Unassigned')}</b><small>Provider: ${esc(t.provider || '—')}</small><select onchange="updateTicketStatus('${t.id}', this.value)">${TICKET_STATUSES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select><div class="ticket-actions"><button class="mini-btn" onclick="viewTicket('${t.id}')">Open</button>${t.status !== 'Resolved' && !t.escalated ? `<button class="mini-btn danger" onclick="escalateTicket('${t.id}')">Escalate</button>` : ''}${t.escalated ? `<button class="mini-btn" onclick="deEscalateTicket('${t.id}')">De-escalate</button>` : ''}<button class="mini-btn danger" onclick="deleteTicket('${t.id}')">Delete</button></div></div></article>`;
}
function ticketFormHTML(){
  return `<section class="panel"><div class="section-title"><div><h3>Raise a Request</h3><p class="muted small-note">Use this for fleet complaints, maintenance requests, client issues, or internal requests.</p></div><span class="pill green">Next: ${nextTicketNo()}</span></div><form id="ticketForm" class="grid"><div class="grid two"><label class="wide">Search / choose from fleet<input id="ticketFleetSearch" list="ticketFleetList" placeholder="Type plate, vehicle, or client..." autocomplete="off"><datalist id="ticketFleetList">${ticketFleetOptionsHTML()}</datalist></label><label>Date<input id="ticketDate" type="date" value="${today()}" required></label><label>Client<input id="ticketClient" placeholder="Client name"></label><label>Plate Number<input id="ticketPlate" placeholder="R 14534"></label><label>Vehicle<input id="ticketVehicle" placeholder="Toyota Hiace"></label><label>Location<input id="ticketLocation" placeholder="Garage / Abu Dhabi / Client site"></label><label>Category<select id="ticketCategory">${TICKET_CATEGORIES.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><label>Priority<select id="ticketPriority">${TICKET_PRIORITIES.map(x=>`<option ${x==='Medium'?'selected':''}>${x}</option>`).join('')}</select></label><label>Status<select id="ticketStatus">${TICKET_STATUSES.map(x=>`<option>${x}</option>`).join('')}</select></label><label>SLA deadline<select id="ticketSla"><option value="1">1 day</option><option value="3">3 days</option><option value="7" selected>7 days</option><option value="14">14 days</option></select></label><label>Requested by<input id="ticketRequestedBy" placeholder="Name"></label><label>Assigned to<input id="ticketAssignedTo" placeholder="Type assignee name manually"></label><label>Service provider<input id="ticketProvider" placeholder="SMG / vendor / garage"></label></div><label>Description<textarea id="ticketDescription" required placeholder="Describe the request or complaint..."></textarea></label><label>Current action / notes<textarea id="ticketAction" placeholder="Awaiting assignment / Sent to provider / Inspection done..."></textarea></label><button class="btn primary large-btn" type="submit">${I('clipboard')} Save Request</button></form></section>`;
}
function ticketEscalationsHTML(){
  const rows = state.tickets.filter(t=>t.status !== 'Resolved' && (t.escalated || ticketDaysOpen(t) > Number(t.slaDays || 7)));
  return `<section class="panel"><div class="section-title"><h3>Escalated / Overdue Requests</h3><small class="muted">Open requests beyond SLA deadline.</small></div>${rows.length?`<div class="ticket-list">${rows.map(ticketRowHTML).join('')}</div>`:'<div class="empty">No escalations right now.</div>'}</section>`;
}
function ticketReportsHTML(){
  const byStatus = Object.fromEntries(TICKET_STATUSES.map(x=>[x, state.tickets.filter(t=>t.status===x).length]));
  const byPriority = Object.fromEntries(TICKET_PRIORITIES.map(x=>[x, state.tickets.filter(t=>t.priority===x).length]));
  const byCategory = {};
  state.tickets.forEach(t=>{ byCategory[t.category || 'Other'] = (byCategory[t.category || 'Other'] || 0) + 1; });
  const bar = (label,val,max)=>`<div class="bar-row"><span class="bar-label">${esc(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(5,Math.round((val/(max||1))*100))}%"><span>${val}</span></div></div></div>`;
  const maxS=Math.max(1,...Object.values(byStatus)), maxP=Math.max(1,...Object.values(byPriority)), maxC=Math.max(1,...Object.values(byCategory));
  return `<div class="report-grid"><section class="panel"><h3>By Status</h3>${Object.entries(byStatus).map(([k,v])=>bar(k,v,maxS)).join('')}</section><section class="panel"><h3>By Priority</h3>${Object.entries(byPriority).map(([k,v])=>bar(k,v,maxP)).join('')}</section></div><section class="panel"><h3>By Category</h3>${Object.entries(byCategory).map(([k,v])=>bar(k,v,maxC)).join('') || '<div class="empty">No data yet.</div>'}</section>`;
}
function fillTicketFromFleet(value){
  const r = findTicketFleetRecord(value);
  if(!r) return;
  if($('ticketFleetSearch')) $('ticketFleetSearch').value = r.label;
  if($('ticketClient')) $('ticketClient').value = r.client || '';
  if($('ticketPlate')) $('ticketPlate').value = r.plate || '';
  if($('ticketVehicle')) $('ticketVehicle').value = r.vehicle || '';
  if($('ticketProvider')) $('ticketProvider').value = r.provider || '';
}
async function saveTicket(e){
  e.preventDefault();
  const ticket = {
    id: id('t'),
    ticketNo: nextTicketNo(),
    date: $('ticketDate').value || today(),
    client: $('ticketClient').value.trim(),
    plate: normalizePlatePiece($('ticketPlate').value),
    vehicle: $('ticketVehicle').value.trim(),
    location: $('ticketLocation').value.trim(),
    category: $('ticketCategory').value,
    priority: $('ticketPriority').value,
    status: $('ticketStatus').value,
    requestedBy: $('ticketRequestedBy').value.trim() || state.user?.name || '',
    assignedTo: $('ticketAssignedTo').value.trim() || 'Unassigned',
    provider: $('ticketProvider').value.trim(),
    description: $('ticketDescription').value.trim(),
    action: $('ticketAction').value.trim() || 'Awaiting assignment',
    slaDays: Number($('ticketSla').value || 7),
    escalated: false,
    escalatedAt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(!ticket.plate || !ticket.category || !ticket.description) return toast('Plate, category, and description are required');
  state.tickets.unshift(ticket);
  await saveTickets();
  await logAction('Created ticket/request', 'Ticketing', ticket.ticketNo, `${ticket.plate} · ${ticket.category}`, ticket.requestedBy || state.user?.name);
  toast(`${ticket.ticketNo} saved`);
  state.ticketTab='tracker';
  render();
}
async function updateTicketStatus(ticketId, status){
  const t = state.tickets.find(x=>x.id===ticketId);
  if(!t) return;
  t.status = status;
  t.updatedAt = new Date().toISOString();
  await saveTickets();
  await logAction('Updated ticket status', 'Ticketing', t.ticketNo, `${t.plate || ''} → ${status}`, state.user?.name);
  toast('Ticket status updated');
  render();
}
async function escalateTicket(ticketId){
  const t = state.tickets.find(x=>x.id===ticketId);
  if(!t) return toast('Ticket not found');
  if(t.status === 'Resolved') return toast('Resolved tickets cannot be escalated');
  t.escalated = true;
  t.escalatedAt = new Date().toISOString();
  if(!t.action) t.action = 'Escalated for management review';
  else if(!String(t.action).toLowerCase().includes('escalated')) t.action += '\nEscalated for management review.';
  t.updatedAt = new Date().toISOString();
  await saveTickets();
  await logAction('Escalated ticket/request', 'Ticketing', t.ticketNo, `${t.plate || ''} · ${t.category || ''}`, state.user?.name);
  toast(`${t.ticketNo} escalated`);
  render();
}
async function deEscalateTicket(ticketId){
  const t = state.tickets.find(x=>x.id===ticketId);
  if(!t) return toast('Ticket not found');
  t.escalated = false;
  t.deEscalatedAt = new Date().toISOString();
  t.updatedAt = new Date().toISOString();
  const note = 'De-escalated after review.';
  if(!t.action) t.action = note;
  else if(!String(t.action).toLowerCase().includes('de-escalated')) t.action += `
${note}`;
  await saveTickets();
  await logAction('De-escalated ticket/request', 'Ticketing', t.ticketNo, `${t.plate || ''} · ${t.category || ''}`, state.user?.name);
  toast(`${t.ticketNo} de-escalated`);
  render();
}
async function deleteTicket(ticketId){
  if(!confirm('Delete this ticket/request?')) return;
  const t = state.tickets.find(x=>x.id===ticketId);
  state.tickets = state.tickets.filter(x=>x.id!==ticketId);
  await saveTickets();
  await deleteRemoteRow('tickets', ticketId);
  if(t) await logAction('Deleted ticket/request', 'Ticketing', t.ticketNo, t.plate || '', state.user?.name);
  toast('Ticket deleted');
  render();
}
function viewTicket(ticketId){
  const t = state.tickets.find(x=>x.id===ticketId);
  if(!t) return;
  $('jobDialogTitle').textContent = `${t.ticketNo} · ${t.plate}`;
  const overdue = t.status !== 'Resolved' && ticketDaysOpen(t) > Number(t.slaDays || 7);
  const over = t.status !== 'Resolved' && (t.escalated || overdue);
  const escBadge = t.escalated ? '<span class="pill red">Escalated</span>' : (overdue ? '<span class="pill red">SLA Breached</span>' : '');
  $('jobDialogBody').innerHTML = `<div class="part-detail"><p><b>Status:</b></p><div class="status-inline">${ticketStatusPill(t.status)} ${ticketPriorityPill(t.priority)} ${escBadge}</div><p><b>Client:</b> ${esc(t.client || '—')}</p><p><b>Vehicle:</b> ${esc(t.vehicle || '—')}</p><p><b>Plate:</b> ${esc(t.plate || '—')}</p><p><b>Category:</b> ${esc(t.category || '—')}</p><p><b>Location:</b> ${esc(t.location || '—')}</p><p><b>Requested by:</b> ${esc(t.requestedBy || '—')}</p><p><b>Assigned to:</b> ${esc(t.assignedTo || '—')}</p><p><b>Provider:</b> ${esc(t.provider || '—')}</p><p><b>Date:</b> ${esc(t.date || '—')} · <b>SLA:</b> ${Number(t.slaDays || 7)} days · <b>Days open:</b> ${ticketDaysOpen(t)}</p><p><b>Description:</b><br>${esc(t.description || '')}</p><p><b>Action / notes:</b><br>${esc(t.action || '')}</p><label>Change Status<select onchange="updateTicketStatus('${t.id}', this.value)">${TICKET_STATUSES.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select></label>${t.status !== 'Resolved' && !t.escalated ? `<button class="btn danger full" onclick="escalateTicket('${t.id}')">Escalate Ticket</button>` : ''}${t.escalated ? `<button class="btn light full" onclick="deEscalateTicket('${t.id}')">De-escalate Ticket</button>` : ''}</div>`;
  $('jobDialog').showModal();
}
function closeTicketDialog(){ closeJobDialog(); }
function exportTickets(){
  downloadCSV('sarab-ticketing-requests.csv', [
    ['Ticket ID','Date','Status','Priority','Escalated','De-escalated At','Client','Plate','Vehicle','Category','Location','Requested By','Assigned To','Provider','SLA Days','Days Open','Description','Action / Notes'],
    ...state.tickets.map(t=>[t.ticketNo,t.date,t.status,t.priority,t.escalated ? 'Yes' : 'No',t.deEscalatedAt || '',t.client,t.plate,t.vehicle,t.category,t.location,t.requestedBy,t.assignedTo,t.provider,t.slaDays,ticketDaysOpen(t),t.description,t.action])
  ]);
}

function exportHTML(){ return `<div class="page-head"><div><h1>Export CSV</h1><p class="muted">Download records for Excel, accounting, backup, or Supabase migration.</p></div></div><div class="export-grid"><section class="card export-card"><h2>Clients CSV</h2><p class="muted">Client database, contract dates, linked fleet and revenue summary.</p><button class="btn primary full" onclick="exportClients()">${I('download','icon-sm')} Export Clients</button></section><section class="card export-card"><h2>Inventory CSV</h2><p class="muted">All parts, quantities, cost value and shelf location.</p><button class="btn primary full" onclick="exportInventory()">${I('download','icon-sm')} Export Inventory</button></section><section class="card export-card"><h2>Jobs CSV</h2><p class="muted">All jobs, cars, labour, totals and parts used.</p><button class="btn primary full" onclick="exportJobs()">${I('download','icon-sm')} Export Jobs</button></section><section class="card export-card"><h2>Parts Used CSV</h2><p class="muted">Every part used against every vehicle/job.</p><button class="btn primary full" onclick="exportUsage()">${I('download','icon-sm')} Export Parts Used</button></section><section class="card export-card"><h2>Fleet CSV</h2><p class="muted">All fleet vehicles, status, rent rate and client rate.</p><button class="btn primary full" onclick="exportFleet()">${I('download','icon-sm')} Export Fleet</button></section><section class="card export-card"><h2>Ticketing CSV</h2><p class="muted">All requests, statuses, priorities, assignments and SLA details.</p><button class="btn primary full" onclick="exportTickets()">${I('download','icon-sm')} Export Tickets</button></section></div>`; }

function serviceParts(startDate, endDate=today()){
  if(!startDate) return { years:0, months:0, days:0, totalDays:0, decimalYears:0 };
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  if(isNaN(start) || isNaN(end) || end <= start) return { years:0, months:0, days:0, totalDays:0, decimalYears:0 };
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if(days < 0){
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if(months < 0){ years -= 1; months += 12; }
  const totalDays = Math.floor((end - start) / 86400000);
  const decimalYears = totalDays / 365;
  return { years, months, days, totalDays, decimalYears };
}
function employeeTenureText(startDate, endDate=today()){
  const t = serviceParts(startDate, endDate);
  if(!t.totalDays) return '—';
  const bits = [];
  if(t.years) bits.push(`${t.years} year${t.years===1?'':'s'}`);
  if(t.months) bits.push(`${t.months} month${t.months===1?'':'s'}`);
  if(!bits.length && t.days) bits.push(`${t.days} day${t.days===1?'':'s'}`);
  return bits.join(', ') || '0 days';
}
function calcUAEGratuity(startDate, basicSalary, endDate=today()){
  const basic = Number(basicSalary || 0);
  if(!startDate || !basic) return 0;
  const t = serviceParts(startDate, endDate);
  if(t.totalDays < 365) return 0;
  const daily = basic / 30;
  // DDA-style estimate: until six completed years, use 21 days/year for the whole tenure.
  // From six years onward: first five years at 21 days/year, remaining service at 30 days/year.
  let gratuityDays;
  if(t.decimalYears < 6){
    gratuityDays = 21 * t.decimalYears;
  }else{
    gratuityDays = (21 * 5) + (30 * Math.max(t.decimalYears - 5, 0));
  }
  const cap = basic * 24;
  return Math.min(gratuityDays * daily, cap);
}
function employeeFormDefaults(){ return { id:'', type: state.employeeType || 'SMG', name:'', startDate:'', currentWorking:true, endDate:'', visaStatus:'Garage', basicSalary:0, netSalary:0, passportCollected:false, passportRequested:false, hasId:false, hasIdRequested:false, drivingLicense:false, drivingLicenseRequested:false, undertaking:false, undertakingRequested:false, labourPermit:false, labourPermitRequested:false, assignedCompany:'', assignedVehicle:'', passportExpiryDate:'', drivingLicenseExpiryDate:'', hasActivePermit:false, permitCategory:'', permitExpiryDate:'', permitRecordedAt:'' }; }
function employeeIsCurrentlyWorking(e){ return e.currentWorking !== false; }
function employeeGratuityEndDate(e){ return employeeIsCurrentlyWorking(e) ? today() : (e.endDate || today()); }
function getEditingEmployee(){ return state.employees.find(e => e.id === state.editingEmployeeId) || null; }
function employeeTypeTabs(){ return `<div class="view-tabs employee-tabs"><button class="tab ${state.view==='employees' && state.employeeType==='All'?'active':''}" onclick="state.view='employees';state.employeeType='All';state.editingEmployeeId='';render()">All Employees</button><button class="tab ${state.view==='employees' && state.employeeType==='SMG'?'active':''}" onclick="state.view='employees';state.employeeType='SMG';state.editingEmployeeId='';render()">SMG Employees</button><button class="tab ${state.view==='employees' && state.employeeType==='Outsourced'?'active':''}" onclick="state.view='employees';state.employeeType='Outsourced';state.editingEmployeeId='';render()">Outsourced Employees</button><button class="tab ${state.view==='employeeHistory'?'active':''}" onclick="go('employeeHistory')">Employees History</button><button class="tab ${state.view==='employeeTickets'?'active':''}" onclick="go('employeeTickets')">Employee Ticketing</button></div>`; }
function employeesHTML(){
  const type = state.employeeType || 'All';
  const q = String(state.employeeSearch || '').toLowerCase();
  const rows = state.employees
    .filter(e => type === 'All' || (e.type || 'SMG') === type)
    .filter(e => !q || [e.type,e.name,e.visaStatus,e.startDate,e.endDate,e.basicSalary,e.netSalary,e.assignedCompany,e.assignedVehicle].join(' ').toLowerCase().includes(q));
  const smg = state.employees.filter(e => (e.type || 'SMG') === 'SMG');
  const out = state.employees.filter(e => e.type === 'Outsourced');
  const gratuityTotal = smg.reduce((a,e)=>a+calcUAEGratuity(e.startDate,e.basicSalary,employeeGratuityEndDate(e)),0);
  const formPanel = type === 'All'
    ? ''
    : `<section class="panel employee-form-panel"><h2>${getEditingEmployee() ? 'Edit' : 'Add'} ${type} Employee</h2>${employeeFormHTML(getEditingEmployee() || employeeFormDefaults())}</section>`;
  return `<div class="page-head"><div><h1>Employees</h1><p class="muted">Manage SMG employees, outsourced employees, documents, salaries, and estimated UAE gratuity.</p></div><button class="btn light" onclick="exportEmployees()">${I('download','icon-sm')} Export CSV</button></div>
  <div class="kpis employee-kpis"><section class="card compact-kpi"><b>${state.employees.length}</b><span>All Employees</span></section><section class="card compact-kpi"><b>${smg.length}</b><span>SMG Employees</span></section><section class="card compact-kpi"><b>${out.length}</b><span>Outsourced Employees</span></section><section class="card compact-kpi"><b>${money(gratuityTotal)}</b><span>Estimated gratuity</span></section></div>
  ${employeeTypeTabs()}
  <div class="employee-layout ${type === 'All' ? 'employee-layout-all' : ''}">
    ${formPanel}
    <section class="panel employee-list-panel"><div class="section-title"><h3>${type === 'All' ? 'All Employees' : type + ' Employee List'}</h3>${type === 'All' ? '' : `<button class="mini-btn" onclick="state.editingEmployeeId='';render()">New Employee</button>`}</div><input id="employeeSearch" class="search-input" placeholder="Search employee, type, visa status, salary..." value="${esc(state.employeeSearch)}" oninput="state.employeeSearch=this.value; renderAndRefocus('employeeSearch')" />${employeeTableHTML(rows,type)}</section>
  </div>
  <p class="hint">Gratuity is an estimate based on basic salary and start date using the standard UAE 21/30-day approach. Confirm final calculations with HR/legal before settlement.</p>`;
}
function employeeVehicleDatalist(){ return `<datalist id="employeeVehicleOptions">${state.vehicles.map(v=>`<option value="${esc(v.plate||'')}">${esc(v.plate||'')} — ${esc(v.modelNumber||'Vehicle')} · ${esc(fleetClientName(v))}</option>`).join('')}</datalist>`; }
function employeeCompanyOptions(selected=''){
  const names=[...new Set([...(state.clients||[]).map(c=>c.name), ...(state.vehicles||[]).map(v=>fleetClientName(v))].filter(Boolean).map(x=>String(x).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const sel=String(selected||'');
  if(sel && !names.includes(sel)) names.unshift(sel);
  return `<option value="">Choose client / company</option>${names.map(n=>`<option value="${esc(n)}" ${n===sel?'selected':''}>${esc(n)}</option>`).join('')}`;
}
function employeeCompanySelect(e){ return `<label>Assigned company<select id="empAssignedCompany">${employeeCompanyOptions(e.assignedCompany||'')}</select></label>`; }
function permitOptionsHTML(selected=''){ return `<option value="">Choose permit</option>${UAE_PERMIT_CATEGORIES.map(x=>`<option value="${esc(x)}" ${x===selected?'selected':''}>${esc(x)}</option>`).join('')}`; }
function employeePermitFields(e){ return `<label class="checkbox-line permit-toggle-line"><input id="empHasActivePermit" type="checkbox" ${e.hasActivePermit?'checked':''} onchange="toggleEmployeePermitFields()"/> Active permit</label><div id="employeePermitFields" class="grid two permit-fields ${e.hasActivePermit?'':'hidden'}"><label>Permit category<select id="empPermitCategory">${permitOptionsHTML(e.permitCategory||'')}</select></label><label>Permit expiry date<input id="empPermitExpiryDate" type="date" value="${esc(e.permitExpiryDate||'')}"></label></div>`; }
function employeeNameDatalist(){ return `<datalist id="employeeNameOptions">${(state.employees||[]).map(e=>`<option value="${esc(e.name||'')}">${esc(e.name||'')} · ${esc(e.type||'SMG')} · ${esc(e.assignedCompany||'')}</option>`).join('')}</datalist>`; }
function employeeFormHTML(e){
  const type = e.type || state.employeeType || 'SMG';
  if(type === 'Outsourced'){
    return `<form id="employeeForm" onsubmit="saveEmployee(event)"><input id="employeeId" type="hidden" value="${esc(e.id)}" /><input id="employeeType" type="hidden" value="Outsourced" />
    <div class="grid two"><label>Name<input id="empName" required value="${esc(e.name)}" placeholder="Employee name" /></label><label>Start date<input id="empStartDate" type="date" value="${esc(e.startDate)}" /></label>${employeeCompanySelect(e)}<label>Assigned vehicle<input id="empAssignedVehicle" list="employeeVehicleOptions" value="${esc(e.assignedVehicle||'')}" placeholder="Plate / vehicle" /></label></div>${employeeVehicleDatalist()}
    <label class="checkbox-line employee-current-line"><input id="empCurrentWorking" type="checkbox" ${employeeIsCurrentlyWorking(e)?'checked':''} onchange="toggleEmployeeEndDate()"/> Currently working</label>
    <div id="employeeEndDateWrap" class="employee-end-date-wrap" style="${employeeIsCurrentlyWorking(e)?'display:none':''}"><label>End date<input id="empEndDate" type="date" value="${esc(e.endDate||'')}" /></label></div>
    <div class="check-grid"><label><input id="empHasId" type="checkbox" ${e.hasId?'checked':''}/> ID</label><label><input id="empDrivingLicense" type="checkbox" ${e.drivingLicense?'checked':''}/> Driving License</label><label><input id="empUndertaking" type="checkbox" ${e.undertaking?'checked':''}/> Undertaking</label><label><input id="empLabourPermit" type="checkbox" ${e.labourPermit?'checked':''}/> Labour part-time permit</label></div>${employeePermitFields(e)}
    <div class="form-actions"><button type="button" class="btn light" onclick="state.editingEmployeeId='';render()">Clear</button><button class="btn primary" type="submit">Save Employee</button></div></form>`;
  }
  return `<form id="employeeForm" onsubmit="saveEmployee(event)"><input id="employeeId" type="hidden" value="${esc(e.id)}" /><input id="employeeType" type="hidden" value="SMG" />
  <div class="grid two"><label>Name<input id="empName" required value="${esc(e.name)}" placeholder="Employee name" /></label><label>Start date<input id="empStartDate" type="date" value="${esc(e.startDate)}" /></label>${employeeCompanySelect(e)}<label>Assigned vehicle<input id="empAssignedVehicle" list="employeeVehicleOptions" value="${esc(e.assignedVehicle||'')}" placeholder="Plate / vehicle" /></label><label>Visa status<select id="empVisaStatus">${EMPLOYEE_VISA_STATUS.map(v=>`<option ${v===(e.visaStatus||'Garage')?'selected':''}>${esc(v)}</option>`).join('')}</select></label><label>Basic salary (AED)<input id="empBasicSalary" type="number" min="0" step="0.01" value="${Number(e.basicSalary||0)}" /></label><label>Net salary (AED)<input id="empNetSalary" type="number" min="0" step="0.01" value="${Number(e.netSalary||0)}" /></label><label>Passport expiry date<input id="empPassportExpiryDate" type="date" value="${esc(e.passportExpiryDate||'')}" /></label><label>Driver's license expiry<input id="empDrivingLicenseExpiryDate" type="date" value="${esc(e.drivingLicenseExpiryDate||'')}" /></label><label class="checkbox-line"><input id="empPassportCollected" type="checkbox" ${e.passportCollected?'checked':''}/> Passport collected</label></div>${employeePermitFields(e)}${employeeVehicleDatalist()}
  <label class="checkbox-line employee-current-line"><input id="empCurrentWorking" type="checkbox" ${employeeIsCurrentlyWorking(e)?'checked':''} onchange="toggleEmployeeEndDate()"/> Currently working</label>
  <div id="employeeEndDateWrap" class="employee-end-date-wrap" style="${employeeIsCurrentlyWorking(e)?'display:none':''}"><label>End date<input id="empEndDate" type="date" value="${esc(e.endDate||'')}" /></label></div>
  <div class="employee-gratuity-preview employee-gratuity-stack"><div><span>Total tenure</span><b>${employeeTenureText(e.startDate,employeeGratuityEndDate(e))}</b></div><div><span>Estimated gratuity</span><b>${money(calcUAEGratuity(e.startDate,e.basicSalary,employeeGratuityEndDate(e)))}</b></div></div>
  <div class="form-actions"><button type="button" class="btn light" onclick="state.editingEmployeeId='';render()">Clear</button><button class="btn primary" type="submit">Save Employee</button></div></form>`;
}

function employeeDocStatusCell(emp, field, requestedField, label){
  const hasDoc = Boolean(emp[field]);
  if(hasDoc) return `<span class="doc-status doc-ok">✓</span>`;
  const requested = Boolean(emp[requestedField]);
  return `<button type="button" class="doc-request-flag ${requested?'requested':''}" onclick="toggleEmployeeDocRequested('${esc(emp.id)}','${esc(requestedField)}')">${requested?'Requested ✓':'Need to request?'}</button>`;
}
async function toggleEmployeeDocRequested(empId, requestedField){
  const emp = state.employees.find(e => e.id === empId);
  if(!emp) return;
  emp[requestedField] = !Boolean(emp[requestedField]);
  emp.updatedAt = new Date().toISOString();
  await saveEmployees();
  await logAction(emp[requestedField] ? 'Marked employee document requested' : 'Marked employee document not requested', 'Employees', emp.name || '', requestedField, state.user?.name);
  toast(emp[requestedField] ? 'Marked as requested' : 'Marked as not requested');
  render();
}
function employeeOutsourcedDocsHTML(e){
  return [
    ['ID','hasId','hasIdRequested'],
    ['Driving','drivingLicense','drivingLicenseRequested'],
    ['Undertaking','undertaking','undertakingRequested'],
    ['Permit','labourPermit','labourPermitRequested']
  ].map(([label,field,requested])=>`<div class="doc-mini-row"><span>${label}</span>${employeeDocStatusCell(e,field,requested,label)}</div>`).join('');
}

function actionNeededBadge(text){ return `<span class="pill orange action-needed-pill">${esc(text || 'Action needed')}</span>`; }
function employeeExpiryAlertsHTML(e){
  const alerts=[];
  if((e.type||'SMG')==='SMG'){
    if(expiryNeedsAction(e.passportExpiryDate,30)) alerts.push(actionNeededBadge(`Passport ${e.passportExpiryDate || ''}`));
    if(expiryNeedsAction(e.drivingLicenseExpiryDate,30)) alerts.push(actionNeededBadge(`License ${e.drivingLicenseExpiryDate || ''}`));
  }
  if(e.hasActivePermit && expiryNeedsAction(e.permitExpiryDate,7)) alerts.push(actionNeededBadge(`${e.permitCategory || 'Permit'} ${e.permitExpiryDate || ''}`));
  return alerts.join('') || '<span class="muted">—</span>';
}
function employeePermitDisplay(e){ return e.hasActivePermit ? `${esc(e.permitCategory || 'Permit')}<div class="muted tiny">Exp: ${esc(e.permitExpiryDate || '—')}</div>` : '<span class="muted">—</span>'; }
function employeeTableHTML(rows,type){
  if(!rows.length) return `<div class="empty">No ${esc(type)} employees yet.</div>`;
  if(type === 'All'){
    const body = rows.map(e => {
      const isSMG = (e.type || 'SMG') === 'SMG';
      return `<tr><td><b>${esc(e.name)}</b><div class="muted tiny">${esc(e.type || 'SMG')}</div></td><td>${employeeIsCurrentlyWorking(e)?'<span class="badge green">Working</span>':'<span class="badge muted-badge">Left</span>'}</td><td>${esc(e.startDate||'—')}</td><td>${employeeIsCurrentlyWorking(e)?'—':esc(e.endDate||'—')}</td><td>${employeeTenureText(e.startDate,employeeGratuityEndDate(e))}</td><td>${esc(e.assignedCompany||'—')}</td><td>${esc(e.assignedVehicle||'—')}</td><td>${isSMG ? esc(e.visaStatus||'—') : 'Outsourced'}</td><td>${isSMG ? money(e.basicSalary) : '—'}</td><td>${isSMG ? money(e.netSalary) : '—'}</td><td>${isSMG ? `<b class="green-text">${money(calcUAEGratuity(e.startDate,e.basicSalary,employeeGratuityEndDate(e)))}</b>` : '—'}</td><td>${employeePermitDisplay(e)}</td><td>${employeeExpiryAlertsHTML(e)}</td><td>${isSMG ? `<div class="doc-mini-row"><span>Passport</span>${employeeDocStatusCell(e,'passportCollected','passportRequested','Passport')}</div>` : employeeOutsourcedDocsHTML(e)}</td><td><button class="mini-btn" onclick="editEmployee('${esc(e.id)}')">Edit</button><button class="mini-btn danger" onclick="removeEmployee('${esc(e.id)}')">Remove</button></td></tr>`;
    }).join('');
    return `<div class="table-wrap employee-table-wrap"><table><tr><th>Name</th><th>Status</th><th>Start date</th><th>End date</th><th>Total tenure</th><th>Assigned Company</th><th>Assigned Vehicle</th><th>Visa / Type</th><th>Basic</th><th>Net</th><th>Gratuity</th><th>Permit</th><th>Expiry Alerts</th><th>Documents</th><th>Action</th></tr><tbody>${body}</tbody></table></div>`;
  }
  const head = type === 'SMG'
    ? `<tr><th>Name</th><th>Status</th><th>Start date</th><th>End date</th><th>Total tenure</th><th>Assigned Company</th><th>Assigned Vehicle</th><th>Visa status</th><th>Basic</th><th>Net</th><th>Gratuity</th><th>Passport Expiry</th><th>Driver License Expiry</th><th>Permit</th><th>Expiry Alerts</th><th>Passport</th><th>Action</th></tr>`
    : `<tr><th>Name</th><th>Status</th><th>Start date</th><th>End date</th><th>Total tenure</th><th>Assigned Company</th><th>Assigned Vehicle</th><th>ID</th><th>Driving License</th><th>Undertaking</th><th>Labour Permit</th><th>Active Permit</th><th>Expiry Alerts</th><th>Action</th></tr>`;
  const body = rows.map(e => type === 'SMG'
    ? `<tr><td><b>${esc(e.name)}</b></td><td>${employeeIsCurrentlyWorking(e)?'<span class="badge green">Working</span>':'<span class="badge muted-badge">Left</span>'}</td><td>${esc(e.startDate||'—')}</td><td>${employeeIsCurrentlyWorking(e)?'—':esc(e.endDate||'—')}</td><td>${employeeTenureText(e.startDate,employeeGratuityEndDate(e))}</td><td>${esc(e.assignedCompany||'—')}</td><td>${esc(e.assignedVehicle||'—')}</td><td>${esc(e.visaStatus||'—')}</td><td>${money(e.basicSalary)}</td><td>${money(e.netSalary)}</td><td><b class="green-text">${money(calcUAEGratuity(e.startDate,e.basicSalary,employeeGratuityEndDate(e)))}</b></td><td>${esc(e.passportExpiryDate||'—')}</td><td>${esc(e.drivingLicenseExpiryDate||'—')}</td><td>${employeePermitDisplay(e)}</td><td>${employeeExpiryAlertsHTML(e)}</td><td>${employeeDocStatusCell(e,'passportCollected','passportRequested','Passport')}</td><td><button class="mini-btn" onclick="editEmployee('${esc(e.id)}')">Edit</button><button class="mini-btn danger" onclick="removeEmployee('${esc(e.id)}')">Remove</button></td></tr>`
    : `<tr><td><b>${esc(e.name)}</b></td><td>${employeeIsCurrentlyWorking(e)?'<span class="badge green">Working</span>':'<span class="badge muted-badge">Left</span>'}</td><td>${esc(e.startDate||'—')}</td><td>${employeeIsCurrentlyWorking(e)?'—':esc(e.endDate||'—')}</td><td>${employeeTenureText(e.startDate,employeeGratuityEndDate(e))}</td><td>${esc(e.assignedCompany||'—')}</td><td>${esc(e.assignedVehicle||'—')}</td><td>${employeeDocStatusCell(e,'hasId','hasIdRequested','ID')}</td><td>${employeeDocStatusCell(e,'drivingLicense','drivingLicenseRequested','Driving License')}</td><td>${employeeDocStatusCell(e,'undertaking','undertakingRequested','Undertaking')}</td><td>${employeeDocStatusCell(e,'labourPermit','labourPermitRequested','Labour Permit')}</td><td>${employeePermitDisplay(e)}</td><td>${employeeExpiryAlertsHTML(e)}</td><td><button class="mini-btn" onclick="editEmployee('${esc(e.id)}')">Edit</button><button class="mini-btn danger" onclick="removeEmployee('${esc(e.id)}')">Remove</button></td></tr>`).join('');
  return `<div class="table-wrap employee-table-wrap"><table>${head}<tbody>${body}</tbody></table></div>`;
}
async function saveEmployee(ev){
  ev.preventDefault();
  const type = $('employeeType').value;
  const existingId = $('employeeId').value;
  const emp = { id: existingId || id('emp'), type, name:$('empName').value.trim(), startDate:$('empStartDate').value || '', updatedAt:new Date().toISOString(), createdAt: existingId ? (getEditingEmployee()?.createdAt || new Date().toISOString()) : new Date().toISOString() };
  if(!emp.name) return toast('Employee name is required');
  const existingEmployee = existingId ? getEditingEmployee() : null;
  emp.assignedCompany = $('empAssignedCompany') ? $('empAssignedCompany').value.trim() : '';
  emp.assignedVehicle = $('empAssignedVehicle') ? $('empAssignedVehicle').value.trim() : '';
  emp.currentWorking = $('empCurrentWorking') ? $('empCurrentWorking').checked : true;
  emp.hasActivePermit = $('empHasActivePermit') ? $('empHasActivePermit').checked : false;
  emp.permitCategory = emp.hasActivePermit && $('empPermitCategory') ? $('empPermitCategory').value : '';
  emp.permitExpiryDate = emp.hasActivePermit && $('empPermitExpiryDate') ? $('empPermitExpiryDate').value : '';
  if(emp.hasActivePermit && (!emp.permitCategory || !emp.permitExpiryDate)) return toast('Permit category and expiry date are required when active permit is ticked');
  const existingPermitChanged = !existingEmployee || !existingEmployee.hasActivePermit || String(existingEmployee.permitCategory||'') !== String(emp.permitCategory||'') || String(existingEmployee.permitExpiryDate||'') !== String(emp.permitExpiryDate||'');
  emp.permitRecordedAt = emp.hasActivePermit ? (existingPermitChanged ? today() : (existingEmployee?.permitRecordedAt || existingEmployee?.updatedAt?.slice?.(0,10) || emp.startDate || today())) : '';
  emp.endDate = emp.currentWorking ? '' : (($('empEndDate') && $('empEndDate').value) || '');
  if(!emp.currentWorking && !emp.endDate) return toast('End date is required when employee is not currently working');
  if(type === 'SMG'){
    emp.visaStatus = $('empVisaStatus').value;
    emp.basicSalary = Number($('empBasicSalary').value || 0);
    emp.netSalary = Number($('empNetSalary').value || 0);
    emp.passportCollected = $('empPassportCollected').checked;
    emp.passportRequested = emp.passportCollected ? false : Boolean(existingEmployee?.passportRequested);
    emp.passportExpiryDate = $('empPassportExpiryDate') ? $('empPassportExpiryDate').value : '';
    emp.drivingLicenseExpiryDate = $('empDrivingLicenseExpiryDate') ? $('empDrivingLicenseExpiryDate').value : '';
  } else {
    emp.hasId = $('empHasId').checked;
    emp.drivingLicense = $('empDrivingLicense').checked;
    emp.undertaking = $('empUndertaking').checked;
    emp.labourPermit = $('empLabourPermit').checked;
    emp.hasIdRequested = emp.hasId ? false : Boolean(existingEmployee?.hasIdRequested);
    emp.drivingLicenseRequested = emp.drivingLicense ? false : Boolean(existingEmployee?.drivingLicenseRequested);
    emp.undertakingRequested = emp.undertaking ? false : Boolean(existingEmployee?.undertakingRequested);
    emp.labourPermitRequested = emp.labourPermit ? false : Boolean(existingEmployee?.labourPermitRequested);
  }
  const ix = state.employees.findIndex(x => x.id === emp.id);
  const oldEmp = ix >= 0 ? state.employees[ix] : null;
  const oldAssign = `${oldEmp?.assignedCompany||''}|${oldEmp?.assignedVehicle||''}`;
  const newAssign = `${emp.assignedCompany||''}|${emp.assignedVehicle||''}`;
  emp.assignmentHistory = Array.isArray(oldEmp?.assignmentHistory) ? oldEmp.assignmentHistory.map(h => ({...h})) : [];
  if(!oldEmp && (emp.assignedCompany || emp.assignedVehicle)){ emp.assignmentHistory.push({from:emp.startDate||today(), to:'Present', company:emp.assignedCompany||'—', vehicle:emp.assignedVehicle||'—', note:'Initial assignment'}); }
  if(oldEmp && oldAssign !== newAssign){
    const d=today();
    const last = emp.assignmentHistory[emp.assignmentHistory.length-1];
    if(last && (!last.to || last.to==='Present')) last.to=d;
    emp.assignmentHistory.push({from:d, to:'Present', company:emp.assignedCompany||'—', vehicle:emp.assignedVehicle||'—', note:'Assignment changed'});
  }
  if(ix >= 0) state.employees[ix] = {...state.employees[ix], ...emp}; else state.employees.unshift(emp);
  await saveEmployees();
  await logAction(existingId ? 'Updated employee' : 'Added employee', 'Employees', emp.name, type, state.user?.name);
  state.editingEmployeeId='';
  toast('Employee saved');
  render();
}
function editEmployee(empId){ const e = state.employees.find(x => x.id === empId); if(!e) return; state.employeeType = e.type || 'SMG'; state.editingEmployeeId = empId; render(); }
async function removeEmployee(empId){ const e = state.employees.find(x => x.id === empId); if(!e) return; if(!confirm(`Remove ${e.name}?`)) return; state.employees = state.employees.filter(x => x.id !== empId); if(USE_SUPABASE) await deleteRemoteRow('employees', empId); await saveEmployees(); await logAction('Removed employee', 'Employees', e.name, e.type || '', state.user?.name); toast('Employee removed'); render(); }
function exportEmployees(){
  const rows = [['Type','Name','Currently Working','Start Date','End Date','Total Tenure','Assigned Company','Assigned Vehicle','Visa Status','Basic Salary AED','Net Salary AED','Estimated Gratuity AED','Passport Expiry Date','Driving License Expiry Date','Active Permit','Permit Category','Permit Expiry Date','Passport Collected','Passport Requested','ID','ID Requested','Driving License','Driving License Requested','Undertaking','Undertaking Requested','Labour Part Time Permit','Labour Permit Requested']];
  state.employees.forEach(e => rows.push([e.type||'SMG', e.name||'', employeeIsCurrentlyWorking(e)?'Yes':'No', e.startDate||'', employeeIsCurrentlyWorking(e)?'':(e.endDate||''), employeeTenureText(e.startDate,employeeGratuityEndDate(e)), e.assignedCompany||'', e.assignedVehicle||'', e.visaStatus||'', e.basicSalary||0, e.netSalary||0, calcUAEGratuity(e.startDate,e.basicSalary,employeeGratuityEndDate(e)).toFixed(2), e.passportExpiryDate||'', e.drivingLicenseExpiryDate||'', e.hasActivePermit?'Yes':'No', e.permitCategory||'', e.permitExpiryDate||'', e.passportCollected?'Yes':'No', e.passportRequested?'Yes':'No', e.hasId?'Yes':'No', e.hasIdRequested?'Yes':'No', e.drivingLicense?'Yes':'No', e.drivingLicenseRequested?'Yes':'No', e.undertaking?'Yes':'No', e.undertakingRequested?'Yes':'No', e.labourPermit?'Yes':'No', e.labourPermitRequested?'Yes':'No']));
  downloadCSV('sarab-employees.csv', rows);
}

function toggleEmployeeEndDate(){ const wrap = $('employeeEndDateWrap'); const current = $('empCurrentWorking'); if(wrap && current) wrap.style.display = current.checked ? 'none' : 'block'; }
function toggleEmployeePermitFields(){ const wrap=$('employeePermitFields'); const active=$('empHasActivePermit'); if(wrap && active) wrap.classList.toggle('hidden', !active.checked); }

function employeeHistoryHTML(){
  const q = String(state.employeeSearch || '').toLowerCase();
  const rows = (state.employees || []).filter(e => !q || [e.name,e.assignedCompany,e.assignedVehicle,e.type,e.visaStatus].join(' ').toLowerCase().includes(q));
  const body = rows.map(e=>{
    const baseHist = (e.assignmentHistory && e.assignmentHistory.length ? e.assignmentHistory : (e.assignedCompany || e.assignedVehicle ? [{from:e.startDate||'—', to:'Present', company:e.assignedCompany||'—', vehicle:e.assignedVehicle||'—', note:'Current assignment'}] : []));
    const hist = baseHist.map(h => ({...h}));
    if(e.hasActivePermit) hist.push({from:e.permitRecordedAt || e.startDate || today(), to:e.permitExpiryDate || '—', company:e.assignedCompany || '—', vehicle:e.assignedVehicle || '—', note:`Active permit: ${e.permitCategory || 'Permit'}`});
    const tickets=(state.employeeTickets||[]).filter(t=>String(t.employee||'').toLowerCase()===String(e.name||'').toLowerCase());
    return `<tr><td><b>${esc(e.name)}</b><div class="muted tiny">${esc(e.type||'SMG')}</div></td><td>${esc(e.assignedCompany||'—')}</td><td>${esc(e.assignedVehicle||'—')}</td><td>${employeeIsCurrentlyWorking(e)?'<span class="badge green">Working</span>':'<span class="badge muted-badge">Left</span>'}</td><td>${hist.length}</td><td>${tickets.length ? `<details><summary class="mini-btn">${tickets.length} ticket(s)</summary><div class="history-table-mini"><table><tr><th>Date</th><th>Category</th><th>Status</th><th>Approval</th><th>Notes</th></tr>${tickets.map(t=>`<tr><td>${esc(t.date||'—')}</td><td>${esc(t.category||'—')}</td><td>${esc(t.status||'Open')}</td><td>${esc(t.approvalStatus||'Pending Approval')}</td><td>${isLeaveTicket(t)?`${esc(t.leaveStartDate||'—')} → ${esc(t.leaveEndDate||'—')} (${leaveDurationText(t.leaveStartDate,t.leaveEndDate)})${t.returnToDutyDate?` Returned: ${esc(t.returnToDutyDate)}`:''}${ticketLeaveOverstay(t)?` OVERSTAY: ${ticketOverstayDays(t)} day${ticketOverstayDays(t)===1?'':'s'}`:''}`:esc(t.notes||'')}</td></tr>`).join('')}</table></div></details>` : '<span class="muted">—</span>'}</td><td><details><summary class="mini-btn">Open history</summary><div class="history-table-mini"><table><tr><th>From</th><th>To</th><th>Company / Client</th><th>Vehicle</th><th>Note</th></tr>${hist.map(h=>`<tr><td>${esc(h.from||'—')}</td><td>${esc(h.to||'Present')}</td><td>${esc(h.company||'—')}</td><td>${esc(h.vehicle||'—')}</td><td>${esc(h.note||'')}</td></tr>`).join('')}</table></div></details></td></tr>`;
  }).join('');
  return `<div class="page-head"><div><h1>Employees History</h1><p class="muted">Track which company/client and vehicle each employee was assigned to over time.</p></div><button class="btn light" onclick="exportEmployeeHistoryCSV()">${I('download','icon-sm')} Export CSV</button></div>${employeeTypeTabs()}<section class="panel"><input id="employeeSearch" class="search-input" placeholder="Search employee, vehicle, company..." value="${esc(state.employeeSearch||'')}" oninput="state.employeeSearch=this.value; renderAndRefocus('employeeSearch')" /><div class="table-wrap"><table><tr><th>Employee</th><th>Current Company</th><th>Current Vehicle</th><th>Status</th><th>History entries</th><th>Employee Tickets</th><th>Details</th></tr><tbody>${body || '<tr><td colspan="7" class="muted">No employee history yet.</td></tr>'}</tbody></table></div></section>`;
}
function exportEmployeeHistoryCSV(){
  const rows=[['Employee','Type','From','To','Company / Client','Vehicle','Note']];
  (state.employees||[]).forEach(e=>{
    const baseHist=(e.assignmentHistory&&e.assignmentHistory.length?e.assignmentHistory:[{from:e.startDate||'',to:'Present',company:e.assignedCompany||'',vehicle:e.assignedVehicle||'',note:'Current assignment'}]);
    const hist=baseHist.map(h=>({...h}));
    if(e.hasActivePermit) hist.push({from:e.permitRecordedAt || e.startDate || today(), to:e.permitExpiryDate || '—', company:e.assignedCompany || '—', vehicle:e.assignedVehicle || '—', note:`Active permit: ${e.permitCategory || 'Permit'}`});
    hist.forEach(h=>rows.push([e.name||'',e.type||'SMG',h.from||'',h.to||'Present',h.company||'',h.vehicle||'',h.note||'']));
    (state.employeeTickets||[]).filter(t=>String(t.employee||'').toLowerCase()===String(e.name||'').toLowerCase()).forEach(t=>rows.push([e.name||'',e.type||'SMG',t.date||'',t.status==='Resolved'?(t.updatedAt?String(t.updatedAt).slice(0,10):t.date||''):'Open',e.assignedCompany||'',e.assignedVehicle||'',`Employee ticket: ${t.category||''} · ${t.approvalStatus||''} · ${t.notes||''}`]));
  });
  downloadCSV('sarab-employee-history.csv', rows);
}
const EMPLOYEE_TICKET_CATEGORIES=['Fine inquiries','Advance request','Leave request','Accidents','Complaints against driver'];
function isLeaveTicket(t){ return String(t?.category||'').toLowerCase()==='leave request'; }
function daysBetweenDates(start,end,inclusive=false){
  if(!start || !end) return 0;
  const a=new Date(`${start}T00:00:00`);
  const b=new Date(`${end}T00:00:00`);
  if(Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff=Math.round((b-a)/(24*60*60*1000));
  return inclusive ? diff + 1 : diff;
}
function ticketOverstayDays(t){
  if(!isLeaveTicket(t) || t.approvalStatus !== 'Approved' || !t.leaveEndDate) return 0;
  const checkDate = t.returnToDutyDate || t.returnedAt || today();
  const days = daysBetweenDates(t.leaveEndDate, checkDate, false);
  return days > 0 ? days : 0;
}
function ticketLeaveOverstay(t){
  return ticketOverstayDays(t) > 0;
}
function leaveDurationText(start,end){
  if(!start || !end) return '—';
  const days=daysBetweenDates(start,end,true);
  if(days <= 0) return '—';
  return `${days} day${days===1?'':'s'}`;
}
function leaveReturnStatusHTML(t){
  if(!isLeaveTicket(t)) return '<span class="muted">—</span>';
  const overDays=ticketOverstayDays(t);
  const duration=leaveDurationText(t.leaveStartDate,t.leaveEndDate);
  const dateLine=`<div><b>${esc(t.leaveStartDate||'—')}</b> → <b>${esc(t.leaveEndDate||'—')}</b></div><div class="muted tiny">Duration: ${esc(duration)}</div>`;
  if(t.returnToDutyDate){
    return `${dateLine}<span class="badge green">Returned ${esc(t.returnToDutyDate)}</span>${overDays?` <span class="badge danger-badge">Overstay ${overDays} day${overDays===1?'':'s'}</span>`:''}`;
  }
  if(overDays){
    return `${dateLine}<span class="badge danger-badge">Overstay alert: ${overDays} day${overDays===1?'':'s'}</span>`;
  }
  return `${dateLine}<span class="badge orange">Return pending</span>`;
}
function toggleEmployeeLeaveFields(){
  const cat=$('employeeTicketCategory')?.value;
  const wrap=$('employeeLeaveFields');
  if(!wrap) return;
  const isLeave = cat === 'Leave request';
  wrap.classList.toggle('leave-hidden', !isLeave);
  wrap.style.setProperty('display', isLeave ? 'grid' : 'none', 'important');
}
function employeeTicketsHTML(){
  const q=String(state.employeeTicketSearch||'').toLowerCase();
  const rows=(state.employeeTickets||[]).filter(t=>!q||[t.employee,t.category,t.status,t.approvalStatus,t.notes,t.date,t.leaveStartDate,t.leaveEndDate,t.returnToDutyDate].join(' ').toLowerCase().includes(q));
  const editing=(state.employeeTickets||[]).find(t=>t.id===state.editingEmployeeTicketId) || {};
  const selectedCategory = editing.category || EMPLOYEE_TICKET_CATEGORIES[0];
  return `<div class="page-head"><div><h1>Employee Ticketing</h1><p class="muted">Track employee requests, fines, leave, accidents and complaints.</p></div><button class="btn light" onclick="exportEmployeeTicketsCSV()">${I('download','icon-sm')} Export CSV</button></div>${employeeTypeTabs()}<div class="employee-ticket-layout"><section class="panel"><h2>${state.editingEmployeeTicketId?'Edit':'New'} Employee Ticket</h2><form onsubmit="saveEmployeeTicket(event)" class="grid"><input id="employeeTicketId" type="hidden" value="${esc(state.editingEmployeeTicketId||'')}"><label>Employee<input id="employeeTicketEmployee" list="employeeNameOptions" value="${esc(editing.employee||'')}" placeholder="Type or choose employee"></label>${employeeNameDatalist()}<label>Category<select id="employeeTicketCategory" onchange="toggleEmployeeLeaveFields()">${EMPLOYEE_TICKET_CATEGORIES.map(c=>`<option ${c===selectedCategory?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label>Date<input id="employeeTicketDate" type="date" value="${esc(editing.date||today())}"></label><label>Status<select id="employeeTicketStatus">${['Open','In Progress','Resolved'].map(st=>`<option ${st===(editing.status||'Open')?'selected':''}>${st}</option>`).join('')}</select></label><label>Approval<select id="employeeTicketApprovalStatus"><option ${((editing.approvalStatus||'Pending Approval')==='Pending Approval')?'selected':''}>Pending Approval</option><option ${editing.approvalStatus==='Approved'?'selected':''}>Approved</option></select></label><div id="employeeLeaveFields" class="wide leave-fields ${selectedCategory==='Leave request'?'':'leave-hidden'}" style="display:${selectedCategory==='Leave request'?'grid':'none'}"><label>Leave start date<input id="employeeLeaveStartDate" type="date" value="${esc(editing.leaveStartDate||'')}"></label><label>Leave end date<input id="employeeLeaveEndDate" type="date" value="${esc(editing.leaveEndDate||'')}"></label><label>Actual return to duty date<input id="employeeReturnToDutyDate" type="date" value="${esc(editing.returnToDutyDate||'')}"></label><div class="leave-note"><b>Leave duration:</b> ${leaveDurationText(editing.leaveStartDate, editing.leaveEndDate)}</div></div><label class="wide">Notes<textarea id="employeeTicketNotes" placeholder="Details, amount, requested dates, complaint info...">${esc(editing.notes||'')}</textarea></label><div class="form-actions wide"><button class="btn light" type="button" onclick="state.editingEmployeeTicketId='';render()">Clear</button><button class="btn primary" type="submit">Save Ticket</button></div></form></section><section class="panel"><div class="section-title"><h3>Employee Tickets</h3></div><input id="employeeTicketSearch" class="search-input" placeholder="Search tickets..." value="${esc(state.employeeTicketSearch||'')}" oninput="state.employeeTicketSearch=this.value; renderAndRefocus('employeeTicketSearch')">${employeeTicketTable(rows)}</section></div>`;
}
function employeeTicketTable(rows){
  return `<div class="table-wrap"><table><tr><th>Date</th><th>Employee</th><th>Category</th><th>Status</th><th>Approval</th><th>Leave / Return</th><th>Notes</th><th>Action</th></tr><tbody>${rows.map(t=>{
    const leaveInfo = leaveReturnStatusHTML(t);
    return `<tr class="${ticketLeaveOverstay(t)?'overstay-row':''}"><td>${esc(t.date||'—')}</td><td><b>${esc(t.employee||'—')}</b></td><td>${esc(t.category||'—')}</td><td>${esc(t.status||'Open')}</td><td>${employeeTicketApprovalBadge(t)}</td><td>${leaveInfo}</td><td>${esc(t.notes||'')}</td><td><button class="mini-btn" onclick="editEmployeeTicket('${esc(t.id)}')">Edit</button><button class="mini-btn ${t.approvalStatus==='Approved'?'warning':''}" onclick="approveEmployeeTicket('${esc(t.id)}')">${t.approvalStatus==='Approved'?'Approved':'Approve'}</button>${isLeaveTicket(t)&&t.approvalStatus==='Approved'&&!t.returnToDutyDate?`<button class="mini-btn" onclick="markReturnToDuty('${esc(t.id)}')">Return to duty</button>`:''}<button class="mini-btn danger" onclick="removeEmployeeTicket('${esc(t.id)}')">Remove</button></td></tr>`;
  }).join('') || '<tr><td colspan="8" class="muted">No employee tickets yet.</td></tr>'}</tbody></table></div>`;
}
function employeeTicketApprovalBadge(t){
  if(ticketLeaveOverstay(t)) return `<span class="badge danger-badge">Approved / Overstay</span>`;
  return t.approvalStatus==='Approved' ? `<span class="badge green">Approved</span>` : `<span class="badge orange">Pending approval</span>`;
}
function requestApprovalPin(){
  const pin=prompt('Enter approval PIN');
  return pin === JOB_LOCK_PIN;
}
async function approveEmployeeTicket(ticketId){
  const t=(state.employeeTickets||[]).find(x=>x.id===ticketId);
  if(!t) return;
  if(t.approvalStatus==='Approved'){ toast('This ticket is already approved'); return; }
  if(isLeaveTicket(t)){
    const start = t.leaveStartDate || prompt('Leave start date (YYYY-MM-DD)', today());
    if(!start) return toast('Leave start date is required');
    const end = t.leaveEndDate || prompt('Leave end date (YYYY-MM-DD)', start);
    if(!end) return toast('Leave end date is required');
    if(!confirm(`Approve leave for ${t.employee || 'employee'} from ${start} to ${end}?`)) return;
    t.leaveStartDate=start; t.leaveEndDate=end;
  }
  if(!requestApprovalPin()){ toast('Wrong PIN. Ticket not approved.'); return; }
  t.approvalStatus='Approved';
  t.approvedAt=new Date().toISOString();
  t.approvedBy=state.user?.name || 'Sarab Al Madina Team';
  await saveEmployeeTickets();
  await logAction('Approved employee ticket','Employees',t.employee,t.category,state.user?.name);
  toast('Employee ticket approved');
  render();
}
async function saveEmployeeTicket(ev){
  ev.preventDefault();
  const existingId=$('employeeTicketId').value;
  const existing=(state.employeeTickets||[]).find(x=>x.id===existingId);
  let approvalStatus=$('employeeTicketApprovalStatus').value || 'Pending Approval';
  const category=$('employeeTicketCategory').value;
  const leaveStartDate = category==='Leave request' ? ($('employeeLeaveStartDate')?.value || '') : '';
  const leaveEndDate = category==='Leave request' ? ($('employeeLeaveEndDate')?.value || '') : '';
  const returnToDutyDate = category==='Leave request' ? ($('employeeReturnToDutyDate')?.value || existing?.returnToDutyDate || '') : '';
  if(category==='Leave request' && approvalStatus==='Approved'){
    if(!leaveStartDate || !leaveEndDate){ toast('Leave start date and end date are required before approval'); approvalStatus='Pending Approval'; }
    else if(!confirm(`Confirm leave dates: ${leaveStartDate} to ${leaveEndDate}?`)){ approvalStatus='Pending Approval'; }
  }
  if(approvalStatus==='Approved' && (!existing || existing.approvalStatus!=='Approved')){
    if(!requestApprovalPin()){ toast('Wrong PIN. Saved as Pending Approval.'); approvalStatus='Pending Approval'; }
  }
  const row={ id: existingId||id('et'), employee:$('employeeTicketEmployee').value.trim(), category, date:$('employeeTicketDate').value||today(), status:$('employeeTicketStatus').value, approvalStatus, approvedAt: approvalStatus==='Approved' ? (existing?.approvedAt || new Date().toISOString()) : '', approvedBy: approvalStatus==='Approved' ? (existing?.approvedBy || state.user?.name || 'Sarab Al Madina Team') : '', leaveStartDate, leaveEndDate, returnToDutyDate, returnedAt:returnToDutyDate ? (existing?.returnedAt || new Date().toISOString()) : '', notes:$('employeeTicketNotes').value.trim(), updatedAt:new Date().toISOString(), createdAt: existingId ? (existing?.createdAt||new Date().toISOString()) : new Date().toISOString() };
  if(!row.employee) return toast('Choose or type employee');
  const ix=(state.employeeTickets||[]).findIndex(x=>x.id===row.id); if(ix>=0) state.employeeTickets[ix]=row; else { if(!state.employeeTickets) state.employeeTickets=[]; state.employeeTickets.unshift(row); }
  await saveEmployeeTickets(); await logAction(existingId?'Updated employee ticket':'Added employee ticket','Employees',row.employee,row.category,state.user?.name); state.editingEmployeeTicketId=''; toast('Employee ticket saved'); render();
}
async function markReturnToDuty(ticketId){
  const t=(state.employeeTickets||[]).find(x=>x.id===ticketId);
  if(!t) return;
  const returned = prompt('Enter actual return to duty date (YYYY-MM-DD)', today());
  if(!returned) return;
  t.returnToDutyDate = returned;
  t.returnedAt = new Date().toISOString();
  t.status = 'Resolved';
  await saveEmployeeTickets();
  await logAction('Marked return to duty','Employees',t.employee,returned,state.user?.name);
  toast('Return to duty saved');
  render();
}
function editEmployeeTicket(id){ const t=(state.employeeTickets||[]).find(x=>x.id===id); if(!t) return; state.editingEmployeeTicketId=id; render(); }
async function removeEmployeeTicket(id){ const t=(state.employeeTickets||[]).find(x=>x.id===id); if(!t || !confirm('Remove this employee ticket?')) return; state.employeeTickets=state.employeeTickets.filter(x=>x.id!==id); if(USE_SUPABASE) await deleteRemoteRow('employee_tickets', id); await saveEmployeeTickets(); toast('Ticket removed'); render(); }
function exportEmployeeTicketsCSV(){ downloadCSV('sarab-employee-tickets.csv', [['Date','Employee','Category','Status','Approval Status','Approved At','Approved By','Leave Start Date','Leave End Date','Leave Duration','Return To Duty Date','Overstay Alert','Notes'], ...(state.employeeTickets||[]).map(t=>[t.date,t.employee,t.category,t.status,t.approvalStatus||'Pending Approval',t.approvedAt||'',t.approvedBy||'',t.leaveStartDate||'',t.leaveEndDate||'',leaveDurationText(t.leaveStartDate,t.leaveEndDate),t.returnToDutyDate||'',ticketLeaveOverstay(t)?`Yes - ${ticketOverstayDays(t)} day${ticketOverstayDays(t)===1?'':'s'}`:'No',t.notes])]); }

function salikRowForVehicle(v){ return (state.salik||[]).find(r=>r.vehicleId===v.id) || { id:`salik_${v.id}`, vehicleId:v.id, incurred:0, crossCharged:0 }; }
function salikHTML(){
  const q=String(state.salikSearch||'').toLowerCase();
  const vehicles=state.vehicles.filter(v=>!q||[v.plate,v.modelNumber,fleetClientName(v),v.status].join(' ').toLowerCase().includes(q));
  const totalIncurred=state.vehicles.reduce((a,v)=>a+Number(salikRowForVehicle(v).incurred||0),0);
  const totalCharged=state.vehicles.reduce((a,v)=>a+Number(salikRowForVehicle(v).crossCharged||0),0);
  return `<div class="page-head"><div><h1>Fleet</h1><p class="muted">SALIK incurred and cross-charged by vehicle.</p></div><div class="head-actions"><button class="btn light" onclick="exportSalikCSV()">${I('download','icon-sm')} Export CSV</button><button class="btn primary" onclick="saveSalikTable()">Save SALIK</button></div></div>${fleetSubnavHeader('salik')}<section class="panel"><div class="kpis"><section class="card compact-kpi"><b>${money(totalIncurred)}</b><span>Total SALIK incurred</span></section><section class="card compact-kpi"><b>${money(totalCharged)}</b><span>Total cross charged</span></section><section class="card compact-kpi"><b>${money(totalCharged-totalIncurred)}</b><span>Difference</span></section></div><input id="salikSearch" class="search-input" placeholder="Search plate, vehicle, client..." value="${esc(state.salikSearch||'')}" oninput="state.salikSearch=this.value; renderAndRefocus('salikSearch')">${salikTable(vehicles)}</section>`;
}
function salikTable(vehicles){ return `<div class="table-wrap"><table><tr><th>Plate</th><th>Vehicle</th><th>Client</th><th>Status</th><th>SALIK incurred</th><th>SALIK cross charged</th><th>Difference</th></tr><tbody>${vehicles.map(v=>{ const r=salikRowForVehicle(v); return `<tr><td><span class="fleet-plate">${esc(v.plate||'—')}</span></td><td><b>${esc(v.modelNumber||'Vehicle')}</b></td><td>${esc(fleetClientName(v))}</td><td>${esc(v.status||'—')}</td><td><input class="salik-input" data-vehicle="${esc(v.id)}" data-field="incurred" type="number" min="0" step="0.01" value="${Number(r.incurred||0)}" oninput="stageSalikInput(this)"></td><td><input class="salik-input" data-vehicle="${esc(v.id)}" data-field="crossCharged" type="number" min="0" step="0.01" value="${Number(r.crossCharged||0)}" oninput="stageSalikInput(this)"></td><td><b class="${Number(r.crossCharged||0)-Number(r.incurred||0)>=0?'green-text':'orange'}">${money(Number(r.crossCharged||0)-Number(r.incurred||0))}</b></td></tr>`; }).join('')}</tbody></table></div>`; }
function stageSalikInput(input){ const vehicleId=input.dataset.vehicle; const field=input.dataset.field; if(!state.salik) state.salik=[]; let r=state.salik.find(x=>x.vehicleId===vehicleId); if(!r){ r={id:`salik_${vehicleId}`,vehicleId,incurred:0,crossCharged:0}; state.salik.push(r); } r[field]=Number(input.value||0); r.updatedAt=new Date().toISOString(); }
async function saveSalikTable(){ await saveSalik(); await logAction('Saved SALIK table','Fleet','SALIK','Updated incurred/cross-charged values',state.user?.name); toast('SALIK saved'); render(); }
function exportSalikCSV(){ const rows=[['Plate','Vehicle','Client','Status','SALIK Incurred AED','SALIK Cross Charged AED','Difference AED']]; state.vehicles.forEach(v=>{ const r=salikRowForVehicle(v); rows.push([v.plate||'',v.modelNumber||'',fleetClientName(v),v.status||'',Number(r.incurred||0),Number(r.crossCharged||0),Number(r.crossCharged||0)-Number(r.incurred||0)]); }); downloadCSV('sarab-salik.csv', rows); }

function settingsHTML(){ return `<div class="page-head"><div><h1>Settings</h1><p class="muted">Settings are currently disabled for garage staff.</p></div></div><section class="card settings-card settings-disabled" aria-disabled="true"><div class="disabled-badge">Disabled</div><h2>Settings locked</h2><p class="muted">This section is greyed out to avoid accidental changes. Only the app owner should update system settings from the code or Supabase dashboard.</p><div class="settings-placeholder"><p><b>Current user</b></p><p>${esc(state.user?.name||'Sarab Al Madina Team')}<br>${esc(state.user?.email||'')}</p><p>Storage mode: ${USE_SUPABASE ? 'Supabase shared database' : 'localStorage local demo'}.</p></div></section>`; }

function toggleFleetPermitFields(){ const wrap=$('fleetPermitFields'); const active=$('fleetHasActivePermit'); if(wrap && active) wrap.classList.toggle('hidden', !active.checked); }
function toggleFleetVendorField(){
  const wrap = $('fleetVendorWrap');
  if(!wrap || !$('fleetOwnership')) return;
  const isOutsource = $('fleetOwnership').value === 'Outsource';
  const isOffHire = $('fleetStatus')?.value === 'Off-hire';
  wrap.classList.toggle('hidden', !isOutsource);
  if(!isOutsource){
    if($('fleetVendorName')) $('fleetVendorName').value = '';
    if($('fleetOutsourceStartDate')) $('fleetOutsourceStartDate').value = '';
    if($('fleetOutsourceEndDate')) $('fleetOutsourceEndDate').value = '';
  }
  if($('fleetRentRate')){
    if(isOffHire) $('fleetRentRate').value = 0;
    $('fleetRentRate').disabled = isOffHire;
  }
  if($('fleetClientRate')){
    if(isOffHire) $('fleetClientRate').value = 0;
    $('fleetClientRate').disabled = isOffHire;
  }
  if($('fleetRegisteredCompany')){
    $('fleetRegisteredCompany').disabled = isOutsource;
    $('fleetRegisteredCompany').closest('label')?.classList.toggle('field-disabled', isOutsource);
    if($('fleetRegisteredCompanyNote')) $('fleetRegisteredCompanyNote').classList.toggle('hidden', !isOutsource);
    if(isOutsource) $('fleetRegisteredCompany').value = '';
    else if(!$('fleetRegisteredCompany').value) $('fleetRegisteredCompany').value = 'Garage';
  }
  if($('fleetRegistrationExpiryWrap')){
    $('fleetRegistrationExpiryWrap').classList.toggle('hidden', isOutsource);
    $('fleetRegistrationExpiryWrap').classList.toggle('field-disabled', isOutsource);
    if(isOutsource && $('fleetRegistrationExpiryDate')) $('fleetRegistrationExpiryDate').value='';
  }
}
function renderAndRefocus(inputId, cursorOverride=null){
  const el=$(inputId);
  const cursor=cursorOverride !== null ? cursorOverride : (el && typeof el.selectionStart==='number' ? el.selectionStart : null);
  const value = el ? el.value : '';
  render();
  const restore = () => {
    const next=$(inputId);
    if(next){
      next.focus({ preventScroll:true });
      if(value !== undefined && next.value !== value) next.value = value;
      if(cursor !== null && typeof next.setSelectionRange==='function') next.setSelectionRange(cursor, cursor);
    }
  };
  requestAnimationFrame(restore);
  setTimeout(restore, 25);
}
function bindPageEvents(){
  if($('searchInput')) $('searchInput').oninput=e=>{state.filters.q=e.target.value; renderInventoryResults();};
  if($('categoryFilter')) $('categoryFilter').onchange=e=>{state.filters.category=e.target.value; renderInventoryResults();};
  if($('stockFilter')) $('stockFilter').onchange=e=>{state.filters.stock=e.target.value; renderInventoryResults();};
  if($('reportMonth')) $('reportMonth').onchange=e=>{state.reportMonth=e.target.value; render();};
  if($('clientSearch')) $('clientSearch').oninput=e=>{state.clientFilter=e.target.value; render();};
  if($('expirySearch')) $('expirySearch').oninput=e=>{state.expirySearch=e.target.value; renderAndRefocus('expirySearch', e.target.selectionStart);};
  if($('expiryModule')) $('expiryModule').onchange=e=>{state.expiryModule=e.target.value; render();};
  if($('summarySearch')) $('summarySearch').oninput=e=>{state.summarySearch=e.target.value; renderAndRefocus('summarySearch', e.target.selectionStart);};
  if($('summaryClientFilter')) $('summaryClientFilter').onchange=e=>{state.summaryClient=e.target.value; render();};
  if($('summaryOwnershipFilter')) $('summaryOwnershipFilter').onchange=e=>{state.summaryOwnership=e.target.value; render();};
  if($('summarySortFilter')) $('summarySortFilter').onchange=e=>{state.summarySort=e.target.value; render();};
  if($('replacementClient')) $('replacementClient').onchange=e=>{state.replacementClient=e.target.value; render();};
  if($('replacementVehicleSearch')) $('replacementVehicleSearch').oninput=e=>{state.replacementVehicleSearch=e.target.value; renderAndRefocus('replacementVehicleSearch', e.target.selectionStart);};
  if($('replacementMonth')) $('replacementMonth').onchange=e=>{state.replacementMonth=e.target.value; render();};
  if($('vehicleHistorySearch')) $('vehicleHistorySearch').oninput=e=>{state.vehicleHistorySearch=e.target.value; renderVehicleHistoryResults();};
  if($('jobOverviewSearch')) $('jobOverviewSearch').oninput=e=>{state.jobOverviewSearch=e.target.value; renderAndRefocus('jobOverviewSearch', e.target.selectionStart);};
  if($('jobOverviewStatus')) $('jobOverviewStatus').onchange=e=>{state.jobOverviewStatus=e.target.value; render();};
  if($('jobOverviewStaff')) $('jobOverviewStaff').onchange=e=>{state.jobOverviewStaff=e.target.value; render();};
  if($('jobOverviewDate')) $('jobOverviewDate').onchange=e=>{state.jobOverviewDate=e.target.value; render();};
  document.querySelectorAll('.rep-cell').forEach(cell=>{ cell.oninput=()=>stageReplacementCellInput(cell); cell.onchange=()=>pickReplacementFromFleet(cell); });

  if($('clientForm')) $('clientForm').onsubmit=saveClient;
  if($('activitySearch')) $('activitySearch').oninput=e=>{state.activityQuery=e.target.value; render();};
  if($('activitySection')) $('activitySection').onchange=e=>{state.activitySection=e.target.value; render();};
  if($('plateHistorySearch')) $('plateHistorySearch').oninput=e=>{state.vehicleHistoryQuery=e.target.value; renderPlateHistoryResults();};
  if($('ticketSearch')) $('ticketSearch').oninput=e=>{state.ticketSearch=e.target.value; renderTicketListOnly();};
  if($('ticketStatusFilter')) $('ticketStatusFilter').onchange=e=>{state.ticketStatus=e.target.value; renderTicketListOnly();};
  if($('ticketPriorityFilter')) $('ticketPriorityFilter').onchange=e=>{state.ticketPriority=e.target.value; renderTicketListOnly();};
  if($('ticketForm')){ $('ticketForm').onsubmit=saveTicket; if($('ticketFleetSearch')) { $('ticketFleetSearch').oninput=e=>fillTicketFromFleet(e.target.value); $('ticketFleetSearch').onchange=e=>fillTicketFromFleet(e.target.value); } }
  if($('fleetForm')){ $('fleetForm').onsubmit=saveFleetVehicle; if($('fleetSearch')) $('fleetSearch').oninput=e=>{state.fleetFilter=e.target.value; renderFleetResults();}; if($('fleetOwnership')) $('fleetOwnership').onchange=toggleFleetVendorField; if($('fleetHasActivePermit')) $('fleetHasActivePermit').onchange=toggleFleetPermitFields; if($('fleetStatus')) $('fleetStatus').onchange=toggleFleetVendorField; if($('fleetModel')) $('fleetModel').onblur=()=>{ const y=extractYearFromModel($('fleetModel').value); if(y && !$('fleetYear').value){ $('fleetYear').value=y; $('fleetModel').value=modelWithoutYear($('fleetModel').value); } }; toggleFleetVendorField(); }
  if($('jobForm')){ $('addLineBtn').onclick=()=>addPartLine(); $('addCustomBtn').onclick=()=>addCustomCharge(); if($('newJobModeBtn')) $('newJobModeBtn').onclick=startNewJobCard; if($('jobEditSelect')) $('jobEditSelect').onchange=e=>{ if(e.target.value) loadJobCardForEdit(e.target.value); }; if($('jobDate')) $('jobDate').onchange=()=>{ if(!$('jobEditId').value) $('jobCardPreview').textContent=nextJobCardId($('jobDate').value || today()); }; $('jobLabour').oninput=updateJobSummary; $('jobLabourHours').oninput=updateJobSummary; if($('jobFleetSelect')) $('jobFleetSelect').onchange=e=>{ if(e.target.value) fillJobFromFleet(e.target.value); }; if($('jobDoneBySelect')) $('jobDoneBySelect').onchange=e=>{ if(e.target.value) addStaffName(e.target.value); }; if($('jobPlateCode')) $('jobPlateCode').oninput=updateFleetPlateSuggestions; if($('jobPlateNumber')) $('jobPlateNumber').oninput=updateFleetPlateSuggestions; addPartLine(); addCustomCharge('', 0); updateFleetPlateSuggestions(); updateJobSummary(); $('jobForm').onsubmit=saveJob; }
}
function addPartLine(selected='', qty=1, manualName='', manualPrice=0){
  const wrap=$('partLines');
  if(!wrap) return;
  const isManual = selected === '__manual__' || (!selected && manualName);
  const selectedPart = state.parts.find(p=>p.id===selected);
  const div=document.createElement('div');
  div.className='part-line';
  div.innerHTML=`<label>Part<select class="linePart"><option value="">Choose part...</option><option value="__manual__" ${isManual?'selected':''}>Manual part / not in inventory</option>${state.parts.map(p=>`<option value="${p.id}" ${p.id===selected?'selected':''}>${esc(p.name)} — stock ${p.qty} — selling ${money(p.price)}</option>`).join('')}</select><small class="line-price-note">${selectedPart ? `Selling price: ${money(selectedPart.price)} each` : ''}</small></label><label>Qty<input class="lineQty" type="number" min="1" step="1" value="${qty || 1}"></label><button type="button" class="btn danger">Remove</button><div class="manual-part-fields ${isManual?'':'hidden'}"><label>Manual part name<input class="manualPartName" placeholder="Part name" value="${esc(manualName || '')}"></label><label>Selling price AED<input class="manualPartPrice" type="number" min="0" step="0.01" placeholder="0" value="${manualPrice || ''}"></label></div>`;
  const select = div.querySelector('.linePart');
  const qtyInput = div.querySelector('.lineQty');
  const note = div.querySelector('.line-price-note');
  const manualBox = div.querySelector('.manual-part-fields');
  const refreshLine = () => {
    const isManualNow = select.value === '__manual__';
    manualBox.classList.toggle('hidden', !isManualNow);
    const part = state.parts.find(p=>p.id===select.value);
    const q = Number(qtyInput.value || 0);
    if(isManualNow){
      const manualPrice = Number(div.querySelector('.manualPartPrice')?.value || 0);
      note.textContent = manualPrice ? `Manual selling price: ${money(manualPrice)} each${q > 1 ? ` · Line total: ${money(manualPrice * q)}` : ''}` : 'Manual part will not reduce inventory stock.';
    } else {
      note.textContent = part ? `Selling price: ${money(part.price)} each${q > 1 ? ` · Line total: ${money(Number(part.price || 0) * q)}` : ''}` : '';
    }
    updateJobSummary();
  };
  div.querySelector('button').onclick=()=>{div.remove(); updateJobSummary();};
  select.onchange=refreshLine;
  qtyInput.oninput=refreshLine;
  div.querySelectorAll('.manualPartName,.manualPartPrice').forEach(x=>x.oninput=refreshLine);
  wrap.appendChild(div);
  refreshLine();
}
function addCustomCharge(name='', amount=0){ const wrap=$('customCharges'); if(!wrap) return; const div=document.createElement('div'); div.className='custom-line'; div.innerHTML=`<label>Charge name<input class="customName" placeholder="Car wash" value="${esc(name)}"></label><label>Amount AED<input class="customAmount" type="number" min="0" step="0.01" placeholder="20" value="${amount || ''}"></label><button type="button" class="btn danger">Remove</button>`; div.querySelector('button').onclick=()=>{div.remove(); updateJobSummary();}; div.querySelectorAll('input').forEach(x=>x.oninput=updateJobSummary); wrap.appendChild(div); updateJobSummary(); }
function getJobLines(){ return [...document.querySelectorAll('.part-line')].map(row=>{ const selected=row.querySelector('.linePart').value; const qty=Number(row.querySelector('.lineQty').value || 0); if(selected==='__manual__'){ const name=row.querySelector('.manualPartName')?.value.trim(); const price=Number(row.querySelector('.manualPartPrice')?.value || 0); return name && qty>0 ? {partId:'manual_'+id('line'), name, sku:'Manual', qty, price, manual:true} : null; } const p=state.parts.find(x=>x.id===selected); return p?{partId:p.id,name:p.name,sku:p.sku,qty,price:Number(p.price)}:null; }).filter(x=>x&&x.qty>0); }
function getCustomCharges(){ return [...document.querySelectorAll('.custom-line')].map(row=>({ name: row.querySelector('.customName').value.trim(), amount: Number(row.querySelector('.customAmount').value || 0) })).filter(x=>x.name && x.amount>0); }
function updateJobSummary(){ const lines=getJobLines(); const customCharges=getCustomCharges(); const partsTotal=lines.reduce((a,l)=>a+(l.qty*l.price),0); const customTotal=customCharges.reduce((a,c)=>a+c.amount,0); const labour=Number($('jobLabour')?.value||0); const hours=Number($('jobLabourHours')?.value||0); if($('jobSummary')) $('jobSummary').innerHTML=`<span>Parts total: ${money(partsTotal)}</span><span>Labor hours: ${hours || 0}</span><span>Labor charge: ${money(labour)}</span><span>Custom charges: ${money(customTotal)}</span><span>Job total: ${money(partsTotal+labour+customTotal)}</span>`; }

function startNewJobCard(){
  if(state.view !== 'job'){ state.view='job'; render(); return; }
  if($('jobForm')){
    $('jobForm').reset();
    $('jobEditId').value='';
    const existingLockNotice = document.getElementById('jobLockNotice');
    if(existingLockNotice) existingLockNotice.remove();
    $('jobDate').value=today();
    if($('jobDoneBySelect')) $('jobDoneBySelect').value = defaultStaffName();
    $('jobCardPreview').textContent=nextJobCardId($('jobDate').value || today());
    $('partLines').innerHTML='';
    $('customCharges').innerHTML='';
    addPartLine();
    addCustomCharge('',0);
    updateFleetPlateSuggestions();
    updateJobSummary();
    toast('New job card ready');
  }
}
function setJobFormFromJob(job){
  if(!job) return;
  const plate = splitPlate(job.plate || '');
  $('jobEditId').value = job.id;
  $('jobCardPreview').textContent = ensureJobCardId(job);
  const existingLockNotice = document.getElementById('jobLockNotice');
  if(existingLockNotice) existingLockNotice.remove();
  const formEl = $('jobForm');
  if(formEl) formEl.classList.toggle('job-locked-form', isJobLocked(job));
  if(isJobLocked(job)){
    const notice=document.createElement('div');
    notice.id='jobLockNotice';
    notice.className='lock-notice unlocked';
    notice.innerHTML='<div><b>Completed job card is locked</b><span>Any edit, delete, or status change requires override PIN 3100.</span></div>';
    $('jobForm')?.prepend(notice);
  }
  $('jobCustomer').value = job.customer || '';
  $('jobPhone').value = job.phone || '';
  $('jobCar').value = job.car || '';
  $('jobPlateCode').value = plate.code || '';
  $('jobPlateNumber').value = plate.license || '';
  $('jobDate').value = job.date || today();
  $('jobStatus').value = jobStatus(job);
  if($('jobDoneBySelect')) $('jobDoneBySelect').value = job.doneBy || '';
  $('jobDescription').value = job.description || '';
  $('jobLabour').value = Number(job.labour || 0);
  $('jobLabourHours').value = Number(job.labourHours || 0);
  $('partLines').innerHTML = '';
  (job.lines && job.lines.length ? job.lines : []).forEach(l => addPartLine(l.manual ? '__manual__' : l.partId, l.qty, l.manual ? l.name : '', l.manual ? l.price : 0));
  if(!job.lines || !job.lines.length) addPartLine();
  $('customCharges').innerHTML = '';
  (job.customCharges && job.customCharges.length ? job.customCharges : []).forEach(c => addCustomCharge(c.name, c.amount));
  if(!job.customCharges || !job.customCharges.length) addCustomCharge('',0);
  updateFleetPlateSuggestions();
  updateJobSummary();
}
function loadJobCardForEdit(jobId){
  const job = state.jobs.find(j => j.id === jobId);
  if(!job) return toast('Job card not found');
  if(!requireJobOverride(job, 'edit it')) return;
  if(state.view !== 'job'){
    state.view='job';
    document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active', b.dataset.view==='job')); document.querySelectorAll('.subnav').forEach(b=>b.classList.toggle('active', b.dataset.view==='job'));
    render();
    setTimeout(()=>setJobFormFromJob(job), 0);
  } else {
    setJobFormFromJob(job);
  }
  toast(`Editing ${ensureJobCardId(job)}`);
}
function oldQtyForPart(job, partId){
  return (job?.lines || []).filter(l => l.partId === partId).reduce((a,l)=>a+Number(l.qty||0),0);
}
async function saveJob(e){
  e.preventDefault();
  const editId = $('jobEditId')?.value || '';
  const oldJob = editId ? state.jobs.find(j => j.id === editId) : null;
  if(oldJob && isJobLocked(oldJob) && !requireJobOverride(oldJob, 'save changes')) return;
  const lines=getJobLines();
  const customCharges=getCustomCharges();
  for(const l of lines){
    if(l.manual) continue;
    const p=state.parts.find(x=>x.id===l.partId);
    const available = Number(p?.qty || 0) + oldQtyForPart(oldJob, l.partId);
    if(!p || available < Number(l.qty)) return toast(`Not enough stock for ${l.name}`);
  }
  if(oldJob){
    (oldJob.lines || []).forEach(l=>{ const p=state.parts.find(x=>x.id===l.partId); if(p) p.qty=Number(p.qty)+Number(l.qty||0); });
  }
  lines.forEach(l=>{ if(l.manual) return; const p=state.parts.find(x=>x.id===l.partId); if(!p) return; p.qty=Number(p.qty)-Number(l.qty); if(Number(p.qty)===0 && typeof p.ordered !== 'boolean') p.ordered=false; });
  const labour=Number($('jobLabour').value||0);
  const labourHours=Number($('jobLabourHours').value||0);
  const partsTotal=lines.reduce((a,l)=>a+(l.qty*l.price),0);
  const customTotal=customCharges.reduce((a,c)=>a+c.amount,0);
  const total=partsTotal+labour+customTotal;
  const selectedDoneBy = $('jobDoneBySelect')?.value || '';
  if(!selectedDoneBy) return toast('Choose or add a staff name first');
  const doneByName = await addStaffName(selectedDoneBy);
  const job={
    id: oldJob?.id || id('j'),
    jobCardId: oldJob?.jobCardId || nextJobCardId($('jobDate').value || today()),
    customer:$('jobCustomer').value.trim() || 'Walk-in',
    phone:$('jobPhone').value.trim(),
    car:$('jobCar').value.trim(),
    plate: combinePlate($('jobPlateCode').value, $('jobPlateNumber').value),
    date:$('jobDate').value,
    status:$('jobStatus').value,
    labour,
    labourHours,
    customCharges,
    description:$('jobDescription').value.trim(),
    doneBy: doneByName,
    lines,
    total,
    createdAt: oldJob?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(oldJob){
    const idx=state.jobs.findIndex(j=>j.id===oldJob.id);
    state.jobs[idx]=job;
  } else {
    state.jobs.unshift(job);
  }
  await saveJobs();
  await saveParts();
  await logAction(oldJob ? 'Updated job card' : 'Created job card', 'Job Card', job.jobCardId, `${job.plate || ''} · ${job.description || 'Job card'} · ${lines.length} part line${lines.length===1?'':'s'}`, job.doneBy);
  toast(job.status === 'Done Completed' ? 'Job card saved and locked because status is Done Completed.' : (oldJob ? 'Job card updated. Inventory adjusted.' : 'Job card saved. Inventory updated.'));
  go('used');
}

async function deleteJob(jobId){ const job=state.jobs.find(j=>j.id===jobId); if(job && !requireJobOverride(job, 'delete it')) return; if(!confirm('Delete this job and return the parts back to inventory?')) return; if(job) job.lines.forEach(l=>{ const p=state.parts.find(x=>x.id===l.partId); if(p) p.qty=Number(p.qty)+Number(l.qty); }); state.jobs=state.jobs.filter(j=>j.id!==jobId); await saveJobs(); await saveParts(); await deleteRemoteRow('jobs', jobId); if(job) await logAction('Deleted job card', 'Job Card', ensureJobCardId(job), `${job.plate || ''} · returned stock`, job.doneBy || state.user?.name); toast('Job deleted and stock returned'); render(); }
function viewJob(jobId){ const j=state.jobs.find(x=>x.id===jobId); if(!j) return; $('jobDialogTitle').textContent=`${ensureJobCardId(j)} · ${j.plate} · ${j.car}`; $('jobDialogBody').innerHTML=`<div class="part-detail"><p><b>Job Card ID:</b> ${esc(ensureJobCardId(j))}</p><p><b>Date:</b> ${esc(j.date)}</p><p><b>Customer:</b> ${esc(j.customer||'N/A')} ${j.phone?` · ${esc(j.phone)}`:''}</p><p><b>Job:</b> ${esc(j.description)}</p><p><b>Status:</b></p><div class="status-inline modal-status-edit">${statusPill(jobStatus(j))}${statusSelect(j.id, jobStatus(j))}</div><p><b>Done by:</b> ${esc(j.doneBy || '—')}</p><p><b>Parts used:</b></p>${j.lines.length?`<div class="table-wrap"><table><thead><tr><th>Part</th><th>Serial Number</th><th>Qty</th><th>Price</th></tr></thead><tbody>${j.lines.map(l=>`<tr><td>${esc(l.name)}</td><td>${esc(l.sku)}</td><td>${l.qty}</td><td>${money(l.price)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No parts used.</p>'}${(j.customCharges||[]).length?`<p><b>Custom charges:</b></p><div class="table-wrap"><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>${(j.customCharges||[]).map(c=>`<tr><td>${esc(c.name)}</td><td>${money(c.amount)}</td></tr>`).join('')}</tbody></table></div>`:''}<button type="button" class="mini-btn" onclick="loadJobCardForEdit('${j.id}'); closeJobDialog();">${isJobLocked(j) && !hasJobOverride(j.id) ? 'Unlock / Edit Job Card' : 'Edit Job Card'}</button><div class="summary-box"><span>Labor hours: ${Number(j.labourHours||0)}</span><span>Labor charge: ${money(j.labour)}</span><span>Custom charges: ${money((j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0))}</span><span>Total: ${money(j.total)}</span></div></div>`; $('jobDialog').showModal(); }
function closeJobDialog(){ $('jobDialog').close(); }
function viewPartUsage(partId){ const p=state.parts.find(x=>x.id===partId); const jobs=state.jobs.filter(j=>j.lines.some(l=>l.partId===partId)); $('jobDialogTitle').textContent=`Where used: ${p?.name || 'Part'}`; $('jobDialogBody').innerHTML=jobs.length?`<div class="table-wrap"><table><thead><tr><th>Job ID</th><th>Date</th><th>Plate</th><th>Car</th><th>Job</th><th>Status</th><th>Qty</th></tr></thead><tbody>${jobs.map(j=>{const line=j.lines.find(l=>l.partId===partId); return `<tr><td>${esc(j.date)}</td><td>${esc(j.plate)}</td><td>${esc(j.car)}</td><td>${esc(j.description)}</td><td>${statusPill(jobStatus(j))}${statusSelect(j.id, jobStatus(j))}</td><td>${line.qty}</td></tr>`}).join('')}</tbody></table></div>`:'<div class="empty">This part has not been used in any job yet.</div>'; $('jobDialog').showModal(); }

function openPartDialog(partId=''){ const p=state.parts.find(x=>x.id===partId); $('partDialogTitle').textContent=p?'Edit Part':'Add Part'; $('partId').value=p?.id||''; $('partName').value=p?.name||''; $('partSku').value=p?.sku||nextSerialNumber(); $('partCategory').value=p?.category||'Engine'; $('partLocation').value=p?.location||''; $('partQty').value=p?.qty??0; $('partThreshold').value=p?.threshold??5; $('partCost').value=p?.cost??0; $('partPrice').value=p?.price??0; $('partSupplier').value=p?.supplier||''; $('partFits').value=p?.fits||''; $('partDialog').showModal(); }
function closePartDialog(){ $('partDialog').close(); }
async function savePartFromForm(e){
  e.preventDefault();
  const existing=state.parts.find(p=>p.id===$('partId').value);
  const qty=Number($('partQty').value);
  const part={ id:$('partId').value || id('p'), name:$('partName').value.trim(), sku:$('partSku').value.trim(), category:$('partCategory').value, location:$('partLocation').value.trim(), qty, threshold:Number($('partThreshold').value), cost:Number($('partCost').value), price:Number($('partPrice').value), supplier:$('partSupplier').value.trim(), fits:$('partFits').value.trim(), ordered: qty===0 ? Boolean(existing?.ordered) : false, createdAt: existing?.createdAt || new Date().toISOString() };
  const duplicate = inventoryDuplicate(part);
  if(duplicate) return toast(`Duplicate inventory blocked: ${duplicate.name} / ${duplicate.sku} already exists`);
  const idx=state.parts.findIndex(p=>p.id===part.id);
  if(idx>=0) state.parts[idx]=part; else state.parts.unshift(part);
  await saveParts();
  await logAction(existing ? 'Updated part' : 'Created part', 'Inventory', part.sku, `${part.name} · stock ${part.qty}`, state.user?.name);
  closePartDialog();
  toast('Part saved');
  render();
}
function openRestockDialog(partId=''){ $('restockPart').innerHTML=state.parts.map(p=>`<option value="${p.id}" ${p.id===partId?'selected':''}>${esc(p.name)} — stock ${p.qty}</option>`).join(''); $('restockQty').value=1; $('restockDialog').showModal(); }
function closeRestockDialog(){ $('restockDialog').close(); }
async function saveRestock(e){ e.preventDefault(); const qtyAdded = Number($('restockQty').value||0); const p=state.parts.find(x=>x.id===$('restockPart').value); if(p){ p.qty=Number(p.qty)+qtyAdded; if(Number(p.qty)>0) p.ordered=false; } await saveParts(); if(p) await logAction('Restocked part', 'Inventory', p.sku, `${p.name} +${qtyAdded}`, state.user?.name); closeRestockDialog(); toast('Stock added'); render(); }
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
  const rows=[['Job Card ID','Date','Status','Done By','Customer','Phone','Plate','Car','Job','Part','Qty','Item Price AED','Parts Line Total AED','Custom Charge','Custom Charge AED','Labor Hours','Labor Charge AED','Total AED']];

  let grandPartsLineTotal = 0;
  let grandCustomTotal = 0;
  let grandLaborHours = 0;
  let grandLaborCharge = 0;
  let grandTotal = 0;

  exactPlateJobs.forEach(j=>{
    const customNames=(j.customCharges||[]).map(c=>c.name).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    const laborHours=Number(j.labourHours||0);
    const laborCharge=Number(j.labour||0);
    const jobTotal=Number(j.total||0);

    grandCustomTotal += customTotal;
    grandLaborHours += laborHours;
    grandLaborCharge += laborCharge;
    grandTotal += jobTotal;

    if(j.lines.length){
      j.lines.forEach((l, index)=>{
        const lineTotal = Number(l.qty||0)*Number(l.price||0);
        grandPartsLineTotal += lineTotal;
        rows.push([
          ensureJobCardId(j),
          j.date,
          jobStatus(j),
          j.doneBy||'',
          j.customer,
          j.phone,
          j.plate,
          j.car,
          j.description,
          l.name,
          l.qty,
          l.price,
          lineTotal,
          index===0 ? customNames : '',
          index===0 ? customTotal : '',
          index===0 ? laborHours : '',
          index===0 ? laborCharge : '',
          index===0 ? jobTotal : ''
        ]);
      });
    } else {
      rows.push([ensureJobCardId(j),j.date,jobStatus(j),j.doneBy||'',j.customer,j.phone,j.plate,j.car,j.description,'',0,0,0,customNames,customTotal,laborHours,laborCharge,jobTotal]);
    }
  });

  rows.push(['TOTAL','','','','','','','','','','','', grandPartsLineTotal, '', grandCustomTotal, grandLaborHours, grandLaborCharge, grandTotal]);
  downloadCSV(`sarab-plate-history-${plateQuery.replace(/\s+/g,'-')}.csv`, rows);
}

function cleanCSVText(v){
  let s = String(v ?? '');
  // Clean common mojibake/non-breaking-space characters that Windows Excel can show as Â/Ã/Ä.
  s = s.replace(/ /g, ' ');
  s = s.replace(/TOYOT[ÃÂÄÀÁ]/gi, m => m[0]===m[0].toUpperCase() ? 'TOYOTA' : 'Toyota');
  s = s.replace(/MITSUBISH[ÃÂÄÀÁ]/gi, m => m[0]===m[0].toUpperCase() ? 'MITSUBISHI' : 'Mitsubishi');
  s = s.replace(/NISS[ÃÂÄÀÁ]N/gi, m => m[0]===m[0].toUpperCase() ? 'NISSAN' : 'Nissan');
  s = s.replace(/[ÂÃÄ]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}
function csvEscape(v){ return `"${cleanCSVText(v).replace(/"/g,'""')}"`; }
function downloadCSV(name, rows){ const csv='sep=,\r\n'+rows.map(r=>r.map(csvEscape).join(',')).join('\r\n'); const blob=new Blob(['\ufeff', csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

function exportDashboardInventory(){
  const rows=[['Part Name','Serial Number','Category','Stock','Ordered?','Low Stock Alert','Location','Cost Value AED','Last Used']];
  state.parts.slice(0,5).forEach(p=>rows.push([p.name,p.sku,p.category,p.qty,p.ordered?'Yes':'No',p.threshold,p.location,Number(p.qty||0)*Number(p.cost||0),lastUsedPlain(p.id)]));
  downloadCSV('sarab-dashboard-inventory-overview.csv', rows);
}
function exportDashboardJobs(){
  const rows=[['Job Card ID','Date','Status','Done By','Plate','Car','Customer','Job','Parts Used','Custom Charges AED','Labor Hours','Labor Charge AED','Total AED']];
  state.jobs.slice(0,4).forEach(j=>{
    const parts=(j.lines||[]).map(l=>`${l.name} x ${l.qty}`).join('; ');
    const custom=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    rows.push([ensureJobCardId(j),j.date,jobStatus(j),j.doneBy||'',j.plate,j.car,j.customer,j.description,parts,custom,j.labourHours||0,j.labour||0,j.total||0]);
  });
  downloadCSV('sarab-dashboard-recent-jobs.csv', rows);
}
function lastUsedPlain(partId){ const j=state.jobs.find(job=>job.lines.some(l=>l.partId===partId)); return j ? j.date : 'Never'; }

function exportInventory(){ downloadCSV('sarab-inventory.csv', [['Part Name','Serial Number','Category','Stock','Ordered?','Low Stock Alert','Location','Supplier','Fits','Buying Cost AED','Selling Price AED','Inventory Cost Value AED'], ...state.parts.map(p=>[p.name,p.sku,p.category,p.qty,p.ordered?'Yes':'No',p.threshold,p.location,p.supplier,p.fits,p.cost,p.price,Number(p.qty)*Number(p.cost)])]); }

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
        const sku=firstValue(obj,['Serial Number','SKU','Part SKU','Part Serial Number','Code']);
        if(!name || !sku){ skipped++; return; }
        const qty=toNumber(firstValue(obj,['Stock','Stock Quantity','Qty','Quantity']),0);
        const existing=state.parts.find(p=>duplicateKey(p.sku)===duplicateKey(sku) || duplicateKey(p.name)===duplicateKey(name));
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
  const rows=[['Job Card ID','Date','Status','Done By','Customer','Phone','Plate','Car','Job','Part','Qty','Item Price AED','Parts Line Total AED','Custom Charge','Custom Charge AED','Labor Hours','Labor Charge AED','Total AED']];
  state.jobs.forEach(j=>{
    const customNames=(j.customCharges||[]).map(c=>c.name).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines.length){
      j.lines.forEach(l=>rows.push([ensureJobCardId(j),j.date,jobStatus(j),j.doneBy||'',j.customer,j.phone,j.plate,j.car,j.description,l.name,l.qty,l.price,Number(l.qty)*Number(l.price||0),customNames,customTotal,j.labourHours||0,j.labour,j.total]));
    } else {
      rows.push([ensureJobCardId(j),j.date,jobStatus(j),j.doneBy||'',j.customer,j.phone,j.plate,j.car,j.description,'',0,0,0,customNames,customTotal,j.labourHours||0,j.labour,j.total]);
    }
  });
  downloadCSV('sarab-jobs.csv', rows);
}
function exportUsage(){
  const rows=[['Job Card ID','Date','Status','Done By','Plate','Car','Job','Part','Serial Number','Qty','Item Price AED','Custom Charge','Custom Charge AED','Labor Charge AED','Total AED']];
  state.jobs.forEach(j=>{
    const customNames=(j.customCharges||[]).map(c=>c.name).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines.length){
      j.lines.forEach(l=>rows.push([ensureJobCardId(j),j.date,jobStatus(j),j.doneBy||'',j.plate,j.car,j.description,l.name,l.sku,l.qty,l.price,customNames,customTotal,j.labour,j.total]));
    } else {
      rows.push([ensureJobCardId(j),j.date,jobStatus(j),j.doneBy||'',j.plate,j.car,j.description,'','',0,0,customNames,customTotal,j.labour,j.total]);
    }
  });
  downloadCSV('sarab-parts-used.csv', rows);
}

function exportMonthlyReport(){
  const month = state.reportMonth || today().slice(0,7);
  const rows=[['Job Card ID','Date','Status','Done By','Plate','Car','Job','Part','Qty','Item Price AED','Custom Charge','Custom Charge AED','Labor Charge AED','Total AED']];
  state.jobs.filter(j => (j.date || '').slice(0,7) === month).forEach(j=>{
    const customNames=(j.customCharges||[]).map(c=>c.name).join('; ');
    const customTotal=(j.customCharges||[]).reduce((a,c)=>a+Number(c.amount||0),0);
    if(j.lines.length){ j.lines.forEach(l=>rows.push([ensureJobCardId(j),j.date,jobStatus(j),j.doneBy||'',j.plate,j.car,j.description,l.name,l.qty,l.price,customNames,customTotal,j.labour,j.total])); }
    else rows.push([ensureJobCardId(j),j.date,jobStatus(j),j.doneBy||'',j.plate,j.car,j.description,'',0,0,customNames,customTotal,j.labour,j.total]);
  });
  downloadCSV(`sarab-monthly-report-${month}.csv`, rows);
}
function exportActivity(){
  const rows=[['Date','Time','Staff','Action','Section','Reference','Details']];
  state.logs.forEach(log=>{
    const d = new Date(log.timestamp);
    rows.push([d.toLocaleDateString(), d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), log.staff || '', log.action || '', log.section || '', log.reference || '', log.details || '']);
  });
  downloadCSV('sarab-activity-log.csv', rows);
}

async function resetDemo(){ if(!confirm('Reset all demo data?')) return; if(USE_SUPABASE){ await sb.from('parts').delete().neq('id','__never__'); await sb.from('jobs').delete().neq('id','__never__'); await sb.from('vehicles').delete().neq('id','__never__'); try { await sb.from('staff').delete().neq('id','__never__'); } catch(e) { console.warn(e); } try { await sb.from('logs').delete().neq('id','__never__'); } catch(e) { console.warn(e); } try { await sb.from('tickets').delete().neq('id','__never__'); } catch(e) { console.warn(e); } state.parts=seedParts.map(p=>({...p})); state.jobs=seedJobs.map(j=>({...j})); state.vehicles=seedVehicles.map(v=>({...v})); state.staff=seedStaff.map(x=>({...x})); state.logs=[]; state.tickets=seedTickets.map(t=>({...t})); state.clients=seedClients.map(c=>({...c})); await saveParts(); await saveJobs(); await saveVehicles(); await saveStaff(); await saveLogs(); await saveTickets(); await saveClients(); } else { set(KEYS.parts, seedParts); set(KEYS.jobs, seedJobs); set(KEYS.vehicles, seedVehicles); set(KEYS.staff, seedStaff); set(KEYS.logs, []); set(KEYS.tickets, seedTickets); set(KEYS.clients, seedClients); } state.filters={q:'',category:'All',stock:'All'}; state.inventorySort={key:'name',dir:'asc'}; state.vehicleHistoryQuery=''; state.selectedClient=''; state.clientFilter=''; state.activityQuery=''; state.activitySection='All'; state.ticketTab='dashboard'; state.ticketSearch=''; state.ticketStatus='All'; state.ticketPriority='All'; toast('Demo data reset'); render(); }

window.addStaffFromPrompt=addStaffFromPrompt; window.selectClient=selectClient; window.editClient=editClient; window.deleteClient=deleteClient; window.clearClientForm=clearClientForm; window.exportClients=exportClients; window.importFleetCSV=importFleetCSV; window.escalateTicket=escalateTicket; window.deEscalateTicket=deEscalateTicket; window.exportActivity=exportActivity; window.switchTicketTab=switchTicketTab; window.saveTicket=saveTicket; window.deleteTicket=deleteTicket; window.updateTicketStatus=updateTicketStatus; window.viewTicket=viewTicket; window.closeTicketDialog=closeTicketDialog; window.exportTickets=exportTickets; window.fillTicketFromFleet=fillTicketFromFleet; window.startNewJobCard=startNewJobCard; window.loadJobCardForEdit=loadJobCardForEdit; window.setInventorySort=setInventorySort; window.goInventory=goInventory; window.goJobs=goJobs; window.exportDashboardInventory=exportDashboardInventory; window.exportDashboardJobs=exportDashboardJobs; window.viewPlateHistory=viewPlateHistory; window.clearPlateHistorySearch=clearPlateHistorySearch; window.exportPlateHistoryCSV=exportPlateHistoryCSV; window.startAddVehicle=startAddVehicle; window.toggleOrdered=toggleOrdered; window.go=go; window.openPartDialog=openPartDialog; window.closePartDialog=closePartDialog; window.openRestockDialog=openRestockDialog; window.closeRestockDialog=closeRestockDialog; window.viewPartUsage=viewPartUsage; window.viewJob=viewJob; window.closeJobDialog=closeJobDialog; window.deleteJob=deleteJob; window.deletePart=deletePart; window.exportInventory=exportInventory; window.importInventoryCSV=importInventoryCSV; window.exportJobs=exportJobs; window.exportUsage=exportUsage; window.exportMonthlyReport=exportMonthlyReport; window.exportFleet=exportFleet; window.toggleEmployeeDocRequested=toggleEmployeeDocRequested; window.clearVisibleReplacementCells=clearVisibleReplacementCells; window.replacementCellKeydown=replacementCellKeydown; window.editFleetVehicle=editFleetVehicle; window.deleteFleetVehicle=deleteFleetVehicle; window.clearFleetForm=clearFleetForm; window.resetDemo=resetDemo;
init();
