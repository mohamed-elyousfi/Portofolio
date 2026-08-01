'use strict';

/* --------------------------------------------------------------------------
   El Yousfi Mohamed — freelance web development
   No libraries. If this file fails to load the page is still fully readable:
   .reveal is gated behind the .js class set in the document head.
   -------------------------------------------------------------------------- */

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------- theme --- */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const root = document.documentElement;

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  };

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* private mode: the choice just won't persist */
    }
  });

  // Track the OS only until the visitor picks for themselves
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem('theme');
    } catch (err) { /* ignore */ }
    if (!saved) apply(e.matches ? 'dark' : 'light');
  });

  apply(root.getAttribute('data-theme') || 'light');
}

/* ------------------------------------------------------------------ nav --- */
function initNav() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  };

  burger.addEventListener('click', () => {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  menu.querySelectorAll('[data-nav-mobile]').forEach((link) =>
    link.addEventListener('click', () => setOpen(false))
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // A menu left open while resizing to desktop would hang under the nav island
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });

  // Tapping outside closes it
  document.addEventListener('click', (e) => {
    if (burger.getAttribute('aria-expanded') !== 'true') return;
    if (menu.contains(e.target) || burger.contains(e.target)) return;
    setOpen(false);
  });
}

/* ------------------------------------------------------------ scrollspy --- */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav-links [data-nav]'));
  if (!links.length) return;

  const sections = links
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const onScreen = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!onScreen.length) return;

      const id = onScreen[0].target.id;
      links.forEach((l) =>
        l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`)
      );
    },
    { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* --------------------------------------------------------------- reveal --- */
function initReveal() {
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (!items.length) return;

  if (reducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((i) => i.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Small stagger so a row of cards arrives in sequence, not as a block
        entry.target.style.transitionDelay = `${Math.min(i, 4) * 90}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  items.forEach((i) => observer.observe(i));
}

/* ----------------------------------------------------------------- form --- */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const submit = form.querySelector('.form-submit');
  const label = form.querySelector('.btn-label');

  const setStatus = (msg, state) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove('is-success', 'is-error');
    if (state) status.classList.add(state);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return; // bot

    const original = label ? label.textContent : '';
    if (label) label.textContent = 'Sending…';
    if (submit) submit.disabled = true;
    setStatus('Sending…');

    try {
      const res = await fetch(
        'https://formsubmit.co/ajax/elyousfimohamed263@gmail.com',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            _subject: 'New project enquiry from your portfolio',
          }),
        }
      );
      if (!res.ok) throw new Error('Request failed');

      form.reset();
      setStatus("Sent — I'll reply within a day or two.", 'is-success');
    } catch (err) {
      setStatus(
        'Could not send. Please email elyousfimohamed263@gmail.com directly.',
        'is-error'
      );
    } finally {
      if (label) label.textContent = original;
      if (submit) submit.disabled = false;
    }
  });
}

/* ----------------------------------------------------------------- misc --- */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

// DOMContentLoaded, not load — waiting on images would delay every reveal
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initScrollSpy();
  initReveal();
  initForm();
  setYear();
});
