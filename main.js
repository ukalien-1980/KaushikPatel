/* ─────────────────────────────────────────────────────────────────────────
   KAUSHIK PATEL · main.js
   ───────────────────────────────────────────────────────────────────────── */

// ── Dark Mode Toggle ──────────────────────────────────────────────────────
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = root.getAttribute('data-theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  root.setAttribute('data-theme', theme);
  updateToggleIcon(theme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateToggleIcon(theme);
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
  }

  function updateToggleIcon(t) {
    if (!toggle) return;
    if (t === 'dark') {
      toggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>`;
    } else {
      toggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>`;
    }
  }
})();

// ── Mobile Nav ────────────────────────────────────────────────────────────
(function () {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    nav.setAttribute('aria-hidden', !open);
  });

  // Close on nav link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
    });
  });
})();

// ── Header scroll shadow ──────────────────────────────────────────────────
(function () {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

// ── Count-up Animations ───────────────────────────────────────────────────
function countUp(el, target, duration = 1200) {
  const start = performance.now();
  const startVal = 0;

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}

// Observe count elements
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        const target = parseInt(entry.target.dataset.count, 10);
        countUp(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ── Chart.js — Growth Chart ───────────────────────────────────────────────
function initChart() {
  const canvas = document.getElementById('growthChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#8896aa' : '#5a6478';
  const gridColor = isDark ? '#1e2a3d' : '#d0d6e0';
  const primaryColor = isDark ? '#22d3ee' : '#0891b2';
  const secondaryColor = isDark ? 'rgba(34,211,238,0.12)' : 'rgba(8,145,178,0.08)';

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Month 1', 'Month 3', 'Month 5', 'Month 7', 'Month 9', 'Month 11', 'Month 13'],
      datasets: [{
        label: 'Platform Value ($M)',
        data: [0.03, 2, 8, 25, 55, 90, 120],
        borderColor: primaryColor,
        backgroundColor: secondaryColor,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: primaryColor,
        pointBorderColor: isDark ? '#0d1422' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#151e2e' : '#ffffff',
          titleColor: isDark ? '#e8edf5' : '#0f1523',
          bodyColor: isDark ? '#8896aa' : '#5a6478',
          borderColor: isDark ? '#243048' : '#d0d6e0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.y}M`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor, font: { family: 'Satoshi, sans-serif', size: 11 } }
        },
        y: {
          grid: { color: gridColor, drawBorder: false },
          ticks: {
            color: textColor,
            font: { family: 'Satoshi, sans-serif', size: 11 },
            callback: (v) => `$${v}M`
          },
          beginAtZero: true
        }
      },
      animation: {
        duration: 1400,
        easing: 'easeOutQuart'
      }
    }
  });

  // Re-init on theme change
  const observer = new MutationObserver(() => {
    chart.destroy();
    initChart();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

// Init chart when visible
(function () {
  const chartSection = document.querySelector('.impact');
  if (!chartSection) return;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Wait for Chart.js to load
      if (typeof Chart !== 'undefined') {
        initChart();
      } else {
        const script = document.querySelector('script[src*="chart.js"]');
        if (script) {
          script.addEventListener('load', initChart);
        }
      }
      observer.unobserve(chartSection);
    }
  }, { threshold: 0.2 });
  observer.observe(chartSection);
})();

// ── Contact Form ──────────────────────────────────────────────────────────
(function () {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const successMsg = document.getElementById('form-success');
  if (!form) return;

  // ── EmailJS config ───────────────────────────────────────────────────────
  const EMAILJS_PUBLIC_KEY  = 'DWND5rEmbDBt4FqP6';
  const EMAILJS_SERVICE_ID  = 'service_8txug67';
  const EMAILJS_TEMPLATE_ID = 'template_en4bcac';
  // ─────────────────────────────────────────────────────────────────────────

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'var(--color-error, #ef4444)';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    if (!valid) return;

    // Show loading state
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.hidden = true;
    btnLoading.hidden = false;
    submitBtn.disabled = true;

    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
      submitBtn.hidden = true;
      successMsg.hidden = false;
      form.reset();
    } catch (err) {
      console.error('EmailJS error:', err);
      btnText.hidden = false;
      btnLoading.hidden = true;
      submitBtn.disabled = false;
      // Show inline error
      let errEl = form.querySelector('.form-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-error';
        errEl.style.cssText = 'color:var(--color-error,#ef4444);font-size:0.875rem;margin-top:0.5rem;';
        submitBtn.insertAdjacentElement('afterend', errEl);
      }
      errEl.textContent = 'Something went wrong. Please email me directly at kaushik@kaushikpatel.com';
    }
  });

  // Clear errors on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
})();

// ── Active Nav Link Highlight ─────────────────────────────────────────────
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
})();

// ── Active nav link style ─────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `.main-nav a.active { color: var(--color-primary) !important; }`;
document.head.appendChild(style);
