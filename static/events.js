/* all the filtering/sorting on the events page happens on the client-side - the events are already
in the DOM (rendered by flask), we just show/hide and reorder the cards with JS instead
of re-fetching from the server every time you type in the search bar */
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'date';

function getCards() {
  return Array.from(document.querySelectorAll('.event-card'));
}

// re-runs every time the search box, category filter, or sort dropdown changes
function filterAndSortCards() {
  const cards = getCards();
  const grid = document.getElementById('eventsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultsCount');

  if (!grid) {
    return;
  }

  // keep only the cards that match both the selected category and the search text
  // (the data attributes on each card come from events.html)
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
    // fewest spots left shows up first
    visibleCards.sort((a, b) => {
      const spotsA = Number(a.dataset.spotsLeft || 9999);
      const spotsB = Number(b.dataset.spotsLeft || 9999);
      return spotsA - spotsB;
    });
  }

  if (currentSort === 'popularity') {
    // most registrations shows up first
    visibleCards.sort((a, b) => {
      const regA = Number(a.dataset.registrations || 0);
      const regB = Number(b.dataset.registrations || 0);
      return regB - regA;
    });
  }

  /* hide everything first, then only show + re-append the cards that survived the filter
   (re-appending also puts them in the right sorted order in the grid) */
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

  // newly-shown cards need to be re-checked for the scroll reveal animation
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

// category filter buttons (All, Study, Workshops etc) only one can be active at a time
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

// mobile hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// run once on page load so the results count is correct from the start
filterAndSortCards();