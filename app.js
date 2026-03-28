/* ── NEXA AFRICA — Full App JavaScript ── */

// ─── STATE ─────────────────────────────────────
const state = {
  user: null,
  balance: 0,
  transactions: [],
  savings: [],
  nexaScore: 0,
  points: 0,
  tier: 'basic',
};

// ─── UTILS ─────────────────────────────────────
const fmt = (n) => '₦' + Number(n).toLocaleString('en-NG', {minimumFractionDigits:2,maximumFractionDigits:2});
const fmtShort = (n) => '₦' + Number(n).toLocaleString('en-NG');
const rand = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const randFloat = (min,max) => (Math.random()*(max-min)+min).toFixed(1);
const today = () => new Date().toLocaleDateString('en-NG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const genAccount = () => '70' + Array.from({length:8},()=>rand(0,9)).join('');
const genTxnId = () => 'NXA' + Date.now().toString(36).toUpperCase();

// ─── NAVBAR SCROLL ─────────────────────────────
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if(window.scrollY > 50) nb.style.background = 'rgba(5,13,26,0.97)';
  else nb.style.background = 'rgba(5,13,26,0.85)';
});

// ─── HAMBURGER ─────────────────────────────────
document.getElementById('hamburger').addEventListener('click', function(){
  document.getElementById('mobile-menu').classList.toggle('open');
});

// ─── COUNTER ANIMATION ─────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isFloat = target % 1 !== 0;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if(current >= target) { current = target; clearInterval(timer); }
      el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
    }, 25);
  });
}
const heroObs = new IntersectionObserver(e => { if(e[0].isIntersecting) animateCounters(); }, {threshold:0.3});
const heroEl = document.getElementById('hero');
if(heroEl) heroObs.observe(heroEl);

// ─── PRODUCT TABS ───────────────────────────────
document.querySelectorAll('.ptab').forEach(btn => {
  btn.addEventListener('click', function(){
    document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.product-panel').forEach(p=>p.classList.remove('active'));
    this.classList.add('active');
    const panel = document.getElementById('tab-' + this.dataset.tab);
    if(panel) panel.classList.add('active');
  });
});

// ─── TESTIMONIAL SLIDER ─────────────────────────
(function(){
  const track = document.getElementById('testi-track');
  const dotsEl = document.getElementById('testi-dots');
  if(!track) return;
  const cards = track.querySelectorAll('.testi-card');
  const total = cards.length;
  let current = 0;

  // Build dots
  for(let i=0;i<total;i++){
    const d = document.createElement('div');
    d.className = 'testi-dot' + (i===0?' active':'');
    d.addEventListener('click',()=>goTo(i));
    dotsEl.appendChild(d);
  }

  function goTo(idx){
    current = idx;
    const cardW = cards[0].offsetWidth + 20;
    track.style.transform = `translateX(-${current * cardW}px)`;
    dotsEl.querySelectorAll('.testi-dot').forEach((d,i)=>d.classList.toggle('active',i===current));
  }

  setInterval(()=>goTo((current+1)%total),5000);
})();

// ─── DEMO / NEXAIQ ──────────────────────────────
document.getElementById('add-expense').addEventListener('click', function(){
  const rows = document.getElementById('expense-rows');
  const row = document.createElement('div');
  row.className = 'exp-row';
  row.innerHTML = `<select class="exp-cat"><option>Food</option><option>Transport</option><option>Rent</option><option>Entertainment</option><option>Health</option><option>Education</option><option>Business</option><option>Other</option></select><input type="number" class="exp-amt" placeholder="Amount ₦"/>`;
  rows.appendChild(row);
});

