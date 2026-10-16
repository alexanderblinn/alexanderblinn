// Contact postcard on the About page. The mail link is assembled here, so the plain address
// never appears in the HTML for address harvesters; the postmark shows today's date; a sent
// card flies off. Without JavaScript the form still posts normally.
const mail = document.querySelector('.contact-mail');
if (mail) {
  const address = `${mail.dataset.user}@${mail.dataset.domain}`;
  mail.href = `mailto:${address}`;
  mail.textContent = address;
}

document.getElementById('pc-date').textContent =
  new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

const form = document.querySelector('.contact');
const card = form.querySelector('.postcard');
const status = form.querySelector('.contact-status');
const again = form.querySelector('.contact-again');
const calm = matchMedia('(prefers-reduced-motion: reduce)');

function sent() {
  card.hidden = true;
  card.classList.remove('is-sent');
  form.reset();
  form.classList.add('is-done');
  status.textContent = 'Deine Karte ist unterwegs! Ich melde mich bald bei dir.';
  again.hidden = false;
  again.focus();
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  status.textContent = 'Wird gesendet …';
  try {
    const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch {
    // For example a captcha the service wants to show: let it handle the form on its own page.
    form.submit();
    return;
  }
  status.textContent = '';
  if (calm.matches) return sent();
  card.addEventListener('animationend', sent, { once: true });
  card.classList.add('is-sent');
});

again.addEventListener('click', () => {
  again.hidden = true;
  status.textContent = '';
  form.classList.remove('is-done');
  card.hidden = false;
  if (!calm.matches) {
    card.addEventListener('animationend', () => card.classList.remove('is-new'), { once: true });
    card.classList.add('is-new');
  }
  form.querySelector('#pc-message').focus();
});
