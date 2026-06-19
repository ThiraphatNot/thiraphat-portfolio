const html = document.documentElement;

/* ── CURSOR GLOW ── */
const glow = document.getElementById('cursorGlow');
if (glow) {
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

/* ── THEME ── */
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
themeBtn && themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ── LANGUAGE ── */
let lang = localStorage.getItem('lang') || 'th';
const langBtn = document.getElementById('langToggle');

const phrases = {
  th: ['นักพัฒนาซอฟต์แวร์ 💻','วิศวกรเมคคาทรอนิกส์ 🤖','ผู้สร้างระบบอัตโนมัติ ⚙️','พร้อมรับงาน ✨'],
  en: ['Software Developer 💻','Mechatronics Engineer 🤖','Automation Builder ⚙️','Open to Work ✨']
};

function applyLang(l) {
  lang = l;
  html.setAttribute('data-lang', l);
  html.lang = l === 'th' ? 'th' : 'en';
  localStorage.setItem('lang', l);
  document.querySelectorAll('[data-th]').forEach(el => {
    const v = el.getAttribute('data-' + l);
    if (v) el.innerHTML = v;
  });
  startTyping();
  setTimeout(checkSectionOverflow, 50);
}

langBtn && langBtn.addEventListener('click', () => applyLang(lang === 'th' ? 'en' : 'th'));

/* ── TYPING ── */
const typedEl = document.getElementById('typedText');
let pIdx = 0, cIdx = 0, del = false, tTimer;

function startTyping() {
  clearTimeout(tTimer); pIdx = 0; cIdx = 0; del = false;
  if (typedEl) typedEl.textContent = '';
  typeLoop();
}

function typeLoop() {
  if (!typedEl) return;
  const list = phrases[lang];
  const phrase = list[pIdx % list.length];
  if (!del) {
    typedEl.textContent = phrase.slice(0, ++cIdx);
    if (cIdx === phrase.length) { del = true; tTimer = setTimeout(typeLoop, 2200); return; }
  } else {
    typedEl.textContent = phrase.slice(0, --cIdx);
    if (cIdx === 0) { del = false; pIdx++; tTimer = setTimeout(typeLoop, 350); return; }
  }
  tTimer = setTimeout(typeLoop, del ? 38 : 65);
}

/* ── PARTICLES ── */
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  class P {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.r  = Math.random() * 1.8 + .8;
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.a  = Math.random() * .5 + .15;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      const dark = html.getAttribute('data-theme') === 'dark';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = dark ? `rgba(77,143,245,${this.a})` : `rgba(42,109,217,${this.a * .55})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({length: 55}, () => new P());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark = html.getAttribute('data-theme') === 'dark';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          const a = (1 - d/110) * (dark ? .14 : .07);
          ctx.beginPath();
          ctx.strokeStyle = dark ? `rgba(77,143,245,${a})` : `rgba(42,109,217,${a})`;
          ctx.lineWidth = .7;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
}

/* ── SNAP SCROLL / DOTS / NAV ── */
const container  = document.getElementById('scrollContainer');
const sections   = [...document.querySelectorAll('.snap-section')];
const dots       = [...document.querySelectorAll('.dot')];
const navAs      = [...document.querySelectorAll('.nav__links a')];
let curIdx = 0;

function setActive(idx) {
  curIdx = idx;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  navAs.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + sections[idx].id);
  });
}

function goTo(idx) {
  if (idx < 0 || idx >= sections.length) return;
  sections[idx].scrollIntoView({ behavior: 'smooth' });
}

dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

navAs.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const id  = a.getAttribute('href').replace('#', '');
    const idx = sections.findIndex(s => s.id === id);
    if (idx !== -1) goTo(idx);
  });
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  if (a.closest('.nav__links')) return;
  a.addEventListener('click', e => {
    const id  = a.getAttribute('href').replace('#', '');
    const idx = sections.findIndex(s => s.id === id);
    if (idx !== -1) { e.preventDefault(); goTo(idx); }
  });
});

/* IntersectionObserver for active + reveal + bars */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const idx = sections.indexOf(entry.target);
    if (idx !== -1) setActive(idx);
    triggerReveal(entry.target);
    if (entry.target.id === 'skills') animateBars();
  });
}, { root: container, threshold: .45 });

sections.forEach(s => io.observe(s));

/* ── NAV SHADOW + BACK TO TOP ── */
const navEl       = document.getElementById('nav');
const backToTop    = document.getElementById('backToTop');

function updateScrollUI() {
  const top = container ? container.scrollTop : (window.scrollY || document.documentElement.scrollTop);
  navEl && navEl.classList.toggle('nav--scrolled', top > 8);
  backToTop && backToTop.classList.toggle('show', curIdx > 0 || top > window.innerHeight * .6);
}

if (container) container.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('scroll', updateScrollUI, { passive: true });
backToTop && backToTop.addEventListener('click', () => goTo(0));

/* ── OVERFLOW FALLBACK: force free-scroll on any device/zoom level
   where a section's content is taller than the viewport ── */
function checkSectionOverflow() {
  const tooTall = sections.some(s => s.scrollHeight > window.innerHeight + 4);
  html.classList.toggle('no-snap', tooTall || window.innerWidth <= 768);
}
window.addEventListener('resize', checkSectionOverflow);
window.addEventListener('load', () => setTimeout(checkSectionOverflow, 200));

/* ── REVEAL ── */
function triggerReveal(sec) {
  sec.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), i * 110);
  });
}

/* ── SKILL BARS ── */
let barsBuilt = false, barsAnimated = false;

function buildBars() {
  if (barsBuilt) return; barsBuilt = true;
  document.querySelectorAll('.sbar').forEach(sbar => {
    sbar.innerHTML = `
      <div class="sbar-top">
        <span class="sbar-name">${sbar.dataset.label}</span>
        <span class="sbar-pct">${sbar.dataset.pct}%</span>
      </div>
      <div class="sbar-track"><div class="sbar-fill" data-w="${sbar.dataset.pct}"></div></div>`;
  });
}

function animateBars() {
  if (barsAnimated) return; barsAnimated = true;
  document.querySelectorAll('.sbar-fill').forEach((f, i) => {
    setTimeout(() => { f.style.width = f.dataset.w + '%'; }, i * 90);
  });
}

/* ── KEYBOARD ── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(curIdx + 1); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp'  ) { e.preventDefault(); goTo(curIdx - 1); }
});

/* ── TOUCH SWIPE (snap mode only — must not hijack normal free scrolling) ── */
let ty0 = 0;
if (container) {
  container.addEventListener('touchstart', e => { ty0 = e.touches[0].clientY; }, {passive:true});
  container.addEventListener('touchend',   e => {
    if (html.classList.contains('no-snap') || window.innerWidth <= 1024) return;
    const diff = ty0 - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 45) goTo(diff > 0 ? curIdx + 1 : curIdx - 1);
  }, {passive:true});
}

/* ── BURGER ── */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}


/* ── DAYS TOGETHER ── */
function updateDaysTogether() {

  // วันที่เริ่มคบ
  const startDate = new Date(2026, 4, 29);

  // วันที่ปัจจุบัน
  const today = new Date();

  // ตัดเวลาออก
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // คำนวณจำนวนวัน
  const diffDays = Math.floor(
    (today - startDate) /
    (1000 * 60 * 60 * 24)
  );

  // หา span ที่จะแสดงผล
  const daysEl =
    document.getElementById("daysTogether");

  // แสดงจำนวนวัน
  if (daysEl) {
    daysEl.textContent = diffDays;
  }
}

/* ── INIT ── */
buildBars();
applyLang(lang);
triggerReveal(sections[0]);
setActive(0);
checkSectionOverflow();
updateScrollUI();
updateDaysTogether();

updateDaysTogether();