document.getElementById('analyse-btn').addEventListener('click', function(){
  const income = parseFloat(document.getElementById('income').value) || 0;
  if(income === 0){ alert('Please enter your monthly income first.'); return; }

  const rows = document.querySelectorAll('.exp-row');
  let expenses = {};
  let total = 0;
  rows.forEach(r => {
    const cat = r.querySelector('.exp-cat').value;
    const amt = parseFloat(r.querySelector('.exp-amt').value) || 0;
    if(amt > 0){ expenses[cat] = (expenses[cat]||0) + amt; total += amt; }
  });

  if(total === 0){ alert('Please add at least one expense.'); return; }

  const unaccounted = Math.max(0, income - total);
  const savings = Math.max(0, income - total);
  const savingsRate = ((savings/income)*100).toFixed(1);
  const spendRate = ((total/income)*100).toFixed(1);
  const score = Math.min(100, Math.max(20, Math.round(60 + (savingsRate*0.8) - (spendRate > 80 ? 20 : 0))));

  // Colours for categories
  const colors = ['#00B8A9','#F5A623','#6C3483','#C0392B','#27AE60','#2980B9','#E67E22','#95A5A6'];

  let barsHTML = Object.entries(expenses).map(([cat,amt],i) => {
    const pct = Math.round((amt/income)*100);
    return `<div class="ar-bar-row"><span>${cat}</span><div class="ar-bar"><div class="ar-fill" style="width:${Math.min(pct,100)}%;background:${colors[i%colors.length]}"></div></div><span>${fmtShort(amt)}</span></div>`;
  }).join('');

  if(unaccounted > 100){
    barsHTML += `<div class="ar-bar-row" style="color:var(--gold)"><span>⚠ Unaccounted</span><div class="ar-bar"><div class="ar-fill" style="width:${Math.min(Math.round((unaccounted/income)*100),100)}%;background:rgba(245,166,35,0.4);border:1px dashed #F5A623"></div></div><span>${fmtShort(unaccounted)}</span></div>`;
  }

  // Insights
  let insights = [];
  if(expenses['Food'] && (expenses['Food']/income) > 0.35) insights.push(`Your food spending is <strong>${((expenses['Food']/income)*100).toFixed(0)}%</strong> of income. The recommended maximum is 35%.`);
  if(expenses['Entertainment'] && (expenses['Entertainment']/income) > 0.1) insights.push(`Entertainment is <strong>${fmtShort(expenses['Entertainment'])}</strong>. Reducing by 30% saves <strong>${fmtShort(expenses['Entertainment']*0.3)}</strong>/month.`);
  if(savingsRate < 10) insights.push(`Your savings rate is <strong>${savingsRate}%</strong>. Aim for at least 20% — that's <strong>${fmtShort(income*0.2)}</strong>/month.`);
  else insights.push(`Great job! Your savings rate of <strong>${savingsRate}%</strong> is above the 10% minimum. Keep it up!`);
  if(unaccounted > income * 0.1) insights.push(`<strong>${fmtShort(unaccounted)}</strong> is untracked. Tag your cash expenses in the app to see your full picture.`);

  document.getElementById('demo-output').innerHTML = `
    <div class="analysis-result">
      <p class="ar-header">🤖 NexaIQ Analysis — Your Month</p>
      <div class="ar-bars">${barsHTML}</div>
      <div class="ar-insights">
        ${insights.map(i=>`<div class="ar-insight-item">💡 ${i}</div>`).join('')}
      </div>
      <div class="ar-score">
        NexaScore estimate: <strong>${score}/100</strong> — 
        ${score >= 75 ? '✦ Excellent — eligible for microloans' : score >= 55 ? '✓ Good — keep saving to unlock credit' : '⚠ Needs work — focus on reducing overspend'}
      </div>
    </div>`;
});

// ─── SCROLL REVEAL ──────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, {threshold:0.1});

document.querySelectorAll('.problem-card,.how-step,.tier-card,.impact-card,.pillar,.testi-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObs.observe(el);
});

// ─── MODAL CONTROLS ────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow=''; }

// Open signup
['open-signup','open-signup-m','hero-signup','cta-signup','signup-basic','signup-pro'].forEach(id => {
  const el = document.getElementById(id);
  if(el) el.addEventListener('click', e => { e.preventDefault(); openModal('signup-modal'); });
});
document.getElementById('signup-elite').addEventListener('click', e => {
  e.preventDefault();
  alert('📞 For Nexa Elite, please contact our enterprise team at enterprise@nexaafrica.io or call 0800-NEXA-NG');
});

// Close buttons
document.getElementById('modal-close').addEventListener('click', ()=>closeModal('signup-modal'));
document.getElementById('signin-modal-close').addEventListener('click', ()=>closeModal('signin-modal'));
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', function(e){ if(e.target === this) closeModal(this.id); });
});

