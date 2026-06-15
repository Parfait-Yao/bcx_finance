# BCX Finance

## Introduction

BCX Finance est une application web destinée aux petites et moyennes
entreprises (PME) africaines pour suivre leur activité financière au
quotidien : recettes, dépenses, solde, et un indicateur de crédibilité
financière propre à l'application, le **Score BCX** (noté sur 100).

## Le but du projet

De nombreuses PME informelles n'ont pas d'historique financier
exploitable par les banques ou organismes de microfinance pour évaluer
leur fiabilité. BCX Finance permet à un commerçant de saisir
quotidiennement ses recettes et dépenses, et calcule automatiquement un
**Score BCX** qui reflète sa régularité de gestion, sa rentabilité et la
stabilité de ses revenus. Ce score, accompagné d'un rapport mensuel
détaillé (PDF), peut servir de justificatif auprès d'un partenaire
financier.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript |
| Base de données | PostgreSQL 16 + Prisma ORM |
| Authentification | JWT (access + refresh token), bcrypt |
| PDF | Puppeteer |
| Gestionnaire de paquets | pnpm |

## Structure du projet

```
bcx/
├── backend/   → API NestJS + Prisma + PostgreSQL
└── frontend/  → Next.js (App Router) + Tailwind CSS
```

---

## Fonctionnalités

### Authentification et compte
- Inscription avec sélection du pays parmi 250 pays (recherche, drapeau,
  indicatif téléphonique automatique), sélection de la ville selon le pays
  choisi, numéro de téléphone avec indicatif pré-rempli
- Connexion par téléphone + mot de passe
- Affichage/masquage du mot de passe à la saisie (icône œil)
- Récupération de mot de passe par email : lien sécurisé à usage unique,
  valable 15 minutes (jeton aléatoire de 256 bits, seul son hash est
  stocké en base)
- Jetons JWT : access token (15 min) + refresh token (7 jours, cookie
  httpOnly), rafraîchissement automatique côté frontend

### Tableau de bord
- Solde, recettes et dépenses du mois en cours
- **Score BCX** calculé en temps réel (sans attendre la génération d'un
  rapport), avec jauge visuelle
- 5 dernières transactions
- Aperçu des alertes/notifications non lues, avec possibilité de les
  fermer individuellement (croix)
