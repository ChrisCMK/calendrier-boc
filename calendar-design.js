(() => {
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = 'calendar-design.css'; document.head.append(css);
  const brand = document.querySelector('.brand');
  const brandText = document.createElement('div');
  while (brand.firstChild) brandText.append(brand.firstChild);
  const logo = document.createElement('img');
  logo.src = 'icon-192.png'; logo.alt = ''; logo.className = 'brand-mark';
  brand.append(logo, brandText);
  document.querySelector('main').id = 'agenda';
  document.querySelector('h1').textContent = 'Calendrier des sorties';
  document.querySelector('main > .intro').hidden = true;
  document.querySelector('main > .eyebrow').hidden = true;
  document.querySelectorAll('.club-filter').forEach(filter => {filter.hidden = true;});
  $('allClubs').hidden = true;
  $('rugby').hidden = true;
  const heading = document.createElement('div'); heading.className = 'calendar-heading';
  $('monthTitle').before(heading); heading.append($('monthTitle'));
  const arrows = document.createElement('div'); arrows.className = 'calendar-arrows';
  arrows.innerHTML = '<button class="tool" id="previousMonth" aria-label="Mois précédent">‹</button><button class="tool" id="followingMonth" aria-label="Mois suivant">›</button>';
  heading.append(arrows);
  const key = document.createElement('div'); key.className = 'calendar-key';
  key.innerHTML = '<span><i></i>Événement</span><span><i class="today-key"></i>Aujourd’hui</span>';
  $('calendar').after(key);
  document.querySelector('.calpanel > .muted').textContent = 'Cliquez sur une date en or pour voir les sorties.';
  function moveMonth(offset) {
    const date = new Date(year, month + offset, 1);
    if (![2026,2027].includes(date.getFullYear())) return;
    year = date.getFullYear(); month = date.getMonth(); day = null; upcoming = false; $('year').value = year; render();
  }
  $('previousMonth').onclick = () => moveMonth(-1);
  $('followingMonth').onclick = () => moveMonth(1);
  const originalRender = render;
  render = function() {
    originalRender();
    $('previousMonth').disabled = year === 2026 && month === 0;
    $('followingMonth').disabled = year === 2027 && month === 11;
    document.querySelectorAll('[data-day]').forEach(button => {
      button.setAttribute('aria-pressed', String(day === Number(button.dataset.day)));
    });
  };
  if (events.length) render();
})();
