# KronoScan UI Redesign — Dark Navy Glass

**Date:** 2026-04-04  
**Status:** Approved

---

## Overview

Redesign complète de l'interface KronoScan vers un style **dark navy glassmorphism** avec une animation de particules Antigravity (react-bits) en fond plein écran. Style minimaliste, épuré, professionnel — inspiré de Linear, Vercel, Raycast.

---

## 1. Palette & Design Tokens

### CSS Variables (`index.css`)

```css
--bg: #030712          /* fond global (quasi-noir) */
--navy: #0a0f1e        /* sidebar, surfaces solides */
--navy-2: #0f172a      /* cards, inputs */
--glass: rgba(15,23,42,0.7)   /* panels glassmorphism */
--border: rgba(255,255,255,0.07) /* bordures subtiles */
--accent: #3b82f6      /* CTAs, éléments actifs, accent principal */
--accent-hover: #2563eb /* hover sur accent */
--text: #f1f5f9        /* texte principal */
--muted: #64748b       /* texte secondaire */

/* Severity */
--crit: #ef4444
--high: #f97316
--med: #f59e0b
--low: #3b82f6
```

### Typographie

- **UI / Corps** : Inter (Google Fonts) — weights 400, 500, 600, 700
- **Code / Mono** : JetBrains Mono — weights 400, 500, 700
- Remplace Sora par Inter (plus neutre, plus lisible, standard industrie)

### Couleur Antigravity

`color="#3b82f6"` — bleu accent, cohérent avec la palette

---

## 2. Architecture Layout

```
┌─────────────────────────────────────────────────────────┐
│  Antigravity (position:fixed, full viewport, z-index:0) │
│                                                         │
│  ┌────────┬────────────────────────────────────────┐    │
│  │Sidebar │  Header (glass blur)                   │    │
│  │ 64px   │────────────────────────────────────────│    │
│  │navy    │  Content grid (2 colonnes)             │    │
│  │solid   │  ┌──────────────┬─────────────────┐   │    │
│  │        │  │ Code Panel   │ Findings Panel  │   │    │
│  │        │  │ (glass)      │ (glass)         │   │    │
│  │        │  │              ├─────────────────┤   │    │
│  │        │  │              │ Cost Panel      │   │    │
│  │        │  │              │ (glass)         │   │    │
│  └────────┴──┴──────────────┴─────────────────┘   │    │
└─────────────────────────────────────────────────────────┘
```

### Règles glassmorphism

Tous les panels flottants appliquent :
```css
background: var(--glass);           /* rgba(15,23,42,0.7) */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid var(--border);    /* rgba(255,255,255,0.07) */
border-radius: 12px;
```

---

## 3. Composants

### 3.1 Antigravity Background

- Installé via `npm install three @react-three/fiber`
- Rendu dans un `<div>` `position: fixed`, `inset: 0`, `z-index: 0`, `pointer-events: none`
- Props : `count={250}`, `color="#3b82f6"`, `particleShape="capsule"`, `autoAnimate`, `magnetRadius={8}`, `ringRadius={8}`, `particleSize={1.2}`, `waveSpeed={0.3}`, `fieldStrength={8}`
- Tout le reste de l'UI : `position: relative`, `z-index: 1`

### 3.2 Sidebar

- Fond : `#0a0f1e` (solide, pas glass — ancre visuelle)
- Largeur : `64px`, fixe
- Logo SVG en haut (garder l'existant, recolorer en `#3b82f6`)
- 4 icônes nav : Dashboard, Audits, Reports, Settings
  - Actif : fond `rgba(59,130,246,0.15)`, bordure `rgba(59,130,246,0.3)`, icône `#3b82f6`
  - Inactif : icône `#334155`, hover `#64748b`
- Wallet avatar en bas : gradient bleu

### 3.3 Header

- Height : `56px`
- Style : glass (`backdrop-filter: blur(20px)`, fond `rgba(10,15,30,0.8)`)
- Bordure basse : `1px solid rgba(255,255,255,0.06)`
- Éléments : Logo texte | Badge réseau | flex spacer | Badge World ID | Wallet / Connect btn | Dot live/demo
- Bouton Connect Wallet : fond `#3b82f6`, couleur blanche, `border-radius: 8px`, padding `6px 14px`
- Logo : `Krono` en `#3b82f6`, `Scan` en `#f1f5f9`

### 3.4 Code Panel (gauche)

- Glass panel, `border-radius: 12px`
- Hero banner interne : fond `rgba(59,130,246,0.12)`, bordure `rgba(59,130,246,0.2)`, texte blanc
- Tabs Source/Address : pill actif fond `rgba(59,130,246,0.15)`, texte `#3b82f6`
- Textarea code : fond `rgba(15,23,42,0.5)`, monospace, texte `#e2e8f0`, caret bleu
- Bouton Run Audit : fond `#3b82f6` solid, blanc, `border-radius: 8px`, full width, `font-weight: 600`
  - Hover : `#2563eb`
  - Active (scanning) : outline pulsant bleu

### 3.5 Findings Panel (droite, haut)

- Glass panel
- Header : titre "Security Findings" + compteurs de sévérité (pills colorés)
- Liste scrollable, custom scrollbar fin (`#1e293b`)
- Cartes findings :
  - Fond : `rgba(15,23,42,0.5)`
  - Bordure gauche 3px colorée par sévérité
  - Badge sévérité : pill monospace, fond teinté, texte coloré
  - Animation entrée : `findingIn` (existante, garder)
- Empty state : icône scan stylisée, texte muted

### 3.6 Cost Panel (droite, bas)

- Glass panel compact
- Barre de progression : fond `rgba(255,255,255,0.06)`, fill gradient bleu
- Stats : coût consommé, temps restant, nb auths
- Nano-tx feed : liste compacte, animation `txIn`, mono font, texte muted
- Custom scrollbar fin

---

## 4. Installation requise

```bash
npm install three @react-three/fiber
```

Nouveau composant : `frontend/src/components/Antigravity.tsx` (code fourni dans le ticket).

---

## 5. Fichiers modifiés

| Fichier | Changement |
|---|---|
| `frontend/src/index.css` | Nouvelle palette, tokens, polices (Inter), animations inchangées |
| `frontend/src/App.tsx` | Nouveau layout glass, Antigravity en fond, tous les styles inline mis à jour |
| `frontend/src/components/Antigravity.tsx` | Nouveau fichier — composant particle background |
| `frontend/index.html` | Import Google Fonts Inter |
| `frontend/package.json` | Ajout `three`, `@react-three/fiber` |

---

## 6. Non-scope

- Logique métier inchangée (hooks, types, coordinator, démo mode)
- Pas de nouvelles pages ou routes
- Pas de refactoring des hooks
