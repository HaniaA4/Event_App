/* ─────────────────────────────────────────
   EVENT DETAILS PAGE
   Data comes from Flask/Jinja in event_details.html
───────────────────────────────────────── */
// the icons (📅 📍 📌 🏷️ 👤 👥 🎟️ etc.) are plain unicode characters typed directly into
// the strings below -- no icon library/CDN involved

/* ─────────────────────────────────────────
   INFO CARDS
   note: the HTML already has a basic version of this info rendered by jinja,
   this function replaces it with the nicer icon-card version once the page loads
───────────────────────────────────────── */
function buildInfoCards() {
  const grid = document.getElementById('infoGrid');
  if (!grid || typeof eventData === 'undefined') return;

  const infoItems = [
    { icon: '📅', label: 'Date', value: eventData.date },
    { icon: '📍', label: 'Location', value: eventData.location },
    { icon: '📌', label: 'Status', value: eventData.status },
    { icon: '🏷️', label: 'Category', value: eventData.category },
    { icon: '👤', label: 'Organizer', value: eventData.organizer },
    { icon: '👥', label: 'Registered', value: eventData.maxParticipants > 0 ? `${eventData.registrationsCount} / ${eventData.maxParticipants} people` : `${eventData.registrationsCount} people registered`},
    { icon: '🎟️', label: 'Entry', value: 'Free' }
  ];

  grid.innerHTML = '';

  infoItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'glass info-item';

    div.innerHTML = `
      <span class="info-item-icon">${item.icon}</span>
      <div class="info-item-label">${item.label}</div>
      <div class="info-item-value">${item.value}</div>
    `;

    grid.appendChild(div);
  });
}

/* ─────────────────────────────────────────
   PROGRESS BAR
   fills based on registered / max_participants, with a warning once spots get low
───────────────────────────────────────── */
function updateProgress() {
  if (typeof eventData === 'undefined') return;

  const progressFill = document.getElementById('progressFill');
  const progressPct = document.getElementById('progressPct');
  const progressText = document.getElementById('progressText');

  if (!progressFill || !progressPct || !progressText) return;

  const max = eventData.maxParticipants;
  const registered = eventData.registrationsCount;

  if (!max || max <= 0) {
    progressFill.style.width = '0%';
    progressPct.textContent = '';
    progressText.textContent = `${registered} people registered`;
    return;
  }

  const pct = Math.min(Math.round((registered / max) * 100), 100);
  const left = max - registered;

  progressFill.style.width = pct + '%';
  progressPct.textContent = pct + '% full';

  progressText.textContent =
    left <= 0 ? 'No spots left' :
    left <= 5 ? `⚠️ Only ${left} spots left!` :
    `${registered} / ${max} registered`;
}

/* ─────────────────────────────────────────
   NOTIFICATION 
───────────────────────────────────────── */
function showNotification(msg) {
  const n = document.getElementById('notification');
  if (!n) return;

  n.textContent = msg;
  n.classList.add('show');

  setTimeout(() => {
    n.classList.remove('show');
  }, 3000);
}

/* ─────────────────────────────────────────
   COMMENT TEXTAREA AUTO-RESIZE 
───────────────────────────────────────── */
    document.querySelectorAll("textarea").forEach(textarea => {
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    });
  });

/* ─────────────────────────────────────────
   SHARE
   just uses the current page URL, no backend involved
───────────────────────────────────────── */
function share(type) {
  const url = window.location.href;

  if (type === 'copy') {
    navigator.clipboard.writeText(url)
      .then(() => showNotification('🔗 Link copied to clipboard!'))
      .catch(() => showNotification('Copy the URL from your browser bar.')); // clipboard API can fail on http/old browsers
  }

  if (type === 'whatsapp') {
    const text = encodeURIComponent(`Check out this event: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
}

/* ─────────────────────────────────────────
   HAMBURGER - the menu for responsiveness
───────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
buildInfoCards();
updateProgress();