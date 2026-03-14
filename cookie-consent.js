const COOKIE_STORAGE_KEY = 'cookie_consent_choice';

function getConsentChoice() {
  try {
    return localStorage.getItem(COOKIE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setConsentChoice(choice) {
  try {
    localStorage.setItem(COOKIE_STORAGE_KEY, choice);
  } catch {
  }
}

function applyCookieTranslations(dict) {
  if (!dict) return;
  const messageEl = document.querySelector('#cookie-banner .cookie-text');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');

  if (messageEl && dict['cookies.message']) {
    messageEl.textContent = dict['cookies.message'];
  }
  if (acceptBtn && dict['cookies.accept']) {
    acceptBtn.textContent = dict['cookies.accept'];
  }
  if (rejectBtn && dict['cookies.reject']) {
    rejectBtn.textContent = dict['cookies.reject'];
  }
}

function showCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  banner.classList.add('visible');
}

function hideCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  banner.classList.remove('visible');
}

function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');

  if (!banner || !acceptBtn || !rejectBtn) return;

  if (window.currentTranslations) {
    applyCookieTranslations(window.currentTranslations);
  }

  window.addEventListener('languageChanged', (ev) => {
    const dict = ev.detail && ev.detail.dict;
    applyCookieTranslations(dict);
  });

  const choice = getConsentChoice();
  if (!choice) {
    showCookieBanner();
  }

  acceptBtn.addEventListener('click', () => {
    setConsentChoice('accepted');
    hideCookieBanner();
  });

  rejectBtn.addEventListener('click', () => {
    setConsentChoice('rejected');
    hideCookieBanner();
  });
}

document.addEventListener('DOMContentLoaded', initCookieBanner);

