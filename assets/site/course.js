// Turns a long note into a course that shows one page at a time. With <h3> headings in
// .article-body every <h2> is a chapter and every <h3> starts a page of it; without them every
// <h2> is a page. Boxes above the text (1.1, 1.2, … coloured per chapter) switch between the
// pages, links at the end of a page lead to the previous and next one. The URL hash (#seite-1-3)
// keeps the place, so reloading, the back button and shared links work; "Abbildung N" in the text
// links to the page with that figure. A page with nothing but its heading is marked as not yet
// written. Without JavaScript the note stays one long page with headings.
const body = document.querySelector('.article-body');
const chaptered = body?.querySelector(':scope > h3') != null;
const pageTag = chaptered ? 'H3' : 'H2';

if (body && body.querySelectorAll(`:scope > ${pageTag}`).length > 1) {
  // 1. Wrap each page heading and everything up to the next one in a section; text before the
  //    first heading belongs to the first page. In chaptered notes the <h2> only names the chapter.
  const chapters = [];
  const pages = [];
  let page = null;
  for (const node of [...body.childNodes]) {
    if (chaptered && node.nodeName === 'H2') {
      chapters.push({ title: node.textContent.trim(), pages: [] });
      node.remove();
      page = null;  // text between the chapter heading and its first page belongs to that page
      continue;
    }
    if (!chapters.length) chapters.push({ title: '', pages: [] });
    if (!page || (node.nodeName === pageTag && page.querySelector(`:scope > ${pageTag.toLowerCase()}`))) {
      const chapter = chapters.length - 1;
      page = document.createElement('section');
      page.className = 'course-page';
      page.dataset.chapter = String(chapter + 1);
      pages.push(page);
      chapters[chapter].pages.push(page);
      body.append(page);
    }
    page.append(node);
  }
  const number = page => chaptered ? `${page.dataset.chapter}.${chapters[page.dataset.chapter - 1].pages.indexOf(page) + 1}` : String(pages.indexOf(page) + 1);
  const titles = pages.map(p => p.querySelector(':scope > h2, :scope > h3')?.textContent.trim() ?? '');
  pages.forEach((p, i) => {
    p.id = `seite-${number(p).replace('.', '-')}`;
    p.setAttribute('aria-label', `Seite ${number(p)}: ${titles[i]}`);
    const heading = p.querySelector(':scope > h2, :scope > h3');
    if (heading) {
      const tag = document.createElement('span');
      tag.className = 'course-number';
      tag.textContent = number(p);
      heading.prepend(tag, ' ');
    }
    // nothing but the heading: the page is still to be written
    if ([...p.children].every(child => child === heading)) {
      p.classList.add('is-empty');
      const note = document.createElement('p');
      note.className = 'course-empty';
      note.textContent = 'Diese Seite ist noch in Arbeit.';
      p.append(note);
    }
  });

  // 2. Boxes above the text, grouped and coloured by chapter.
  const nav = document.createElement('nav');
  nav.className = 'course-nav';
  nav.setAttribute('aria-label', 'Seiten des Kurses');
  const label = document.createElement('p');
  label.className = 'course-label';
  const groups = document.createElement('div');
  groups.className = 'course-chapters';
  const links = [];
  chapters.forEach((chapter, c) => {
    const list = document.createElement('ol');
    list.dataset.chapter = String(c + 1);
    if (chapter.title) list.setAttribute('aria-label', `Kapitel ${c + 1}: ${chapter.title}`);
    for (const p of chapter.pages) {
      const i = pages.indexOf(p);
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${p.id}`;
      link.title = `${number(p)} ${titles[i]}`;
      link.setAttribute('aria-label', `Seite ${number(p)}: ${titles[i]}`);
      link.textContent = number(p);
      if (p.classList.contains('is-empty')) link.classList.add('is-empty');
      item.append(link);
      list.append(item);
      links[i] = link;
    }
    groups.append(list);
  });
  nav.append(label, groups);
  body.prepend(nav);

  // 3. Previous and next page at the end of every page.
  pages.forEach((p, i) => {
    const pager = document.createElement('nav');
    pager.className = 'course-pager';
    pager.setAttribute('aria-label', 'Weiterblättern');
    for (const [j, kind, word] of [[i - 1, 'course-prev', '← Zurück'], [i + 1, 'course-next', 'Weiter →']]) {
      if (j < 0 || j >= pages.length) continue;
      const link = document.createElement('a');
      link.className = kind;
      link.href = `#${pages[j].id}`;
      link.dataset.chapter = pages[j].dataset.chapter;
      const small = document.createElement('small');
      small.textContent = word;
      link.append(small, `${number(pages[j])} ${titles[j]}`);
      pager.append(link);
    }
    p.append(pager);
  });

  // 4. Figures get an anchor from their caption, and mentions of them in the text become links.
  for (const figure of body.querySelectorAll('figure')) {
    const figureNumber = figure.querySelector('figcaption')?.textContent.match(/^\s*Abbildung (\d+)/)?.[1];
    if (figureNumber) figure.id = `abbildung-${figureNumber}`;
  }
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => /Abbildung \d/.test(node.data) && !node.parentElement.closest('a, math, code, pre, h2, h3, nav')
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

  // 5. Show one page; visited pages are remembered in this browser only.
  const key = `course:${location.pathname}`;
  let visited = new Set();
  try { visited = new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { /* storage blocked */ }

  function show(index, target) {
    pages.forEach((p, i) => { p.hidden = i !== index; });
    visited.add(pages[index].id);
    try { localStorage.setItem(key, JSON.stringify([...visited])); } catch { /* storage blocked */ }
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      link.classList.toggle('is-visited', visited.has(pages[i].id));
    });
    const chapter = Number(pages[index].dataset.chapter);
    nav.dataset.chapter = String(chapter);
    label.textContent = chaptered
      ? `Kapitel ${chapter}: ${chapters[chapter - 1].title} · Seite ${number(pages[index])}`
      : `Kurs · Seite ${index + 1} von ${pages.length}`;
    if (target) target.scrollIntoView({ block: 'start' });
  }

  // #seite-1-3 shows that page from the top, #abbildung-N or any other anchor the page containing it.
  function route(scroll) {
    const target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    const index = target ? pages.findIndex(p => p.contains(target)) : -1;
    show(Math.max(index, 0), scroll ? (target && !target.classList.contains('course-page') ? target : nav) : null);
  }
  window.addEventListener('hashchange', () => route(true));
  route(location.hash.length > 1);
}
