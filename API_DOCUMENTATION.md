# Documentation de l'API — BCX Finance

**Version :** 1.0.0  
**Base URL (production) :** `https://bcx-finance.onrender.com/api`  
**Base URL (développement) :** `http://localhost:3001/api`  
**Format :** JSON (Content-Type: application/json)  
**Encoding :** UTF-8

---

## Table des matières

1. [Authentification](#1-authentification)
2. [Sécurité](#2-sécurité)
3. [Gestion des erreurs](#3-gestion-des-erreurs)
4. [Module Auth](#4-module-auth)
5. [Module Users](#5-module-users)
6. [Module Transactions](#6-module-transactions)
7. [Module Categories](#7-module-categories)
8. [Module Reports](#8-module-reports)
9. [Module Notifications](#9-module-notifications)
10. [Module Locations](#10-module-locations)
11. [Module Assistant](#11-module-assistant)
12. [Notes pour les tests de sécurité](#12-notes-pour-les-tests-de-sécurité)

---

## 1. Authentification

L'API utilise deux jetons JWT complémentaires :

| Jeton | Durée de vie | Transport |
|---|---|---|
| **Access token** | 15 minutes | Header HTTP `Authorization: Bearer <token>` |
| **Refresh token** | 7 jours | Cookie httpOnly `refreshToken` |

### Utilisation du token d'accès

Toutes les routes protégées nécessitent ce header :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Flux de rafraîchissement

Quand l'access token expire (401), le client appelle
`POST /auth/refresh` avec le cookie `refreshToken` pour obtenir
un nouvel access token sans redemander les identifiants.

---

## 2. Sécurité

### Mesures en place

| Mécanisme | Détail |
|---|---|
| Hachage des mots de passe | bcrypt, 12 rounds |
| JWT | Algorithme HS256, secrets distincts access/refresh |
| Cookies | `httpOnly`, `secure` (production), `sameSite: none` (cross-domain production) |
| Rate limiting global | 60 requêtes / minute / IP |
| Rate limiting par route | Voir chaque endpoint |
| Validation des entrées | `class-validator` strict : `whitelist: true`, `forbidNonWhitelisted: true` |
| En-têtes de sécurité | Helmet (X-Frame-Options, CSP, HSTS, etc.) |
| Compression | Gzip (compression) |
| CORS | Origines autorisées : `FRONTEND_URL` configuré + `*.vercel.app` + `localhost:*` |
| Isolation des données | Chaque ressource vérifie que `userId` correspond à l'utilisateur authentifié |
| Tokens de reset | SHA-256 (seul le hash est stocké, jamais le token en clair), usage unique, expiration 15 min |

### Payload JWT décodé

```json
{
  "sub": "uuid-de-l-utilisateur",
  "telephone": "+2250700000000",
  "iat": 1718000000,
  "exp": 1718000900
}
```

---

## 3. Gestion des erreurs

### Format standard d'erreur

```json
{
  "statusCode": 400,
  "message": ["nom must not be empty", "email must be an email"],
  "error": "Bad Request"
}
```

> **Note :** `message` peut être une chaîne unique ou un tableau de
> chaînes (validation `class-validator`). Les clients doivent gérer les
> deux cas.

### Codes HTTP utilisés

| Code | Signification |
|---|---|
| 200 | Succès |
| 201 | Ressource créée |
| 400 | Données invalides (validation DTO) |
| 401 | Non authentifié (token absent, expiré ou invalide) |
| 403 | Accès interdit (ressource appartenant à un autre utilisateur) |
| 404 | Ressource introuvable |
| 429 | Trop de requêtes (rate limit atteint) |
| 500 | Erreur interne serveur |

---

## 4. Module Auth

Routes d'inscription, connexion et gestion des mots de passe.
**Ces routes ne nécessitent pas de token JWT** (sauf `/auth/refresh`
qui utilise le cookie).

---

### `POST /auth/register`

Crée un nouveau compte utilisateur.

**Authentification requise :** Non  
**Rate limit :** Limite globale (60/min/IP)

#### Corps de la requête

```json
{
  "nom": "Aïcha Koné",
  "telephone": "+2250700000000",
  "email": "aicha@exemple.com",
  "entreprise": "Boutique Aïcha",
  "motDePasse": "motdepasse123",
  "ville": "Abidjan",
  "pays": "Côte d'Ivoire"
}
```

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| `nom` | string | Oui | Non vide |
| `telephone` | string | Oui | Non vide (format libre, ex: +225...) |
| `email` | string | Oui | Format email valide |
| `entreprise` | string | Oui | Non vide |
| `motDePasse` | string | Oui | Minimum 6 caractères |
| `ville` | string | Oui | Non vide |
| `pays` | string | Oui | Non vide |

#### Réponse — 201 Created

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "a7731dfa-b496-4b91-93d0-e593dd57fc5e"
}
```

Le `refreshToken` est positionné en cookie httpOnly `Set-Cookie`.

#### Erreurs possibles

| Code | Cause |
|---|---|
| 400 | Champ manquant, email invalide, mot de passe < 6 caractères |
| 409 | Téléphone ou email déjà utilisé |

---

### `POST /auth/login`

Authentifie un utilisateur existant.

**Authentification requise :** Non  
**Rate limit :** 5 requêtes / 15 minutes / IP

#### Corps de la requête

```json
{
  "telephone": "+2250700000000",
  "motDePasse": "motdepasse123"
}
```

| Champ | Type | Obligatoire |
|---|---|---|
| `telephone` | string | Oui |
| `motDePasse` | string | Oui |

#### Réponse — 200 OK

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "a7731dfa-b496-4b91-93d0-e593dd57fc5e"
}
```

#### Erreurs possibles

| Code | Cause |
|---|---|
| 400 | Champ manquant |
| 401 | Téléphone ou mot de passe incorrect |
| 429 | Trop de tentatives (brute-force) |

---

### `POST /auth/refresh`

Obtient un nouvel access token à partir du refresh token.

**Authentification requise :** Non (utilise le cookie `refreshToken`)  
**Rate limit :** Limite globale

Le refresh token est lu en priorité depuis le cookie httpOnly.
En alternative (ex: tests sans cookie), il peut être passé dans le corps.

#### Corps de la requête (optionnel si cookie présent)

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Réponse — 200 OK

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "a7731dfa-b496-4b91-93d0-e593dd57fc5e"
}
```

#### Erreurs possibles

| Code | Cause |
|---|---|
| 401 | Refresh token absent, invalide ou expiré |

---

### `POST /auth/forgot-password`

Déclenche l'envoi d'un lien de réinitialisation par email.

**Authentification requise :** Non  
**Rate limit :** 3 requêtes / 15 minutes / IP

> **Sécurité :** La réponse est **identique** que l'email existe ou non,
> afin d'éviter l'énumération de comptes (user enumeration).

#### Corps de la requête

```json
{
  "email": "aicha@exemple.com"
}
```

#### Réponse — 200 OK

```json
{
  "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
}
```

> **En développement (sans SMTP configuré) :** le lien de
> réinitialisation est affiché dans les logs du serveur au lieu d'être
> envoyé par email.

#### Erreurs possibles

| Code | Cause |
|---|---|
| 400 | Email invalide |
| 429 | Trop de demandes |

---

### `POST /auth/reset-password`

Réinitialise le mot de passe via le jeton reçu par email.

**Authentification requise :** Non  
**Rate limit :** 5 requêtes / 15 minutes / IP

> **Sécurité :** Le jeton est à **usage unique** (supprimé après
> utilisation) et expire après **15 minutes**. Seul son hash SHA-256
> est stocké en base de données.

#### Corps de la requête

```json
{
  "token": "8831549b667b4e3a88dd2f202c33efa2...",
  "motDePasse": "nouveauMotDePasse123"
}
```

| Champ | Type | Contraintes |
|---|---|---|
| `token` | string | Non vide |
| `motDePasse` | string | Minimum 6 caractères |

#### Réponse — 200 OK

```json
{
  "message": "Mot de passe réinitialisé avec succès."
}
```

#### Erreurs possibles

| Code | Cause |
|---|---|
| 400 | Token invalide, expiré ou déjà utilisé / mot de passe < 6 caractères |
| 429 | Trop de tentatives |

---

## 5. Module Users

### `GET /users/me`

Retourne le profil de l'utilisateur authentifié.

**Authentification requise :** Oui

#### Réponse — 200 OK

```json
{
  "id": "a7731dfa-b496-4b91-93d0-e593dd57fc5e",
  "nom": "Aïcha Koné",
  "telephone": "+2250700000000",
  "email": "aicha@exemple.com",
  "entreprise": "Boutique Aïcha",
  "ville": "Abidjan",
  "pays": "Côte d'Ivoire",
  "scoreBcx": 42,
  "createdAt": "2026-06-01T10:00:00.000Z"
}
```

---

### `GET /dashboard`

Retourne les données du tableau de bord : solde, statistiques du mois
et **Score BCX calculé en temps réel** (pas de valeur en cache).

**Authentification requise :** Oui

#### Réponse — 200 OK

```json
{
  "solde": 350000,
  "recettesMois": 500000,
  "depensesMois": 150000,
  "scoreBcx": 67,
  "dernieresTransactions": [
    {
      "id": "uuid",
      "type": "recette",
      "montant": 50000,
      "description": "Vente marché",
      "dateTransaction": "2026-06-15T08:00:00.000Z",
      "categorie": {
        "nom": "Vente",
        "emoji": "🛒"
      }
    }
  ]
}
```

---

## 6. Module Transactions

Toutes les routes nécessitent un token JWT valide.
Chaque opération est **isolée par utilisateur** : un utilisateur ne
peut pas accéder aux transactions d'un autre.

---

### `GET /transactions`

Liste paginée des transactions de l'utilisateur, avec filtres optionnels.

**Authentification requise :** Oui

#### Paramètres de requête (query params)

| Paramètre | Type | Obligatoire | Description |
|---|---|---|---|
| `page` | integer ≥ 1 | Non (défaut: 1) | Numéro de page |
| `limit` | integer 1–100 | Non (défaut: 20) | Transactions par page |
| `type` | `recette` \| `depense` | Non | Filtre par type |
| `mois` | integer 1–12 | Non | Filtre par mois |
| `annee` | integer ≥ 2000 | Non | Filtre par année |

#### Exemple de requête

```
GET /transactions?page=1&limit=20&type=recette&mois=6&annee=2026
```

#### Réponse — 200 OK

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "recette",
      "montant": 75000,
      "description": "Vente de tissus",
      "dateTransaction": "2026-06-10T09:30:00.000Z",
      "categorie": {
        "nom": "Vente",
        "emoji": "🛒"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### `POST /transactions`

Crée une nouvelle transaction.

**Authentification requise :** Oui

#### Corps de la requête

```json
{
  "type": "recette",
  "montant": 75000,
  "categorieId": "uuid-de-la-categorie",
  "description": "Vente de tissus au marché",
  "dateTransaction": "2026-06-10T09:30:00.000Z"
}
```

| Champ | Type | Obligatoire | Contraintes |
|---|---|---|---|
| `type` | `recette` \| `depense` | Oui | Valeur enum stricte |
| `montant` | number | Oui | Positif (> 0) |
| `categorieId` | UUID string | Non | UUID valide |
| `description` | string | Non | Texte libre |
| `dateTransaction` | string ISO 8601 | Oui | Format `YYYY-MM-DDTHH:mm:ss.sssZ` |

#### Réponse — 201 Created

```json
{
  "id": "uuid",
  "type": "recette",
  "montant": 75000,
  "description": "Vente de tissus au marché",
  "dateTransaction": "2026-06-10T09:30:00.000Z",
  "userId": "uuid",
  "categorieId": "uuid"
}
```

---

### `POST /transactions/sync`

Synchronise un lot de transactions créées hors-ligne (mode offline).

**Authentification requise :** Oui

#### Corps de la requête

```json
{
  "transactions": [
    {
      "type": "depense",
      "montant": 12000,
      "description": "Achat stock",
      "dateTransaction": "2026-06-09T14:00:00.000Z"
    },
    {
      "type": "recette",
      "montant": 30000,
      "dateTransaction": "2026-06-09T16:00:00.000Z"
    }
  ]
}
```

#### Réponse — 201 Created

```json
{
  "synchronisees": 2,
  "erreurs": 0
}
```

---

### `PATCH /transactions/:id`

Modifie une transaction existante. Seuls les champs fournis sont mis à jour
(PATCH partiel). Vérifie que la transaction appartient à l'utilisateur
authentifié.

**Authentification requise :** Oui

#### Paramètre d'URL

| Paramètre | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant de la transaction |

#### Corps de la requête (tous les champs sont optionnels)

```json
{
  "montant": 80000,
  "description": "Vente de tissus + livraison"
}
```

#### Réponse — 200 OK

L'objet transaction mis à jour (même format que POST).

#### Erreurs possibles

| Code | Cause |
|---|---|
| 403 | La transaction appartient à un autre utilisateur |
| 404 | Transaction introuvable |

---

### `DELETE /transactions/:id`

Supprime définitivement une transaction. Vérifie l'appartenance à
l'utilisateur authentifié.

**Authentification requise :** Oui

#### Paramètre d'URL

| Paramètre | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant de la transaction |

#### Réponse — 200 OK

```json
{
  "id": "uuid-supprime"
}
```

#### Erreurs possibles

| Code | Cause |
|---|---|
| 403 | La transaction appartient à un autre utilisateur |
| 404 | Transaction introuvable |

---

## 7. Module Categories

### `GET /categories`

Retourne toutes les catégories disponibles pour classer les transactions.

**Authentification requise :** Oui

#### Réponse — 200 OK

```json
[
  {
    "id": "uuid",
    "nom": "Vente",
    "emoji": "🛒",
    "type": "recette"
  },
  {
    "id": "uuid",
    "nom": "Loyer",
    "emoji": "🏠",
    "type": "depense"
  }
]
```

---

## 8. Module Reports

Les rapports sont **générés une fois par mois et mis en cache 24h**.
Un recalcul est déclenché automatiquement si une transaction du mois
est créée, modifiée ou supprimée.

---

### `GET /reports/:mois/:annee`

Génère ou retourne le rapport mensuel avec score détaillé et insights.

**Authentification requise :** Oui

#### Paramètres d'URL

| Paramètre | Type | Exemple |
|---|---|---|
| `mois` | integer 1–12 | `6` |
| `annee` | integer | `2026` |

#### Exemple de requête

```
GET /reports/6/2026
```

#### Réponse — 200 OK

```json
{
  "id": "uuid",
  "mois": 6,
  "annee": 2026,
  "totalRecettes": 500000,
  "totalDepenses": 150000,
  "soldeNet": 350000,
  "joursSaisie": 18,
  "scoreBcx": 67,
  "scoreDetails": {
    "regularite": 21.4,
    "soldePositif": 21.0,
    "stabiliteRevenus": 18.5,
    "anciennete": 6.1
  },
  "insights": [
    {
      "type": "score_hausse",
      "niveau": "bon",
      "message": "Votre score a progressé ce mois-ci."
    }
  ],
  "conseilIa": "Vous avez maintenu une régularité exemplaire ce mois...",
  "generatedAt": "2026-06-15T10:00:00.000Z"
}
```

---

### `GET /reports/:id/pdf`

Télécharge le rapport au format PDF.

**Authentification requise :** Oui

#### Paramètre d'URL

| Paramètre | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant du rapport (obtenu via GET /reports/:mois/:annee) |

#### Réponse — 200 OK

Fichier PDF (`Content-Type: application/pdf`, `Content-Disposition: attachment`).

#### Erreurs possibles

| Code | Cause |
|---|---|
| 403 | Le rapport appartient à un autre utilisateur |
| 404 | Rapport introuvable |

---

## 9. Module Notifications

Les notifications sont générées automatiquement lors de la création d'un
rapport mensuel (alertes basées sur des règles + conseil IA).

---

### `GET /notifications`

Retourne toutes les notifications de l'utilisateur (lues et non lues),
les plus récentes en premier.

**Authentification requise :** Oui

#### Réponse — 200 OK

```json
[
  {
    "id": "uuid",
    "type": "ia_conseil",
    "message": "Votre Score BCX est encore faible (3/100)...",
    "lu": false,
    "createdAt": "2026-06-15T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "type": "tresorerie_faible",
    "message": "Attention : votre trésorerie est en baisse ce mois-ci.",
    "lu": true,
    "createdAt": "2026-06-10T08:00:00.000Z"
  }
]
```

#### Types de notifications

| Type | Description |
|---|---|
| `ia_conseil` | Conseil personnalisé généré par l'IA (Claude) |
| `tresorerie_faible` | Alerte trésorerie faible |
| `depense_anormale` | Dépense anormalement élevée par rapport à la moyenne |
| `score_hausse` | Le Score BCX a progressé |
| `rappel_saisie` | Rappel de saisie des transactions |

---

### `PATCH /notifications/:id/read`

Marque une notification comme lue.

**Authentification requise :** Oui

#### Paramètre d'URL

| Paramètre | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant de la notification |

#### Réponse — 200 OK

```json
{
  "id": "uuid",
  "lu": true
}
```

---

### `DELETE /notifications/:id`

Supprime définitivement une notification. Vérifie l'appartenance à
l'utilisateur authentifié.

**Authentification requise :** Oui

#### Réponse — 200 OK

```json
{
  "id": "uuid-supprime"
}
```

#### Erreurs possibles

| Code | Cause |
|---|---|
| 403 | La notification appartient à un autre utilisateur |
| 404 | Notification introuvable |

---

## 10. Module Locations

Routes publiques (pas de token requis) pour alimenter les formulaires
d'inscription.

---

### `GET /locations/countries`

Retourne la liste des pays couverts par BCX Finance.

**Authentification requise :** Non

#### Réponse — 200 OK

```json
[
  {
    "code": "CI",
    "nom": "Côte d'Ivoire",
    "drapeau": "🇨🇮",
    "indicatif": "+225"
  },
  {
    "code": "SN",
    "nom": "Sénégal",
    "drapeau": "🇸🇳",
    "indicatif": "+221"
  }
]
```

---

### `GET /locations/countries/:code/cities`

Retourne les villes principales d'un pays couvert.

**Authentification requise :** Non

#### Paramètre d'URL

| Paramètre | Type | Exemple |
|---|---|---|
| `code` | string ISO 3166-1 alpha-2 | `CI` |

#### Réponse — 200 OK

```json
["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro", "Korhogo", "Daloa"]
```

---

## 11. Module Assistant

### `POST /assistant/ask`

Assistant conversationnel IA pour les visiteurs de la page d'accueil.
Répond aux questions sur BCX Finance.

**Authentification requise :** Non (route publique)  
**Rate limit :** 10 requêtes / 5 minutes / IP

#### Corps de la requête

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Comment fonctionne le Score BCX ?"
    }
  ]
}
```

| Champ | Type | Description |
|---|---|---|
| `messages` | array | Historique de la conversation (rôles `user` / `assistant`) |
| `messages[].role` | `user` \| `assistant` | Rôle du message |
| `messages[].content` | string | Contenu du message |

#### Réponse — 200 OK

```json
{
  "reponse": "Le Score BCX est un indicateur noté sur 100 points qui mesure..."
}
```

#### Erreurs possibles

| Code | Cause |
|---|---|
| 429 | Trop de questions (10/5min) |
| 500 | Service IA indisponible (ANTHROPIC_API_KEY non configurée) |

---

## 12. Notes pour les tests de sécurité

Cette section est destinée à orienter les tests de pénétration (pentest)
et d'audit de sécurité.

### Points d'attention

**Authentification et autorisation**
- Tester l'accès à une transaction/notification/rapport d'un autre
  utilisateur avec un token valide (IDOR — Insecure Direct Object Reference)
- Tester l'accès aux routes protégées sans token, avec un token expiré,
  avec un token signé par un secret différent, avec un token modifié
- Tester le refresh token : réutilisation après usage, token d'un autre
  utilisateur

**Rate limiting**
- Vérifier que `/auth/login` bloque après 5 tentatives / 15 min / IP
- Vérifier que `/auth/forgot-password` bloque après 3 tentatives / 15 min / IP
- Tester le bypass de rate limiting (rotation d'IP via headers X-Forwarded-For)

**Réinitialisation de mot de passe**
- Vérifier que le token est bien à usage unique (réutilisation doit échouer)
- Vérifier l'expiration à 15 minutes
- Vérifier que la réponse est identique pour un email existant et
  inexistant (anti-énumération)
- Vérifier que le hash du token en base ne permet pas de reconstruire
  le token original

**Validation des entrées**
- Tester l'injection SQL via les champs libres (Prisma utilise des
  requêtes paramétrées — attendu : aucun effet)
- Tester les payloads XSS dans les champs `description`, `nom`,
  `entreprise` (l'API renvoie du JSON, pas du HTML — attendu : texte
  brut retourné)
- Tester les champs non autorisés dans les DTOs (`forbidNonWhitelisted: true`
  doit retourner 400)
- Tester les valeurs hors limites : montant négatif, mois 13, page 0,
  limit 1000

**CORS**
- Vérifier qu'une origine non autorisée (ex: `https://evil.com`) reçoit
  une erreur CORS sur les routes protégées
- Vérifier que les origines `*.vercel.app` et `localhost:*` sont bien
  acceptées

**Cookies**
- Vérifier que le cookie `refreshToken` est `httpOnly` (inaccessible
  via JavaScript)
- Vérifier `Secure` et `SameSite=None` en production (HTTPS requis)

**En-têtes de sécurité (Helmet)**
- Vérifier la présence de : `X-Frame-Options`, `X-Content-Type-Options`,
  `Strict-Transport-Security`, `Content-Security-Policy`

### Environnement de test recommandé

| Paramètre | Valeur |
|---|---|
| Base URL prod | `https://bcx-finance.onrender.com/api` |
| Base URL dev | `http://localhost:3001/api` |
| Outil recommandé | Burp Suite, Postman, OWASP ZAP |
| Compte test | Créer via `POST /auth/register` |

### Ce qui est hors périmètre

- L'infrastructure Render/Neon (hors contrôle de l'application)
- Le service SMTP externe (si configuré)
- L'API Anthropic (service tiers)

---

*Documentation générée le 16/06/2026 — BCX Finance v1.0.0*
