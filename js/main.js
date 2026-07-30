'use strict';

const navbar = document.getElementById('navbar');
const contactBtn = document.getElementById('nav-contact');
const closePortalBtn = document.getElementById('portal-close');
const body = document.body;

const ROLES = [
  'scalable web apps.',
  'pixel-perfect UIs.',
  'fast REST APIs.',
  'seamless experiences.',
  'clean, modern code.',
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = () => reduceMotionQuery.matches;

let lastPortalTrigger = null;

function openPortal(trigger) {
  lastPortalTrigger = trigger || document.activeElement;
  body.classList.add('portal-open');

  const firstField = document.querySelector('.cyber-form input');
  if (firstField) {
    setTimeout(() => firstField.focus(), 450);
  }
}

function closePortal() {
  if (!body.classList.contains('portal-open')) return;

  body.classList.remove('portal-open');

  if (lastPortalTrigger && typeof lastPortalTrigger.focus === 'function') {
    lastPortalTrigger.focus();
  }

  lastPortalTrigger = null;
}

function initPortal() {
  if (contactBtn) {
    contactBtn.addEventListener('click', (event) => {
      event.preventDefault();
      openPortal(contactBtn);
    });
  }

  if (closePortalBtn) {
    closePortalBtn.addEventListener('click', closePortal);
  }

  // The contact section's own CTAs open the portal instead of only linking to it
  document.querySelectorAll('[data-open-portal]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openPortal(trigger);
    });
  });

  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
  }, { passive: true });

  // Escape works everywhere; wheel-up is a desktop convenience only
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePortal();
    }
  });

  window.addEventListener('wheel', (event) => {
    if (!body.classList.contains('portal-open')) return;
    if (event.deltaY < -20) {
      closePortal();
    }
  });
}

function typeLoop() {
  const typedEl = document.querySelector('.typed-text');
  if (!typedEl) return;

  // Reduced motion: show one role statically instead of typing on a loop
  if (prefersReducedMotion()) {
    typedEl.textContent = ROLES[0];
    return;
  }

  const currentRole = ROLES[roleIndex];

  if (!isDeleting) {
    typedEl.textContent = currentRole.slice(0, ++charIndex);

    if (charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(typeLoop, 2200);
      return;
    }
  } else {
    typedEl.textContent = currentRole.slice(0, --charIndex);

    if (charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % ROLES.length;
    }
  }

  setTimeout(typeLoop, isDeleting ? 45 : 85);
}

function initAboutSlider() {
  const images = document.querySelectorAll('.slider-img');
  const dots = document.querySelectorAll('.slider-dot');
  const prev = document.getElementById('sliderPrev');
  const next = document.getElementById('sliderNext');

  if (!images.length || !dots.length) return;

  let current = 0;
  let interval = null;

  function goTo(index) {
    images[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + images.length) % images.length;
    images[current].classList.add('active');
    dots[current].classList.add('active');
    resetTimer();
  }

  function nextSlide() {
    goTo(current + 1);
  }

  function prevSlide() {
    goTo(current - 1);
  }

  function resetTimer() {
    if (interval) {
      clearInterval(interval);
    }

    if (prefersReducedMotion()) return;

    interval = setInterval(nextSlide, 4500);
  }

  next?.addEventListener('click', nextSlide);
  prev?.addEventListener('click', prevSlide);
  dots.forEach((dotElement, index) => {
    dotElement.addEventListener('click', () => goTo(index));
  });

  resetTimer();
}

function initRevealAnimations() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((element) => {
    revealObserver.observe(element);
  });
}

function initProjectCarousel() {
  const track = document.getElementById('project-track');
  const cards = Array.from(track?.querySelectorAll('.project-card') || []);
  const glow = document.getElementById('carousel-glow');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let autoPlayTimer = null;

  function updateCarousel() {
    cards.forEach((card, index) => {
      card.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next', 'hidden');

      const offset = (index - currentIndex + cards.length) % cards.length;

      if (offset === 0) {
        card.classList.add('active');
        glow?.classList.add('visible');
      } else if (offset === 1) {
        card.classList.add('next');
      } else if (offset === cards.length - 1) {
        card.classList.add('prev');
      } else if (offset === 2) {
        card.classList.add('far-next');
      } else if (offset === cards.length - 2) {
        card.classList.add('far-prev');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  function goTo(index) {
    currentIndex = (index + cards.length) % cards.length;
    updateCarousel();
    startAutoPlay();
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();

    if (prefersReducedMotion()) return;

    autoPlayTimer = setInterval(next, 5000);
  }

  // Arrow keys drive the carousel once either nav button has focus
  track.addEventListener('keydown', handleCarouselKeys);
  prevBtn?.addEventListener('keydown', handleCarouselKeys);
  nextBtn?.addEventListener('keydown', handleCarouselKeys);

  function handleCarouselKeys(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    }
  }

  nextBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    next();
  });

  prevBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    prev();
  });

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (index !== currentIndex) {
        goTo(index);
      }
    });

    const arrow = card.querySelector('.project-arrow');
    arrow?.addEventListener('click', (event) => {
      event.stopPropagation();
      next();
    });
  });

  track.addEventListener('mouseenter', stopAutoPlay);
  track.addEventListener('mouseleave', startAutoPlay);

  updateCarousel();
  startAutoPlay();
}

