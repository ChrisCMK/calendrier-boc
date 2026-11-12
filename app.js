(() => {
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const bar = document.createElement('div');
  bar.className = 'app-bar';
  bar.innerHTML = '<span class="app-state" role="status"></span><button class="app-install" type="button">Installer l’application</button>';
  document.querySelector('header').after(bar);
  const state = bar.querySelector('.app-state');
  const button = bar.querySelector('button');
  function status() {
    state.textContent = navigator.onLine ? 'B.O.C. · Votre agenda dans la poche' : 'Hors connexion · Dernières données enregistrées, susceptibles d’avoir changé';
    button.hidden = standalone();
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'app-help';
  dialog.innerHTML = '<h2>Votre agenda B.O.C.</h2><p>Gardez les sorties et les flyers sur votre écran d’accueil.</p><h3>Sur iPhone ou iPad</h3><ol><li>Ouvrez ce calendrier dans <strong>Safari</strong>.</li><li>Touchez <strong>Partager</strong>, puis <strong>Sur l’écran d’accueil</strong>.</li><li>Activez <strong>Ouvrir comme app</strong> si proposé, puis touchez <strong>Ajouter</strong>.</li></ol><h3>Sur Android</h3><p>Dans Chrome, ouvrez le menu ⋮ puis <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>.</p><p class="app-note">Ouvrez l’application une première fois avec Internet. Les données déjà chargées restent consultables hors connexion ; les nouveaux flyers nécessitent Internet.</p><form method="dialog"><button class="app-install">Compris</button></form>';
  document.body.append(dialog);
  let installPrompt;
  addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
  button.addEventListener('click', async () => {
    if (installPrompt) {
      const prompt = installPrompt; installPrompt = null;
      await prompt.prompt(); await prompt.userChoice;
    } else dialog.showModal();
  });
  addEventListener('appinstalled', status);
  addEventListener('online', status); addEventListener('offline', status); status();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {
    state.textContent = 'B.O.C. · Mode hors connexion indisponible dans ce navigateur';
  });
})();
