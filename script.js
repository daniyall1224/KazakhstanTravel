/* =====================================================================
   Kazakhstan Travel Company - Assignment 6 (jQuery)
   Built on top of Assignment 5 (Advanced JS and DOM).
   One script is shared by all pages. It is loaded in <head>, so all code
   runs inside $(document).ready() when the HTML is ready.
   Every block checks that its elements exist before running.
   ===================================================================== */

$(document).ready(function () {
  console.log('jQuery is ready!');

  /* ========== Assignment 6 helpers (jQuery) ========== */

  // Task 7. Toast notification: fades in, waits, then fades out and is removed
  const $toastBox = $('<div class="toast-box" role="status" aria-live="polite"></div>').appendTo('body');
  const TOAST_ICONS = { success: '\u2713', info: 'i', error: '!' };

  function showToast(message, type = 'success') {
    const $toast = $('<div class="toast"></div>').addClass(`toast-${type}`);
    $('<span class="toast-icon" aria-hidden="true"></span>').text(TOAST_ICONS[type] || 'i').appendTo($toast);
    $('<span class="toast-text"></span>').text(message).appendTo($toast);
    $('<button class="toast-close" type="button" aria-label="Close notification">&times;</button>')
      .on('click', () => $toast.stop(true).fadeOut(200, () => $toast.remove()))
      .appendTo($toast);

    $toast.hide().appendTo($toastBox)
      .fadeIn(250)
      .delay(3000)
      .fadeOut(700, () => $toast.remove());
  }

  // Task 6. Loading state for a submit button
  function startLoading($btn, text = 'Please wait...') {
    $btn.data('label', $btn.html())
      .prop('disabled', true)
      .addClass('is-loading')
      .attr('aria-busy', 'true')
      .html(`<span class="spinner" aria-hidden="true"></span>${text}`);
  }
  function stopLoading($btn) {
    $btn.html($btn.data('label'))
      .prop('disabled', false)
      .removeClass('is-loading')
      .removeAttr('aria-busy');
  }

  // Task 3. Highlight helpers (regex + .html())
  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function escapeHtml(text) {
    return $('<div>').text(text).html();
  }
  // Wraps every match of `query` in `html` with <mark>, but only in text, never inside tags.
  // Returns the new html and the number of matches.
  function wrapMatches(html, query, tag = 'mark class="hl"') {
    if (!query) return { html, count: 0 };
    const closeTag = tag.split(' ')[0];
    const re = new RegExp(`(${escapeRegex(escapeHtml(query))})`, 'gi');
    let count = 0;
    const result = html.replace(/(<[^>]+>)|([^<]+)/g, (match, htmlTag, text) => {
      if (htmlTag) return htmlTag;
      return text.replace(re, found => {
        count++;
        return `<${tag}>${found}</${closeTag}>`;
      });
    });
    return { html: result, count };
  }
  // Highlights `query` inside every element of a jQuery set. Returns the number of matches.
  function highlight($elements, query) {
    let total = 0;
    $elements.each(function () {
      const $el = $(this);
      if ($el.data('original') === undefined) $el.data('original', $el.html());   // remember clean html
      const { html, count } = wrapMatches($el.data('original'), query);
      $el.html(html);
      total += count;
    });
    return total;
  }

  // Is an element (almost) inside the visible part of the window?
  function isInView($el, margin = 0) {
    const top = $el.offset().top;
    const bottom = top + $el.outerHeight();
    const viewTop = $(window).scrollTop();
    const viewBottom = viewTop + $(window).height();
    return top < viewBottom + margin && bottom > viewTop - margin;
  }

  /* ========== Helpers ========== */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Show or clear an error message under an input and mark the input state
  function setError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.toggle('invalid', Boolean(message));
    input.classList.toggle('valid', !message);
    return !message;
  }

  // localStorage wrappers (safe if storage is blocked)
  function saveData(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* ignore */ }
  }
  function loadData(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  /* ========== Sound effects (Web Audio API, no audio files needed) ========== */
  // Each sound is a list of [frequency in Hz, duration in seconds]
  const SOUNDS = {
    click:   [[520, 0.07]],
    star:    [[660, 0.08], [880, 0.12]],
    success: [[523, 0.1], [659, 0.1], [784, 0.18]],
    error:   [[220, 0.12], [180, 0.18]],
    open:    [[440, 0.07], [587, 0.09]]
  };
  let soundOn = loadData('soundOn', false);
  let audioCtx = null;
  let activeOsc = null;

  // Stop the current sound so that two sounds never overlap
  function stopSound() {
    if (activeOsc) {
      try { activeOsc.stop(); } catch (err) { /* already stopped */ }
      activeOsc = null;
    }
  }

  function playSound(name) {
    const notes = SOUNDS[name];
    if (!soundOn || !notes) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      stopSound();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      let t = audioCtx.currentTime;
      notes.forEach(([freq, duration]) => {
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.95);
        t += duration;
      });
      osc.onended = () => { if (activeOsc === osc) activeOsc = null; };
      osc.start();
      osc.stop(t);
      activeOsc = osc;
    } catch (err) {
      console.warn('Sound is not available:', err);
    }
  }

  const soundBtn = document.getElementById('soundBtn');
  function updateSoundButton() {
    soundBtn.textContent = soundOn ? 'Sound: on' : 'Sound: off';
    soundBtn.setAttribute('aria-pressed', String(soundOn));
  }
  if (soundBtn) {
    updateSoundButton();
    soundBtn.addEventListener('click', () => {
      soundOn = !soundOn;
      saveData('soundOn', soundOn);
      updateSoundButton();
      playSound('click');
    });
  }

  /* ========== Day / Night theme switch ========== */
  const themeBtn = document.getElementById('themeBtn');
  const colorBtn = document.getElementById('colorBtn');

  function applyTheme(theme) {
    const isNight = theme === 'night';
    document.body.classList.toggle('night', isNight);
    document.documentElement.classList.toggle('theme-night', isNight);
    document.body.style.backgroundColor = '';      // drop a color picked with the color button
    themeBtn.textContent = isNight ? 'Day mode' : 'Night mode';
    themeBtn.setAttribute('aria-pressed', String(isNight));
    if (colorBtn) colorBtn.disabled = isNight;     // color button works in day mode only
  }
  if (themeBtn) {
    let theme = loadData('theme', 'day');
    applyTheme(theme);
    themeBtn.addEventListener('click', () => {
      theme = theme === 'day' ? 'night' : 'day';
      saveData('theme', theme);
      applyTheme(theme);
      playSound('click');
    });
  }

  /* ========== Keyboard navigation for the menu (arrow keys) ========== */
  const nav = document.querySelector('nav');
  if (nav) {
    const items = Array.from(nav.querySelectorAll('a, button'));
    nav.addEventListener('keydown', event => {
      const current = items.indexOf(document.activeElement);
      if (current === -1) return;
      let target = null;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          target = items[(current + 1) % items.length];
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          target = items[(current - 1 + items.length) % items.length];
          break;
        case 'Home':
          target = items[0];
          break;
        case 'End':
          target = items[items.length - 1];
          break;
        default:
          break;
      }
      if (target) {
        event.preventDefault();
        target.focus();
      }
    });
  }

  /* ========== Popup subscription form ========== */
  const overlay = document.getElementById('popupOverlay');
  if (overlay) {
    const openBtn = document.getElementById('openPopup');
    const closeBtn = document.getElementById('closePopup');
    const subForm = document.getElementById('subscribeForm');
    const subEmail = document.getElementById('subEmail');
    const subError = document.getElementById('subError');
    const subSuccess = document.getElementById('subSuccess');

    const openPopup = () => {
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
      subEmail.focus();
      playSound('open');
    };
    const closePopup = () => {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      openBtn.focus();
    };

    openBtn.addEventListener('click', openPopup);
    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', ev => { if (ev.target === overlay) closePopup(); });
    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && overlay.classList.contains('show')) closePopup();
    });

    subForm.addEventListener('submit', ev => {
      ev.preventDefault();
      const value = subEmail.value.trim();
      subSuccess.hidden = true;
      if (!value) { playSound('error'); return setError(subEmail, subError, 'Email is required.'); }
      if (!EMAIL_RE.test(value)) { playSound('error'); return setError(subEmail, subError, 'Enter a valid email address.'); }
      setError(subEmail, subError, '');
      const $subBtn = $(subForm).find('button[type="submit"]');
      startLoading($subBtn);                      // Task 6: spinner + disabled button
      setTimeout(() => {                          // simulate a server call
        stopLoading($subBtn);
        subSuccess.hidden = false;
        const existing = loadData('kzt_subscribers_v1', []);
        saveData('kzt_subscribers_v1', Array.from(new Set([...(Array.isArray(existing) ? existing : []), value.toLowerCase()])));
        playSound('success');
        showToast('Demo subscription saved locally. No emails will be sent.', 'success');
        subForm.reset();
        subEmail.classList.remove('valid');
      }, 1800);
    });
  }

  /* ========== Accordion (FAQ) with arrow-key navigation ========== */
  const questions = Array.from(document.querySelectorAll('.acc-q'));
  questions.forEach((button, index) => {
    button.addEventListener('click', () => {
      const item = button.parentElement;
      const answer = item.querySelector('.acc-a');
      const isOpen = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
      answer.style.maxHeight = isOpen ? answer.scrollHeight + 'px' : '0';
      playSound('click');
    });

    button.addEventListener('keydown', event => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          questions[(index + 1) % questions.length].focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          questions[(index - 1 + questions.length) % questions.length].focus();
          break;
        default:
          break;
      }
    });
  });

  /* =====================================================================
     INDEX PAGE
     ===================================================================== */

  /* ========== Current date and time ========== */
  const clock = document.getElementById('clock');
  if (clock) {
    const format = new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
    const tick = () => {
      const now = new Date();
      clock.textContent = format.format(now);
      clock.setAttribute('datetime', now.toISOString());
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ========== Change page background color (dynamic style) ========== */
  if (colorBtn) {
    const colors = ['#eaf6f9', '#fdf3d6', '#f9e3d9', '#e3f1e6', '#e8e6f7', '#f4f4f0'];
    let colorIndex = 0;
    colorBtn.addEventListener('click', () => {
      colorIndex = (colorIndex + 1) % colors.length;
      document.body.style.backgroundColor = colors[colorIndex];
      playSound('click');
    });
  }

  /* ========== Greeting by time of day + personal name ========== */
  const greeting = document.getElementById('greeting');
  if (greeting) {
    const nameForm = document.getElementById('nameForm');
    const nameInput = document.getElementById('nameInput');
    let travelerName = loadData('travelerName', '');

    function getPeriod(hour) {
      if (hour < 5) return 'night';
      if (hour < 12) return 'morning';
      if (hour < 18) return 'afternoon';
      return 'evening';
    }

    // switch statement: different greeting for each part of the day
    function getGreetingText(period) {
      switch (period) {
        case 'morning':   return 'Good morning';
        case 'afternoon': return 'Good afternoon';
        case 'evening':   return 'Good evening';
        default:          return 'Good night';
      }
    }

    function updateGreeting() {
      const base = getGreetingText(getPeriod(new Date().getHours()));
      const who = travelerName ? `, ${travelerName}` : '';
      greeting.textContent = `${base}${who}! Ready to explore Kazakhstan?`;
    }

    updateGreeting();
    if (travelerName) nameInput.value = travelerName;
    nameInput.addEventListener('input', () => {
      nameInput.classList.remove('invalid');
      nameInput.removeAttribute('aria-invalid');
      document.getElementById('nameInputError').textContent = '';
    });

    nameForm.addEventListener('submit', event => {
      event.preventDefault();
      const candidate = nameInput.value.trim();
      const error = document.getElementById('nameInputError');
      const message = !candidate ? 'Please enter your name.' : candidate.length < 2
        ? 'Use at least 2 characters.' : candidate.length > 60 ? 'Keep your name under 60 characters.' : '';
      nameInput.classList.toggle('invalid', Boolean(message));
      nameInput.setAttribute('aria-invalid', String(Boolean(message)));
      error.textContent = message;
      if (message) { nameInput.focus(); playSound('error'); return; }
      travelerName = candidate;
      saveData('travelerName', travelerName);
      updateGreeting();
      playSound('success');
      showToast(`Name saved. Nice to meet you, ${travelerName}!`, 'success');
    });
  }

  /* ========== Tours: one shared catalog powers cards and detailed guides ========== */
  const tours = (window.KZT_TOURS || []).map(tour => ({
    ...tour,
    priceLabel() { return `${this.days} days from $${this.price}`; }
  }));

  const destGrid = document.getElementById('destGrid');
  if (destGrid) {
    const resultCount = document.getElementById('resultCount');
    const chips = document.querySelectorAll('.chip');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const resetFilters = document.getElementById('resetFilters');
    const filters = loadData('kzt_tour_filters_v1', { category: 'all', price: 'any' });
    if (!['all', 'mountains', 'nature', 'city', 'history'].includes(filters.category)) filters.category = 'all';
    if (!['any', 'low', 'mid', 'high'].includes(filters.price)) filters.price = 'any';
    if (!['recommended', 'priceLow', 'priceHigh', 'duration'].includes(filters.sort)) filters.sort = 'recommended';
    chips.forEach(c => {
      const active = c.dataset.filter === filters.category;
      c.classList.toggle('active', active); c.setAttribute('aria-pressed', String(active));
    });
    priceFilter.value = filters.price;
    sortFilter.value = filters.sort;
    const ratings = loadData('tourRatings', {});   // { tourId: 1..5 }

    // switch: category filter
    function matchesCategory(tour, category) {
      switch (category) {
        case 'mountains':
        case 'nature':
        case 'city':
        case 'history':
          return tour.category === category;
        default:
          return true;   // "all"
      }
    }

    // switch: price filter
    function matchesPrice(tour, range) {
      switch (range) {
        case 'low':  return tour.price < 150;
        case 'mid':  return tour.price >= 150 && tour.price <= 250;
        case 'high': return tour.price > 250;
        default:     return true;   // "any"
      }
    }

    // Rating stars: select all stars of a card and color them up to the chosen value
    function paintStars(card, value) {
      card.querySelectorAll('.star').forEach(star => {
        star.classList.toggle('selected', Number(star.dataset.value) <= value);
      });
      card.querySelector('.rating-text').textContent =
        value ? `Your rating: ${value} / 5` : 'Tap a star to rate this tour';
    }

    function createCard(tour) {
      const card = document.createElement('article');
      card.className = `dest ${tour.style}`;
      card.dataset.category = tour.category;   // used by the jQuery search
      card.innerHTML =
        `<h3>${tour.title}</h3>` +
        `<p>${tour.priceLabel()}</p>` +
        `<button class="more-btn" type="button" aria-expanded="false">Read more</button>` +
        `<p class="more">${tour.details}</p>` +
        `<div class="stars" role="group" aria-label="Rate ${tour.title}"></div>` +
        `<p class="rating-text"></p>` +
        `<a class="tour-guide-link" href="tour.html?id=${encodeURIComponent(tour.id)}">View itinerary ↗</a>` +
        `<a class="card-cta" href="profile.html?save=${encodeURIComponent(tour.id)}" aria-label="Save ${tour.title} to my trip list">♡ Save to my trips <span aria-hidden="true">→</span></a>`;

      // Build five stars with a loop
      const starsBox = card.querySelector('.stars');
      for (let value = 1; value <= 5; value++) {
        const star = document.createElement('button');
        star.type = 'button';
        star.className = 'star';
        star.dataset.value = value;
        star.setAttribute('aria-label', `${value} star${value > 1 ? 's' : ''}`);
        star.textContent = '\u2605';
        star.addEventListener('click', () => {
          ratings[tour.id] = value;
          saveData('tourRatings', ratings);
          paintStars(card, value);
          star.classList.add('pop');
          star.addEventListener('animationend', () => star.classList.remove('pop'), { once: true });
          playSound('star');
          showToast(`You rated ${tour.title}: ${value} / 5`, 'info');
        });
        starsBox.appendChild(star);
      }
      paintStars(card, ratings[tour.id] || 0);

      // "Read more": toggle visibility with style.display
      const moreBtn = card.querySelector('.more-btn');
      const more = card.querySelector('.more');
      moreBtn.addEventListener('click', () => {
        const isOpen = more.style.display === 'block';
        more.style.display = isOpen ? 'none' : 'block';
        moreBtn.textContent = isOpen ? 'Read more' : 'Show less';
        moreBtn.setAttribute('aria-expanded', String(!isOpen));
        playSound('click');
      });
      return card;
    }

    function renderTours() {
      const visible = tours
        .filter(tour => matchesCategory(tour, filters.category))
        .filter(tour => matchesPrice(tour, filters.price));
      if (filters.sort === 'priceLow') visible.sort((a,b) => a.price - b.price);
      if (filters.sort === 'priceHigh') visible.sort((a,b) => b.price - a.price);
      if (filters.sort === 'duration') visible.sort((a,b) => a.days - b.days);
      destGrid.innerHTML = '';
      visible.forEach(tour => destGrid.appendChild(createCard(tour)));
      resultCount.textContent = visible.length === 0
        ? 'No tours match these filters. Try another category or price.'
        : `Showing ${visible.length} of ${tours.length} tours`;
      $(document).trigger('tours:rendered');   // lets the jQuery search re-apply itself
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        filters.category = chip.dataset.filter;
        saveData('kzt_tour_filters_v1', filters);
        chips.forEach(other => {
          const isActive = other === chip;
          other.classList.toggle('active', isActive);
          other.setAttribute('aria-pressed', String(isActive));
        });
        renderTours();
        playSound('click');
      });
    });

    priceFilter.addEventListener('change', () => {
      filters.price = priceFilter.value;
      saveData('kzt_tour_filters_v1', filters);
      renderTours();
      playSound('click');
    });
    sortFilter.addEventListener('change', () => {
      filters.sort = sortFilter.value;
      saveData('kzt_tour_filters_v1', filters);
      renderTours();
    });
    resetFilters.addEventListener('click', () => {
      filters.category = 'all'; filters.price = 'any'; filters.sort = 'recommended';
      priceFilter.value = 'any'; sortFilter.value = 'recommended';
      document.getElementById('tourSearch').value = '';
      chips.forEach(chip => {
        const active = chip.dataset.filter === 'all';
        chip.classList.toggle('active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      saveData('kzt_tour_filters_v1', filters);
      renderTours();
      playSound('click');
    });

    renderTours();
  }

  /* ========== Random fact button ========== */
  const factBtn = document.getElementById('factBtn');
  if (factBtn) {
    const facts = [
      'Kazakhstan is the largest landlocked country in the world.',
      'Yuri Gagarin launched into space from Baikonur in 1961.',
      'Almaty is often linked to apples: wild apple forests grow in the mountains nearby.',
      'The Medeu skating rink near Almaty sits high in the mountains, at about 1,700 meters.',
      'Khan Shatyr in Astana is one of the largest tent-shaped buildings in the world.',
      'The Bayterek tower in Astana is 97 meters tall, a nod to the year 1997 when the capital moved.',
      'Charyn Canyon has a section called the Valley of Castles, shaped by wind and water.'
    ];
    const factText = document.getElementById('factText');
    const factBox = document.getElementById('factBox');
    let lastFact = -1;

    factBtn.addEventListener('click', () => {
      let next = lastFact;
      while (next === lastFact) {                       // avoid showing the same fact twice
        next = Math.floor(Math.random() * facts.length);
      }
      lastFact = next;
      factText.textContent = facts[next];
      factBox.classList.remove('flash');
      void factBox.offsetWidth;                         // restart the CSS animation
      factBox.classList.add('flash');
      playSound('open');
    });
  }

  // Final project: registration and login live in auth.js (one shared validation module).

  /* =====================================================================
     ASSIGNMENT 6 - jQuery features
     ===================================================================== */

  /* ========== Task 1 + 2. Real-time search with autocomplete (index) ========== */
  const $search = $('#tourSearch');
  if ($search.length) {
    const $suggest = $('#suggestList');
    const $resultCount = $('#resultCount');

    // Words for suggestions: every tour title + famous places + categories
    const places = [
      { term: 'Big Almaty Lake', tour: 'almaty' },
      { term: 'Kok-Tobe hill', tour: 'almaty' },
      { term: 'Medeu skating rink', tour: 'almaty' },
      { term: 'Charyn river', tour: 'charyn' },
      { term: 'Bayterek', tour: 'astana' },
      { term: 'Khan Shatyr', tour: 'astana' },
      { term: 'Palace of Peace', tour: 'astana' },
      { term: 'Yasawi Mausoleum', tour: 'turkestan' },
      { term: 'Silk Road', tour: 'turkestan' },
      { term: 'Bozzhyra', tour: 'mangystau' },
      { term: 'Ustyurt plateau', tour: 'mangystau' },
      { term: 'Caspian coast', tour: 'mangystau' },
      { term: 'Pine forests', tour: 'burabay' }
    ];
    const tourTitle = id => tours.find(t => t.id === id).title;
    const suggestions = [
      ...tours.map(t => ({ term: t.title, hint: `${t.days} days, $${t.price}` })),
      ...places.map(p => ({ term: p.term, hint: tourTitle(p.tour) })),
      ...['Mountains', 'Nature', 'City', 'History'].map(c => ({ term: c, hint: 'Category' }))
    ];
    let activeIndex = -1;

    // Task 1: hide all cards, then show only the ones that match, using .filter()
    function applySearch() {
      const query = $search.val().trim().toLowerCase();
      const $cards = $('#destGrid .dest');
      const $matches = $cards.hide().filter(function () {
        const $card = $(this);
        const text = `${$card.find('h3').text()} ${$card.find('.more').text()} ${$card.data('category')}`;
        return text.toLowerCase().includes(query);
      }).show();

      highlight($cards.find('h3'), query);   // also highlight the word in the titles

      if ($matches.length === 0) {
        $resultCount.text(query
          ? `No tours found for "${$search.val().trim()}". Try another word.`
          : 'No tours match these filters. Try another category or price.');
      } else {
        $resultCount.text(`Showing ${$matches.length} of ${tours.length} tours` +
          (query ? ` for "${$search.val().trim()}"` : ''));
      }
    }

    // Task 2: build the dropdown list of suggestions
    function closeSuggestions() {
      $suggest.prop('hidden', true).empty();
      $search.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
      activeIndex = -1;
    }

    function renderSuggestions() {
      const query = $search.val().trim().toLowerCase();
      if (!query) return closeSuggestions();

      const found = suggestions
        .filter(s => s.term.toLowerCase().includes(query))
        .sort((a, b) => b.term.toLowerCase().startsWith(query) - a.term.toLowerCase().startsWith(query))
        .slice(0, 6);

      $suggest.empty();
      activeIndex = -1;
      if (found.length === 0) {
        $('<li class="suggest-empty"></li>').text('No suggestions').appendTo($suggest);
      }
      found.forEach((item, index) => {
        const $li = $('<li class="suggest-item" role="option"></li>')
          .attr('id', `suggest-${index}`)
          .data('term', item.term);
        $('<span class="suggest-term"></span>')
          .html(wrapMatches(escapeHtml(item.term), query, 'strong').html)
          .appendTo($li);
        $('<span class="suggest-hint"></span>').text(item.hint).appendTo($li);
        $li.appendTo($suggest);
      });
      $suggest.prop('hidden', false);
      $search.attr('aria-expanded', 'true');
    }

    function chooseSuggestion(term) {
      $search.val(term);
      closeSuggestions();
      applySearch();
      playSound('click');
    }

    function moveActive(step) {
      const $items = $suggest.find('.suggest-item');
      if (!$items.length) return;
      activeIndex = (activeIndex + step + $items.length) % $items.length;
      $items.removeClass('active').attr('aria-selected', 'false');
      const $active = $items.eq(activeIndex).addClass('active').attr('aria-selected', 'true');
      $search.attr('aria-activedescendant', $active.attr('id'));
    }

    const NAV_KEYS = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape'];
    $search.on('keyup input', function (event) {
      if (NAV_KEYS.includes(event.key)) return;   // handled in keydown
      renderSuggestions();
      applySearch();
    });

    $search.on('keydown', function (event) {
      if ($suggest.prop('hidden')) return;
      switch (event.key) {
        case 'ArrowDown': event.preventDefault(); moveActive(1); break;
        case 'ArrowUp': event.preventDefault(); moveActive(-1); break;
        case 'Enter':
          event.preventDefault();
          if (activeIndex >= 0) chooseSuggestion($suggest.find('.suggest-item').eq(activeIndex).data('term'));
          else closeSuggestions();
          break;
        case 'Escape': closeSuggestions(); break;
        default: break;
      }
    });

    // mousedown fires before the input loses focus
    $suggest.on('mousedown', '.suggest-item', function (event) {
      event.preventDefault();
      chooseSuggestion($(this).data('term'));
    });
    $search.on('blur', closeSuggestions);

    // when the category / price filters re-draw the cards, search again
    $(document).on('tours:rendered', applySearch);
    applySearch();
  }

  /* ========== Task 3. Search highlighting (FAQ) ========== */
  const $faqSearch = $('#faqSearch');
  if ($faqSearch.length) {
    const $items = $('.acc-item');
    const $faqCount = $('#faqCount');

    $faqSearch.on('keyup input', function () {
      const query = $(this).val().trim();
      let total = 0;
      let shown = 0;

      $items.each(function () {
        const $item = $(this);
        const hits = highlight($item.find('.q-text, .acc-a p'), query);
        total += hits;

        if (!query) { $item.show(); return; }
        if (hits > 0) {
          shown++;
          const $answer = $item.find('.acc-a');
          $item.show().addClass('open');                       // open it so the matches are visible
          $item.find('.acc-q').attr('aria-expanded', 'true');
          $answer.css('max-height', `${$answer[0].scrollHeight}px`);
        } else {
          $item.hide();
        }
      });

      if (!query) $faqCount.text('');
      else if (total === 0) $faqCount.text(`No matches for "${query}". Try another word.`);
      else $faqCount.text(`${total} match${total > 1 ? 'es' : ''} in ${shown} question${shown > 1 ? 's' : ''}`);
    });
  }

  /* ========== Task 4. Scroll progress bar (all pages) ========== */
  const $progress = $(
    '<div class="scroll-progress" aria-hidden="true">' +
      '<div class="scroll-progress-bar"></div>' +
      '<span class="scroll-progress-label">0%</span>' +
    '</div>'
  ).prependTo('body');
  const $progressBar = $progress.find('.scroll-progress-bar');
  const $progressLabel = $progress.find('.scroll-progress-label');

  function updateProgress() {
    const scrollTop = $(window).scrollTop();
    const maxScroll = $(document).height() - $(window).height();
    const percent = maxScroll > 0 ? Math.min(100, Math.round((scrollTop / maxScroll) * 100)) : 0;
    $progressBar.css('width', `${percent}%`);
    $progressLabel
      .text(`${percent}%`)
      .css({ left: `${percent}%`, transform: `translateX(-${percent}%)` })   // label stays on screen
      .toggleClass('visible', scrollTop > 10);
  }
  $(window).on('scroll.progress resize.progress', updateProgress);
  updateProgress();

  /* ========== Task 5. Animated number counter (index) ========== */
  const $counters = $('.counter');
  if ($counters.length) {
    function formatNumber(value, decimals) {
      return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    function runCounter($el) {
      const target = Number($el.data('target'));
      const decimals = Number($el.data('decimals')) || 0;
      const suffix = $el.data('suffix') || '';
      // jQuery .animate() on a plain object: "value" goes from 0 to target smoothly
      $({ value: 0 }).animate({ value: target }, {
        duration: 2200,
        easing: 'swing',
        step(now) { $el.text(formatNumber(now, decimals) + suffix); },
        complete() {
          $el.text(formatNumber(target, decimals) + suffix);
          $el.closest('.stat').addClass('done');
        }
      });
    }

    function checkCounters() {
      $counters.each(function () {
        const $el = $(this);
        if (!$el.data('counted') && isInView($el, -20)) {   // start when it is really visible
          $el.data('counted', true);
          runCounter($el);
        }
      });
      if ($counters.filter((i, el) => !$(el).data('counted')).length === 0) {
        $(window).off('scroll.counter resize.counter');
      }
    }
    $(window).on('scroll.counter resize.counter', checkCounters);
    checkCounters();
  }

  /* ========== Task 8. Copy to clipboard ========== */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for http:// or old browsers: a hidden textarea + execCommand('copy')
    return new Promise((resolve, reject) => {
      const $temp = $('<textarea readonly></textarea>').val(text)
        .css({ position: 'fixed', top: 0, left: 0, opacity: 0 }).appendTo('body');
      $temp[0].select();
      const ok = document.execCommand('copy');
      $temp.remove();
      if (ok) resolve(); else reject(new Error('Copy failed'));
    });
  }

  // Icon -> checkmark and "Copied to clipboard!" tooltip, then back after 2 seconds
  function markCopied($btn) {
    clearTimeout($btn.data('timer'));
    $btn.addClass('copied');
    $btn.data('timer', setTimeout(() => $btn.removeClass('copied'), 2000));
  }

  $(document).on('click', '.copy-btn', function () {
    const $btn = $(this);
    const text = $($btn.data('copy-target')).text().trim();
    copyText(text)
      .then(() => {
        markCopied($btn);
        showToast(`"${text}" copied to clipboard`, 'success');
        playSound('star');
      })
      .catch(() => showToast('Could not copy. Please select the text and press Ctrl+C.', 'error'));
  });

  // The "copy" event also fires when the user selects a snippet and presses Ctrl+C
  $(document).on('copy', '.copy-text', function () {
    markCopied($(this).closest('.copy-row').find('.copy-btn'));
    showToast('Copied to clipboard!', 'success');
  });

  /* ========== Task 9. Image lazy loading ========== */
  function lazyLoad() {
    $('img.lazy').each(function () {
      const $img = $(this);
      if (isInView($img, 150)) {                 // 150px before it appears on screen
        $img.removeClass('lazy').addClass('loading')
          .one('load', function () { $(this).removeClass('loading').addClass('loaded'); })
          .attr('src', $img.data('src'));         // swap the placeholder for the real photo
        console.log('Lazy loaded:', $img.data('src'));
      }
    });
    if ($('img.lazy').length === 0) {
      $(window).off('scroll.lazy resize.lazy');   // everything is loaded, stop listening
    }
  }
  $(window).on('scroll.lazy resize.lazy', lazyLoad);
  lazyLoad();
});
