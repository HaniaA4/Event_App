let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'date';

function getCards() {
  return Array.from(document.querySelectorAll('.event-card'));
}

function filterAndSortCards() {
  const cards = getCards();
  const grid = document.getElementById('eventsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultsCount');

  let visibleCards = cards.filter(card => {
    const category = card.dataset.category || '';
    const title = card.dataset.title || '';
    const location = card.dataset.location || '';

    const matchesCategory =
      currentCategory === 'all' || category === currentCategory;

    const q = currentSearch.toLowerCase().trim();

    const matchesSearch =
      !q ||
      title.toLowerCase().includes(q) ||
      location.toLowerCase().includes(q) ||
      category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  if (currentSort === 'spots') {
    visibleCards.sort((a, b) => {
      const spotsA = Number(a.dataset.spotsLeft || 9999);
      const spotsB = Number(b.dataset.spotsLeft || 9999);
      return spotsA - spotsB;
    });
  }

  if (currentSort === 'popularity') {
    visibleCards.sort((a, b) => {
      const regA = Number(a.dataset.registrations || 0);
      const regB = Number(b.dataset.registrations || 0);
      return regB - regA;
    });
  }

  cards.forEach(card => {
    card.style.display = 'none';
  });

  visibleCards.forEach(card => {
    card.style.display = '';
    grid.appendChild(card);
  });

  if (visibleCards.length === 0) {
    if (empty) empty.style.display = 'block';
    if (count) count.innerHTML = '<strong>0</strong> events found';
  } else {
    if (empty) empty.style.display = 'none';
    if (count) {
      count.innerHTML = `<strong>${visibleCards.length}</strong> event${visibleCards.length === 1 ? '' : 's'} found`;
    }
  }

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

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}

const searchInput = document.getElementById('searchInput');

if (searchInput) {
  searchInput.addEventListener('input', e => {
    currentSearch = e.target.value;
    filterAndSortCards();
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
    });

    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    filterAndSortCards();
  });
});

const sortSelect = document.getElementById('sortSelect');

if (sortSelect) {
  sortSelect.addEventListener('change', e => {
    currentSort = e.target.value;
    filterAndSortCards();
  });
}

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

filterAndSortCards();