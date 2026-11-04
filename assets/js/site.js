// Qyntiv : mouvements lents et feutrés. Tout s'immobilise si le visiteur demande moins d'animations.
(() => {
  const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // En-tête : transparent sur le ciel, voilé dès que l'on descend
  const entete = document.querySelector('.entete');
  const majEntete = () => entete && entete.classList.toggle('defile', window.scrollY > 40);
  majEntete();
  window.addEventListener('scroll', majEntete, { passive: true });

  // Apparition lente des blocs au défilement
  const blocs = document.querySelectorAll('.apparait');
  if ('IntersectionObserver' in window && !calme) {
    const vue = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); vue.unobserve(e.target); } });
    }, { threshold: 0.12 });
    blocs.forEach((b) => vue.observe(b));
  } else {
    blocs.forEach((b) => b.classList.add('visible'));
  }

  // Profondeur : les dunes et la ligne d'horizon glissent à des vitesses différentes
  if (calme) return;
  const couches = [...document.querySelectorAll('[data-profondeur]')];
  if (!couches.length) return;
  let attente = false;
  const glisser = () => {
    const y = window.scrollY;
    couches.forEach((c) => { c.style.transform = `translate3d(0, ${y * parseFloat(c.dataset.profondeur)}px, 0)`; });
    attente = false;
  };
  window.addEventListener('scroll', () => { if (!attente) { attente = true; requestAnimationFrame(glisser); } }, { passive: true });
})();
