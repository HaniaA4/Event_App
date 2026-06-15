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

document.querySelectorAll('.reveal').forEach((el, index) => {
  el.style.transitionDelay = `${index * 0.07}s`;
});

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

observeReveal();