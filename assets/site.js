document.documentElement.classList.add('js');

const reveal = new IntersectionObserver((entries) => {
  for (const { target, isIntersecting } of entries) {
    if (isIntersecting) {
      target.classList.add('is-in');
      reveal.unobserve(target);
    }
  }
}, { rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.slide').forEach((el) => reveal.observe(el));

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

document.querySelectorAll('video').forEach((v) => {
  if (reducedMotion) {
    v.controls = true;
    return;
  }
  preload.observe(v);
  videos.observe(v);
});
