/* RJ Labs presence check. Runs entirely in the browser. Nothing is sent anywhere. */
(function () {
  'use strict';

  var EMAIL = 'rowan@rj-labs.com';
  var STORE_KEY = 'rjlabs-check-v1';

  function q(id) { return document.getElementById(id); }
  function enc(s) { return encodeURIComponent(s); }

  function googleSearch(s) { return 'https://www.google.com/search?q=' + enc(s.name + ' ' + s.town); }
  function googleMaps(s) { return 'https://www.google.com/maps/search/?api=1&query=' + enc(s.name + ' ' + s.town); }
  function appleMaps(s) { return 'https://maps.apple.com/?q=' + enc(s.name + ' ' + s.town); }

  // kind: ok = fine, problem = costing customers, unsure = worth a second look
  var STEPS = [
    {
      id: 'google',
      title: 'Search for your business on Google',
      lead: 'This opens a Google search for your business in a new tab.',
      open: 'Open Google search',
      url: googleSearch,
      tip: 'On a computer the box is on the right side. On a phone it is near the top. When you are done looking, come back to this page.',
      ask: 'Do you see a box with your business name, hours, and phone number?',
      answers: [
        { label: 'Yes, I see it', kind: 'ok' },
        { label: 'No, I do not see it', kind: 'problem',
          title: 'Google does not show your business properly',
          text: 'People who search your name may not see your hours or phone number, so some may call someone else instead.' },
        { label: 'I am not sure', kind: 'unsure',
          title: 'You were not sure what Google shows',
          text: 'Look for one box with your business name, stars, hours, and a Call button together.' }
      ]
    },
    {
      id: 'maps-contact',
      title: 'Check Google Maps',
      lead: 'This opens Google Maps with your business name and town.',
      open: 'Open Google Maps',
      url: googleMaps,
      tip: 'On a phone this may open the Maps app. Come back here when you are done.',
      ask: 'Are your address and phone number right?',
      answers: [
        { label: 'Yes, both are right', kind: 'ok' },
        { label: 'No, something is wrong', kind: 'problem',
          title: 'Google Maps has the wrong address or phone number',
          text: 'People are being sent to the wrong place, or calling a number that does not reach you.' },
        { label: 'My business is not on Google Maps', kind: 'problem',
          title: 'Your business does not show up on Google Maps',
          text: 'Someone looking for directions to you cannot find you at all.' },
        { label: 'I am not sure', kind: 'unsure',
          title: 'You were not sure about your address and phone number on Google Maps',
          text: 'Search your business on Google Maps and compare the address and phone number to your real ones.' }
      ]
    },
    {
      id: 'maps-hours',
      title: 'Check your hours',
      lead: 'Stay on the same Google Maps page, or open it again below.',
      open: 'Open Google Maps again',
      url: googleMaps,
      tip: '',
      ask: 'Are the hours Google shows for you right?',
      answers: [
        { label: 'Yes, the hours are right', kind: 'ok' },
        { label: 'No, they are wrong', kind: 'problem',
          title: 'Google is showing the wrong hours',
          text: 'Somebody looks you up at 6pm, sees you as closed, and may go somewhere else. Or they drive over when you are actually closed.' },
        { label: 'There are no hours listed', kind: 'problem',
          title: 'Google does not show your hours',
          text: 'People cannot tell if you are open, so some will pick a place where they can tell.' },
        { label: 'I am not sure', kind: 'unsure',
          title: 'You were not sure about the hours Google shows',
          text: 'Compare the hours on Google Maps to the hours on your door.' }
      ]
    },
    {
      id: 'website',
      title: 'Tap your Website button',
      lead: 'On the Google page that opens, find the box for your business, then tap or click the button that says Website.',
      open: 'Open Google search',
      url: googleSearch,
      tip: 'This is the check most people never do.',
      ask: 'Does it take you to your own website?',
      answers: [
        { label: 'Yes, it is my website', kind: 'ok' },
        { label: 'No, it goes somewhere else', kind: 'problem',
          title: 'Your Website button sends people somewhere that is not yours',
          text: 'Customers who tap it land on a page that has nothing to do with you. This one is worth fixing soon. It can happen when an old web address runs out and someone else buys it.' },
        { label: 'There is no Website button', kind: 'unsure',
          title: 'Your Google listing has no Website button',
          text: 'If you have a website, customers cannot get to it from Google. If you do not have one, this is fine.' },
        { label: 'I am not sure', kind: 'unsure',
          title: 'You were not sure where your Website button goes',
          text: 'Tap Website on your Google listing and see whose page opens.' }
      ]
    },
    {
      id: 'apple',
      title: 'Check Apple Maps',
      lead: 'Apple Maps is completely separate from Google. iPhones come with it, and fixing your Google listing does not fix Apple Maps.',
      open: 'Open Apple Maps',
      url: appleMaps,
      tip: 'Easiest way: open the Maps app on an iPhone and search your business name.',
      ask: 'Is your business there, with the right address, phone number, and hours?',
      answers: [
        { label: 'Yes, everything is right', kind: 'ok' },
        { label: 'No, something is wrong or missing', kind: 'problem',
          title: 'Apple Maps is missing you or has something wrong',
          text: 'People with iPhones who look you up get the wrong information, or do not find you at all.' },
        { label: 'I cannot check right now', kind: 'unsure',
          title: 'You could not check Apple Maps',
          text: 'Open the Maps app on any iPhone and search your business name. It takes a minute.' }
      ]
    },
    {
      id: 'reviews',
      title: 'Look at your reviews',
      lead: 'Look at the reviews on your Google listing.',
      open: 'Open Google search again',
      url: googleSearch,
      tip: '',
      ask: 'When somebody leaves you a review, does anyone reply?',
      answers: [
        { label: 'Yes, we reply', kind: 'ok' },
        { label: 'No, not usually', kind: 'problem',
          title: 'Reviews are going unanswered',
          text: 'People reading your reviews see nobody replying. A short thank you, or a calm answer to a complaint, shows them someone is paying attention.' },
        { label: 'We do not have reviews yet', kind: 'unsure',
          title: 'You do not have reviews yet',
          text: 'Asking a few happy regulars to leave a review is the easiest place to start.' },
        { label: 'I am not sure', kind: 'unsure',
          title: 'You were not sure whether anyone replies to reviews',
          text: 'Open a few reviews on your Google listing and look for a reply from the owner under each one.' }
      ]
    }
  ];

  var state = { screen: 'start', name: '', town: '', step: 0, answers: [] };

  function save() { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable, keep going */ } }
  function load() {
    try {
      var raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === 'object' && Array.isArray(s.answers)) { state = s; }
      }
    } catch (e) { /* ignore */ }
  }

  var panels = { start: q('tool-start'), question: q('tool-question'), result: q('tool-result') };

  function show(screen, focus) {
    state.screen = screen;
    Object.keys(panels).forEach(function (k) { panels[k].hidden = (k !== screen); });
    save();
    if (screen === 'start') renderStart();
    if (screen === 'question') renderQuestion();
    if (screen === 'result') renderResult();
    if (focus) {
      var h = panels[screen].querySelector('.q-title');
      if (h) {
        h.focus({ preventScroll: true });
        var top = q('tool').getBoundingClientRect().top + window.pageYOffset - 90;
        if (Math.abs(window.pageYOffset - top) > 40 && q('tool').getBoundingClientRect().top < 60) {
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    }
  }

  function renderStart() {
    q('biz-name').value = state.name || '';
    q('biz-town').value = state.town || '';
  }

  function renderQuestion() {
    var s = STEPS[state.step];
    q('progress-bar').style.width = Math.round(((state.step) / STEPS.length) * 100) + '%';
    q('step-label').textContent = 'Step ' + (state.step + 1) + ' of ' + STEPS.length;
    q('q-title').textContent = s.title;
    q('q-lead').textContent = s.lead;
    var open = q('q-open');
    open.textContent = s.open + ' (new tab)';
    open.href = s.url(state);
    q('q-tip').textContent = s.tip;
    q('q-ask').textContent = s.ask;
    var box = q('answers');
    box.innerHTML = '';
    s.answers.forEach(function (a, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'answer';
      b.textContent = a.label;
      b.setAttribute('aria-pressed', state.answers[state.step] === i ? 'true' : 'false');
      b.addEventListener('click', function () { choose(i); });
      box.appendChild(b);
    });
    q('btn-back').textContent = state.step === 0 ? 'Back to business name' : 'Back';
  }

  function choose(i) {
    state.answers[state.step] = i;
    if (state.step < STEPS.length - 1) {
      state.step += 1;
      show('question', true);
    } else {
      show('result', true);
    }
  }

  function collect() {
    var problems = [], unsure = [];
    STEPS.forEach(function (s, idx) {
      var ai = state.answers[idx];
      if (ai === undefined || ai === null) return;
      var a = s.answers[ai];
      if (!a) return;
      if (a.kind === 'problem') problems.push(a);
      if (a.kind === 'unsure') unsure.push(a);
    });
    return { problems: problems, unsure: unsure };
  }

  var WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];

  function listItems(ul, items) {
    ul.innerHTML = '';
    items.forEach(function (a) {
      var li = document.createElement('li');
      var st = document.createElement('strong');
      st.textContent = a.title;
      var sp = document.createElement('span');
      sp.textContent = a.text;
      li.appendChild(st); li.appendChild(sp);
      ul.appendChild(li);
    });
  }

  function emailParts(found) {
    var subject = 'Free check results for ' + state.name;
    var lines = [
      'Hi Rowan,', '',
      'I ran the free check on rj-labs.com for my business.', '',
      'Business: ' + state.name,
      'Town: ' + state.town, ''
    ];
    if (found.problems.length) {
      lines.push('What looked wrong:');
      found.problems.forEach(function (a) { lines.push('- ' + a.title); });
      lines.push('');
    }
    if (found.unsure.length) {
      lines.push('What I was not sure about:');
      found.unsure.forEach(function (a) { lines.push('- ' + a.title); });
      lines.push('');
    }
    lines.push('Can you take a look?', '', 'My name:', 'Best phone number (optional):');
    return { subject: subject, body: lines.join('\r\n') };
  }

  function renderResult() {
    var found = collect();
    var n = found.problems.length, u = found.unsure.length;
    var title = q('result-title');
    title.classList.remove('is-clean');
    q('result-copy').hidden = false;
    q('copy-status').textContent = '';

    if (n > 0) {
      title.textContent = 'You found ' + (WORDS[n] || n).toLowerCase() + (n === 1 ? ' thing' : ' things') + ' worth fixing.';
      q('result-lead').textContent = 'Here is what each one can mean for customers looking up ' + state.name + '.';
    } else if (u > 0) {
      title.textContent = 'Nothing you checked looks wrong.';
      q('result-lead').textContent = 'There ' + (u === 1 ? 'is one thing' : 'are a few things') + ' you were not sure about. You can check ' + (u === 1 ? 'it' : 'them') + ' yourself using the tips below.';
    } else {
      title.textContent = 'Everything looks good.';
      title.classList.add('is-clean');
      q('result-lead').textContent = 'From what you saw, Google and Apple Maps are showing people the right information about ' + state.name + '.';
    }

    listItems(q('findings'), found.problems);
    q('findings').hidden = n === 0;
    listItems(q('unsure'), found.unsure);
    q('unsure-wrap').hidden = u === 0;

    var cta = q('result-cta');
    cta.hidden = (n === 0 && u === 0);
    q('result-clean').hidden = !(n === 0 && u === 0);
    if (!cta.hidden) {
      cta.querySelector('.result-cta-title').textContent = n > 0
        ? 'Want us to fix these for you? Free to look.'
        : 'Want us to look at these for you instead? Free, no obligation.';
      var parts = emailParts(found);
      q('result-mail').href = 'mailto:' + EMAIL + '?subject=' + enc(parts.subject) + '&body=' + enc(parts.body);
    }
    q('progress-bar').style.width = '100%';
  }

  function copyText(text, statusEl) {
    function done(ok) {
      statusEl.textContent = ok
        ? 'Copied. Paste it into a new email to ' + EMAIL + '.'
        : 'Could not copy automatically. Please email ' + EMAIL + ' and tell us your business name.';
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta); done(ok);
      } catch (e) { done(false); }
    }
  }

  function init() {
    if (!panels.start) return;
    load();

    q('tool-start').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = q('biz-name').value.trim(), town = q('biz-town').value.trim();
      if (!name || !town) {
        q('start-error').hidden = false;
        (name ? q('biz-town') : q('biz-name')).focus();
        return;
      }
      q('start-error').hidden = true;
      if (name !== state.name || town !== state.town) { state.answers = []; }
      state.name = name; state.town = town; state.step = 0;
      show('question', true);
    });

    q('btn-back').addEventListener('click', function () {
      if (state.step === 0) { show('start', true); }
      else { state.step -= 1; show('question', true); }
    });
    q('btn-result-back').addEventListener('click', function () { state.step = STEPS.length - 1; show('question', true); });
    q('btn-restart').addEventListener('click', function () {
      state = { screen: 'start', name: '', town: '', step: 0, answers: [] };
      show('start', true);
    });
    q('result-copy').addEventListener('click', function () {
      var p = emailParts(collect());
      copyText('To: ' + EMAIL + '\r\nSubject: ' + p.subject + '\r\n\r\n' + p.body, q('copy-status'));
    });

    var screen = (state.screen === 'question' || state.screen === 'result') && state.name ? state.screen : 'start';
    if (state.step < 0 || state.step >= STEPS.length) state.step = 0;
    show(screen, false);
  }

  function mailForms() {
    var lead = q('lead-form');
    if (lead) lead.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = q('lead-name').value.trim(), town = q('lead-town').value.trim();
      if (!name || !town) { q('lead-error').hidden = false; return; }
      q('lead-error').hidden = true;
      var body = ['Hi Rowan,', '', 'Could you check my business for me?', '', 'Business: ' + name, 'Town: ' + town, '', 'My name:', 'Best phone number (optional):'].join('\r\n');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + enc('Please check my business: ' + name) + '&body=' + enc(body);
    });

    var contact = q('contact-form');
    if (contact) contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = q('c-name').value.trim(), b = q('c-biz').value.trim(), m = q('c-msg').value.trim();
      if (!n || !m) { q('contact-error').hidden = false; return; }
      q('contact-error').hidden = true;
      var body = ['Hi Rowan,', '', m, '', 'Name: ' + n].concat(b ? ['Business: ' + b] : []).join('\r\n');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + enc('Question from ' + (b || n)) + '&body=' + enc(body);
    });
  }

  function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  init();
  mailForms();
  reveal();
})();
