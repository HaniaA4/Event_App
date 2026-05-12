const event = {
  id:          3,
  title:       "Web Design Workshop",
  category:    "Workshops",
  date:        "May 20, 2025",
  time:        "14:00 – 17:00",
  location:    "Auditorium A, Main Building",
  organizer:   "NOVA IMS Tech Club",
  participants: 45,
  max:         60,
  icon:        "🛠️",
  gradient:    "linear-gradient(135deg, #4a148c, #6a1b9a)",
  tags:        ["HTML", "CSS", "Design", "Frontend", "Beginners Welcome"],
  description: `Join us for a hands-on Web Design Workshop where you'll learn the fundamentals of building beautiful, responsive websites from scratch.

Whether you're completely new to web development or looking to sharpen your skills, this workshop has something for everyone. We'll cover HTML structure, modern CSS techniques (flexbox, grid, animations), and practical tips for making your pages look great on any device.

Bring your laptop and get ready to build your first webpage live in the room. No prior experience required!`,
};

let isRegistered = false;
let currentParticipants = event.participants;

function populatePage() {
  document.getElementById('heroGrad').style.background = event.gradient;
  document.getElementById('heroIcon').textContent  = event.icon;
  document.getElementById('heroCat').textContent   = event.category;
  document.getElementById('heroTitle').textContent = event.title;
  document.title = `EventHub – ${event.title}`;

  document.getElementById('eventDesc').innerHTML =
    event.description.split('\n\n').map(p => `<p style="margin-bottom:1rem;">${p}</p>`).join('');

  const infoItems = [
    { icon: '📅', label: 'Date',       value: event.date },
    { icon: '🕐', label: 'Time',       value: event.time },
    { icon: '📍', label: 'Location',   value: event.location },
    { icon: '👤', label: 'Organizer',  value: event.organizer },
    { icon: '👥', label: 'Registered', value: `${currentParticipants} / ${event.max} people` },
    { icon: '🎟️', label: 'Entry',      value: 'Free' },
  ];

  const grid = document.getElementById('infoGrid');
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

  const tagsRow = document.getElementById('tagsRow');
  tagsRow.innerHTML = event.tags.map(t => `<span class="tag">${t}</span>`).join('');

  updateProgress();

  const colors = ['#5c7cfa','#ff6b9d','#a9e34b','#ffd43b','#74c0fc','#e599f7'];
  const names  = ['AC','BM','CL','DR','EF','FG','GH','JK'];
  const pList  = document.getElementById('participantsList');
  pList.innerHTML = '';

  names.forEach((name, i) => {
    const av = document.createElement('div');
    av.className = 'participant-avatar';
    av.style.background   = colors[i % colors.length] + '33';
    av.style.color        = colors[i % colors.length];
    av.style.borderColor  = colors[i % colors.length] + '55';
    av.textContent = name;
    pList.appendChild(av);
  });

  const more = document.createElement('div');
  more.className = 'participant-avatar avatar-more';
  more.textContent = `+${currentParticipants - names.length}`;
  pList.appendChild(more);
}

function updateProgress() {
  const pct  = Math.round((currentParticipants / event.max) * 100);
  const left = event.max - currentParticipants;

  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent  = pct + '% full';
  document.getElementById('progressText').textContent =
    left === 0 ? 'No spots left' :
    left <= 5  ? `⚠️ Only ${left} spots left!` :
    `${currentParticipants} / ${event.max} registered`;
}

function toggleRegister() {
  const btn = document.getElementById('registerBtn');

  if (!isRegistered) {
    isRegistered = true;
    currentParticipants++;
    btn.textContent = "✅ You're registered – Cancel?";
    btn.className   = 'btn btn-danger btn-lg';
    showNotification("🎉 You're registered! See you there.");
  } else {
    isRegistered = false;
    currentParticipants--;
    btn.textContent = 'Register for this event';
    btn.className   = 'btn btn-primary btn-lg';
    showNotification('Registration cancelled.');
  }

  updateProgress();
}

function showNotification(msg) {
  const n = document.getElementById('notification');
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}

function share(type) {
  const url = window.location.href;
  if (type === 'copy') {
    navigator.clipboard.writeText(url)
      .then(() => showNotification('🔗 Link copied to clipboard!'))
      .catch(() => showNotification('Copy the URL from your browser bar.'));
  } else if (type === 'whatsapp') {
    window.open(`https://wa.me/?text=Check%20out%20this%20event:%20${encodeURIComponent(url)}`, '_blank');
  }
}

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

populatePage();
