/* Salt & Pepper Food Chain — site behaviour (GSAP + ScrollTrigger, loaded locally). Information site: no ordering, no prices. */
(function () {
  'use strict';
  clearTimeout(window.__spFail);
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var G = window.gsap, ST = window.ScrollTrigger;
  var animate = !!(G && ST) && !reduce;
  if (!animate) root.classList.remove('js');
  if (G && ST) G.registerPlugin(ST);

  /* ---------- menu content (details only) ---------- */
  var MENU = [
    { n: 'Channa Samosa', c: 'snacks', i: 'p03', r: 'r_samosa', d: 'Crisp samosa stuffed with spiced channa, served with chutney.' },
    { n: 'Paneer Samosa', c: 'snacks', i: 'p03', d: 'Golden samosa with a soft, spiced paneer filling.' },
    { n: 'Mushroom Samosa', c: 'snacks', i: 'p03', d: 'Pepper-spiced mushroom filling in a flaky crust.' },
    { n: 'Pani Puri', c: 'snacks', i: 'p06', r: 'r_chaat', d: 'Crunchy puris with tangy pani, chutney and fresh toppings.' },
    { n: 'Gobi Pakora', c: 'snacks', i: 'p05', d: 'Cauliflower fritters, fried fresh in new oil.' },
    { n: 'Medu Pakoda', c: 'snacks', i: 'p05', d: 'Crispy lentil pakoda with a soft centre.' },
    { n: 'Masala Bonda', c: 'snacks', i: 'p05', d: 'Hot potato bondas in spiced gram batter.' },
    { n: 'Panneer Puff', c: 'snacks', i: 'p05', d: 'Flaky puff pastry with a paneer masala filling.' },
    { n: 'Veg Burger', c: 'snacks', i: 'p05', d: 'Fresh veg patty burger with sauces and salad.' },
    { n: 'Veg Masala Sandwich', c: 'snacks', i: 'p01', d: 'Toasted sandwich with spiced vegetable masala.' },
    { n: 'Garden Fresh Sandwich', c: 'snacks', i: 'p01', d: 'Cucumber, tomato, onion and greens, lightly buttered.' },
    { n: 'Breakfast Combo', c: 'tiffin', i: 'p14', r: 'r_combo', d: 'Idli, vada, pongal and chutneys. A complete breakfast spread.' },
    { n: 'Medu Vada & Bonda', c: 'tiffin', i: 'p09', r: 'r_vada', d: 'Vadas and bondas with sambar and chutney.' },
    { n: 'Sambar Vada', c: 'tiffin', i: 'p09', d: 'Soft vada soaked in hot, fresh sambar.' },
    { n: 'Spl. Bun Butter Jam', c: 'tiffin', i: 'p05', d: 'Soft bun with butter and fruit jam. A kids favourite.' },
    { n: 'Green Gram (Sundal)', c: 'tiffin', i: 'p07', d: 'Protein rich green gram sundal, tempered and fresh.' },
    { n: 'Set Dosa (Live Counter)', c: 'live', i: 'p08', r: 'r_dosa', d: 'Soft set dosa made fresh on the spot with sambar and chutneys.' },
    { n: 'Norukkal (Live Counter)', c: 'live', i: 'p15', d: 'Crunchy norukkal prepared live at your event.' },
    { n: 'Fruit Salad', c: 'sweets', i: 'p01', d: 'Seasonal fresh fruits, cut the same day.' },
    { n: 'Peanut Salad', c: 'sweets', i: 'p01', d: 'Boiled peanut, onion, tomato and lemon.' },
    { n: 'Mixed Nuts', c: 'sweets', i: 'p01', d: 'Roasted and lightly spiced nuts.' },
    { n: 'Palkova Poli', c: 'sweets', i: 'p11', r: 'r_sweet', d: 'Traditional poli stuffed with sweet palkova.' }
  ];
  var CATS = [['all', 'All'], ['snacks', 'Snacks'], ['tiffin', 'Tiffin & Combos'], ['live', 'Live Counter'], ['sweets', 'Sweets & Salads']];
  var CATNAME = { snacks: 'Snack', tiffin: 'Tiffin', live: 'Live counter', sweets: 'Sweet / Salad' };

  /* ---------- helpers ---------- */
  function splitWords(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'); o.className = 'sw';
            var i = document.createElement('span'); i.className = 'si'; i.textContent = t;
            o.appendChild(i); frag.appendChild(o);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName.toLowerCase() !== 'svg' && !ch.classList.contains('sw')) walk(ch);
      });
    })(el);
  }

  /* ---------- tilt cards (3D + glare) ---------- */
  function bindTilt(scope) {
    if (!fine || reduce) return;
    $$('.tilt:not([data-t])', scope).forEach(function (el) {
      el.dataset.t = 1;
      if (!$('.glare', el)) { var g = document.createElement('i'); g.className = 'glare'; el.appendChild(g); }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add('hot');
        el.style.setProperty('--ry', ((x - .5) * 14).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - y) * 14).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (x * 100) + '%'); el.style.setProperty('--gy', (y * 100) + '%');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('hot'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- reveal on scroll (IntersectionObserver, works without GSAP) ---------- */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .04, rootMargin: '0px 0px -30px 0px' });
  }
  function watch(scope) {
    $$('.rv:not(.in)', scope).forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });
  }

  /* ---------- header, mobile menu, progress, back-to-top ---------- */
  var head = $('header.site'), btt = $('.top-btn'), prog = $('.progress'), lastY = 0;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (btt) btt.classList.toggle('show', y > 700);
    if (head && !document.body.classList.contains('menu-open')) {
      if (y > lastY + 6 && y > 300) head.classList.add('hide'); else if (y < lastY - 6 || y < 200) head.classList.remove('hide');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (btt) btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  var burger = $('.burger'), mm = $('.mmenu');
  function setMenu(open) {
    if (!burger || !mm) return;
    mm.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open); document.body.style.overflow = open ? 'hidden' : '';
    if (open && head) head.classList.remove('hide');
  }
  if (burger && mm) {
    burger.addEventListener('click', function () { setMenu(!mm.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });
  }

  /* ---------- page transition (curtain) ---------- */
  var curtain = $('.curtain');
  if (curtain && animate) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === '_blank') return;
      var href = a.getAttribute('href');
      if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
      e.preventDefault(); setMenu(false);
      curtain.style.display = ''; curtain.style.pointerEvents = 'auto';
      var cimg = $('img', curtain); if (cimg) cimg.style.opacity = 0;
      G.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: .6, ease: 'power4.inOut', onComplete: function () { location.href = href; } });
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { G.set(curtain, { yPercent: -100, display: 'none' }); } });
  }

  /* ---------- flip cards (hover on desktop, tap/Enter on touch) ---------- */
  $$('.flip').forEach(function (f) {
    f.addEventListener('click', function () { f.classList.toggle('on'); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.classList.toggle('on'); } });
  });

  /* ---------- counters ---------- */
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', done = false;
    var run = function () {
      if (done) return; done = true;
      if (reduce) { el.textContent = end + suf; return; }
      var t0 = performance.now(), dur = 1600;
      (function step(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(end * e) + suf; if (k < 1) requestAnimationFrame(step); })(t0);
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .5 }).observe(el); else run();
  });

  /* ---------- marquee: duplicate for seamless loop ---------- */
  $$('.mq .track').forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* ---------- menu page ---------- */
  function card(m) {
    return '<article class="mcard tilt" data-cat="' + m.c + '"><div class="im"><img src="assets/img/' + m.i + '.jpg" alt="' + esc(m.n) + '" loading="lazy"><span class="tag">' + CATNAME[m.c] + '</span></div>' +
      '<div class="bd"><h3>' + esc(m.n) + '</h3><p>' + esc(m.d) + '</p></div></article>';
  }
  var grid = $('#menuGrid');
  if (grid) {
    var cur = 'all', q = '', tabs = $('#menuTabs');
    tabs.innerHTML = CATS.map(function (c, i) { return '<button class="tab" role="tab" aria-selected="' + (i === 0) + '" data-c="' + c[0] + '">' + c[1] + '</button>'; }).join('');
    var draw = function (first) {
      var list = MENU.filter(function (m) { return (cur === 'all' || m.c === cur) && (!q || (m.n + ' ' + m.d).toLowerCase().indexOf(q) > -1); });
      grid.innerHTML = list.map(card).join('');
      $('#menuEmpty').style.display = list.length ? 'none' : 'block';
      $('#menuCount').textContent = list.length + (list.length === 1 ? ' dish' : ' dishes');
      bindTilt(grid);
      if (animate && !first) G.from($$('.mcard', grid), { y: 40, opacity: 0, scale: .94, duration: .6, stagger: .04, ease: 'power3.out', clearProps: 'transform,opacity' });
      else if (animate) G.from($$('.mcard', grid), { y: 50, opacity: 0, duration: .8, stagger: .05, ease: 'power3.out', delay: .9, clearProps: 'transform,opacity' });
    };
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (!b) return; cur = b.dataset.c;
      $$('.tab', tabs).forEach(function (t) { t.setAttribute('aria-selected', t === b); }); draw();
    });
    $('#menuSearch').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); draw(); });
    var hash = location.hash.replace('#', '');
    if (CATS.some(function (c) { return c[0] === hash; })) { cur = hash; $$('.tab', tabs).forEach(function (t) { t.setAttribute('aria-selected', t.dataset.c === cur); }); }
    draw(true);
  }

  /* ---------- home: dishes strip ---------- */
  var dt = $('#dishTrack');
  if (dt) {
    var picks = ['Pani Puri', 'Set Dosa (Live Counter)', 'Medu Vada & Bonda', 'Breakfast Combo', 'Channa Samosa', 'Palkova Poli'];
    dt.innerHTML = picks.map(function (n) {
      var m = MENU.filter(function (x) { return x.n === n; })[0];
      return '<article class="dish tilt"><div class="rd"><img src="assets/img/' + m.r + '.jpg" alt="' + esc(m.n) + '" loading="lazy"></div><div class="cd"><span class="tg">' + CATNAME[m.c] + '</span><h3>' + esc(m.n) + '</h3><p>' + esc(m.d) + '</p></div></article>';
    }).join('');
  }

  /* ---------- gallery lightbox ---------- */
  var gal = $$('.gal button');
  if (gal.length) {
    var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<button class="close" type="button" aria-label="Close">&times;</button><button class="prev" type="button" aria-label="Previous">‹</button><img alt=""><button class="next" type="button" aria-label="Next">›</button>';
    document.body.appendChild(lb);
    var idx = 0, im = $('img', lb);
    var show = function (i) { idx = (i + gal.length) % gal.length; var s = $('img', gal[idx]); im.src = s.src; im.alt = s.alt; };
    gal.forEach(function (b, i) { b.addEventListener('click', function () { show(i); lb.classList.add('open'); $('.close', lb).focus(); }); });
    $('.close', lb).addEventListener('click', function () { lb.classList.remove('open'); });
    $('.prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.next', lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lb.classList.remove('open'); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  bindTilt(document); watch(document);
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- GSAP: intro + scroll animations ---------- */
  if (!animate) { if (curtain) curtain.style.display = 'none'; return; }

  $$('.hero h1, .banner h1, h2.splt').forEach(splitWords);

  var first = !sessionStorage.getItem('sp_seen'); try { sessionStorage.setItem('sp_seen', '1'); } catch (e) { }
  var started = false;
  function intro() {
    if (started) return; started = true;
    var tl = G.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(curtain, { yPercent: -100, duration: .9, ease: 'power4.inOut', delay: first ? .5 : .05, onComplete: function () { curtain.style.display = 'none'; } });
    tl.to('.hero .si, .banner .si', { y: 0, duration: 1, stagger: .07 }, '-=.35');
    tl.to('.hero-in', { opacity: 1, y: 0, duration: .9, stagger: .1 }, '-=.7');
    if ($('.stage')) {
      tl.from('.stage .main', { scale: .3, rotate: -90, opacity: 0, duration: 1.4, ease: 'back.out(1.4)' }, 0.9);
      tl.from('.stage .orbit .o', { scale: 0, opacity: 0, duration: .9, stagger: .12, ease: 'back.out(2)' }, 1.3);
      tl.from('.stage .sticker', { scale: 0, rotate: -40, opacity: 0, duration: .8, stagger: .15, ease: 'back.out(2.4)' }, 1.6);
    }
    if ($('.art')) tl.from('.art .blob, .art .ring, .art img, .art .chip', { scale: .6, opacity: 0, duration: .9, stagger: .1, ease: 'back.out(1.6)' }, 0.9);
    tl.from('.banner .bp', { scale: 0, opacity: 0, duration: 1, stagger: .15, ease: 'back.out(1.8)' }, 1);
  }
  var cimg = $('img', curtain);
  if (cimg && !cimg.complete) cimg.addEventListener('load', function () { }, { once: true });
  var waited = first ? 900 : 120;
  window.addEventListener('load', function () { setTimeout(intro, waited); });
  setTimeout(intro, 2600);

  /* heading reveals */
  $$('h2.splt').forEach(function (h) {
    ST.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () { G.to($$('.si', h), { y: 0, duration: 1, stagger: .05, ease: 'power4.out' }); } });
  });

  /* hero 3D tilt + parallax */
  var hero = $('.hero');
  if (hero && fine && $('.scene', hero)) {
    var scene = $('.scene', hero), stage = $('.stage', hero);
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      scene.style.transform = 'rotateY(' + (x * 18) + 'deg) rotateX(' + (-y * 14) + 'deg)';
      G.to('.bgword', { x: x * -40, duration: 1, overwrite: 'auto' });
    });
    hero.addEventListener('pointerleave', function () { scene.style.transform = ''; });
  }
  if ($('.bgword')) G.to('.bgword', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  if ($('.stage')) G.to('.stage', { yPercent: -10, rotate: 4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* scrubbed story text */
  var big = $('.story .big');
  if (big) {
    var html = big.innerHTML.replace(/(>|^)([^<]+)/g, function (m, a, t) { return a + t.replace(/(\S+)/g, '<span class="w">$1</span>'); });
    big.innerHTML = html;
    var words = $$('.w', big);
    ST.create({
      trigger: big, start: 'top 78%', end: 'bottom 50%', scrub: true, onUpdate: function (self) {
        var n = Math.round(self.progress * words.length); words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
      }
    });
  }
  /* polaroids parallax */
  if ($('.pol-stack')) {
    [['.p1', -60, -4], ['.p2', 70, 10], ['.p3', -30, 3]].forEach(function (p) {
      G.to('.pol-stack ' + p[0], { y: p[1], rotate: p[2], ease: 'none', scrollTrigger: { trigger: '.pol-stack', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
  }
  /* image parallax inside frames */
  $$('.imgbox .main img').forEach(function (img) {
    G.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.imgbox .float').forEach(function (f, i) {
    G.to(f, { y: i ? 40 : -40, ease: 'none', scrollTrigger: { trigger: f.parentNode, start: 'top bottom', end: 'bottom top', scrub: 1 } });
  });

  /* horizontal scroll on desktop */
  var hs = $('.hs'), track = $('.hs-track');
  if (hs && track) {
    var mql = G.matchMedia();
    mql.add('(min-width: 900px)', function () {
      var dist = function () { return Math.max(0, track.scrollWidth - document.documentElement.clientWidth); };
      G.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: hs, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$('.dish .rd', track).forEach(function (rd) { G.to(rd, { rotate: 220, ease: 'none', scrollTrigger: { trigger: hs, start: 'top top', end: function () { return '+=' + dist(); }, scrub: .8 } }); });
    });
  }

  /* timeline */
  var tl = $('.tl');
  if (tl) {
    G.to('.tl .fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 65%', end: 'bottom 60%', scrub: true } });
    $$('.tstep', tl).forEach(function (s) { ST.create({ trigger: s, start: 'top 68%', onEnter: function () { s.classList.add('in'); }, onLeaveBack: function () { s.classList.remove('in'); } }); });
  }

  /* gallery columns parallax */
  if ($('.gal') && window.matchMedia('(min-width:701px)').matches) {
    $$('.gal .gcol').forEach(function (c, i) {
      G.fromTo(c, { y: [40, -30, 70][i % 3] }, { y: [-60, 50, -90][i % 3], ease: 'none', scrollTrigger: { trigger: '.gal', start: 'top bottom', end: 'bottom top', scrub: .8 } });
    });
  }

  /* cta + footer */
  if ($('.cta-band h2')) G.from('.cta-band h2', { scale: .85, opacity: 0, ease: 'power3.out', duration: 1, scrollTrigger: { trigger: '.cta-band', start: 'top 75%' } });
  if ($('.fmega')) G.from('.fmega', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.fmega', start: 'top 100%' } });

  window.addEventListener('load', function () { ST.refresh(); });
})();