// Sign in button
document.getElementById('signin-btn').addEventListener('click', e => { e.preventDefault(); openModal('signin-modal'); });

// Switch between modals
document.getElementById('switch-signin').addEventListener('click', e => { e.preventDefault(); closeModal('signup-modal'); openModal('signin-modal'); });
document.getElementById('switch-signup').addEventListener('click', e => { e.preventDefault(); closeModal('signin-modal'); openModal('signup-modal'); });

// ─── SIGNUP FLOW ────────────────────────────────
let regData = {};

function showStep(n) {
  document.querySelectorAll('.modal-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('step-'+n).classList.add('active');
}

document.getElementById('next-1').addEventListener('click', () => {
  const tier = document.querySelector('input[name="tier"]:checked').value;
  regData.tier = tier;
  showStep(2);
});

document.getElementById('back-2').addEventListener('click', () => showStep(1));
document.getElementById('next-2').addEventListener('click', () => {
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  if(!name){ alert('Please enter your full name.'); return; }
  if(!phone || phone.length < 10){ alert('Please enter a valid phone number.'); return; }
  regData.name = name;
  regData.phone = phone;
  regData.nin = document.getElementById('reg-nin').value.trim();
  showStep(3);
});

document.getElementById('back-3').addEventListener('click', () => showStep(2));
document.getElementById('next-3').addEventListener('click', () => {
  const pins = document.querySelectorAll('#step-3 .pin-box');
  const pin = Array.from(pins).map(p=>p.value).join('');
  if(pin.length < 6){ alert('Please enter all 6 PIN digits.'); return; }

  // Create account
  regData.pin = pin;
  regData.accountNumber = genAccount();
  regData.balance = rand(1000, 5000); // welcome bonus
  regData.nexaScore = rand(42, 68);
  regData.points = 500; // welcome points

  document.getElementById('success-details').innerHTML = `
    <strong>Account Number:</strong> ${regData.accountNumber}<br>
    <strong>Account Name:</strong> ${regData.name}<br>
    <strong>Plan:</strong> Nexa ${regData.tier.charAt(0).toUpperCase()+regData.tier.slice(1)}<br>
    <strong>Welcome Bonus:</strong> ${fmtShort(regData.balance)} added to your account ✦<br>
    <strong>NexaPoints:</strong> 500 pts — redeem for airtime or data
  `;
  document.getElementById('success-msg').textContent = 'Your Nexa account is live! Welcome to a better way to bank.';

  showStep(4);
  setupDashboard(regData);
});

document.getElementById('done-btn').addEventListener('click', () => {
  closeModal('signup-modal');
  showDashboard();
});

// ─── SIGNIN FLOW ────────────────────────────────
setupPinBoxes('#si-pin-boxes');

document.getElementById('signin-submit').addEventListener('click', () => {
  const phone = document.getElementById('si-phone').value.trim();
  const pins = document.querySelectorAll('#si-pin-boxes .pin-box');
  const pin = Array.from(pins).map(p=>p.value).join('');

  if(!phone){ alert('Please enter your phone number.'); return; }
  if(pin.length < 6){ alert('Please enter your 6-digit PIN.'); return; }

  // Demo: any creds work
  if(!state.user) {
    // Create demo account if none exists
    const demoData = {
      name: 'Demo User',
      phone,
      accountNumber: genAccount(),
      balance: rand(150000, 850000),
      nexaScore: rand(58, 82),
      points: rand(800, 2400),
      tier: 'pro',
    };
    setupDashboard(demoData);
  }
  closeModal('signin-modal');
  showDashboard();
});

// ─── PIN BOX AUTO-ADVANCE ───────────────────────
function setupPinBoxes(selector) {
  const boxes = document.querySelectorAll(selector + ' .pin-box');
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      if(box.value && i < boxes.length - 1) boxes[i+1].focus();
    });
    box.addEventListener('keydown', e => {
      if(e.key === 'Backspace' && !box.value && i > 0) boxes[i-1].focus();
    });
  });
}
setupPinBoxes('#step-3');

