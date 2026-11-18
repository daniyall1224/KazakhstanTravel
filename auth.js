/* Final Project - localStorage authentication simulation, client-side validation,
   session-aware navigation, and persistent trip wishlist. No backend/payments.
   IMPORTANT: This is a school demo, NOT secure production authentication. */
(() => {
  'use strict';

  const USERS_KEY = 'kzt_users_v1';
  const SESSION_KEY = 'kzt_active_v1';
  const FAVORITES_KEY = 'kzt_saved_v1';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
  const tourNames = {
    almaty: 'Almaty and Big Almaty Lake', charyn: 'Charyn Canyon',
    astana: 'Astana city break', turkestan: 'Turkestan',
    mangystau: 'Mangystau', burabay: 'Burabay'
  };

  const read = (key, defaultValue) => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? defaultValue : JSON.parse(value);
    } catch (_) { return defaultValue; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  };
  const sessionUser = () => {
    const email = read(SESSION_KEY, null);
    const users = read(USERS_KEY, []);
    return Array.isArray(users) ? users.find(u => u.email === email) || null : null;
  };
  const byId = id => document.getElementById(id);
  const normalizedEmail = email => email.trim().toLowerCase();
  const phoneDigits = value => value.replace(/\D/g, '').replace(/^8(?=\d{10}$)/, '7');
  const validPhone = value => /^7\d{10}$/.test(phoneDigits(value));
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);

  function errorFor(field, message) {
    const el = byId(field);
    const error = byId(`${field}Error`);
    if (!el || !error) return !message;
    error.textContent = message;
    el.classList.toggle('invalid', Boolean(message));
    el.classList.toggle('valid', !message);
    el.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }
  const nameCheck = () => {
    const v = byId('name').value.trim();
    return errorFor('name', !v ? 'Enter your full name.' : v.length < 2 ? 'Name must be at least 2 characters.' : '');
  };
  const emailCheck = () => {
    const v = normalizedEmail(byId('email').value);
    return errorFor('email', !v ? 'Enter an email address.' : !EMAIL_RE.test(v) ? 'Use a valid email, for example traveler@example.com.' : '');
  };
  const phoneCheck = () => {
    const v = byId('phone').value.trim();
    return errorFor('phone', !v ? 'Enter a phone number.' : !validPhone(v) ? 'Use a Kazakhstan number, for example +7 777 123 45 67.' : '');
  };
  const passwordCheck = () => {
    const v = byId('password').value;
    return errorFor('password', !v ? 'Create a password.' : !PASSWORD_RE.test(v)
      ? 'Use 8+ characters, uppercase, lowercase, number and a special symbol.' : '');
  };
  const confirmCheck = () => {
    const v = byId('confirm').value;
    return errorFor('confirm', !v ? 'Confirm your password.' : v !== byId('password').value ? 'Passwords do not match.' : '');
  };

  function initMenuAndNav() {
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav]').forEach(link => {
      if (link.dataset.nav === current) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
    const isLoggedIn = Boolean(sessionUser());
    document.querySelectorAll('[data-guest]').forEach(el => { el.hidden = isLoggedIn; });
    document.querySelectorAll('[data-member]').forEach(el => { el.hidden = !isLoggedIn; });

    const menuButton = byId('menuToggle');
    const nav = byId('primaryNav');
    if (menuButton && nav) {
      menuButton.addEventListener('click', () => {
        const open = nav.classList.toggle('mobile-open');
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.textContent = open ? '✕ Close' : '☰ Menu';
      });
      nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        nav.classList.remove('mobile-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = '☰ Menu';
      }));
    }
  }

  function initRegistration() {
    const form = byId('regForm');
    if (!form) return;
    const checks = { name: nameCheck, email: emailCheck, phone: phoneCheck,
      password: passwordCheck, confirm: confirmCheck };
    const steps = { 1: ['name', 'email', 'phone'], 2: ['password', 'confirm'] };
    const nextBtn = byId('nextBtn');
    const backBtn = byId('backBtn');
    const submitBtn = byId('submitBtn');
    const success = byId('formSuccess');
    const strength = byId('passwordStrength');
    const strengthBar = byId('passwordStrengthBar');
    let step = 1;

    function showStep(next, focus = false) {
      step = next;
      form.querySelectorAll('fieldset.step').forEach(panel => {
        panel.hidden = Number(panel.dataset.step) !== next;
      });
      form.querySelectorAll('.step-dot').forEach(dot => {
        const num = Number(dot.dataset.step);
        dot.classList.toggle('active', num === next);
        dot.classList.toggle('done', num < next);
      });
      backBtn.hidden = next === 1;
      nextBtn.hidden = next === 2;
      submitBtn.hidden = next !== 2;
      if (focus) byId(steps[next][0]).focus();
    }
    function validateStep(which) {
      const results = steps[which].map(field => checks[field]());
      if (results.some(ok => !ok)) byId(steps[which].find(field => byId(field).classList.contains('invalid'))).focus();
      return results.every(Boolean);
    }

    function updateStrength() {
      const value = byId('password').value;
      const checksCount = [value.length >= 8, /[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9\s]/.test(value)].filter(Boolean).length;
      const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
      strength.textContent = value ? `Password strength: ${labels[checksCount]}` : 'Password strength: not entered';
      strengthBar.style.width = `${checksCount * 20}%`;
      strengthBar.dataset.level = checksCount >= 5 ? 'strong' : checksCount >= 3 ? 'medium' : 'weak';
    }
    byId('password').addEventListener('input', updateStrength);
    form.querySelectorAll('[data-toggle-password]').forEach(button => {
      button.addEventListener('click', () => {
        const target = byId(button.dataset.togglePassword);
        const showing = target.type === 'password';
        target.type = showing ? 'text' : 'password';
        button.textContent = showing ? 'Hide' : 'Show';
        button.setAttribute('aria-pressed', String(showing));
      });
    });
    Object.keys(checks).forEach(key => {
      byId(key).addEventListener('blur', checks[key]);
      byId(key).addEventListener('input', () => {
        if (byId(key).classList.contains('invalid')) checks[key]();
      });
    });
    nextBtn.addEventListener('click', () => {
      if (validateStep(1)) showStep(2, true);
    });
    backBtn.addEventListener('click', () => showStep(1, true));
    byId('resetBtn').addEventListener('click', () => {
      form.reset();
      Object.keys(checks).forEach(key => {
        byId(key).classList.remove('invalid', 'valid');
        byId(key).removeAttribute('aria-invalid');
        byId(`${key}Error`).textContent = '';
      });
      success.hidden = true;
      updateStrength();
      showStep(1);
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      success.hidden = true;
      if (step === 1) { if (validateStep(1)) showStep(2, true); return; }
      const validPersonal = validateStep(1);
      const validSecrets = validateStep(2);
      if (!validPersonal) { showStep(1, true); return; }
      if (!validSecrets) return;
      const name = byId('name').value.trim();
      const email = normalizedEmail(byId('email').value);
      const phone = phoneDigits(byId('phone').value);
      const password = byId('password').value;
      const users = read(USERS_KEY, []);
      if (!Array.isArray(users)) {
        success.textContent = 'Local data is corrupted. Clear site storage and try again.';
        success.hidden = false;
        return;
      }
      if (users.some(user => user.email === email)) {
        showStep(1);
        errorFor('email', 'This email already has a demo account. Please log in.');
        byId('email').focus();
        return;
      }
      // The password is stored in localStorage solely because the assignment explicitly
      // requires an authentication simulation without a backend. Never use real passwords.
      if (!write(USERS_KEY, [...users, { name, email, phone, password, joined: new Date().toISOString() }])) {
        success.textContent = 'Browser storage is unavailable. Enable it to use demo accounts.';
        success.hidden = false;
        return;
      }
      form.reset();
      Object.keys(checks).forEach(key => {
        byId(key).classList.remove('invalid', 'valid');
        byId(`${key}Error`).textContent = '';
      });
      updateStrength();
      showStep(1);
      success.innerHTML = 'Account created successfully! <a href="login.html">Log in to view your profile →</a>';
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    showStep(1);
  }

  function safeNextPath() {
    const next = new URLSearchParams(location.search).get('next');
    if (!next) return 'profile.html';
    // Strict same-site allowlist prevents open redirects.
    if (/^profile\.html(?:\?save=(?:almaty|charyn|astana|turkestan|mangystau|burabay))?$/.test(next)) return next;
    return 'profile.html';
  }
  function initLogin() {
    const form = byId('loginForm');
    if (!form) return;
    const email = byId('loginEmail');
    const password = byId('loginPassword');
    const emailError = byId('loginEmailError');
    const passError = byId('loginPasswordError');
    const errorText = byId('loginError');
    const returnLink = byId('loginReturnLink');
    if (returnLink && new URLSearchParams(location.search).has('next')) {
      returnLink.hidden = false;
      returnLink.textContent = 'After login, your selected trip will be saved.';
    }
    [email, password].forEach(input => input.addEventListener('input', () => {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
      byId(`${input.id}Error`).textContent = '';
      errorText.textContent = '';
    }));
    const showPassword = byId('showLoginPassword');
    if (showPassword) showPassword.addEventListener('click', () => {
      const showing = password.type === 'password';
      password.type = showing ? 'text' : 'password';
      showPassword.textContent = showing ? 'Hide' : 'Show';
      showPassword.setAttribute('aria-pressed', String(showing));
    });
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      errorText.textContent = '';
      const value = normalizedEmail(email.value);
      const pw = password.value;
      emailError.textContent = !value ? 'Enter your email.' : !EMAIL_RE.test(value) ? 'Enter a valid email address.' : '';
      passError.textContent = !pw ? 'Enter your password.' : !PASSWORD_RE.test(pw)
        ? 'Use your demo password with 8+ characters, upper/lowercase letters, number and symbol.' : '';
      email.classList.toggle('invalid', Boolean(emailError.textContent));
      password.classList.toggle('invalid', Boolean(passError.textContent));
      email.setAttribute('aria-invalid', String(Boolean(emailError.textContent)));
      password.setAttribute('aria-invalid', String(Boolean(passError.textContent)));
      if (emailError.textContent || passError.textContent) return;
      const users = read(USERS_KEY, []);
      const found = Array.isArray(users) ? users.find(u => u.email === value && u.password === pw) : null;
      if (!found) { errorText.textContent = 'Incorrect email or password. Try again or create an account.'; return; }
      if (!write(SESSION_KEY, found.email)) { errorText.textContent = 'Cannot save login session. Check browser storage.'; return; }
      location.assign(safeNextPath());
    });
  }

  function initProfile() {
    const profile = byId('profileApp');
    if (!profile) return;
    const user = sessionUser();
    const guest = byId('profileGuest');
    if (!user) {
      profile.hidden = true;
      guest.hidden = false;
      const save = new URLSearchParams(location.search).get('save');
      if (save && Object.hasOwn(tourNames, save)) {
        const next = `profile.html?save=${save}`;
        byId('profileLoginLink').href = `login.html?next=${encodeURIComponent(next)}`;
        byId('guestMessage').textContent = `Log in first to save ${tourNames[save]} to your trip list.`;
      }
      return;
    }
    guest.hidden = true;
    profile.hidden = false;
    byId('profileName').textContent = user.name;
    byId('profileEmail').textContent = user.email;
    byId('profilePhone').textContent = `+${user.phone}`;
    byId('profileJoined').textContent = new Date(user.joined).toLocaleDateString('en-GB', { dateStyle: 'medium' });
    byId('profileAvatar').textContent = user.name.trim().slice(0, 1).toUpperCase();
    const key = `${FAVORITES_KEY}:${user.email}`;
    const feedback = byId('favoriteFeedback');
    let favorites = read(key, []);
    if (!Array.isArray(favorites)) favorites = [];

    function render() {
      const list = byId('favoritesList');
      list.replaceChildren();
      byId('favoritesCount').textContent = String(favorites.length);
      byId('favoritesEmpty').hidden = favorites.length !== 0;
      favorites.forEach(id => {
        if (!Object.hasOwn(tourNames, id)) return;
        const item = document.createElement('li');
        item.className = 'favorite-item';
        const label = document.createElement('span');
        label.textContent = tourNames[id];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-small btn-secondary';
        button.textContent = 'Remove';
        button.setAttribute('aria-label', `Remove ${tourNames[id]} from saved trips`);
        button.addEventListener('click', () => {
          favorites = favorites.filter(x => x !== id);
          write(key, favorites);
          feedback.textContent = `${tourNames[id]} removed from your trip list.`;
          render();
        });
        const guide = document.createElement('a');
        guide.href = `tour.html?id=${encodeURIComponent(id)}`;
        guide.textContent = 'View guide';
        guide.className = 'favorite-guide';
        item.append(label, guide, button);
        list.append(item);
      });
    }
    const requested = new URLSearchParams(location.search).get('save');
    if (requested && Object.hasOwn(tourNames, requested)) {
      if (!favorites.includes(requested)) {
        favorites.push(requested);
        write(key, favorites);
        feedback.textContent = `Saved ${tourNames[requested]} to your trips!`;
      } else feedback.textContent = `${tourNames[requested]} is already on your trip list.`;
      // Clean the query so a refresh does not save an item after its removal.
      try { history.replaceState(null, '', 'profile.html'); } catch (_) { /* non-HTTP preview environments may block history URL changes */ }
    }
    render();
    byId('logoutBtn').addEventListener('click', () => {
      try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
      location.assign('login.html');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenuAndNav();
    initRegistration();
    initLogin();
    initProfile();
  });
})();
