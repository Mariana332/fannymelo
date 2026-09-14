// ============ MENU MOBILE ============
const burger = document.getElementById('burgerBtn');
const panel = document.getElementById('mobilePanel');
if (burger && panel) {
  burger.addEventListener('click', () => {
    panel.classList.toggle('open');
    burger.classList.toggle('open');
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    panel.classList.remove('open');
    burger.classList.remove('open');
  }));
}

// ============ WORD-STAGGER SPLIT (headlines/quotes) ============
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function splitReveal(el) {
  const fullText = el.textContent.trim();
  el.setAttribute('aria-label', fullText);
  const nodes = Array.from(el.childNodes);
  const hiddenWrap = document.createElement('span');
  hiddenWrap.setAttribute('aria-hidden', 'true');
  let idx = 0;

  function wrapWord(content, isHTML, extraClass) {
    const mask = document.createElement('span');
    mask.className = 'split-mask';
    const inner = document.createElement('span');
    inner.className = 'split-word' + (extraClass ? ' ' + extraClass : '');
    if (isHTML) inner.innerHTML = content; else inner.textContent = content;
    inner.style.transitionDelay = Math.min(idx, 12) * 45 + 'ms';
    idx++;
    mask.appendChild(inner);
    return mask;
  }

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) hiddenWrap.appendChild(document.createTextNode(part));
        else hiddenWrap.appendChild(wrapWord(part, false));
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      hiddenWrap.appendChild(wrapWord(node.innerHTML, true, node.className));
    }
  });

  el.innerHTML = '';
  el.appendChild(hiddenWrap);
}

if (!prefersReducedMotion) {
  document.querySelectorAll('[data-split]').forEach(el => {
    splitReveal(el);
    el.classList.add('split-ready');
  });
}

// ============ CONTADORES ANIMADOS ============
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const pad = parseInt(el.dataset.pad || '0', 10);
  if (prefersReducedMotion || isNaN(target)) {
    el.textContent = pad ? String(target).padStart(pad, '0') : String(target);
    return;
  }
  const duration = 1100;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = Math.round(target * eased);
    el.textContent = pad ? String(value).padStart(pad, '0') : String(value);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ============ ÍCONES COM TRAÇADO (line-draw) ============
// stroke-dasharray/offset calculados a partir do comprimento REAL de cada
// forma, para que todo ícone se desenhe no mesmo ritmo visual, independente
// de quão simples ou complexo é o seu contorno.
document.querySelectorAll('.ic-circle svg').forEach(svg => {
  svg.querySelectorAll('path, rect, circle').forEach(shape => {
    if (typeof shape.getTotalLength !== 'function') return;
    const len = shape.getTotalLength();
    shape.style.strokeDasharray = len;
    shape.style.strokeDashoffset = prefersReducedMotion ? 0 : len;
  });
});
function drawIcons(container) {
  container.querySelectorAll('.ic-circle svg path, .ic-circle svg rect, .ic-circle svg circle').forEach(shape => {
    shape.style.strokeDashoffset = 0;
  });
}

// ============ REVEAL ON SCROLL ============
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      entry.target.querySelectorAll('.count').forEach(animateCount);
      drawIcons(entry.target);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach((el) => io.observe(el));

document.querySelectorAll('section').forEach(section => {
  const items = section.querySelectorAll('.reveal');
  items.forEach((el, i) => { el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms'; });
});

// ============ BARRA DE PROGRESSO ============
const progressBar = document.getElementById('scrollProgress');
function updateProgress() {
  if (!progressBar) return;
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  progressBar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
}
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ============ PARALLAX (blobs do hero / page-hero) ============
const blob1 = document.querySelector('.hero-blobs .b1');
const blob2 = document.querySelector('.hero-blobs .b2');
const pageBlob = document.querySelector('.page-hero .blob');
function updateParallax() {
  if (prefersReducedMotion) return;
  const y = window.scrollY;
  if (blob1) blob1.style.transform = `translateY(${y * 0.18}px)`;
  if (blob2) blob2.style.transform = `translateY(${y * 0.3}px)`;
  if (pageBlob) pageBlob.style.transform = `translateY(${y * 0.22}px)`;
}
document.addEventListener('scroll', updateParallax, { passive: true });
updateParallax();

// ============ TILT 3D NOS CARDS DE BANDEIRAS ============
const canTilt = !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (canTilt) {
  document.querySelectorAll('.pillar-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1100px) translateY(-6px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ============ TRAJETÓRIA: LINHA DO TEMPO QUE SE DESENHA ============
const timelineEl = document.getElementById('timeline');
const timelineFill = document.getElementById('timelineFill');
if (timelineEl && timelineFill) {
  const dots = Array.from(timelineEl.querySelectorAll('.t-dot'));
  function updateTimeline() {
    const rect = timelineEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const triggerLine = vh * 0.75;
    const total = rect.height;
    let progressPx = triggerLine - rect.top;
    progressPx = Math.max(0, Math.min(total, progressPx));
    const pct = total > 0 ? (progressPx / total) * 100 : 0;
    timelineFill.style.height = pct + '%';
    dots.forEach(dot => {
      const dotRect = dot.getBoundingClientRect();
      const dotCenter = dotRect.top + dotRect.height / 2;
      dot.classList.toggle('lit', dotCenter < triggerLine);
    });
  }
  document.addEventListener('scroll', () => requestAnimationFrame(updateTimeline), { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();
}

// ============ CARROSSEL DE FOTOS (home) ============
const galTrack = document.getElementById('galTrack');
const galPrev = document.getElementById('galPrev');
const galNext = document.getElementById('galNext');
const galDots = document.getElementById('galDots');
if (galTrack) {
  const cards = Array.from(galTrack.children);
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' }));
    galDots.appendChild(dot);
  });
  const dots = Array.from(galDots.children);

  function cardStep() {
    const card = cards[0];
    const style = getComputedStyle(galTrack);
    return card.getBoundingClientRect().width + parseFloat(style.gap || 20);
  }
  function updateCarouselUI() {
    const idx = Math.round(galTrack.scrollLeft / cardStep());
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    galPrev.disabled = galTrack.scrollLeft <= 4;
    galNext.disabled = galTrack.scrollLeft >= galTrack.scrollWidth - galTrack.clientWidth - 4;
  }
  galPrev.addEventListener('click', () => galTrack.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
  galNext.addEventListener('click', () => galTrack.scrollBy({ left: cardStep(), behavior: 'smooth' }));
  galTrack.addEventListener('scroll', () => requestAnimationFrame(updateCarouselUI), { passive: true });
  updateCarouselUI();
}

// ============ FORMULÁRIO DE APOIO (contato) ============
const apoioForm = document.getElementById('apoioForm');
if (apoioForm) {
  apoioForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const numeroFanny = '5534991037599';
    let msg = 'Olá! Quero apoiar a pré-candidatura de Fanny Melo.';
    msg += '\nNome: ' + nome;
    if (cidade) msg += '\nCidade: ' + cidade;
    msg += '\nMeu WhatsApp: ' + whatsapp;
    const url = 'https://wa.me/' + numeroFanny + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank', 'noopener');
    this.reset();
    this.style.display = 'none';
    const success = document.getElementById('formSuccess');
    if (success) success.classList.add('show');
  });
  const successReset = document.getElementById('formSuccessReset');
  if (successReset) {
    successReset.addEventListener('click', () => {
      document.getElementById('formSuccess').classList.remove('show');
      apoioForm.style.display = '';
    });
  }
}