// ─── DASHBOARD SETUP ───────────────────────────
function setupDashboard(data) {
  state.user = data.name;
  state.balance = data.balance;
  state.nexaScore = data.nexaScore;
  state.points = data.points;
  state.tier = data.tier;
  state.accountNumber = data.accountNumber;

  // Generate demo transactions
  const cats = [
    {name:'Groceries',icon:'🛒',color:'#00B8A9',type:'debit'},
    {name:'Salary Credit',icon:'💼',color:'#27AE60',type:'credit'},
    {name:'Bolt Ride',icon:'🚗',color:'#F5A623',type:'debit'},
    {name:'MTN Airtime',icon:'📱',color:'#2980B9',type:'debit'},
    {name:'PiggyVest Transfer',icon:'🏦',color:'#6C3483',type:'debit'},
    {name:'Freelance Payment',icon:'💻',color:'#27AE60',type:'credit'},
    {name:'NEPA Bill',icon:'⚡',color:'#E67E22',type:'debit'},
    {name:'Restaurant',icon:'🍽️',color:'#C0392B',type:'debit'},
    {name:'NexaScore Bonus',icon:'⭐',color:'#F5A623',type:'credit'},
    {name:'Transfer from John',icon:'👤',color:'#27AE60',type:'credit'},
  ];

  state.transactions = Array.from({length:12}, (_,i) => {
    const cat = cats[i % cats.length];
    const amt = cat.type === 'credit' ? rand(5000,350000) : rand(500,25000);
    const daysAgo = i;
    const d = new Date(); d.setDate(d.getDate()-daysAgo);
    return { ...cat, amount: amt, date: d.toLocaleDateString('en-NG',{day:'numeric',month:'short'}), id: genTxnId() };
  });

  // Default savings goals
  state.savings = [
    { name: 'Emergency Fund', target: 200000, saved: rand(40000,120000), monthly: 15000 },
    { name: 'New Laptop', target: 350000, saved: rand(50000,200000), monthly: 25000 },
  ];
}

function showDashboard() {
  const overlay = document.getElementById('dashboard');
  overlay.style.display = 'flex';
  setTimeout(() => overlay.style.opacity = '1', 10);

  // Populate
  document.getElementById('db-name').textContent = state.user || 'Friend';
  document.getElementById('db-balance').textContent = fmt(state.balance);
  document.getElementById('db-health-score').textContent = state.nexaScore;
  document.getElementById('db-date').textContent = today();

  // IQ Alert
  const alerts = [
    `🤖 <strong>NexaIQ:</strong> Your spending on food this month is 38% of income. The recommended max is 35%.`,
    `🤖 <strong>NexaIQ:</strong> You're on track to save ${fmtShort(rand(15000,50000))} this month. Great discipline!`,
    `🤖 <strong>NexaIQ:</strong> 3 of your transactions are untagged. Tag them to complete your monthly picture.`,
    `🤖 <strong>NexaIQ:</strong> Your NexaScore improved by 4 points this month. Keep saving consistently!`,
  ];
  document.getElementById('db-iq-alert').innerHTML = alerts[rand(0,alerts.length-1)];

  renderTransactions();
  renderAnalytics();
  renderSavings();
  renderLoans();
  renderLearn();
}

function renderTransactions() {
  const list = document.getElementById('db-txn-list');
  list.innerHTML = state.transactions.slice(0,8).map(t => `
    <div class="db-txn-row">
      <div class="db-txn-dot" style="background:${t.color}22">${t.icon}</div>
      <div class="db-txn-info"><p>${t.name}</p><span>${t.date} · ${genTxnId()}</span></div>
      <span class="db-txn-amt" style="color:${t.type==='credit'?'#27AE60':'#E74C3C'}">${t.type==='credit'?'+':'-'}${fmt(t.amount)}</span>
    </div>
  `).join('');
}

