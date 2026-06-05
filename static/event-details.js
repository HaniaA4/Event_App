/* ─────────────────────────────────────────
   ALL EVENTS DATA
   We read ?id= from the URL and find the
   matching event. Flask will replace this later.
───────────────────────────────────────── */
const allEvents = [
  {
    id: 1,
    title: "Python for Data Science – Study Session",
    category: "Study Sessions",
    date: "May 15, 2025", time: "18:00 – 20:00",
    location: "Campus Library, Room B2",
    organizer: "Data Science Club",
    participants: 12, max: 20,
    icon: "📚", gradient: "linear-gradient(135deg, #1a237e, #283593)",
    tags: ["Python", "Data Science", "Beginners", "Study"],
    description: `Come join us for a collaborative study session focused on Python for Data Science. Whether you're just getting started or looking to sharpen your skills, this is the perfect environment to learn together.\n\nWe'll cover NumPy, Pandas, and basic data visualization using Matplotlib. Bring your laptop and your questions — experienced students will be on hand to help.\n\nAll levels welcome, no prior Python knowledge required!`
  },
  {
    id: 2,
    title: "5-a-side Football Tournament",
    category: "Sports",
    date: "May 17, 2025", time: "15:30 – 18:30",
    location: "Campus Sports Field",
    organizer: "Campus Sports Association",
    participants: 28, max: 30,
    icon: "⚽", gradient: "linear-gradient(135deg, #1b5e20, #2e7d32)",
    tags: ["Football", "Sports", "Tournament", "Outdoor"],
    description: `Get your team together for our 5-a-side Football Tournament on the campus sports field! Teams of 5 compete in a round-robin format, with the top 2 teams going head-to-head in the final.\n\nAll skill levels are welcome — this is about fun, fitness, and meeting new people. Prizes for the winning team!\n\nRegister as a team or individually and we'll sort you into a group.`
  },
  {
    id: 3,
    title: "Web Design Workshop",
    category: "Workshops",
    date: "May 20, 2025", time: "14:00 – 17:00",
    location: "Auditorium A, Main Building",
    organizer: "NOVA IMS Tech Club",
    participants: 45, max: 60,
    icon: "🛠️", gradient: "linear-gradient(135deg, #4a148c, #6a1b9a)",
    tags: ["HTML", "CSS", "Design", "Frontend", "Beginners Welcome"],
    description: `Join us for a hands-on Web Design Workshop where you'll learn the fundamentals of building beautiful, responsive websites from scratch.\n\nWhether you're completely new to web development or looking to sharpen your skills, this workshop has something for everyone. We'll cover HTML structure, modern CSS techniques (flexbox, grid, animations), and practical tips for making your pages look great on any device.\n\nBring your laptop and get ready to build your first webpage live in the room. No prior experience required!`
  },
  {
    id: 4,
    title: "Data Visualization Talk: Beyond Bar Charts",
    category: "Talks",
    date: "May 22, 2025", time: "17:00 – 18:30",
    location: "Room 101, Main Building",
    organizer: "NOVA IMS Research Group",
    participants: 33, max: 50,
    icon: "🎤", gradient: "linear-gradient(135deg, #bf360c, #d84315)",
    tags: ["Data Viz", "Tableau", "D3.js", "Storytelling"],
    description: `Bar charts are great — but there's a whole world of data visualization beyond them. In this talk, we explore how to choose the right chart for your data and how to make your visuals actually tell a story.\n\nWe'll walk through real examples using Tableau and D3.js, covering heatmaps, network graphs, sankey diagrams, and interactive dashboards.\n\nPerfect for anyone in data science, business analytics, or just curious about making data beautiful.`
  },
  {
    id: 5,
    title: "Portuguese Culture Night",
    category: "Cultural",
    date: "May 24, 2025", time: "20:00 – 23:00",
    location: "Student Lounge",
    organizer: "International Students Association",
    participants: 60, max: 80,
    icon: "🎭", gradient: "linear-gradient(135deg, #006064, #00838f)",
    tags: ["Culture", "Portugal", "Food", "Music", "Social"],
    description: `Experience the rich culture of Portugal in an unforgettable evening of food, music, and traditions. Portuguese Culture Night brings together students from all backgrounds to celebrate and learn.\n\nEnjoy traditional Fado music performances, taste authentic Portuguese food and pastéis de nata, and take part in cultural games and activities.\n\nCome alone or with friends — everyone is welcome at this free event!`
  },
  {
    id: 6,
    title: "Group Project Kickoff – TAW",
    category: "Group Meetings",
    date: "May 25, 2025", time: "10:00 – 12:00",
    location: "Room 204",
    organizer: "TAW Course Team",
    participants: 8, max: 10,
    icon: "👥", gradient: "linear-gradient(135deg, #e65100, #ef6c00)",
    tags: ["TAW", "Project", "Flask", "Web Dev", "Group Work"],
    description: `Kickoff meeting for the TAW group project. We'll align on the project scope, divide responsibilities, and set up our development environment together.\n\nAgenda: project overview, tech stack decisions (Flask + SQLite + HTML/CSS/JS), GitHub setup, and task assignment.\n\nMandatory for all group members. Bring your laptop!`
  },
  {
    id: 7,
    title: "Statistics Exam Prep Session",
    category: "Study Sessions",
    date: "May 26, 2025", time: "16:00 – 18:30",
    location: "Library, Floor 3",
    organizer: "Statistics Study Group",
    participants: 20, max: 25,
    icon: "📊", gradient: "linear-gradient(135deg, #0d47a1, #1565c0)",
    tags: ["Statistics", "Exam Prep", "Study", "Math"],
    description: `Preparing for the statistics exam? Join our group study session where we'll work through past exam papers, tackle the trickiest problems together, and review key concepts.\n\nTopics covered: hypothesis testing, regression analysis, probability distributions, and ANOVA.\n\nBring your notes, past papers, and questions. A tutor will be present to help with difficult topics.`
  },
  {
    id: 8,
    title: "Intro to Machine Learning Workshop",
    category: "Workshops",
    date: "May 28, 2025", time: "10:00 – 13:00",
    location: "Lab 3, Tech Building",
    organizer: "AI & ML Student Club",
    participants: 18, max: 30,
    icon: "🤖", gradient: "linear-gradient(135deg, #311b92, #4527a0)",
    tags: ["Machine Learning", "Python", "scikit-learn", "AI", "Hands-on"],
    description: `New to machine learning? This beginner-friendly workshop will walk you through the core concepts and get you building your first ML model by the end of the session.\n\nUsing Python and scikit-learn, we'll cover supervised learning, train/test splits, decision trees, and model evaluation. Everything is hands-on — you'll leave with working code.\n\nPrerequisite: basic Python knowledge. Bring your laptop with Python installed.`
  },
  {
    id: 9,
    title: "Campus 5km Run",
    category: "Sports",
    date: "Jun 01, 2025", time: "08:30 – 10:00",
    location: "University Gardens",
    organizer: "Campus Running Club",
    participants: 55, max: 100,
    icon: "🏃", gradient: "linear-gradient(135deg, #004d40, #00695c)",
    tags: ["Running", "Fitness", "Outdoor", "5km", "All Levels"],
    description: `Lace up your trainers and join us for the Campus 5km Run through the beautiful university gardens and surrounding paths!\n\nWhether you're a seasoned runner or just getting started, this is a relaxed, non-competitive run focused on enjoying the outdoors and meeting fellow students.\n\nWater stations along the route. Finisher certificates for everyone. See you at the starting line!`
  }
];