function initProjectGalleries() {
  const galleries = document.querySelectorAll('.project-gallery');

  galleries.forEach((gallery) => {
    const slides = Array.from(gallery.querySelectorAll('.project-gallery-image'));
    const dots = Array.from(gallery.querySelectorAll('.project-gallery-dot'));

    if (slides.length <= 1 || dots.length !== slides.length) return;

    let current = slides.findIndex((slide) => slide.classList.contains('active'));
    let timer = null;
    const interval = Number(gallery.dataset.galleryInterval) || 3500;

    if (current < 0) {
      current = 0;
      slides[0].classList.add('active');
      dots[0].classList.add('active');
    }

    function update(nextIndex) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');

      current = (nextIndex + slides.length) % slides.length;

      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();

      if (prefersReducedMotion()) return;

      timer = setInterval(() => update(current + 1), interval);
    }

    dots.forEach((dotElement, index) => {
      dotElement.addEventListener('click', (event) => {
        event.stopPropagation();
        update(index);
        start();
      });
    });

    gallery.addEventListener('mouseenter', stop);
    gallery.addEventListener('mouseleave', start);

    start();
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (link.id === 'nav-contact') return;

      event.preventDefault();

      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    });
  });
}

function initParallax() {
  if (prefersReducedMotion()) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroContent = document.querySelector('.hero-content');

    if (heroContent && scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.7);
    }
  }, { passive: true });
}

function initContactForm() {
  const cyberForm = document.getElementById('cyber-contact-form');
  if (!cyberForm) return;

  const status = document.getElementById('form-status');

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.classList.remove('is-success', 'is-error');
    if (state) {
      status.classList.add(state);
    }
  }

  cyberForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitBtn = cyberForm.querySelector('.cyber-submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');

    if (!submitBtn || !btnText) return;

    const originalText = btnText.textContent;
    btnText.textContent = 'TRANSMITTING DATA...';
    submitBtn.disabled = true;
    submitBtn.style.color = '#42D392';
    submitBtn.style.borderColor = '#42D392';
    setStatus('Sending your message…');

    const formData = new FormData(cyberForm);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('https://formsubmit.co/ajax/elyousfimohamed263@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          _subject: 'New Portfolio Message via Portal',
        }),
      });

      if (!response.ok) {
        throw new Error('Transmission failed');
      }

      btnText.textContent = 'TRANSMISSION SUCCESSFUL';
      setStatus('Message sent — thanks, I will get back to you soon.', 'is-success');
      cyberForm.reset();

      setTimeout(() => {
        btnText.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.color = '';
        submitBtn.style.borderColor = '';
      }, 3500);
    } catch (error) {
      btnText.textContent = 'ERROR: SYSTEM FAILURE';
      setStatus('Could not send. Please email elyousfimohamed263@gmail.com directly.', 'is-error');
      submitBtn.style.color = '#ef4444';
      submitBtn.style.borderColor = '#ef4444';

      setTimeout(() => {
        btnText.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.color = '';
        submitBtn.style.borderColor = '';
      }, 3500);
    }
  });
}

function setHeroVideoSpeed() {
  const heroVideo = document.getElementById('hero-video');
  if (!heroVideo) return;

  if (prefersReducedMotion()) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
    return;
  }

  heroVideo.playbackRate = 0.5;
  heroVideo.addEventListener('canplay', () => {
    heroVideo.playbackRate = 0.5;
  }, { once: true });
}

function setFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

window.addEventListener('load', () => {
  initPortal();
  initAboutSlider();
  initRevealAnimations();
  initProjectCarousel();
  initProjectGalleries();
  initSmoothScroll();
  initParallax();
  initContactForm();
  setHeroVideoSpeed();
  setFooterYear();

  setTimeout(typeLoop, prefersReducedMotion() ? 0 : 1800);
});
