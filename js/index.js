const events = [
  { title:"Python for Data Science – Study Session", category:"Study Sessions", date:"May 15", time:"18:00", location:"Library, Room B2",   participants:12, max:20, icon:"📚", gradient:"linear-gradient(135deg,#1a237e,#283593)" },
  { title:"5-a-side Football Tournament",            category:"Sports",         date:"May 17", time:"15:30", location:"Campus Sports Field", participants:28, max:30, icon:"⚽", gradient:"linear-gradient(135deg,#1b5e20,#2e7d32)" },
  { title:"Web Design Workshop",                     category:"Workshops",      date:"May 20", time:"14:00", location:"Auditorium A",         participants:45, max:60, icon:"🛠️", gradient:"linear-gradient(135deg,#4a148c,#6a1b9a)" },
  { title:"Data Viz Talk: Beyond Bar Charts",        category:"Talks",          date:"May 22", time:"17:00", location:"Room 101, Main Bldg", participants:33, max:50, icon:"🎤", gradient:"linear-gradient(135deg,#7c2d12,#b45309)" },
  { title:"Portuguese Culture Night",                category:"Cultural",       date:"May 24", time:"20:00", location:"Student Lounge",       participants:60, max:80, icon:"🎭", gradient:"linear-gradient(135deg,#064e3b,#065f46)" },
  { title:"Group Project Kickoff – TAW",             category:"Group Meetings", date:"May 25", time:"10:00", location:"Room 204",             participants:8,  max:10, icon:"👥", gradient:"linear-gradient(135deg,#92400e,#b45309)" },
];

function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  events.forEach((ev, i) => {
    const spotsLeft  = ev.max - ev.participants;
    const badgeClass = spotsLeft <= 5 ? 'spots-low' : 'spots-ok';
    const badgeText  = spotsLeft <= 5 ? `Only ${spotsLeft} left!` : `${spotsLeft} spots left`;
    const card = document.createElement('a');
    if (ev.title === 'Web Design Workshop') card.href = 'event_details.html';
    card.className = 'glass event-card reveal';
    card.style.transitionDelay = `${i * 0.07}s`;
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${ev.date} · ${ev.time}
          </div>
          <div class="event-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${ev.location}
          </div>
        </div>
        <div class="event-footer">
          <div class="event-participants"><strong>${ev.participants}</strong>/${ev.max} going</div>
          <span class="spots-badge ${badgeClass}">${badgeText}</span>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  observeReveal();
}

function observeReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

renderEvents();
observeReveal();
