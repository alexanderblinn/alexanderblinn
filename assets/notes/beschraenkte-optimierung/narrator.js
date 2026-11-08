// Lambda talks for a moment when one of its dialogue boxes first scrolls into view.
// Without this script (or with reduced motion) the boxes are simply shown; see narrator.css.
const boxes = document.querySelectorAll('.narrator');
const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (boxes.length && !still && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('narrator-js');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const box = entry.target;
      observer.unobserve(box);
      box.classList.add('is-seen', 'is-talking');
      box.addEventListener('animationend', () => box.classList.remove('is-talking'), { once: true });
    }
  }, { threshold: 0.35 });
  boxes.forEach(box => observer.observe(box));
}
