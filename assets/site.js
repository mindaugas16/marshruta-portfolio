document.documentElement.classList.add('js');

const reveal = new IntersectionObserver((entries) => {
  for (const { target, isIntersecting } of entries) {
    if (isIntersecting) {
      target.classList.add('is-in');
      reveal.unobserve(target);
    }
  }
}, { rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.slide, .tile').forEach((el) => reveal.observe(el));

// Videos use preload="none" (the Bio Bandits loop alone is ~18 MB), so they only
// download once they come near the viewport, and pause again when scrolled away.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const videos = new IntersectionObserver((entries) => {
  for (const { target: video, isIntersecting } of entries) {
    if (isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
}, { threshold: 0.25 });

const preload = new IntersectionObserver((entries) => {
  for (const { target: video, isIntersecting } of entries) {
    if (isIntersecting) {
      video.preload = 'auto';
      preload.unobserve(video);
    }
  }
}, { rootMargin: '150% 0px' });

const toTop = document.querySelector('.to-top');
// The Visuals page has no cover slide, so the button appears once the header scrolls away.
const cover = document.querySelector('.slide') ?? document.querySelector('header');

new IntersectionObserver(([entry]) => {
  toTop.classList.toggle('is-shown', !entry.isIntersecting);
}).observe(cover);

let progressQueued = false;
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  toTop.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
  progressQueued = false;
};
addEventListener('scroll', () => {
  if (!progressQueued) {
    progressQueued = true;
    requestAnimationFrame(updateProgress);
  }
}, { passive: true });
updateProgress();

toTop.addEventListener('click', (e) => {
  e.preventDefault();
  scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  history.replaceState(null, '', location.pathname);
});

document.querySelectorAll('video').forEach((v) => {
  if (reducedMotion) {
    v.controls = true;
    return;
  }
  preload.observe(v);
  videos.observe(v);
});
