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

## Ajouter un logiciel

Copier un bloc `<article class="logiciel">` dans `index.html` et dans `en/index.html`, puis remplacer
le texte, les images (dans `assets/img/`) et les liens. Pour l'achat, toujours utiliser l'adresse courte
Gumroad `https://gumroad.com/l/<code>`, qui reste valable même si la boutique change de nom.

## Voir le site sur son PC

```
python -m http.server 8000
```
puis ouvrir http://127.0.0.1:8000
