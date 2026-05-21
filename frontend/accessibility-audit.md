# Accessibility Audit — JobSearch

**Date :** 21 mai 2026  
**Outil :** Google Lighthouse (Chrome DevTools)  
**Standard visé :** WCAG 2.1 niveau AA

---

## Scores Lighthouse par page

| Page | URL | Performance | Accessibility | Best Practices | SEO |
|------|-----|-------------|---------------|----------------|-----|
| Login | `/login` | 98 | **96** | 100 | 100 |
| Explorer | `/explorer` | 80 | **96** | 100 | 100 |
| Profil | `/profil` | 100 | **95** | 100 | 100 |

**Score d'accessibilité moyen : 95.7 / 100**

---

## Améliorations WCAG implémentées

### 1. Skip Link (WCAG 2.4.1 — Bypass Blocks)
- Ajout d'un lien "Aller au contenu principal" en haut de la Navbar
- Visible uniquement au focus clavier (`:focus { top: 0 }`)
- Cible `id="main-content"` avec `tabIndex="-1"` sur chaque `<main>`
- Focus déplacé programmatiquement via `onClick` + `element.focus()`

### 2. Langue de la page (WCAG 3.1.1 — Language of Page)
- `lang="fr"` présent sur la balise `<html>` dans `layout.jsx`
- Permet aux lecteurs d'écran de prononcer correctement le contenu

### 3. Messages d'erreur accessibles (WCAG 4.1.3 — Status Messages)
- `role="alert"` sur les divs d'erreur des formulaires
- Annonce automatique par les lecteurs d'écran sans déplacement de focus

### 4. Liaison erreurs/inputs (WCAG 1.3.1 — Info and Relationships)
- `aria-describedby="login-error"` sur les inputs email et password
- `id="login-error"` sur le div d'erreur
- Le lecteur d'écran lit l'erreur associée quand l'input est focusé

### 5. Focus visible (WCAG 2.4.7 — Focus Visible)
- Contour violet (`var(--color-primary)`) sur tous les éléments interactifs via `:focus-visible`
- Focus visible sur les inputs, boutons, liens et éléments de navigation
- `outline: none` retiré des inputs, remplacé par un style explicite

### 6. Formulaires (WCAG 1.3.1 — Info and Relationships)
- `htmlFor` sur tous les `<label>` liés aux `<input>`
- `aria-required="true"` sur les champs obligatoires
- `autoComplete` sur les champs email et mot de passe

### 7. Navigation (WCAG 4.1.2 — Name, Role, Value)
- `role="navigation"` et `aria-label="Navigation principale"` sur la `<nav>`
- `aria-label` sur les boutons icônes (thème, menu mobile)

---

## Résultats des audits Lighthouse — Accessibility

### Page Login (`/login`) — Score : 96
- 20 audits passés
- Avertissements performance : Render blocking requests, Legacy JavaScript (hors scope accessibilité)

### Page Explorer (`/explorer`) — Score : 96
- 18 audits passés
- Avertissements performance : Render blocking requests, Layout shift, Legacy JavaScript (hors scope accessibilité)

### Page Profil (`/profil`) — Score : 95
- Tous les critères d'accessibilité principaux validés

---

## Conclusion

Le projet respecte les principaux critères WCAG 2.1 niveau AA avec un score Lighthouse moyen de **95.7/100** en accessibilité. Les éléments fondamentaux sont en place : navigation clavier, skip link, labels de formulaire, annonces d'erreur, focus visible et langue de page. Les avertissements restants concernent uniquement la performance (JavaScript non minifié, images) et n'impactent pas l'accessibilité .