function renderAnalytics() {
  const totalSpend = state.transactions.filter(t=>t.type==='debit').reduce((a,b)=>a+b.amount,0);
  const totalIncome = state.transactions.filter(t=>t.type==='credit').reduce((a,b)=>a+b.amount,0);
  const savingsAmt = totalIncome - totalSpend;

  document.getElementById('analytics-summary').innerHTML = `
    <div class="an-card"><label>Total Income</label><strong>${fmt(totalIncome)}</strong><div class="an-sub">This period</div></div>
    <div class="an-card"><label>Total Spent</label><strong>${fmt(totalSpend)}</strong><div class="an-sub">${((totalSpend/totalIncome)*100).toFixed(0)}% of income</div></div>
    <div class="an-card"><label>Net Saved</label><strong style="color:${savingsAmt>=0?'#27AE60':'#E74C3C'}">${fmt(Math.abs(savingsAmt))}</strong><div class="an-sub">${savingsAmt>=0?'Surplus':'Deficit'}</div></div>
  `;

  // Spending by category
  const byCat = {};
  state.transactions.filter(t=>t.type==='debit').forEach(t => {
    const key = t.name;
    byCat[key] = (byCat[key]||0) + t.amount;
  });

  const colors = ['#00B8A9','#F5A623','#6C3483','#27AE60','#C0392B','#2980B9'];
  const bars = Object.entries(byCat).slice(0,6).map(([k,v],i) => {
    const pct = Math.round((v/totalSpend)*100);
    return `<div class="ar-bar-row"><span>${k}</span><div class="ar-bar"><div class="ar-fill" style="width:${pct}%;background:${colors[i%colors.length]}"></div></div><span>${fmtShort(v)}</span></div>`;
  }).join('');

  document.getElementById('analytics-chart').innerHTML = `<p style="font-size:0.82rem;color:var(--gray);margin-bottom:12px;font-family:'DM Mono',monospace">SPENDING BREAKDOWN</p><div class="ar-bars">${bars}</div>`;
}

function renderSavings() {
  const list = document.getElementById('savings-list');
  if(state.savings.length === 0){ list.innerHTML = '<p style="color:var(--gray);font-size:0.85rem">No savings goals yet. Create one below!</p>'; return; }
  list.innerHTML = state.savings.map(g => {
    const pct = Math.min(100, Math.round((g.saved/g.target)*100));
    const monthsLeft = Math.ceil((g.target - g.saved) / g.monthly);
    return `<div class="sg-card">
      <div class="sg-top"><strong>${g.name}</strong><span>${fmt(g.saved)} / ${fmt(g.target)}</span></div>
      <div class="sg-bar"><div class="sg-fill" style="width:${pct}%"></div></div>
      <div class="sg-sub">${pct}% complete · ${monthsLeft} months at ${fmt(g.monthly)}/mo · NexaIQ: on track ✓</div>
    </div>`;
  }).join('');
}

document.getElementById('sg-create').addEventListener('click', () => {
  const name = document.getElementById('sg-name').value.trim();
  const target = parseFloat(document.getElementById('sg-target').value);
  const monthly = parseFloat(document.getElementById('sg-monthly').value);
  if(!name||!target||!monthly){ alert('Please fill in all goal fields.'); return; }
  state.savings.push({ name, target, saved: 0, monthly });
  renderSavings();
  document.getElementById('sg-name').value='';
  document.getElementById('sg-target').value='';
  document.getElementById('sg-monthly').value='';
});

function renderLoans() {
  const score = state.nexaScore;
  const eligible = score >= 50;
  const maxLoan = score >= 80 ? 5000000 : score >= 70 ? 1500000 : score >= 60 ? 500000 : score >= 50 ? 150000 : 0;
  document.getElementById('loans-content').innerHTML = `
    <div class="loan-score-big">
      <div class="lsb-num">${score}</div>
      <div class="lsb-label">Your NexaScore / 100</div>
      <div style="font-size:0.78rem;color:var(--gray);line-height:1.5">
        ${score >= 80 ? '✦ Excellent — top-tier borrower' : score >= 70 ? '✓ Very Good — strong credit profile' : score >= 60 ? '✓ Good — eligible for most loans' : score >= 50 ? '~ Fair — eligible for microloans' : '⚠ Building — keep saving to improve'}
      </div>
    </div>
    ${eligible ? `
    <div class="loan-eligible">
      <p>Maximum loan amount</p>
      <strong>${fmt(maxLoan)}</strong>
      <button class="btn-primary" onclick="applyLoan(${maxLoan})" style="width:100%">Apply for Loan →</button>
    </div>
    <div style="font-size:0.78rem;color:var(--gray);line-height:1.8;background:var(--card);padding:14px;border-radius:10px;border:1px solid var(--border)">
      <strong style="color:var(--white)">Loan Terms:</strong><br>
      Interest rate: 2.5% monthly · No collateral needed · No guarantor<br>
      Repayment: auto-deducted on salary credit · Penalty: none for early repayment
    </div>` : `
    <div style="background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:10px;padding:16px;font-size:0.85rem;color:var(--gray)">
      ⚠ Your NexaScore is ${score}. To unlock loans, reach a score of 50+.<br><br>
      <strong style="color:var(--white)">How to improve:</strong> Save consistently, pay debts on time, and keep banking with Nexa for 3+ months.
    </div>`}
  `;
}

