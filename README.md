# Système de Gestion Scolaire

Une application moderne et intuitive de gestion scolaire développée par **Adnane El Kharraz**, permettant aux administrateurs de gérer efficacement les étudiants, enseignants, cours, inscriptions et ressources au sein d'un établissement éducatif.

![SchoolApp](https://img.shields.io/badge/SchoolApp-v1.0-blue)
![React](https://img.shields.io/badge/React-v19.1.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-v4.9.5-3178C6)
![Material UI](https://img.shields.io/badge/Material_UI-v7.0.2-0081CB)

## Fonctionnalités principales

- **Tableau de bord interactif** avec statistiques et visualisations en temps réel
- **Gestion des étudiants** (ajout, modification, suppression)
- **Gestion des enseignants** avec validation d'email et gestion des spécialisations
- **Gestion des cours** avec dates de début/fin et attribution d'enseignants
- **Système d'inscriptions** liant étudiants et cours
- **Gestion des ressources matérielles** (disponibilité, maintenance, réservation)
- **Interface utilisateur moderne** avec design responsive et thème personnalisé

## Technologies utilisées

- **Frontend**:
  - React 19.1
  - TypeScript 4.9
  - Material UI 7.0
  - React Router 7.5
  
- **Base de données**:
  - Dexie.js 4.0 (IndexedDB)
  
- **Architecture**:
  - Pattern de conception MVC
  - Pattern Singleton pour les gestionnaires
  - Hooks React personnalisés
  - Composants fonctionnels React

## Exigences système

- Node.js 18+
- NPM 8+
- Navigateur web moderne (Chrome, Firefox, Edge, Safari)

## Installation et démarrage

1. Cloner le dépôt
   ```bash
   git clone https://github.com/yourusername/school-management.git
   cd school-management
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Démarrer l'application en mode développement
   ```bash
   npm start
   ```
   L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000)

4. Créer une version de production
   ```bash
   npm run build
   ```

## Structure du projet

```
school-management/
├── src/
│   ├── components/      # Composants UI réutilisables
│   ├── contexts/        # Contextes React pour la gestion d'état global
│   ├── database/        # Configuration de la base de données IndexedDB
│   ├── daos/            # Data Access Objects pour interactions avec la BDD
│   ├── models/          # Modèles de données et logique métier
│   ├── pages/           # Composants de pages principales
│   ├── services/        # Services pour logique métier complexe
│   ├── theme/           # Configuration du thème Material UI
│   └── utils/           # Fonctions utilitaires
├── public/              # Ressources statiques
└── package.json         # Dépendances et scripts
```

## Fonctionnalités de sécurité

- Validation des données côté client
- Vérification des contraintes d'intégrité (ex: suppression d'enseignants avec des cours assignés)
- Protection contre les entrées invalides

## Compatibilité

L'application est conçue avec une approche responsive et fonctionne sur:
- Ordinateurs de bureau
- Tablettes
- Smartphones

## Tests

Exécuter les tests unitaires:
```bash
npm test
```

## Roadmap

- Authentification et gestion des rôles utilisateurs
- Exportation de données (PDF, Excel)
- Notifications par email
- Système de messagerie interne
- Application mobile native

## À propos de l'auteur

**Adnane El Kharraz** - Développeur full-stack passionné par la création d'applications web modernes et performantes.

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.
