// Turns a long note into a course: every <h2> of .article-body starts a part, and only one part is
// shown at a time. Numbered boxes above the text switch between the parts, links at the end of a
// part lead to the previous and next one. The URL hash (#teil-3) keeps the place, so reloading,
// the back button and shared links work; "Abbildung N" in the text links to the part with that
// figure. Without JavaScript the note stays one long page with headings.
const body = document.querySelector('.article-body');
const headings = body ? body.querySelectorAll(':scope > h2') : [];

if (headings.length > 1) {
  // 1. Wrap each heading and everything up to the next heading in a section; text before the
  //    first heading belongs to the first part.
  const pages = [];
  let page = null;
  for (const node of [...body.childNodes]) {
    if (!page || (node.nodeName === 'H2' && page.querySelector(':scope > h2'))) {
      page = document.createElement('section');
      page.className = 'course-page';
      page.id = `teil-${pages.length + 1}`;
      pages.push(page);
      body.append(page);
    }
    page.append(node);
  }
  const titles = pages.map(p => p.querySelector(':scope > h2')?.textContent.trim() ?? '');
  pages.forEach((p, i) => p.setAttribute('aria-label', `Teil ${i + 1}: ${titles[i]}`));

  // 2. Boxes 1, 2, 3 … above the text.
  const nav = document.createElement('nav');
  nav.className = 'course-nav';
  nav.setAttribute('aria-label', 'Teile des Kurses');
  const label = document.createElement('p');
  label.className = 'course-label';
  const list = document.createElement('ol');
  const links = pages.map((p, i) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${p.id}`;
    link.title = `${i + 1}. ${titles[i]}`;
    link.setAttribute('aria-label', `Teil ${i + 1}: ${titles[i]}`);
    link.textContent = String(i + 1);
    item.append(link);
    list.append(item);
    return link;
  });
  nav.append(label, list);
  body.prepend(nav);

  // 3. Previous and next part at the end of every part.
  pages.forEach((p, i) => {
    const pager = document.createElement('nav');
    pager.className = 'course-pager';
    pager.setAttribute('aria-label', 'Weiterblättern');
    for (const [j, kind, word] of [[i - 1, 'course-prev', '← Zurück'], [i + 1, 'course-next', 'Weiter →']]) {
      if (j < 0 || j >= pages.length) continue;
      const link = document.createElement('a');
      link.className = kind;
      link.href = `#${pages[j].id}`;
      const small = document.createElement('small');
      small.textContent = word;
      link.append(small, `${j + 1}. ${titles[j]}`);
      pager.append(link);
    }
    p.append(pager);
  });

  // 4. Figures get an anchor from their caption, and mentions of them in the text become links.
  for (const figure of body.querySelectorAll('figure')) {
    const number = figure.querySelector('figcaption')?.textContent.match(/^\s*Abbildung (\d+)/)?.[1];
    if (number) figure.id = `abbildung-${number}`;
  }
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => /Abbildung \d/.test(node.data) && !node.parentElement.closest('a, math, code, pre, h2, nav')
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (const node of textNodes) {
    const own = node.parentElement.closest('figure')?.id;
    const fragment = document.createDocumentFragment();
    let last = 0;
    for (const match of node.data.matchAll(/Abbildung (\d+)/g)) {
      const id = `abbildung-${match[1]}`;
      if (id === own || !document.getElementById(id)) continue;
      fragment.append(node.data.slice(last, match.index));
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = match[0];
      fragment.append(link);
      last = match.index + match[0].length;
    }
    if (last === 0) continue;
    fragment.append(node.data.slice(last));
    node.replaceWith(fragment);
  }

  // 5. Show one part; visited parts are remembered in this browser only.
  const key = `course:${location.pathname}`;
  let visited = new Set();
  try { visited = new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { /* storage blocked */ }

  function show(index, target) {
    pages.forEach((p, i) => { p.hidden = i !== index; });
    visited.add(index);
    try { localStorage.setItem(key, JSON.stringify([...visited])); } catch { /* storage blocked */ }
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      link.classList.toggle('is-visited', visited.has(i));
    });
    label.textContent = `Kurs · Teil ${index + 1} von ${pages.length}`;
    if (target) target.scrollIntoView({ block: 'start' });
  }

  // #teil-N shows that part from the top, #abbildung-N or any other anchor the part containing it.
  function route(scroll) {
    const target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    const index = target ? pages.findIndex(p => p.contains(target)) : -1;
    show(Math.max(index, 0), scroll ? (target && !target.classList.contains('course-page') ? target : nav) : null);
  }
  window.addEventListener('hashchange', () => route(true));
  route(location.hash.length > 1);
}
