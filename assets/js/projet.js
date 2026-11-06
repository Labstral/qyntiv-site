// Qyntiv : formulaire « Proposer un projet » (logiciel sur mesure + rendez-vous téléphonique).
// Assistant en 5 étapes, validation à chaque étape, brouillon gardé dans le navigateur.
// Envoi : Web3Forms (le message arrive dans la boîte mail du studio, rien n'est stocké sur ce site).
// Sans clé Web3Forms, le message est préparé dans la messagerie du visiteur.
(() => {
  const formulaire = document.getElementById('formulaire-projet');
  if (!formulaire) return;

  // ------------------------------------------------------------- réglages
  const CLE_WEB3FORMS = '6ae6555f-7de7-47fe-a69e-ee74cc6cc03b';                 // clé d'accès Web3Forms (web3forms.com) ; vide : envoi par e-mail
  const ADRESSE = 'qyntiv@gmail.com';     // utilisée seulement sans clé
  const MAX_CRENEAUX = 3;
  const JOURS_PROPOSES = 12;                // jours proposés : deux semaines, du lundi au samedi
  const CLE_BROUILLON = 'qyntiv-projet-brouillon';

  const EN = document.documentElement.lang === 'en';
  const T = EN ? {
    jours: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    mois: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    matin: ['Morning', '9:00 to 12:00'], apresMidi: ['Afternoon', '14:00 to 17:00'],
    aucunCreneau: 'No slot chosen yet.',
    retirer: 'Remove',
    limite: (n) => `Up to ${n} slots.`,
    requis: 'Please fill in this field.',
    choixRequis: 'Please choose at least one option.',
    trop_court: (n) => `A few more words please (${n} characters minimum).`,
    courriel: 'Please enter a valid email address.',
    telephone: 'Please enter a valid phone number, with the country code if outside Switzerland.',
    creneauRequis: 'Choose at least one slot, or tick “I am flexible”.',
    accord: 'Please accept so we can get back to you.',
    flexible: 'Flexible: call me whenever suits you',
    envoi: 'Sending...',
    envoyer: 'Send my project',
    echec: 'The message could not be sent. Please try again in a moment, or write to us directly.',
    sujet: (e) => `Custom software project: ${e}`,
    heureSuisse: (h) => `Times are Swiss time (Europe/Zurich), it is currently ${h} here.`,
    caracteres: (n) => `${n} characters`,
    libelles: { types: 'Project type', resume: 'In one sentence', description: 'Description', lien: 'Link', taille: 'Company size',
      secteur: 'Industry', budget: 'Budget', delai: 'Timeline', nom: 'Name', entreprise: 'Company', fonction: 'Role', courriel: 'Email',
      telephone: 'Phone', pays: 'Country', langue: 'Call language', creneaux: 'Call slots', message: 'Note' },
    mailtoOuvert: 'Your email app has opened with your project ready to send. Just press Send.',
  } : {
    jours: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    mois: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    matin: ['Matin', '9 h à 12 h'], apresMidi: ['Après-midi', '14 h à 17 h'],
    aucunCreneau: 'Aucun créneau choisi pour l’instant.',
    retirer: 'Retirer',
    limite: (n) => `${n} créneaux au maximum.`,
    requis: 'Merci de remplir ce champ.',
    choixRequis: 'Merci de choisir au moins une option.',
    trop_court: (n) => `Encore quelques mots, s’il vous plaît (${n} caractères au minimum).`,
    courriel: 'Merci d’indiquer une adresse e-mail valide.',
    telephone: 'Merci d’indiquer un numéro valide, avec l’indicatif du pays hors de Suisse.',
    creneauRequis: 'Choisissez au moins un créneau, ou cochez « Je suis flexible ».',
    accord: 'Merci d’accepter pour que nous puissions vous recontacter.',
    flexible: 'Flexible : appelez-moi quand cela vous convient',
    envoi: 'Envoi...',
    envoyer: 'Envoyer mon projet',
    echec: 'Le message n’a pas pu partir. Réessayez dans un instant, ou écrivez-nous directement.',
    sujet: (e) => `Projet sur mesure : ${e}`,
    heureSuisse: (h) => `Heures de Suisse (Europe/Zurich), il est actuellement ${h} chez nous.`,
    caracteres: (n) => `${n} caractères`,
    libelles: { types: 'Type de projet', resume: 'En une phrase', description: 'Description', lien: 'Lien', taille: 'Taille',
      secteur: 'Secteur', budget: 'Budget', delai: 'Délai', nom: 'Nom', entreprise: 'Entreprise', fonction: 'Fonction', courriel: 'E-mail',
      telephone: 'Téléphone', pays: 'Pays', langue: 'Langue de l’appel', creneaux: 'Créneaux d’appel', message: 'Remarque' },
    mailtoOuvert: 'Votre messagerie s’est ouverte avec votre projet prêt à partir : il ne reste qu’à cliquer sur Envoyer.',
  };

  const etapes = [...formulaire.querySelectorAll('.etape')];
  const reperes = [...document.querySelectorAll('.progression li')];
  const precedent = formulaire.querySelector('.precedent');
  const suivant = formulaire.querySelector('.suivant');
  const erreurEtape = formulaire.querySelector('.erreur-etape');
  const resultat = document.querySelector('.resultat');
  let courante = 0;
  let creneaux = [];          // [{ cle: '2026-11-09|matin', texte: 'lun. 9 nov., matin (9 h à 12 h)' }]

  // ----------------------------------------------------------- créneaux
  const grille = formulaire.querySelector('.jours');
  const liste = formulaire.querySelector('.choisis');
  const flexible = formulaire.querySelector('[name="flexible"]');

  const joursOuvres = () => {
    const out = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    while (out.length < JOURS_PROPOSES) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) out.push(new Date(d));          // pas d'appel le dimanche
    }
    return out;
  };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nomJour = (d) => `${T.jours[d.getDay()]} ${d.getDate()} ${T.mois[d.getMonth()]}`;

  const dessinerCreneaux = () => {
    if (!grille) return;
    grille.innerHTML = '';
    joursOuvres().forEach((d) => {
      const jour = document.createElement('div');
      jour.className = 'jour';
      jour.style.setProperty('--colonne', d.getDay());   // lundi = 1 ... samedi = 6 : chaque jour dans sa colonne
      jour.innerHTML = `<div class="date"><small>${T.jours[d.getDay()]}</small><b>${d.getDate()}</b><i>${T.mois[d.getMonth()]}</i></div>`;
      [['matin', T.matin], ['apres-midi', T.apresMidi]].forEach(([moment, [nom, heures]]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'creneau';
        b.dataset.cle = `${iso(d)}|${moment}`;
        b.dataset.texte = `${nomJour(d)}, ${nom.toLowerCase()} (${heures})`;
        b.setAttribute('aria-pressed', 'false');
        b.setAttribute('aria-label', b.dataset.texte);
        b.innerHTML = `${nom}<small>${heures}</small>`;
        b.addEventListener('click', () => basculer(b));
        jour.appendChild(b);
      });
      grille.appendChild(jour);
    });
    // Créneaux du brouillon encore à venir
    const valides = new Set([...grille.querySelectorAll('.creneau')].map((b) => b.dataset.cle));
    creneaux = creneaux.filter((c) => valides.has(c.cle));
    majCreneaux();
  };

  const basculer = (b) => {
    const i = creneaux.findIndex((c) => c.cle === b.dataset.cle);
    if (i >= 0) creneaux.splice(i, 1);
    else if (creneaux.length < MAX_CRENEAUX) creneaux.push({ cle: b.dataset.cle, texte: b.dataset.texte });
    if (creneaux.length && flexible) flexible.checked = false;
    majCreneaux();
    sauver();
  };

  const majCreneaux = () => {
    if (!grille) return;
    const choisis = new Set(creneaux.map((c) => c.cle));
    grille.querySelectorAll('.creneau').forEach((b) => {
      const on = choisis.has(b.dataset.cle);
      b.setAttribute('aria-pressed', String(on));
      b.disabled = !on && creneaux.length >= MAX_CRENEAUX;
    });
    liste.innerHTML = '';
    if (!creneaux.length) {
      liste.textContent = T.aucunCreneau;
      return;
    }
    creneaux.forEach((c) => {
      const p = document.createElement('span');
      p.className = 'pastille';
      p.textContent = c.texte;
      const x = document.createElement('button');
      x.type = 'button';
      x.textContent = '×';
      x.setAttribute('aria-label', `${T.retirer} : ${c.texte}`);
      x.addEventListener('click', () => { creneaux = creneaux.filter((k) => k.cle !== c.cle); majCreneaux(); sauver(); });
      p.appendChild(x);
      liste.appendChild(p);
    });
    if (creneaux.length >= MAX_CRENEAUX) {
      const n = document.createElement('span');
      n.textContent = T.limite(MAX_CRENEAUX);
      liste.appendChild(n);
    }
  };
  flexible?.addEventListener('change', () => { if (flexible.checked) { creneaux = []; majCreneaux(); } sauver(); });

  // Heure de Suisse, pour les visiteurs d'un autre fuseau
  const fuseau = formulaire.querySelector('.fuseau');
  if (fuseau) {
    try {
      const h = new Intl.DateTimeFormat(EN ? 'en-GB' : 'fr-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }).format(new Date());
      fuseau.textContent = T.heureSuisse(h);
    } catch (e) { /* fuseau inconnu du navigateur : le texte de la page reste */ }
  }

  // ---------------------------------------------------------- compteur
  const description = formulaire.querySelector('[name="description"]');
  const compteur = formulaire.querySelector('.compteur');
  const majCompteur = () => { if (compteur && description) compteur.textContent = T.caracteres(description.value.trim().length); };
  description?.addEventListener('input', majCompteur);

  // -------------------------------------------------------- validation
  const champDe = (el) => el.closest('.champ');
  const signaler = (el, message) => {
    const champ = champDe(el);
    if (!champ) return;
    champ.classList.toggle('invalide', Boolean(message));
    const zone = champ.querySelector('.erreur');
    if (zone) zone.textContent = message || '';
  };

  const valider = (etape) => {
    let premier = null;
    const noter = (el, message) => { signaler(el, message); if (message && !premier) premier = el; };

    etape.querySelectorAll('[data-groupe-requis]').forEach((groupe) => {
      const coche = groupe.querySelector('input:checked');
      noter(groupe.querySelector('input'), coche ? '' : T.choixRequis);
    });
    etape.querySelectorAll('input[required], textarea[required], select[required]').forEach((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') return;
      const v = el.value.trim();
      let m = '';
      if (!v) m = T.requis;
      else if (el.dataset.min && v.length < Number(el.dataset.min)) m = T.trop_court(el.dataset.min);
      else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = T.courriel;
      else if (el.type === 'tel' && (v.replace(/\D/g, '').length < 8 || /[^\d\s+().\/-]/.test(v))) m = T.telephone;
      noter(el, m);
    });
    if (etape.dataset.etape === '4' && grille) {
      const ok = creneaux.length > 0 || (flexible && flexible.checked);
      const zone = etape.querySelector('.erreur-creneaux');
      if (zone) zone.textContent = ok ? '' : T.creneauRequis;
      if (!ok && !premier) premier = grille.querySelector('.creneau');
    }
    const accord = etape.querySelector('[name="accord"]');
    if (accord) {
      const zone = etape.querySelector('.erreur-accord');
      if (zone) zone.textContent = accord.checked ? '' : T.accord;
      if (!accord.checked && !premier) premier = accord;
    }
    if (premier) premier.focus({ preventScroll: false });
    return !premier;
  };

  // Les erreurs s'effacent dès que l'on corrige
  formulaire.addEventListener('input', (e) => {
    const champ = champDe(e.target);
    if (champ && champ.classList.contains('invalide')) signaler(e.target, '');
    if (e.target.name === 'accord') { const z = formulaire.querySelector('.erreur-accord'); if (z) z.textContent = ''; }
    sauver();
  });
  formulaire.addEventListener('change', (e) => {
    const groupe = e.target.closest('[data-groupe-requis]');
    if (groupe) signaler(groupe.querySelector('input'), '');
    sauver();
  });

  // ------------------------------------------------------------ étapes
  const afficher = (n, focus = true) => {
    courante = Math.max(0, Math.min(n, etapes.length - 1));
    etapes.forEach((e, i) => e.classList.toggle('active', i === courante));
    reperes.forEach((r, i) => {
      r.classList.toggle('active', i === courante);
      r.classList.toggle('faite', i < courante);
      if (i === courante) r.setAttribute('aria-current', 'step'); else r.removeAttribute('aria-current');
    });
    precedent.classList.toggle('cache', courante === 0);
    suivant.querySelector('.libelle').textContent = courante === etapes.length - 1 ? T.envoyer : suivant.dataset.suivant;
    if (courante === etapes.length - 1) recapituler();
    if (focus) {
      const titre = etapes[courante].querySelector('legend');
      document.getElementById('projet')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      titre?.setAttribute('tabindex', '-1');
      setTimeout(() => titre?.focus({ preventScroll: true }), 350);
    }
    sauver();
  };

  precedent.addEventListener('click', () => afficher(courante - 1));
  suivant.addEventListener('click', () => {
    if (!valider(etapes[courante])) return;
    if (courante < etapes.length - 1) afficher(courante + 1);
    else envoyer();
  });
  formulaire.addEventListener('submit', (e) => { e.preventDefault(); suivant.click(); });
  // Entrée dans un champ d'une ligne : étape suivante (pas dans la zone de texte)
  formulaire.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') {
      e.preventDefault();
      suivant.click();
    }
  });

  // ----------------------------------------------------------- données
  const valeur = (nom) => {
    const els = [...formulaire.querySelectorAll(`[name="${nom}"]`)];
    if (!els.length) return '';
    if (els[0].type === 'checkbox' && els.length > 1) return els.filter((e) => e.checked).map((e) => e.value).join(', ');
    if (els[0].type === 'radio') return (els.find((e) => e.checked) || {}).value || '';
    if (els[0].type === 'checkbox') return els[0].checked ? els[0].value : '';
    return els[0].value.trim();
  };
  const donnees = () => {
    const L = T.libelles;
    const d = {};
    d[L.types] = valeur('types');
    d[L.resume] = valeur('resume');
    d[L.description] = valeur('description');
    if (valeur('lien')) d[L.lien] = valeur('lien');
    d[L.taille] = valeur('taille');
    if (valeur('secteur')) d[L.secteur] = valeur('secteur');
    d[L.budget] = valeur('budget');
    d[L.delai] = valeur('delai');
    d[L.nom] = valeur('nom');
    d[L.entreprise] = valeur('entreprise');
    if (valeur('fonction')) d[L.fonction] = valeur('fonction');
    d[L.courriel] = valeur('courriel');
    d[L.telephone] = valeur('telephone');
    d[L.pays] = valeur('pays');
    d[L.langue] = valeur('langue');
    d[L.creneaux] = creneaux.length ? creneaux.map((c) => c.texte).join('\n') : T.flexible;
    if (valeur('message')) d[L.message] = valeur('message');
    return d;
  };

  // Récapitulatif, avec un lien « Modifier » vers chaque étape
  const ETAPE_DE = { types: 0, resume: 0, description: 0, lien: 0, taille: 1, secteur: 1, budget: 1, delai: 1, nom: 2, entreprise: 2,
    fonction: 2, courriel: 2, telephone: 2, pays: 2, langue: 2, creneaux: 3, message: 3 };
  const recapituler = () => {
    const dl = formulaire.querySelector('.recap');
    if (!dl) return;
    dl.innerHTML = '';
    const L = T.libelles;
    const cles = Object.keys(L);
    const d = donnees();
    cles.forEach((cle) => {
      if (!(L[cle] in d)) return;
      const dt = document.createElement('dt');
      dt.textContent = L[cle];
      const dd = document.createElement('dd');
      dd.textContent = d[L[cle]];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'modifier';
      b.textContent = suivant.dataset.modifier;
      b.addEventListener('click', () => afficher(ETAPE_DE[cle]));
      dd.appendChild(b);
      dl.append(dt, dd);
    });
  };

  // ------------------------------------------------------------- envoi
  const envoyer = async () => {
    const d = donnees();
    const L = T.libelles;
    const sujet = T.sujet(d[L.entreprise] || d[L.nom]);
    if (formulaire.querySelector('[name="botcheck"]')?.checked) return;   // robot : rien n'est envoyé

    if (!CLE_WEB3FORMS) {
      const corps = Object.entries(d).map(([k, v]) => `${k} :\n${v}`).join('\n\n');
      window.location.href = `mailto:${ADRESSE}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
      terminer(T.mailtoOuvert);
      return;
    }
    suivant.disabled = true;
    suivant.querySelector('.libelle').textContent = T.envoi;
    try {
      const reponse = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CLE_WEB3FORMS, subject: sujet, from_name: 'Qyntiv · Sur mesure',
          replyto: d[L.courriel], botcheck: false, ...d,
        }),
      });
      const json = await reponse.json().catch(() => ({}));
      if (!reponse.ok || !json.success) throw new Error(json.message || reponse.status);
      terminer();
    } catch (e) {
      erreurEtape.textContent = T.echec;
      suivant.disabled = false;
      suivant.querySelector('.libelle').textContent = T.envoyer;
    }
  };

  const terminer = (texte) => {
    try { localStorage.removeItem(CLE_BROUILLON); } catch (e) { /* stockage indisponible */ }
    const prenom = valeur('nom').split(/\s+/)[0] || '';
    resultat.querySelectorAll('[data-prenom]').forEach((el) => { el.textContent = prenom; });
    if (texte) resultat.querySelector('.detail').textContent = texte;
    formulaire.hidden = true;
    document.querySelector('.progression').hidden = true;
    resultat.classList.add('visible');
    resultat.setAttribute('tabindex', '-1');
    resultat.focus();
    document.getElementById('projet')?.scrollIntoView({ block: 'start' });
  };

  // ---------------------------------------------------------- brouillon
  let restauration = false;
  const sauver = () => {
    if (restauration) return;
    const champs = {};
    formulaire.querySelectorAll('input, textarea, select').forEach((el) => {
      if (!el.name || el.name === 'botcheck' || el.name === 'accord') return;
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked) (champs[el.name] = champs[el.name] || []).push(el.value);
      } else champs[el.name] = el.value;
    });
    try { localStorage.setItem(CLE_BROUILLON, JSON.stringify({ champs, creneaux, etape: courante })); } catch (e) { /* stockage indisponible */ }
  };
  const restaurer = () => {
    let b = null;
    try { b = JSON.parse(localStorage.getItem(CLE_BROUILLON) || 'null'); } catch (e) { b = null; }
    if (!b || !b.champs) return 0;
    restauration = true;
    formulaire.querySelectorAll('input, textarea, select').forEach((el) => {
      if (!(el.name in b.champs)) return;
      const v = b.champs[el.name];
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = Array.isArray(v) && v.includes(el.value);
      else el.value = v;
    });
    creneaux = Array.isArray(b.creneaux) ? b.creneaux : [];
    restauration = false;
    return Math.min(Number(b.etape) || 0, etapes.length - 2);
  };

  // ---------------------------------------------------------- démarrage
  const depart = restaurer();
  dessinerCreneaux();
  majCompteur();
  afficher(depart, false);

  // Un lien « Proposer un projet » avec #projet-type=... pré-coche le type
  const pre = new URLSearchParams(location.hash.replace(/^#projet\??/, '')).get('type');
  if (pre) formulaire.querySelectorAll('[name="types"]').forEach((el) => { if (el.value === pre) el.checked = true; });
})();
