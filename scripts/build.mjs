// Generates index.html from slides.json. Run: node scripts/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFileSync(root + path, 'utf8');
const { slides } = JSON.parse(read('slides.json'));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const indent = (s) => s.trim().replace(/^/gm, '    ');

function slide({ n, alt, video, html }) {
  if (html) return indent(read(html));

  const label = esc(alt ?? `Portfolio – ${Number(n)}`);
  const img = `assets/slides/${n}`;

  if (video) {
    return indent(`
<figure class="slide" id="s${n}">
  <video class="slide-media" muted loop playsinline preload="none" poster="${img}.webp" aria-label="${label}" width="1920" height="1080">
    <source src="assets/video/${n}.mp4" type="video/mp4">
  </video>
</figure>`);
  }
  return indent(`
<figure class="slide" id="s${n}">
  <img class="slide-media" src="${img}.webp" srcset="${img}-960.webp 960w, ${img}.webp 1920w" sizes="(min-width: 1664px) 1600px, (min-width: 900px) calc(100vw - 64px), calc(100vw - 32px)" width="1920" height="1080" loading="lazy" decoding="async" alt="${label}">
</figure>`);
}

const html = `<!doctype html>
<html lang="lt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rūta Morkūnė – Portfolio</title>
  <meta name="description" content="Rūta Morkūnė – grafikos dizainerė. Prekės ženklai, socialinių tinklų turinys, animacija.">
  <meta property="og:title" content="Rūta Morkūnė – Portfolio">
  <meta property="og:description" content="Grafikos dizainerės portfolio.">
  <meta property="og:image" content="https://marshruta.lt/assets/og.jpg">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@700&family=Montserrat:wght@400;500;600;700&family=Roboto:wght@900&display=swap">
  <link rel="stylesheet" href="assets/site.css">
</head>
<body>
  <header class="bar">
    <a href="#top">Rūta Morkūnė</a>
    <a href="mailto:morkuneruta@gmail.com">Portfolio</a>
  </header>
  <main id="top" class="deck">
${slides.map(slide).join('\n')}
  </main>
  <footer class="bar">
    <a href="mailto:morkuneruta@gmail.com">morkuneruta@gmail.com</a>
    <span>© ${new Date().getFullYear()} Rūta Morkūnė</span>
  </footer>
  <a class="to-top" href="#top" aria-label="Į viršų">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  </a>
  <script src="assets/site.js" defer></script>
</body>
</html>
`;

writeFileSync(root + 'index.html', html);
console.log(`index.html: ${slides.length} slides (${slides.filter((s) => s.html).length} html, ${slides.filter((s) => s.video).length} video)`);
