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

// A video should play whenever it is on screen. Browsers sometimes refuse or interrupt
// playback (the first load of a big file, a background tab, bfcache restore, Low Power
// Mode), so a single play() on intersect is not enough: keep track of what is on screen
// and retry from every event that can unblock it.
const onScreen = new Set();

const tryPlay = (video) => {
  if (!onScreen.has(video) || !video.paused || document.hidden) return;
  video.muted = true; // autoplay is only allowed for muted video
  video.play()?.catch(() => {});
};

const videos = new IntersectionObserver((entries) => {
  for (const { target: video, isIntersecting } of entries) {
    if (isIntersecting) {
      onScreen.add(video);
      tryPlay(video);
    } else {
      onScreen.delete(video);
      video.pause();
    }
  }
}, { threshold: 0.25 });

const retryAll = () => onScreen.forEach(tryPlay);
document.addEventListener('visibilitychange', retryAll);
addEventListener('pageshow', retryAll);
for (const type of ['pointerdown', 'touchstart', 'keydown', 'wheel']) {
  addEventListener(type, retryAll, { passive: true });
}
setInterval(retryAll, 1500); // watchdog: cheap, and only touches videos that are on screen but paused

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
  v.muted = true;
  v.addEventListener('canplay', () => tryPlay(v));
  preload.observe(v);
  videos.observe(v);
});
