# ⚡ SubVault — Plateforme E-Commerce de Comptes & Abonnements Digitaux

Plateforme e-commerce professionnelle Next.js 16 pour la vente de **comptes digitaux, licences et abonnements premium** avec **livraison automatisée instantanée** (en Dinar Algérien - DA).

---

## 🚀 Accès & Démonstration en Direct

La plateforme est en ligne sur votre serveur local :
**[http://localhost:3000](http://localhost:3000)**

### 🔐 Identifiants Super-Admin :
| Rôle | Email | Mot de passe | Privilèges |
| :--- | :--- | :--- | :--- |
| **Super-Admin** | `gacemfouzi1@gmail.com` | `Evetgac3214.` | Gestion intégrale du coffre d'inventaire, injection de comptes en masse, suivi des abonnements clients, rapports financiers |

> *Astuce : Vous pouvez utiliser le bouton de remplissage automatique **Super Admin** directement sur la [Page de Connexion](http://localhost:3000/login).*

---

## 📦 Catalogue de Produits Actifs (Prix en DA)

| Produit | Formule / Durée | Prix | Catégorie | Stock Vault |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini Pro (18 Months)** | Main + 5 membres | **3 450 DA** | AI & Developer | Disponible (Livraison Instantanée) |
| **Google Gemini Pro (18 Months)** | Family Slot | **1 000 DA** | AI & Developer | Disponible (Livraison Instantanée) |
| **Canva Edu Invite (2 years)** | 2 Years | **3 500 DA** | Design & Video | Disponible (Livraison Instantanée) |
| **CapCut Pro 30 Days (Full Warranty)** | 30 Days | **4 000 DA** | Design & Video | Disponible (Livraison Instantanée) |
| **Spotify Premium (3 Months)** | 3 Months | **1 200 DA** | Streaming | Disponible (Livraison Instantanée) |
| **Microsoft 365 (12 Months)** | 12 Months | **4 000 DA** | Productivity | Disponible (Livraison Instantanée) |
| **Duolingo (1 Year)** | 1 Year | **1 500 DA** | Education & Learning | Disponible (Livraison Instantanée) |
| **Apple Music (5 Months)** | 5 Months | **4 000 DA** | Streaming | Disponible (Livraison Instantanée) |
| **Notion Plus (12 Months)** | 12 Months | **2 500 DA** | Productivity | Disponible (Livraison Instantanée) |
| **Autodesk 12 months** | 12 Months | **1 200 DA** | Productivity | Disponible (Livraison Instantanée) |
| **Figma Pro Education 1 Year** | 1 Year | **3 500 DA** | Design & Video | Disponible (Livraison Instantanée) |

---

## 🛠️ Fonctionnalités Opérationnelles

1. **Vitrine & Catalogue Storefront (`/`)** :
   - Interface Dark-Mode moderne et épurée.
   - Filtrage par catégories (AI & Developer, Design & Video, Streaming, Productivity, Education & Learning).
   - Sélecteurs de formules dynamiques avec prix en DA et badges d'économie.
   - Compteur de stock temps réel connecté au coffre d'inventaire.

2. **Panier & Passerelle de Commande (`/checkout`)** :
   - Panier latéral avec calculs en DA et support des codes promo (`SAVE20`).
   - Simulateur de paiement sécurisé (Carte bancaire, Apple Pay, Crypto USDT).

3. **Livraison Automatique Instantanée (`/order-success/[orderId]`)** :
   - Déblocage immédiat sur l'écran des identifiants (Email, Mot de passe avec bouton œil, codes d'invitation/PIN).
   - Boutons de copie en 1 clic.

4. **Espace Client / Dashboard Abonnements (`/dashboard`)** :
   - Suivi des abonnements actifs avec barre de progression de la date d'expiration.
   - Coffre-fort numérique personnel (My Vault) avec tous les identifiants débloqués.
   - Historique des transactions et factures.

5. **Panneau d'Administration Super-Admin (`/admin`)** :
   - Vue d'ensemble du chiffre d'affaires en DA.
   - **Outil d'importation en masse** de comptes (`email:motdepasse:notes`).
   - Gestion et suivi de tous les abonnements clients.
