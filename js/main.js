/* ==========================================================================
   AVAC LTD — Motion, Navigation & Mobile-Optimized Interactive Components
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* 1. Sticky Header, Scroll Progress Bar & Mobile Action Bar Visibility */
  const header = document.querySelector('.site-header');
  const progressBar = document.querySelector('.scroll-progress');
  const mobileBar = document.querySelector('.mobile-action-bar');
  const footer = document.querySelector('.site-footer');
  let ticking = false;

  function updateScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (header) {
      header.classList.toggle('is-scrolled', scrollTop > 20);
    }
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      progressBar.style.width = pct.toFixed(2) + '%';
    }
    if (mobileBar && footer) {
      const footerRect = footer.getBoundingClientRect();
      const hideForFooter = footerRect.top < window.innerHeight - 60;
      mobileBar.classList.toggle('is-hidden', hideForFooter);
    }
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollUI);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateScrollUI();

  /* 2. Mobile Navigation Drawer (with Auto-Close & Focus Safety) */
  const navToggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerClose = document.querySelector('.mobile-drawer__close');
  const drawerBackdrop = document.querySelector('.mobile-drawer__backdrop');

  function setDrawerOpen(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (navToggle) navToggle.setAttribute('aria-expanded', String(open));
    if (mobileBar) {
      mobileBar.classList.toggle('is-hidden', open);
    }
  }

  if (navToggle) navToggle.addEventListener('click', () => setDrawerOpen(true));
  if (drawerClose) drawerClose.addEventListener('click', () => setDrawerOpen(false));
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => setDrawerOpen(false));

  if (drawer) {
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setDrawerOpen(false);
  });

  /* 3. Scroll-Triggered Reveal System (Snappier Threshold on Mobile) */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length > 0) {
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const isCompact = window.innerWidth <= 768;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target;
              const rawDelay = parseInt(el.getAttribute('data-delay') || '0', 10);
              const delay = isCompact ? Math.min(rawDelay, 120) : rawDelay;
              if (delay > 0) {
                el.style.transitionDelay = delay + 'ms';
              }
              el.classList.add('is-visible');
              observer.unobserve(el);
            }
          });
        },
        { threshold: isCompact ? 0.06 : 0.12, rootMargin: '0px 0px -24px 0px' }
      );
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  /* 4. Animated Stat Counters */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0 && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const counterObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1000;
          const start = performance.now();

          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.innerHTML = current + (suffix ? '<span>' + suffix + '</span>' : '');
            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          }
          requestAnimationFrame(tick);
          counterObs.unobserve(el);
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach((c) => counterObs.observe(c));
  }

  /* 5. Interactive "Why Choose Us" Active Highlight (Hover on Desktop, Tap on Mobile) */
  const whyItems = document.querySelectorAll('.why-item');
  if (whyItems.length > 0) {
    const activateWhy = (item) => {
      whyItems.forEach((el) => el.classList.remove('is-featured'));
      item.classList.add('is-featured');
    };
    whyItems.forEach((item) => {
      if (!isTouchDevice) {
        item.addEventListener('mouseenter', () => activateWhy(item));
      }
      item.addEventListener('click', () => activateWhy(item));
    });
  }

  /* 6. Visa Category Filter (visas.html) with Mobile Auto-Centering */
  const filterBtns = document.querySelectorAll('[data-filter]');
  const filterCards = document.querySelectorAll('[data-category]');
  if (filterBtns.length > 0 && filterCards.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

        filterCards.forEach((card) => {
          const cat = card.getAttribute('data-category');
          const show = filter === 'all' || cat === filter;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            card.classList.add('is-visible');
          }
        });
      });
    });
  }

  /* 7. Study Abroad Pathways Tabs (admissions.html) */
  const pathwayTabs = document.querySelectorAll('[data-pathway-tab]');
  const pathwayPanels = document.querySelectorAll('[data-pathway-panel]');
  if (pathwayTabs.length > 0 && pathwayPanels.length > 0) {
    pathwayTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-pathway-tab');
        pathwayTabs.forEach((t) => {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', String(t === tab));
        });
        pathwayPanels.forEach((panel) => {
          panel.classList.toggle(
            'is-active',
            panel.getAttribute('data-pathway-panel') === target
          );
        });
      });
    });
  }

  /* 8. Destinations Scroll-Spy & Horizontal Chip Auto-Centering (destinations.html) */
  const destBlocks = document.querySelectorAll('.dest-block[id]');
  const destLinks = document.querySelectorAll('.dest-anchor-link');
  if (destBlocks.length > 0 && destLinks.length > 0 && 'IntersectionObserver' in window) {
    const destObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          destLinks.forEach((link) => {
            const matches = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', matches);
            if (matches && window.innerWidth <= 768) {
              link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
          });
        });
      },
      { rootMargin: '-28% 0px -55% 0px', threshold: 0.05 }
    );
    destBlocks.forEach((block) => destObs.observe(block));
  }

  /* 9. FAQ Accordion */
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  faqTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            const btn = openItem.querySelector('.faq-trigger');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        });
      }
      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* 10. Consultation Form Pre-fill & Mobile-Friendly Submission (contact.html) */
  const consultForm = document.getElementById('consultation-form');
  if (consultForm) {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    const destParam = params.get('destination');
    const visaParam = params.get('visa');

    const serviceSelect = document.getElementById('service');
    const destSelect = document.getElementById('destination');
    const visaSelect = document.getElementById('visa-type');

    if (serviceParam && serviceSelect) {
      Array.from(serviceSelect.options).forEach((opt) => {
        if (opt.value.toLowerCase() === serviceParam.toLowerCase()) {
          serviceSelect.value = opt.value;
        }
      });
    }
    if (destParam && destSelect) {
      Array.from(destSelect.options).forEach((opt) => {
        if (opt.value.toLowerCase() === destParam.toLowerCase()) {
          destSelect.value = opt.value;
        }
      });
    }
    if (visaParam && visaSelect) {
      Array.from(visaSelect.options).forEach((opt) => {
        if (opt.value.toLowerCase().includes(visaParam.toLowerCase())) {
          visaSelect.value = opt.value;
        }
      });
    }

    const statusBox = document.getElementById('form-status');
    const waBtn = document.getElementById('send-whatsapp-btn');
    const mailBtn = document.getElementById('send-email-btn');

    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!consultForm.checkValidity()) {
        consultForm.reportValidity();
        return;
      }

      const name = document.getElementById('full-name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const service = serviceSelect ? serviceSelect.value : '';
      const destination = destSelect ? destSelect.value : '';
      const visaType = visaSelect ? visaSelect.value : '';
      const notes = document.getElementById('message').value.trim();

      const summary =
        `Hello AVAC Ltd,\n\n` +
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `Email: ${email}\n` +
        `Service: ${service}\n` +
        `Destination: ${destination}\n` +
        (visaType ? `Visa Category: ${visaType}\n` : '') +
        `Consultation Fee: 10,000 RWF (payable after booking appointment)\n` +
        (notes ? `\nDetails:\n${notes}` : '');

      if (waBtn) {
        waBtn.href = `https://wa.me/250780873992?text=${encodeURIComponent(summary)}`;
      }
      if (mailBtn) {
        const subject = `Consultation Inquiry — ${service} (${destination}) | ${name}`;
        mailBtn.href = `mailto:avacltd10@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary)}`;
      }

      if (statusBox) {
        statusBox.classList.add('is-visible');
        statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* 11. Subtle Parallax Depth on Desktop Only (120Hz Native Scroll on Mobile) */
  const parallaxTarget = document.querySelector('[data-parallax]');
  if (parallaxTarget && !prefersReducedMotion && !isTouchDevice) {
    window.addEventListener(
      'scroll',
      () => {
        if (window.innerWidth <= 920) {
          parallaxTarget.style.transform = '';
          return;
        }
        const y = window.scrollY;
        if (y < 700) {
          parallaxTarget.style.transform = `translate3d(0, ${(y * 0.05).toFixed(1)}px, 0)`;
        }
      },
      { passive: true }
    );
  }
})();
