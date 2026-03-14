const TRANSLATIONS_PATH = 'translations';
const STORAGE_LANG_KEY = 'site_language';

let translations = {};
let currentLang = 'it';

async function loadTranslations(lang) {
  const response = await fetch(`${TRANSLATIONS_PATH}/${lang}.json`);
  if (!response.ok) {
    throw new Error(`Unable to load translations for ${lang}`);
  }
  return response.json();
}

function applyTextTranslation(element, key, dict) {
  const value = key && dict[key];
  if (!value) return;
  element.textContent = value;
}

function applyPlaceholderTranslation(element, key, dict) {
  const value = key && dict[key];
  if (!value) return;
  element.placeholder = value;
}

function applyTranslations(lang, dict) {
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    applyTextTranslation(el, key, dict);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    applyPlaceholderTranslation(el, key, dict);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    const value = key && dict[key];
    if (value) {
      el.setAttribute('aria-label', value);
    }
  });

  const titleKey = 'meta.title';
  const descKey = 'meta.description';
  if (dict[titleKey]) {
    document.title = dict[titleKey];
  }
  if (dict[descKey]) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', dict[descKey]);
  }
}

async function setLanguage(lang) {
  if (lang === currentLang && translations[lang]) return;

  try {
    const dict = translations[lang] || (await loadTranslations(lang));
    translations[lang] = dict;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // ignore storage errors
    }
    applyTranslations(lang, dict);
    updateLanguageButtons(lang);
    window.currentLang = lang;
    window.currentTranslations = dict;

    const ev = new CustomEvent('languageChanged', { detail: { lang, dict } });
    window.dispatchEvent(ev);
  } catch (err) {
    console.error(err);
  }
}

function updateLanguageButtons(lang) {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const btnLang = btn.getAttribute('data-lang');
    btn.classList.toggle('active', btnLang === lang);
  });
}

function initLanguage() {
  const stored = localStorage.getItem(STORAGE_LANG_KEY);
  const initial = stored === 'en' ? 'en' : 'it';
  setLanguage(initial);
}

function initLanguageSwitcher() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });
}

function initNavToggle() {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-menu');

  if (!navToggle || !navList || !header) return;

  navToggle.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function initRevealOnScroll() {
  const elements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || elements.length === 0) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();

    const submitBtn = form.querySelector('.form-submit');
    if (!submitBtn) return;

    const original = submitBtn.textContent;
    const dict = window.currentTranslations || {};
    const successText = dict['contact.form.success'] || 'Richiesta inviata';

    submitBtn.textContent = successText;
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = original;
      submitBtn.disabled = false;
    }, 2600);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initLanguageSwitcher();
  initRevealOnScroll();
  initContactForm();
  initLanguage();
});

