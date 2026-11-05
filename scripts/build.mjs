// Generates index.html from slides.json and visuals.html from visuals.json. Run: node scripts/build.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFileSync(root + path, 'utf8');
const { slides } = JSON.parse(read('slides.json'));
const { posts } = JSON.parse(read('visuals.json'));

// GitHub Pages caches assets for 10 minutes; a content hash stops a new index.html
// from being paired with a stale site.css/site.js after a deploy.
const versioned = (path) => `${path}?v=${createHash('sha1').update(read(path)).digest('hex').slice(0, 8)}`;

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

function post({ n, h, alt, video }) {
  const label = esc(alt ?? `Visual – ${Number(n)}`);
  const img = `assets/visuals/${n}`;

  if (video) {
    return indent(`
<figure class="tile">
  <video class="tile-media" muted loop playsinline preload="none" poster="${img}.webp" aria-label="${label}" width="1080" height="${h}">
    <source src="${img}.mp4" type="video/mp4">
  </video>
</figure>`);
  }
  return indent(`
<figure class="tile">
  <img class="tile-media" src="${img}-540.webp" srcset="${img}-540.webp 540w, ${img}.webp 1080w" sizes="(min-width: 1664px) 320px, (min-width: 900px) calc((100vw - 64px) / 5), (min-width: 601px) calc((100vw - 32px) / 3), calc((100vw - 32px) / 2)" width="1080" height="${h}" loading="lazy" decoding="async" alt="${label}">
</figure>`);
}

const nav = (current) =>
  [['index.html', 'Portfolio'], ['visuals.html', 'Visuals']]
    .map(([href, text]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${text}</a>`)
    .join('\n      ');

const page = ({ file, title, main }) => `<!doctype html>
<html lang="lt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="Rūta Morkūnė – grafikos dizainerė. Prekės ženklai, socialinių tinklų turinys, animacija.">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="Grafikos dizainerės portfolio.">
  <meta property="og:image" content="https://marshruta.lt/assets/og.jpg">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&display=swap">
  <link rel="stylesheet" href="${versioned('assets/site.css')}">
</head>
<body>
  <header class="bar">
    <span class="brand">Rūta Morkūnė</span>
    <nav class="nav">
      ${nav(file)}
    </nav>
  </header>
${main}
  <footer class="bar">
    <a href="mailto:morkuneruta@gmail.com">morkuneruta@gmail.com</a>
    <span>© ${new Date().getFullYear()} Rūta Morkūnė</span>
  </footer>
  <a class="to-top" href="#top" aria-label="Į viršų">
    <svg class="to-top-ring" viewBox="0 0 56 56" width="56" height="56" aria-hidden="true"><circle cx="28" cy="28" r="26.5" pathLength="1"/></svg>
    <svg class="to-top-arrow" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  </a>
  <script src="${versioned('assets/site.js')}" defer></script>
</body>
</html>
`;

writeFileSync(root + 'index.html', page({
  file: 'index.html',
  title: 'Rūta Morkūnė – Portfolio',
  main: `  <main id="top" class="deck">\n${slides.map(slide).join('\n')}\n  </main>`,
}));

writeFileSync(root + 'visuals.html', page({
  file: 'visuals.html',
  title: 'Rūta Morkūnė – Visuals',
  main: `  <main id="top" class="visuals">\n${posts.map(post).join('\n')}\n  </main>`,
}));

console.log(`index.html: ${slides.length} slides (${slides.filter((s) => s.html).length} html, ${slides.filter((s) => s.video).length} video)`);
console.log(`visuals.html: ${posts.length} posts (${posts.filter((p) => p.video).length} video)`);