/* ─────────────────────────────────────────
   READ EVENT ID FROM URL (?id=3)
   Falls back to event 1 if no ID given
───────────────────────────────────────── */
const params  = new URLSearchParams(window.location.search);
const eventId = parseInt(params.get('id')) || 1;
const event   = allEvents.find(e => e.id === eventId) || allEvents[0];

/* ─────────────────────────────────────────
   REGISTRATION STATE
───────────────────────────────────────── */
let isRegistered = false;
let currentParticipants = event.participants;

/* ─────────────────────────────────────────
   POPULATE PAGE
───────────────────────────────────────── */
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
    av.style.background  = colors[i % colors.length] + '33';
    av.style.color       = colors[i % colors.length];
    av.style.borderColor = colors[i % colors.length] + '55';
    av.textContent = name;
    pList.appendChild(av);
  });

  const more = document.createElement('div');
  more.className = 'participant-avatar avatar-more';
  more.textContent = `+${currentParticipants - names.length}`;
  pList.appendChild(more);
}

/* ─────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   REGISTER / UNREGISTER
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   NOTIFICATION TOAST
───────────────────────────────────────── */
function showNotification(msg) {
  const n = document.getElementById('notification');
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}

/* ─────────────────────────────────────────
   SHARE
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   HAMBURGER
───────────────────────────────────────── */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

populatePage();
