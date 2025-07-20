function scrollToHeroForm() {
  const hero = document.getElementById("hero");
  if (hero) {
    const yOffset = -60; // Höhe z. B. des Sticky-Headers
    const y = hero.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
