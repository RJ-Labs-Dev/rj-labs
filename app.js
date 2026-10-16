/* RJ Labs site behavior: mobile menu, old link redirects, example animation, contact form. */
(function () {
  'use strict';

  var EMAIL = 'rowan@rj-labs.com';
  var PHONE = '(928) 863-8198';

  // Inquiries post to RJ Labs' own Google Form ("RJ Labs contact", owned by info@rj-labs.com).
  var FORM_POST = 'https://docs.google.com/forms/d/e/1FAIpQLSfpcxdRJSl2qsStFCW76eo3QYnYRosberZ2S7PVgVCC95Lozw/formResponse';
  var FIELD = {
    name: 'entry.1931311903',
    business: 'entry.1947405332',
    phone: 'entry.441750110',
    email: 'entry.1930709784',
    message: 'entry.1753243788'
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function q(id) { return document.getElementById(id); }

  /* Old section links from the previous site still land somewhere sensible. */
  var ALIASES = { '#work': '#about', '#why': '#automate', '#owner': '#about' };
  function followAlias() {
    var target = ALIASES[window.location.hash];
    if (target && document.querySelector(target)) {
      history.replaceState(null, '', target);
      document.querySelector(target).scrollIntoView();
    }
  }
  followAlias();
  window.addEventListener('hashchange', followAlias);

  /* Mobile menu */
  var toggle = q('menu-toggle'), nav = q('site-nav');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) setMenu(false); });
  }

  /* Example workflow: highlight steps in order. Decorative only, off for reduced motion. */
  (function flow() {
    var steps = document.querySelectorAll('.flow-step');
    if (!steps.length || reduceMotion) return;
    var i = 0, timer = null;
    function tick() {
      steps.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
      i = (i + 1) % steps.length;
    }
    function start() { if (!timer) { tick(); timer = setInterval(tick, 2200); } }
    function stop() { clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }).observe(steps[0].closest('.flow'));
    } else { start(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  })();

  /* Reveal on scroll */
  (function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  var year = q('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Contact form */
  var form = q('contact-form');
  if (!form) return;
  var loadedAt = Date.now();
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, errId, show) {
    var err = q(errId);
    if (err) err.hidden = !show;
    if (show) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }

  function clean(v, max) { return String(v || '').replace(/\u0000/g, '').trim().slice(0, max); }

  ['c-name', 'c-email', 'c-msg'].forEach(function (id) {
    var el = q(id);
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) setError(el, id + '-err', false); });
  });

  function send(data) {
    var body = new FormData();
    body.append(FIELD.name, data.name);
    body.append(FIELD.business, data.business);
    body.append(FIELD.phone, data.phone);
    body.append(FIELD.email, data.email);
    body.append(FIELD.message, data.message);
    var controller = 'AbortController' in window ? new AbortController() : null;
    var t = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;
    // Google Forms does not allow reading the response from another site (no-cors).
    // A network failure or timeout still rejects, and is shown to the visitor as an error.
    return fetch(FORM_POST, { method: 'POST', mode: 'no-cors', body: body, signal: controller ? controller.signal : undefined })
      .finally(function () { if (t) clearTimeout(t); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = q('c-name'), email = q('c-email'), msg = q('c-msg');
    var nameV = clean(name.value, 100), emailV = clean(email.value, 200), msgV = clean(msg.value, 4000);
    var bad = [];
    setError(name, 'c-name-err', !nameV); if (!nameV) bad.push(name);
    var emailOk = EMAIL_RE.test(emailV);
    setError(email, 'c-email-err', !emailOk); if (!emailOk) bad.push(email);
    setError(msg, 'c-msg-err', msgV.length < 3); if (msgV.length < 3) bad.push(msg);
    if (bad.length) { bad[0].focus(); return; }

    // Spam checks: hidden field filled, or submitted faster than a person could type.
    if (q('c-hp').value || Date.now() - loadedAt < 2500) {
      showSent();
      return;
    }

    var biz = clean(q('c-biz').value, 150), site = clean(q('c-site').value, 200), phone = clean(q('c-phone').value, 40);
    var message = msgV + (site ? '\n\nWebsite: ' + site : '') + '\n\n(Sent from the rj-labs.com automation inquiry form)';

    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.dataset.label = btn.dataset.label || btn.textContent;
    btn.textContent = 'Sending...';
    var status = q('contact-status');
    status.className = 'send-status';
    status.textContent = '';

    send({ name: nameV, business: biz, phone: phone, email: emailV, message: message })
      .then(showSent)
      .catch(function () {
        btn.disabled = false;
        btn.textContent = btn.dataset.label;
        status.className = 'send-status is-bad';
        status.innerHTML = '';
        var p = document.createElement('p');
        p.textContent = 'That did not go through. Please try again, or email ' + EMAIL + ' or call or text ' + PHONE + '.';
        status.appendChild(p);
        status.focus();
      });
  });

  function showSent() {
    var status = q('contact-status');
    form.hidden = true;
    status.className = 'send-status is-good';
    status.innerHTML = '';
    var s = document.createElement('strong');
    s.textContent = 'Thanks, your message was sent.';
    var p = document.createElement('p');
    p.textContent = 'This is not a booked appointment. Rowan will reply by email to talk through your workflow and find a time if a call makes sense.';
    var p2 = document.createElement('p');
    p2.textContent = 'Need to add something? Email ' + EMAIL + '.';
    status.appendChild(s); status.appendChild(p); status.appendChild(p2);
    status.focus();
  }
})();
