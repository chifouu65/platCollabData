# Documentation du Projet : Plateforme Collaborative d’Annotation de Données

## Contexte et Utilité

De nombreuses entreprises et laboratoires ont besoin de jeux de données annotés (images, textes, sons…) pour entraîner des modèles de Machine Learning. L’annotation est souvent fastidieuse et nécessite une plateforme où plusieurs personnes peuvent collaborer en temps réel ou de manière asynchrone, tout en maintenant la qualité et la cohérence des données.

## Fonctionnalités Possibles

### 1. Gestion de Projets et de Jeux de Données

- **Création de Projets** : Permettre aux utilisateurs de créer des projets (ex. : “Classification d’images de fruits”, “Analyse de sentiments de tweets”, etc.).
- **Import de Datasets** : Fonctionnalité pour importer des datasets (images, fichiers audio, textes, etc.).

### 2. Interface d’Annotation Avancée

- **Outils d'Annotation** : Outils pour dessiner des bounding boxes, polygon masks, highlights de texte, sélection de mots-clés.
- **Ajout de Métadonnées** : Possibilité d’ajouter des métadonnées (labels multiples, niveaux de confiance, etc.).

### 3. Collaboration en Équipe

- **Assignation des Tâches** : Qui annote quel lot de données ?
- **Suivi d’Avancement** : Statistiques en temps réel sur le nombre d’images/textes annotés et la progression.
- **Système de Commentaires** : Discussions autour des annotations (ex. : “Je pense que ce fruit est mal classé”).

### 4. Contrôle de Qualité et Validations

- **Double ou Triple Annotation** : Plusieurs personnes annotent la même donnée pour vérifier la cohérence.
- **Statistiques de Fiabilité** : Mesure des écarts de label par annotateur.
- **Workflow de Relecture** : Pour repérer et corriger les désaccords.

### 5. Export et Intégration ML

- **Formats d'Exportation** : Export des annotations dans divers formats (COCO, Pascal VOC, CSV, JSON).
- **Intégration avec des Frameworks de ML** : Intégration possible avec TensorFlow, PyTorch pour un pipeline complet.

## Tech Stack

- **Front-end** : Angular (ou React/Vue avec des librairies de dessin pour l’annotation, ex. fabric.js, Konva.js).
- **Back-end** : Node.js (NestJS).
- **Base de Données** : SQL (PostgreSQL) ou NoSQL (MongoDB).
- **Temps Réel** : Socket.IO / WebSockets pour la collaboration.
- **Déploiement** : Docker + hébergement cloud (AWS/GCP/Azure/Render), pipeline CI/CD pour tests et mise en production.

## Routes à Créer

### Back-End (NestJS)

1. **Projets**

   - `POST /projects` : Créer un nouveau projet.
   - `GET /projects` : Récupérer tous les projets.

2. **Annotations** (à ajouter)
   - `POST /annotations` : Créer une nouvelle annotation.
   - `GET /annotations` : Récupérer toutes les annotations pour un projet spécifique.

### Front-End (Angular)

1. **Composants**
   - **Liste des Projets** : Afficher tous les projets avec la possibilité d'en créer de nouveaux.
   - **Détails du Projet** : Afficher les détails d'un projet spécifique et les annotations associées.
   - **Interface d'Annotation** : Outils pour annoter les données.

## Écrans à Créer

1. **Écran d'Accueil**

   - Présentation de la plateforme et des fonctionnalités.

2. **Écran de Liste des Projets**

   - Affichage de tous les projets avec options pour créer, modifier ou supprimer des projets.

3. **Écran de Détails du Projet**

   - Affichage des détails d'un projet, des annotations existantes et des outils d'annotation.

4. **Écran d'Annotation**

   - Interface d'annotation avec outils pour dessiner et ajouter des métadonnées.

5. **Écran de Statistiques**
   - Affichage des statistiques d'annotation et de progression.

## Pourquoi c’est Challengeant ?

- **Complexité UI** : Créer une interface d’annotation riche et réactive.
- **Collaboration & Workflow** : Mécanismes de répartition des tâches, contrôle de qualité, synchronisation en temps réel.
- **Évolutivité** : L’application doit supporter potentiellement plusieurs milliers de données et utilisateurs.
- **Utilité** : Outil très recherché par les entreprises et laboratoires travaillant en data science.

## Conclusion

Cette documentation fournit un aperçu complet de la plateforme collaborative d’annotation de données, y compris les fonctionnalités, la technologie, les routes à créer, et les écrans à développer. En suivant ces directives, vous serez en mesure de construire une application robuste et efficace pour l'annotation de données. Si vous avez des questions ou besoin d'aide supplémentaire, n'hésitez pas à demander !