window.applyLoan = function(max) {
  const amt = prompt(`Enter loan amount (max ${fmt(max)}):`);
  const num = parseFloat(amt);
  if(!num || num > max) { alert('Invalid amount.'); return; }
  state.balance += num;
  state.transactions.unshift({ name:`Nexa Loan Disbursement`, icon:'💰', color:'#27AE60', type:'credit', amount:num, date:new Date().toLocaleDateString('en-NG',{day:'numeric',month:'short'}), id:genTxnId() });
  document.getElementById('db-balance').textContent = fmt(state.balance);
  renderTransactions();
  alert(`✅ Loan of ${fmt(num)} approved and credited to your account!\n\nTxn ID: ${genTxnId()}\nRepayment starts next salary credit.`);
  renderLoans();
};

function renderLearn() {
  const lessons = [
    { icon:'💰', title:'How to Build Your NexaScore', desc:'Learn what drives your credit score and how to improve it fast.', pts:50, done: false },
    { icon:'📊', title:'Making a Monthly Budget', desc:"Step-by-step guide to tracking income and expenses like a pro.", pts:40, done: true },
    { icon:'🏦', title:'How Interest Rates Work', desc:'Understand what banks charge and how to avoid paying too much.', pts:60, done: false },
    { icon:'💳', title:'Using Your Virtual Card Safely', desc:'Best practices for online payments and fraud prevention.', pts:35, done: false },
    { icon:'🏢', title:'Registering a Business in Nigeria', desc:'CAC process, costs, and how Nexa can help your SME.', pts:70, done: false },
    { icon:'📈', title:'Investing for Beginners', desc:'Treasury bills, fixed deposits, and more — explained simply.', pts:80, done: false },
  ];
  document.getElementById('learn-lessons').innerHTML = lessons.map(l => `
    <div class="lesson-card" onclick="startLesson('${l.title}',${l.pts})">
      <div class="lesson-icon">${l.icon}</div>
      <div class="lesson-info">
        <h5>${l.title}</h5>
        <p>${l.desc} ${l.done ? '✓ Completed' : ''}</p>
      </div>
      <div class="lesson-pts">+${l.pts} pts</div>
    </div>
  `).join('');
}

window.startLesson = function(title, pts) {
  alert(`📚 Starting lesson: "${title}"\n\nThis would open the full interactive lesson.\nOn completion, you earn ${pts} NexaPoints!\n\nNexaPoints can be redeemed for airtime, data bundles, or savings boosts.`);
};

// ─── TRANSFER ──────────────────────────────────
document.getElementById('tf-amount').addEventListener('input', function(){
  const amt = parseFloat(this.value)||0;
  if(amt <= 0){ document.getElementById('tf-breakdown').classList.remove('show'); return; }
  const fee = amt <= 10000 ? 0 : amt <= 100000 ? 25 : 50;
  const total = amt + fee;
  document.getElementById('tf-breakdown').classList.add('show');
  document.getElementById('tf-breakdown').innerHTML = `
    Transfer: <strong style="color:var(--white)">${fmt(amt)}</strong><br>
    Transaction fee: <strong style="color:var(--white)">${fee === 0 ? 'FREE' : '₦'+fee}</strong>
      <span style="font-size:0.72rem;color:var(--teal)"> (pre-disclosed as required by Nexa policy)</span><br>
    Total deducted: <strong style="color:var(--white)">${fmt(total)}</strong><br>
    Recipient gets: <strong style="color:#27AE60">${fmt(amt)}</strong>
  `;
});

