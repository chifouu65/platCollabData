# TODO List de Projet : Plateforme Collaborative d’Annotation de Données

## Objectif du Projet

Développer une plateforme collaborative pour l'annotation de données, permettant aux utilisateurs de créer des projets, d'annoter des données, et de collaborer en temps réel.

## TODO List

### 1. **Configuration de l'Environnement**

- [ ] Installer les dépendances nécessaires pour le back-end (NestJS).
- [ ] Installer les dépendances nécessaires pour le front-end (Angular).
- [ ] Configurer Docker pour le déploiement.

### 2. **Back-End (NestJS)**

#### 2.1. **Routes API**

- [x] **Créer les Routes pour les Projets**

  - [x] Implémenter la route `POST /projects` dans `projects.controller.ts` pour créer un projet.
  - [x] Implémenter la route `GET /projects` dans `projects.controller.ts` pour récupérer tous les projets.

- [ ] **Créer les Routes pour les Annotations**
  - [ ] Implémenter la route `POST /annotations` pour créer une annotation.
  - [ ] Implémenter la route `GET /annotations` pour récupérer les annotations d'un projet.

#### 2.2. **Services**

- [] **Configurer le Service de Projets**
  - [x] Ajouter la logique pour gérer les projets dans `projects.service.ts`.
  - [ ] Ajouter la logique pour gérer les annotations dans un nouveau service `annotations.service.ts`.

#### 2.3. **Contrôleurs**

- [ ] **Configurer le Contrôleur de Projets**

  - [x] Assurer que le contrôleur gère correctement les requêtes dans `projects.controller.ts`.

- [ ] **Configurer le Contrôleur d'Annotations**
  - [ ] Créer un nouveau contrôleur `annotations.controller.ts` pour gérer les annotations.

#### 2.4. **Tests**

- [ ] Écrire des tests pour les routes et les services dans `projects.controller.spec.ts` et `annotations.controller.spec.ts`.

### 3. **Front-End (Angular)**

#### 3.1. **Services**

- [x] **Configurer le Service de Projets**
  - [x] Implémenter les méthodes pour interagir avec l'API dans `projet.service.ts`.

#### 3.2. **Composants**

- [] **Créer les Composants**
  - [x] Créer le composant pour la liste des projets dans `projet-list.component.ts`.
  - [x] Créer le composant pour les détails d'un projet.
  - [] Créer le composant pour l'interface d'annotation.

#### 3.3. **Interface Utilisateur**

- [ ] Concevoir l'interface d'annotation avec les outils nécessaires.
- [ ] Créer des écrans pour afficher les statistiques et les projets.

#### 3.4. **Tests**

- [ ] Écrire des tests pour les composants et les services.

### 4. **Documentation**

- [ ] Mettre à jour `doc.md` avec les spécifications du projet, les fonctionnalités, et les instructions d'utilisation.
- [ ] Documenter les routes API et les structures de données.

### 5. **Déploiement**

- [ ] Configurer Docker pour le déploiement de l'application.
- [ ] Déployer l'application sur un hébergement cloud (AWS/GCP/Azure/Render).
- [ ] Mettre en place un pipeline CI/CD pour les tests et la mise en production.

### 6. **Améliorations Futures**

- [ ] Ajouter des fonctionnalités de contrôle de qualité et de validation.
- [ ] Intégrer des outils d'analyse de données pour les annotations.
- [ ] Ajouter des fonctionnalités de notifications en temps réel avec Socket.IO.

## Conclusion

Cette TODO list fournit une feuille de route claire pour le développement de la plateforme collaborative d’annotation de données. En suivant ces étapes, vous pourrez structurer votre travail et vous assurer que toutes les fonctionnalités nécessaires sont mises en œuvre. Si vous avez des questions ou besoin d'aide supplémentaire, n'hésitez pas à demander !
