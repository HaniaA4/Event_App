const events = [
  { id:1, title:"Python for Data Science – Study Session",     category:"Study Sessions", date:"May 15, 2025", time:"18:00", location:"Campus Library, Room B2",    participants:12, max:20, icon:"📚", gradient:"linear-gradient(135deg,#1a237e,#283593)" },
  { id:2, title:"5-a-side Football Tournament",                 category:"Sports",         date:"May 17, 2025", time:"15:30", location:"Campus Sports Field",         participants:28, max:30, icon:"⚽", gradient:"linear-gradient(135deg,#1b5e20,#2e7d32)" },
  { id:3, title:"Web Design Workshop",                          category:"Workshops",      date:"May 20, 2025", time:"14:00", location:"Auditorium A",                participants:45, max:60, icon:"🛠️", gradient:"linear-gradient(135deg,#4a148c,#6a1b9a)" },
  { id:4, title:"Data Visualization Talk: Beyond Bar Charts",   category:"Talks",          date:"May 22, 2025", time:"17:00", location:"Room 101, Main Building",     participants:33, max:50, icon:"🎤", gradient:"linear-gradient(135deg,#bf360c,#d84315)" },
  { id:5, title:"Portuguese Culture Night",                     category:"Cultural",       date:"May 24, 2025", time:"20:00", location:"Student Lounge",              participants:60, max:80, icon:"🎭", gradient:"linear-gradient(135deg,#006064,#00838f)" },
  { id:6, title:"Group Project Kickoff – TAW",                  category:"Group Meetings", date:"May 25, 2025", time:"10:00", location:"Room 204",                    participants:8,  max:10, icon:"👥", gradient:"linear-gradient(135deg,#e65100,#ef6c00)" },
  { id:7, title:"Statistics Exam Prep Session",                 category:"Study Sessions", date:"May 26, 2025", time:"16:00", location:"Library, Floor 3",            participants:20, max:25, icon:"📊", gradient:"linear-gradient(135deg,#0d47a1,#1565c0)" },
  { id:8, title:"Intro to Machine Learning Workshop",           category:"Workshops",      date:"May 28, 2025", time:"10:00", location:"Lab 3, Tech Building",        participants:18, max:30, icon:"🤖", gradient:"linear-gradient(135deg,#311b92,#4527a0)" },
  { id:9, title:"Campus 5km Run",                               category:"Sports",         date:"Jun 01, 2025", time:"08:30", location:"University Gardens",          participants:55, max:100,icon:"🏃", gradient:"linear-gradient(135deg,#004d40,#00695c)" },
];

let currentCategory = 'all';
let currentSearch   = '';
let currentSort     = 'date';

function getFiltered() {
  let list = [...events];

  if (currentCategory !== 'all') {
    list = list.filter(e => e.category === currentCategory);
  }

  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    list = list.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  }

  if (currentSort === 'spots') {
    list.sort((a, b) => (a.max - a.participants) - (b.max - b.participants));
  } else if (currentSort === 'popularity') {
    list.sort((a, b) => b.participants - a.participants);
  }

  return list;
}

function render() {
  const list  = getFiltered();
  const grid  = document.getElementById('eventsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultsCount');

  grid.innerHTML = '';

  if (list.length === 0) {
    empty.style.display = 'block';
    count.innerHTML = '<strong>0</strong> events found';
    return;
  }

  empty.style.display = 'none';
  count.innerHTML = `<strong>${list.length}</strong> event${list.length === 1 ? '' : 's'} found`;

  list.forEach((ev, idx) => {
    const spotsLeft = ev.max - ev.participants;
    let badgeClass = 'spots-ok';
    let badgeText  = `${spotsLeft} spots left`;
    if (spotsLeft === 0)     { badgeClass = 'spots-full'; badgeText = 'Full'; }
    else if (spotsLeft <= 5) { badgeClass = 'spots-low';  badgeText = `Only ${spotsLeft} left!`; }

    const card = document.createElement('a');
    if (ev.id === 3) card.href = 'event_details.html';
    card.className = 'glass event-card reveal';
    card.style.transitionDelay = `${idx * 0.06}s`;

    card.innerHTML = `
      <div class="event-img">
        <div class="event-img-grad" style="background:${ev.gradient};"></div>
        <span class="event-img-icon">${ev.icon}</span>
      </div>
      <div class="event-body">
        <div class="event-category">${ev.category}</div>
        <h3 class="event-title">${ev.title}</h3>
        <div class="event-meta">
          <div class="event-meta-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${ev.date} · ${ev.time}
          </div>
          <div class="event-meta-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${ev.location}
          </div>
        </div>
        <div class="event-footer">
          <div class="event-participants"><strong>${ev.participants}</strong>/${ev.max} going</div>
          <span class="spots-badge ${badgeClass}">${badgeText}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  observeReveal();
}

function observeReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

document.getElementById('searchInput').addEventListener('input', e => {
  currentSearch = e.target.value;
  render();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    render();
  });
});

document.getElementById('sortSelect').addEventListener('change', e => {
  currentSort = e.target.value;
  render();
});

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

render();
