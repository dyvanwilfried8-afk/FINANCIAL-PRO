# 💰 FINANCIAL-PRO

Suivez votre patrimoine en temps réel — actions, crypto, ETF, immobilier, épargne.
Inspiré de Finary. Hébergé sur GitHub Pages + Supabase.

---

## 🚀 Démarrage rapide

### 1. Créer le repo GitHub

```bash
# Cloner ou initialiser
git clone https://github.com/VOTRE_USER/financial-pro.git
cd financial-pro

# Ou copier ce dossier et initialiser
git init
git remote add origin https://github.com/VOTRE_USER/financial-pro.git
```

### 2. Configurer Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Copier l'URL et la clé anon depuis **Settings → API**
3. Dans **SQL Editor**, coller et exécuter le contenu de `supabase/migrations/001_initial.sql`
4. Dans **Authentication → Settings**, activer **Email Auth**

### 3. Variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` :
```
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Lancer en local

```bash
npm install
npm run dev
```

→ Ouvrir http://localhost:5173/financial-pro/

---

## 📦 Déploiement GitHub Pages (automatique)

### Ajouter les secrets GitHub

Dans votre repo GitHub → **Settings → Secrets and variables → Actions** :

| Secret | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anon Supabase |

### Activer GitHub Pages

1. **Settings → Pages → Source** → "GitHub Actions"
2. Modifier `vite.config.js` : changer `base` par le nom de votre repo

```js
base: '/VOTRE_REPO_NAME/',
```

3. Push sur `main` → le déploiement se lance automatiquement !

```bash
git add .
git commit -m "🚀 Initial deploy"
git push origin main
```

---

## 🗂️ Structure du projet

```
financial-pro/
├── src/
│   ├── pages/
│   │   ├── AuthPage.jsx          # Connexion / Inscription
│   │   ├── DashboardPage.jsx     # Tableau de bord principal
│   │   ├── AssetsPage.jsx        # Gestion des actifs
│   │   ├── SavingsPage.jsx       # Livrets d'épargne + taux
│   │   ├── ImportPage.jsx        # Import CSV / API
│   │   ├── ConnectPage.jsx       # Connexions API (Binance etc.)
│   │   ├── SettingsPage.jsx      # Compte + suppression
│   │   └── AppLayout.jsx         # Layout avec sidebar
│   ├── components/
│   │   ├── dashboard/            # Sidebar, StatCard
│   │   └── charts/               # PortfolioChart, AllocationChart
│   ├── hooks/
│   │   ├── useAuth.jsx           # Auth context
│   │   └── usePortfolio.js       # Données portfolio
│   └── lib/
│       ├── supabase.js           # Client Supabase
│       ├── savingsRates.js       # Taux livrets français
│       └── utils.js              # Formatters, constantes
├── supabase/
│   ├── migrations/001_initial.sql  # Schéma BDD
│   └── functions/update-rates/     # Edge Function taux
└── .github/workflows/deploy.yml    # CI/CD GitHub Pages
```

---

## 📊 Fonctionnalités

### Tableau de bord
- Valeur totale du patrimoine en temps réel
- Performance globale (€ et %)
- Graphique d'évolution : **1J / 7J / 1M / 3M / 6M / YTD / Tout**
- Répartition par type d'actif (donut)
- Liste de tous les actifs avec P&L

### Actifs
- Ajout/modification/suppression d'actifs
- Types : Actions, Crypto, ETF, Immobilier, Épargne, Autre
- Calcul automatique des plus-values

### Épargne — Livrets
- 15+ livrets français avec taux réels (Livret A, LEP, LDDS, Cashbee, Sumeria...)
- Simulation d'intérêts mensuelle et annuelle
- Mise à jour automatique des taux via Supabase Edge Functions
- Filtres par catégorie (réglementé / bancaire / fintech)

### Import de données
- **CSV** : glisser-déposer avec aperçu avant import
- **API Binance** : clé API lecture seule
- **Excel Online** : via Microsoft Graph
- **Google Sheets** : export CSV public
- Template CSV téléchargeable

### Compte
- Inscription/connexion par email
- Suppression du compte (avec confirmation)
- Export JSON des données

---

## 🔒 Sécurité

- Row Level Security (RLS) sur toutes les tables Supabase
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Clés API jamais stockées en clair (à chiffrer via Edge Function en prod)
- Variables d'environnement côté build, jamais dans le code

---

## 📈 Roadmap

- [ ] Connexion Trading 212 API
- [ ] Notifications performance (email / push)
- [ ] Import OFX/QIF
- [ ] Simulation retraite / objectifs
- [ ] Partage de tableau de bord (read-only)
- [ ] Application mobile (React Native)

---

## 🛠️ Stack

| Technologie | Usage |
|---|---|
| React 18 + Vite | Frontend SPA |
| Tailwind CSS | Styles |
| Recharts | Graphiques |
| Supabase | BDD + Auth + Edge Functions |
| GitHub Pages | Hébergement |
| GitHub Actions | CI/CD |

---

## 📝 Licence

MIT — Libre d'utilisation et de modification.
