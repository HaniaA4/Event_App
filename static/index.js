// handles the fade-in-on-scroll effect for elements with the .reveal class
// (uses IntersectionObserver so it's not constantly checking scroll position, better for performance)
function observeReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible'); // css transition does the actual fade
        observer.unobserve(entry.target); // only needs to happen once per element
      }
    });
  }, { threshold: 0.08 }); 

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    observer.observe(el);
  });
}

// stagger the reveal animations a bit so elements don't all pop in at the same time
document.querySelectorAll('.reveal').forEach((el, index) => {
  el.style.transitionDelay = `${index * 0.07}s`;
});

// mobile hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

observeReveal();