- Mise à jour automatique sans rechargement manuel (rafraîchissement
  périodique + au retour sur l'onglet)

### Transactions (recettes / dépenses)
- Ajout d'une transaction : type (recette/dépense), montant, catégorie
  (pastilles avec emoji), date, description optionnelle
- Historique paginé avec onglets de filtrage (Toutes / Recettes /
  Dépenses)
- Modification et suppression d'une transaction existante (modale dédiée)
- **Mode hors-ligne** : une transaction créée sans connexion est stockée
  localement (`localStorage`) puis synchronisée automatiquement au retour
  de connexion (`POST /transactions/sync`). Un Service Worker met en cache
  le tableau de bord pour consultation hors-ligne.

### Rapports mensuels
- Génération (avec cache 24h) d'un rapport par mois : total recettes,
  dépenses, solde net, Score BCX détaillé par critère, jours de saisie
- Insights automatiques (alertes "bon / attention / critique") basés sur
  des règles : trésorerie faible, dépense anormale par rapport à la
  moyenne, hausse du score, rappel de saisie
- Conseil personnalisé généré par IA (Claude) sur l'évolution du score et
  la situation du mois — avec message de repli si l'IA n'est pas
  configurée
- Export PDF du rapport (mise en page conforme à un document financier)

### Notifications
- Liste des notifications (alertes, conseils IA)
- Marquage comme lue au clic
- Suppression individuelle (croix) sur chaque notification, y compris
  dans l'aperçu du tableau de bord

### Page d'accueil (landing page)
- Présentation du produit, services, tarifs, témoignages
- Carte interactive de l'Afrique indiquant les pays couverts par BCX
  Finance
- Assistant conversationnel (IA) pour répondre aux questions des visiteurs

---

## Backend (NestJS) — modules et endpoints

Toutes les routes sont préfixées par `/api`. Sauf indication contraire,
chaque route nécessite un access token JWT valide (`Authorization: Bearer
<token>`).

### `auth` — inscription, connexion, mots de passe

| Méthode | Route | Description | Limite |
|---|---|---|---|
| POST | `/auth/register` | Crée un compte (nom, téléphone, email, entreprise, mot de passe, ville, pays) | — |
| POST | `/auth/login` | Connexion par téléphone + mot de passe | 5 / 15 min |
| POST | `/auth/refresh` | Rafraîchit l'access token via le refresh token (cookie httpOnly) | — |
| POST | `/auth/forgot-password` | Envoie un lien de réinitialisation par email (réponse générique, anti-énumération) | 3 / 15 min |
| POST | `/auth/reset-password` | Réinitialise le mot de passe via le jeton reçu par email (usage unique, 15 min) | 5 / 15 min |

### `users` — profil et tableau de bord

| Méthode | Route | Description |
|---|---|---|
| GET | `/users/me` | Profil de l'utilisateur connecté |
| GET | `/dashboard` | Solde, recettes/dépenses du mois, **Score BCX calculé en temps réel**, 5 dernières transactions |

### `transactions` — recettes et dépenses

| Méthode | Route | Description |
|---|---|---|
| GET | `/transactions` | Liste paginée (`page`, `limit`), filtrable par `type` (recette/depense), `mois`, `annee` |
| POST | `/transactions` | Crée une transaction |
| POST | `/transactions/sync` | Synchronise un lot de transactions créées hors-ligne |
| PATCH | `/transactions/:id` | Modifie une transaction existante (propriétaire uniquement) |
| DELETE | `/transactions/:id` | Supprime une transaction (propriétaire uniquement) |

### `categories`

| Méthode | Route | Description |
|---|---|---|
| GET | `/categories` | Liste des catégories disponibles (recette/dépense, nom, emoji) |

### `reports` — rapports mensuels et PDF

| Méthode | Route | Description |
|---|---|---|
| GET | `/reports/:mois/:annee` | Génère ou retourne (cache 24h) le rapport du mois (score détaillé, insights) |
| GET | `/reports/:id/pdf` | Télécharge le rapport au format PDF |

### `notifications`

| Méthode | Route | Description |
|---|---|---|
| GET | `/notifications` | Liste des notifications (alertes, conseils IA) de l'utilisateur |
| PATCH | `/notifications/:id/read` | Marque une notification comme lue |
| DELETE | `/notifications/:id` | Supprime définitivement une notification |

### `locations`

| Méthode | Route | Description |
|---|---|---|
| GET | `/locations/countries` | Liste des pays couverts par BCX Finance (code, nom, drapeau, indicatif) |
| GET | `/locations/countries/:code/cities` | Villes principales d'un pays couvert |

### `assistant` — assistant IA public (landing page)

| Méthode | Route | Description | Limite |
|---|---|---|---|
| POST | `/assistant/ask` | Répond aux questions des visiteurs sur BCX Finance | 10 / 5 min |

---

## Logique métier backend

### Score BCX (`scoring/scoring.service.ts`)

Calculé sur 100 points, selon 4 critères :

| Critère | Points | Calcul |
|---|---|---|
| Régularité des saisies | 30 | (jours du mois avec au moins une transaction) / (jours du mois) × 30 |
| Solde positif | 30 | Si solde net > 0 : (solde net / recettes totales, plafonné à 1) × 30, sinon 0 |
| Stabilité des revenus | 25 | Basé sur le coefficient de variation des recettes des 3 derniers mois. 0 si aucun historique, 12,5 (neutre) si un seul mois de données, sinon calcul complet |
| Ancienneté du compte | 15 | (mois écoulés depuis la création, plafonné à 6) / 6 × 15 |

Le score est recalculé **en temps réel** à chaque appel à `/dashboard`
(pas de valeur figée en base), et également enregistré lors de la
génération d'un rapport mensuel.

Testé indépendamment dans `scoring.service.spec.ts`
(`pnpm test` depuis `backend/`).

### Rapports et alertes (`reports/`)

- `reports.service.ts` : agrège les transactions du mois, calcule le
  score, et met en cache le rapport 24h (recalcul forcé si une
  transaction du mois est créée/modifiée/supprimée, via un événement
  `TRANSACTION_CHANGED_EVENT`)
- `insights.service.ts` : génère des alertes basées sur des règles
  (trésorerie faible, dépense anormale, hausse du score, rappel de saisie)
- `ai-advice.service.ts` : génère un conseil personnalisé via l'API
  Anthropic (Claude). Si `ANTHROPIC_API_KEY` n'est pas définie ou que
  l'appel échoue, un message de repli basé sur des règles simples est
  utilisé
- `pdf.service.ts` : génère le PDF du rapport avec Puppeteer

### Email (`mail/mail.service.ts`)

Utilisé pour la réinitialisation de mot de passe. Si `SMTP_HOST` est
configuré, l'email est envoyé via ce serveur SMTP. Sinon, le lien de
réinitialisation est simplement écrit dans les logs du serveur — utile en
développement sans configuration SMTP.

---

## Sécurité

- Mots de passe hashés avec bcrypt (12 rounds)
- JWT access token (15 min) + refresh token (7 jours, cookie httpOnly,
  `secure` en production)
- Jetons de réinitialisation de mot de passe : aléatoires (256 bits),
  seul leur hash SHA-256 est stocké en base, valables 15 minutes, à usage
  unique, réponse générique côté API (n'indique jamais si un email existe)
- Rate limiting : connexion (5/15min), récupération de mot de passe
  (3/15min), réinitialisation (5/15min), assistant IA public (10/5min),
  limite globale par défaut (60 requêtes/minute/IP)
- Validation stricte de tous les DTOs entrants (`class-validator`,
  `whitelist`, `forbidNonWhitelisted`)
- Helmet (en-têtes HTTP de sécurité), CORS restreint au frontend
  configuré (+ tout `localhost`/`127.0.0.1` en développement),
  compression Gzip
- Isolation stricte des données : chaque accès à une ressource
  (transaction, notification, rapport) vérifie que `userId` correspond à
  l'utilisateur authentifié

---

## Frontend (Next.js) — pages et composants

### Pages (`src/app/`)

| Route | Description |
|---|---|
| `/` | Landing page (présentation, services, tarifs, carte Afrique, assistant IA) |
| `/login` | Connexion (téléphone + mot de passe, lien "mot de passe oublié") |
| `/register` | Inscription (pays, téléphone avec indicatif, ville, mot de passe) |
| `/forgot-password` | Demande de réinitialisation de mot de passe (email) |
| `/reset-password?token=...` | Choix d'un nouveau mot de passe via le lien reçu par email |
| `/dashboard` | Tableau de bord : score, solde, recettes/dépenses, alertes, dernières transactions |
| `/transactions` | Historique paginé avec onglets (Toutes/Recettes/Dépenses), édition/suppression |
| `/transactions/new` | Formulaire d'ajout d'une recette ou dépense |
| `/reports` | Rapport mensuel détaillé + export PDF |
| `/notifications` | Liste des notifications avec suppression individuelle |

### Composants clés (`src/components/`)

- `NavBar.tsx` : navigation principale (desktop + mobile)
- `ScoreGauge.tsx` : jauge visuelle du Score BCX
- `MetricCard.tsx` : carte d'indicateur (recettes, dépenses, solde)
- `EvolutionChart.tsx` : graphique d'évolution
- `AlertsPreview.tsx` : aperçu des alertes non lues (avec suppression)
- `EditTransactionModal.tsx` : modale de modification/suppression d'une
  transaction
- `OfflineBanner.tsx` / `ServiceWorkerRegister.tsx` : gestion du mode
  hors-ligne
- `auth/CountrySelect.tsx`, `auth/CitySelect.tsx`, `auth/PhoneInput.tsx`,
  `auth/PasswordInput.tsx`, `auth/FlagIcon.tsx`, `auth/AuthVisual.tsx` :
  champs du formulaire d'inscription/connexion
- `landing/*` : sections de la page d'accueil (Hero, Services, Pricing,
  Témoignages, Carte Afrique, Assistant IA, Contact, etc.)

### Bibliothèque partagée (`src/lib/`)

- `api.ts` : client Axios centralisé (injection du token, rafraîchissement
  automatique sur 401)
- `types.ts` : types TypeScript partagés (Transaction, Dashboard, Report,
  NotificationItem, ...)
- `format.ts` : formatage des montants (**"F CFA" avec séparateur de
  milliers**) et des dates
- `countries.ts` : liste des 250 pays (noms français, drapeaux,
  indicatifs téléphoniques) via le package `world-countries`
- `offline.ts` : gestion des transactions créées hors-ligne
  (`localStorage`) et synchronisation
- `usePolling.ts` : rafraîchissement automatique des données (intervalle +
  retour sur l'onglet)

---

## Installation et lancement en local

### Prérequis

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 16 installé et démarré localement

### 1. Base de données PostgreSQL

```bash
psql -U postgres -c "CREATE DATABASE bcx_finance;"
```

### 2. Backend (NestJS)

```bash
cd backend
cp .env.example .env   # puis adaptez DATABASE_URL et les secrets JWT
pnpm install

# Génère le client Prisma et applique les migrations
pnpm prisma:generate
pnpm prisma:migrate

# Seed des catégories par défaut (Vente, Prestation, Stock, Loyer, ...)
pnpm prisma:seed

# Démarrage en mode développement (http://localhost:3001/api)
pnpm start:dev
```

Lancer les tests unitaires (notamment le calcul du Score BCX) :

```bash
pnpm test
```

### 3. Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001/api
pnpm install

# Démarrage en mode développement (http://localhost:3000)
pnpm dev
```

### 4. Première utilisation

1. Ouvrez http://localhost:3000
2. Créez un compte via `/register` (choisissez votre pays : le drapeau,
   l'indicatif téléphonique et la liste de villes s'adaptent
   automatiquement)
3. Connectez-vous via `/login`
4. Ajoutez vos recettes/dépenses via `/transactions/new`
5. Consultez votre Score BCX et vos statistiques sur `/dashboard`
6. Générez votre rapport mensuel et téléchargez-le en PDF via `/reports`

---

## Déploiement

> Le projet n'est pas encore déployé. Les liens ci-dessous seront complétés
> après la mise en ligne.

| Service | Plateforme | URL |
|---|---|---|
| Frontend (Next.js) | Vercel | _à compléter_ |
| Backend (API NestJS) | Railway | _à compléter_ |
| Base de données | PostgreSQL (Neon / Railway) | _à compléter_ |

### Variables d'environnement à configurer en production

**Backend** (`backend/.env.example`) :
- `DATABASE_URL` : URL de connexion PostgreSQL fournie par l'hébergeur de
  la base de données
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` : chaînes aléatoires longues,
  différentes de celles de développement
- `FRONTEND_URL` : URL publique du frontend (Vercel)
- `NODE_ENV=production`
- `ANTHROPIC_API_KEY` (optionnel) : pour les conseils IA personnalisés
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`
  (optionnel) : pour l'envoi réel des emails de réinitialisation de mot de
  passe

**Frontend** (`frontend/.env.example`) :
- `NEXT_PUBLIC_API_URL` : URL publique de l'API backend (Railway),
  terminée par `/api`

### À vérifier avant la mise en ligne

- Appliquer les migrations Prisma sur la base de production :
  `pnpm exec prisma migrate deploy`
- **Commande de démarrage** : `nest build` compile vers `dist/src/main.js`
  (et non `dist/main.js`, car `sourceRoot` est `src`). Sur Render/Railway,
  la commande de démarrage doit donc être :
  ```
  node dist/src/main.js
  ```
- Mettre à jour `FRONTEND_URL` côté backend avec l'URL Vercel exacte
- Les rapports PDF sont générés sur le système de fichiers du backend
  (`backend/storage/reports`) : sur un hébergeur avec système de fichiers
  éphémère, prévoir un stockage externe (ex: S3) pour la persistance
