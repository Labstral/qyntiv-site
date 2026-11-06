# qyntiv.com

Site de Qyntiv, la marque mère des logiciels d'Emmanuel Percheron (neoSlice, Ordalis, et les suivants).
Chaque logiciel a son propre site ; celui-ci les présente tous.

Site statique (HTML et CSS, un petit script d'animation), publié par GitHub Pages. Aucun cookie, aucune mesure
d'audience, aucune ressource externe : polices (Cormorant et Inter, licence OFL) et images hébergées ici.

## Pages

* `index.html` : accueil en français ; `en/index.html` : accueil en anglais
* `ordalis/` : page d'Ordalis, en attendant son propre site ; `ordalis/version.json` : fichier lu par Ordalis
  pour savoir si une mise à jour existe (changer `version` et `url` à chaque nouvelle version)
* `mentions-legales/` et `en/legal-notice/` : mentions légales et protection des données
* `404.html` : page d'erreur
* `sur-mesure/` et `en/custom/` : offre de logiciels sur mesure et formulaire de projet (`assets/js/projet.js`).
  Les demandes partent par Web3Forms (clé dans `projet.js`) et arrivent sur qyntiv@gmail.com.

## Après une modification du style ou des scripts

Changer le numéro `?v=AAAAMMJJ` des liens vers `site.css`, `site.js` et `projet.js` dans toutes les pages :
sinon les navigateurs des visiteurs gardent l'ancienne version et la page s'affiche de travers.

## Ajouter un logiciel

Copier un bloc `<article class="oeuvre">` dans `index.html` et dans `en/index.html`, puis remplacer
le texte, les images (dans `assets/img/`) et les liens. Pour l'achat, toujours utiliser l'adresse courte
Gumroad `https://gumroad.com/l/<code>`, qui reste valable même si la boutique change de nom.

## Voir le site sur son PC

```
python -m http.server 8000
```
puis ouvrir http://127.0.0.1:8000
