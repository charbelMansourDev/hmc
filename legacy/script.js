(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Mobile navigation ---------- */
  const nav = $('.nav');
  const toggle = $('.nav-toggle');

  const setNav = (open) => {
    nav.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => setNav(!nav.classList.contains('nav-open')));
  $$('.nav-links a').forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setNav(false); });

  /* ---------- Booking form ---------- */
  const booking = $('#book');
  const service = $('#service');
  const date = $('#date');
  const time = $('#time');

  const pad = (n) => String(n).padStart(2, '0');
  const dayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const now = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const prefix = i === 0 ? 'Today · ' : i === 1 ? 'Tomorrow · ' : '';
    date.add(new Option(prefix + dayFmt.format(d), value));
  }

  for (let h = 9; h < 19; h++) {
    for (const m of [0, 30]) {
      const label = `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
      time.add(new Option(label, `${pad(h)}:${pad(m)}`));
    }
  }

  const flash = (el) => {
    el.classList.remove('is-flash');
    void el.offsetWidth; // restart the animation
    el.classList.add('is-flash');
  };

  const pickService = (name) => {
    if (!name) return;
    let option = [...service.options].find((o) => o.value === name);
    if (!option) {
      option = new Option(name, name);
      service.add(option);
    }
    service.value = option.value;
    service.classList.remove('is-error');
    flash(booking);
  };

  $$('[data-service]').forEach((el) => {
    el.addEventListener('click', () => pickService(el.dataset.service));
  });

  const clearError = (e) => e.target.classList.remove('is-error');
  $$('.select, .input').forEach((el) => {
    el.addEventListener('change', clearError);
    el.addEventListener('input', clearError);
  });

  const firstMissing = (fields) => {
    const missing = fields.filter((f) => !f.value.trim());
    missing.forEach((f) => f.classList.add('is-error'));
    return missing[0];
  };

  const contactForm = $('#contact-form');
  const nameInput = $('#name');
  const messageInput = $('#message');

  booking.addEventListener('submit', (e) => {
    e.preventDefault();
    const missing = firstMissing([service, date, time]);
    if (missing) {
      missing.focus();
      return;
    }

    const day = date.selectedOptions[0].text.replace(/^(Today|Tomorrow) · /, '');
    const slot = time.selectedOptions[0].text;
    const note = $('.form-success', booking);
    note.textContent = `Great — ${service.value} on ${day} at ${slot}. Add your name and phone below and our team will confirm.`;
    note.classList.add('is-visible');

    messageInput.value = `I'd like to book ${service.value} on ${day} at ${slot}.`;
    setTimeout(() => {
      contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInput.focus({ preventScroll: true });
      flash(contactForm);
    }, 900);
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const missing = firstMissing([nameInput, $('#phone')]);
    if (missing) {
      missing.focus();
      return;
    }
    const note = $('.form-success', contactForm);
    const first = nameInput.value.trim().split(/\s+/)[0];
    note.textContent = `Thanks, ${first}! We've received your message and will be in touch shortly.`;
    note.classList.add('is-visible');
    contactForm.reset();
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const index = siblings.indexOf(el);
    if (index > 0) el.style.transitionDelay = `${(index % 6) * 60}ms`;
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-in');
          io.unobserve(el);
          // Drop the stagger delay once revealed so hover effects respond instantly
          setTimeout(() => { el.style.transitionDelay = ''; }, 1100);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
