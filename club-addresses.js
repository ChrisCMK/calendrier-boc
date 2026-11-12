(() => {
  const style = document.createElement('style');
  style.textContent = `.section-links{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:32px}.section-links a{text-decoration:none;display:inline-flex;align-items:center;gap:8px;min-height:44px}.address-section{margin-top:56px;padding-top:32px;border-top:1px solid #484034;scroll-margin-top:24px}.address-tools{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0}.address-search{flex:1;min-width:200px;padding:12px 15px;border:1px solid #484034;background:var(--panel);border-radius:8px;color:#f5f1e9;font:inherit}.address-search:focus-visible{outline:3px solid var(--gold);outline-offset:3px}.address-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.address-card{padding:22px;background:var(--panel);border:1px solid #39342b;border-radius:12px}.address-card h3{font-size:19px;margin:12px 0;display:flex;align-items:center;gap:10px}.address-club-logo{width:38px;height:38px;object-fit:contain;flex:none;border-radius:6px;background:#101010;padding:3px}.address-card p{line-height:1.6;font-size:14px}.address-actions{display:flex;gap:14px;flex-wrap:wrap;align-items:center}.address-actions a{font-size:13px}.address-card .badge{margin:0}.address-unknown{color:var(--muted)}@media(max-width:1000px){.address-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.address-grid{grid-template-columns:1fr}.address-tools>*{width:100%}}`;
  document.head.append(style);
  const main = document.querySelector('main');
  main.id = 'agenda';
  const links = document.createElement('nav');
  links.className = 'section-links';
  links.setAttribute('aria-label', 'Rubriques');
  links.innerHTML = '<a class="tool" href="#agenda">Calendrier</a><a class="tool" href="#adresses"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Adresses des clubs</a>';
  main.prepend(links);
  const section = document.createElement('section');
  section.id = 'adresses';
  section.className = 'address-section';
  section.setAttribute('aria-labelledby', 'address-title');
  section.innerHTML = `<div class="eyebrow">LE RÉPERTOIRE</div><h2 id="address-title">Adresses des clubs</h2><p class="intro">Choisissez un club dans le menu déroulant pour afficher son adresse et ouvrir Google Maps. Le chapitre est précisé lorsqu’il est connu. Une adresse de flyer correspond au lieu annoncé pour cet événement.</p><p class="muted">Clubs grand patch de Suisse<br>Clubs petit patch de Suisse</p><div class="address-tools"><select id="address-club" class="address-search" aria-label="Choisir le club dont afficher l’adresse"><option value="">Choisir un club</option></select><select id="address-category" aria-label="Catégorie de club"><option value="">MC et AMCC</option><option value="AMCC">AMCC</option><option value="MC">Tous les MC</option><option value="grand">Grand patch</option><option value="petit">Petit patch</option></select><select id="address-known" aria-label="Disponibilité de l’adresse"><option value="all">Tous les clubs</option><option value="known">Adresses connues</option></select></div><p id="address-count" class="muted" aria-live="polite">Chargement des adresses…</p><div id="address-list" class="address-grid"></div>`;
  main.append(section);
  let addresses = [], directoryWebsites = {}, directoryLogos = {};
  function patchGroup(name){return largePatchClubs.has(name)?'grand':smallPatchClubs.has(name)?'petit':''}
  function categoryMatches(name, category){return !category || (category==='grand'||category==='petit' ? patchGroup(name)===category : categoryOfClub(name)===category)}
  function populateAddressClubs() {
    const select = $('address-club'), selected = select.value;
    const category = $('address-category').value;
    const names = [...new Set([...amccClubs,...mcClubs,...addresses.map(x => x.club)])].filter(name => categoryMatches(name, category)).sort((a,b) => a.localeCompare(b,'fr'));
    const groups=[['grand','Clubs grand patch de Suisse'],['petit','Clubs petit patch de Suisse'],['','Autres clubs']];
    select.innerHTML = '<option value="">Tous les clubs de la sélection</option>' + groups.map(([key,label])=>{const members=names.filter(name=>patchGroup(name)===key);return members.length ? `<optgroup label="${esc(label)}">${members.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}</optgroup>`:''}).join('');
    select.value = names.includes(selected) ? selected : '';
  }
  function drawAddresses() {
    const selectedClub = $('address-club').value;
    const category = $('address-category').value;
    const known = $('address-known').value === 'known';
    const names = [...new Set([...amccClubs, ...mcClubs, ...addresses.map(x => x.club)])];
    const rows = names.flatMap(name => {
      const matches = addresses.filter(x => x.club === name);
      return matches.length ? matches : [{club:name}];
    }).filter(x => (selectedClub ? x.club === selectedClub : !known || x.address) && (categoryMatches(x.club, category))).sort((a,b) => a.club.localeCompare(b.club,'fr'));
    $('address-count').textContent = rows.length + ' résultat' + (rows.length > 1 ? 's' : '');
    $('address-list').innerHTML = rows.length ? rows.map(x => {
      const logo = directoryLogos[x.club] || directoryLogos[clubAliases[x.club]];
      const website = directoryWebsites[x.club];
      const url = typeof website === 'string' ? website : website?.url;
      const valid = url && /^https?:\/\//i.test(url);
      const mapsUrl = x.mapsUrl && /^https:\/\//i.test(x.mapsUrl) ? x.mapsUrl : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(x.address);
      return `<article class="address-card"><span class="badge">${esc(patchGroup(x.club)==='grand'?'MC · Grand patch':patchGroup(x.club)==='petit'?'MC · Petit patch':categoryOfClub(x.club) || 'Club')}</span><h3>${logo?.image ? `<img class="address-club-logo" src="${esc(logo.image)}" alt="" loading="lazy">` : ''}<span>${esc(x.club)}</span></h3>${x.chapter ? `<p class="muted">${esc(x.chapter)}</p>` : ''}${x.address ? `<p>${esc(x.address)}</p>${x.kind && !/^Adresse annoncée sur flyer/i.test(x.kind) ? `<p class="muted">${esc(x.kind)}</p>` : ''}<div class="address-actions"><a class="club-website" href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Google Maps : ${esc(x.club)}">Google Maps ↗</a><a href="${esc(x.source)}" target="_blank" rel="noopener noreferrer">${esc(x.sourceLabel)}</a></div>` : '<p class="address-unknown">Adresse à confirmer</p>'}${valid ? `<p><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Site du club ↗</a></p>` : ''}</article>`;
    }).join('') : '<p class="empty">Aucun club ne correspond à cette recherche.</p>';
  }
  $('address-club').addEventListener('change', drawAddresses);
  $('address-category').addEventListener('change', () => {populateAddressClubs();drawAddresses();});
  $('address-known').addEventListener('change', drawAddresses);
  Promise.all([fetch('club-addresses.json').then(r => {if (!r.ok) throw new Error('addresses');return r.json();}),fetch('club-websites.json').then(r => r.ok ? r.json() : {}).catch(() => ({})),fetch('club-logos.json').then(r => r.ok ? r.json() : {}).catch(() => ({}))]).then(([data,websites,logos]) => {addresses=data;directoryWebsites=websites;directoryLogos=logos;populateAddressClubs();drawAddresses();if(location.hash === '#adresses') section.scrollIntoView();}).catch(() => {$('address-count').textContent='Les adresses ne peuvent pas se charger. Actualisez la page pour réessayer.';});
})();
