// Guestbook extras on top of the plain HTML form: smiley buttons, glitter behind the mouse
// pointer, the blinking "NEU!" for entries of the last 30 days and an in-page confirmation
// instead of the form service's own page. Without JavaScript the form still posts normally.
const form = document.querySelector('.gb-form');
const message = document.getElementById('gb-message');
const status = form.querySelector('.gb-status');

for (const button of document.querySelectorAll('[data-smiley]')) {
  button.addEventListener('click', () => {
    const { selectionStart: start, selectionEnd: end, value } = message;
    const smiley = (start > 0 && !/\s/.test(value[start - 1]) ? ' ' : '') + button.dataset.smiley + ' ';
    message.value = value.slice(0, start) + smiley + value.slice(end);
    message.focus();
    message.selectionStart = message.selectionEnd = start + smiley.length;
  });
}

// Glitter trailing the mouse pointer, as on many homepages around 1999.
if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const colours = ['#c99a2e', '#b95a28', '#173fbe', '#8a5979', '#426f6b'];
  let last = 0;
  addEventListener('pointermove', event => {
    if (event.timeStamp - last < 40) return;
    last = event.timeStamp;
    const spark = document.createElement('span');
    spark.className = 'gb-glitter';
    spark.setAttribute('aria-hidden', 'true');
    spark.textContent = Math.random() < 0.5 ? '✦' : '✧';
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.style.color = colours[Math.floor(Math.random() * colours.length)];
    spark.addEventListener('animationend', () => spark.remove());
    document.body.append(spark);
  });
}

const month = 30 * 24 * 3600 * 1000;
for (const entry of document.querySelectorAll('.gb-entry[data-date]')) {
  if (Date.now() - Date.parse(entry.dataset.date) < month) entry.classList.add('is-new');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  status.textContent = 'Wird gesendet …';
  try {
    const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    form.reset();
    status.textContent = 'Danke für deinen Eintrag! Er erscheint hier, sobald ich ihn freigeschaltet habe.';
  } catch {
    // For example a captcha the service wants to show: let it handle the form on its own page.
    form.submit();
  }
});