document.getElementById('tf-send').addEventListener('click', () => {
  const account = document.getElementById('tf-account').value.trim();
  const bank = document.getElementById('tf-bank').value;
  const amt = parseFloat(document.getElementById('tf-amount').value)||0;
  const narration = document.getElementById('tf-narration').value.trim();

  if(!account || account.length < 10){ alert('Please enter a valid 10-digit account number.'); return; }
  if(amt < 100){ alert('Minimum transfer amount is ₦100.'); return; }
  if(amt > state.balance){ alert('Insufficient balance.'); return; }

  const fee = amt <= 10000 ? 0 : amt <= 100000 ? 25 : 50;

  if(confirm(`Confirm transfer:\n\nAmount: ${fmt(amt)}\nTo: ${account} (${bank})\nFee: ₦${fee}\nTotal: ${fmt(amt+fee)}\n\nProceed?`)){
    state.balance -= (amt + fee);
    document.getElementById('db-balance').textContent = fmt(state.balance);
    state.transactions.unshift({
      name: narration || `Transfer to ${account.slice(-4).padStart(account.length,'*')}`,
      icon:'↑', color:'#E74C3C', type:'debit',
      amount: amt+fee, date: new Date().toLocaleDateString('en-NG',{day:'numeric',month:'short'}),
      id: genTxnId()
    });
    renderTransactions();
    alert(`✅ Transfer Successful!\n\n${fmt(amt)} sent to ${account} (${bank})\nTxn ID: ${genTxnId()}\n\nThe recipient has been notified.`);
    document.getElementById('tf-account').value='';
    document.getElementById('tf-amount').value='';
    document.getElementById('tf-narration').value='';
    document.getElementById('tf-breakdown').classList.remove('show');
    showPanel('overview');
  }
});

// ─── DASHBOARD NAV ─────────────────────────────
function showPanel(name) {
  document.querySelectorAll('.db-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.db-link').forEach(l=>l.classList.remove('active'));
  const panel = document.getElementById('panel-'+name);
  if(panel) panel.classList.add('active');
  const link = document.querySelector(`.db-link[data-panel="${name}"]`);
  if(link) link.classList.add('active');
}

document.querySelectorAll('.db-link').forEach(link => {
  link.addEventListener('click', function(e){
    e.preventDefault();
    showPanel(this.dataset.panel);
  });
});

window.showPanel = showPanel;

// Receive
window.showReceive = function() {
  const html = `<div class="receive-info"><p style="color:var(--gray);font-size:0.85rem">Share your account details to receive money</p><div class="receive-account">${state.accountNumber}</div><div class="receive-bank">Nexa Africa · ${state.user}</div></div>`;
  document.getElementById('db-iq-alert').innerHTML = '📥 <strong>Your Account Number:</strong> ' + state.accountNumber + ' (Nexa Africa). Share this to receive money from any Nigerian bank.';
};

// Logout
document.getElementById('db-logout').addEventListener('click', () => {
  if(confirm('Sign out of Nexa Africa?')){
    const overlay = document.getElementById('dashboard');
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display='none'; }, 300);
    state.user = null;
    showStep(1);
  }
});

// ─── TRUST STRIP DUPLICATE ──────────────────────
// Duplicate trust strip for seamless scroll
const strip = document.querySelector('.trust-inner');
if(strip){ strip.innerHTML += strip.innerHTML; }

// ─── LANGUAGE SWITCHER IN LEARN ─────────────────
document.querySelectorAll('.ll').forEach(btn => {
  btn.addEventListener('click', function(){
    document.querySelectorAll('.ll').forEach(b=>b.classList.remove('active'));
    this.classList.add('active');
  });
});

console.log('%c🌍 Nexa Africa — Building Digital Trust for the Unbanked', 'color:#00B8A9;font-size:14px;font-weight:bold;padding:8px;');
console.log('%cOpen your account at nexaafrica.io', 'color:#F5A623;font-size:12px;');
