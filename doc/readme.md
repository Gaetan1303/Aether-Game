# Projet : MMO RPG - Architecture et API

## Introduction

Ce document décrit l'architecture d'un jeu mobile de type **MMO RPG** (Massively Multiplayer Online Role-Playing Game), inspiré de jeux comme **Final Fantasy Tactics Advance**. Le projet se divise en plusieurs modules API et services qui interagissent pour offrir une expérience de jeu immersive tout en maintenant une architecture scalable, flexible et performante.

## Architecture

### 1. **Front-End (Facade utilisateur)**
- **Description** : Le front-end est responsable de l'interface utilisateur. Il récupère et affiche les informations du joueur (profil, inventaire, progression, etc.) via des API.
- **Technologies** : Angular, State Management (NgRx ou Akita).
- **Fonctionnalités** :
  - Interface utilisateur pour afficher l'état du joueur, son inventaire et ses statistiques.
  - Consommation des différentes API via des services Angular.
  - Mise à jour en temps réel avec WebSockets ou API REST périodiques.

### 2. **API Observer (Maintien de l'état du joueur et du jeu)**
- **Description** : Cette API surveille l'état du joueur et du monde du jeu. Elle synchronise l'état du joueur avec l'état global du jeu.
- **Technologies** : Kafka, RabbitMQ pour la gestion des événements en temps réel, Redis pour la persistance de l'état du joueur.
- **Fonctionnalités** :
  - Surveillance de l'état des joueurs (position, vie, équipement, progression).
  - Persistance des données critiques à intervalles réguliers.
  - Mise à jour dynamique de l'état en fonction des événements du jeu.

### 3. **Serveur Fabric (Logique métier et règles de jeu)**
- **Description** : Ce serveur gère la logique métier du jeu, telles que les règles de combat, la gestion des quêtes et des objets.
- **Technologies** : Node.js, Go, Microservices.
- **Fonctionnalités** :
  - Gestion des combats, des quêtes et de la progression des joueurs.
  - Règles complexes de jeu, calculs de récompenses, système d'économie.
  - Séparation des services pour chaque aspect du jeu (combat, quêtes, économie).

### 4. **API Middleware (Clonage de sessions et gestion des instances)**
- **Description** : L'API Middleware est responsable de la gestion des instances de jeu et du clonage des sessions pour garantir la séparation des joueurs et de leurs groupes.
- **Technologies** : Kubernetes, Docker, Nginx ou HAProxy pour la gestion des instances.
- **Fonctionnalités** :
  - Clonage dynamique des sessions de jeu pour séparer les groupes (dungeons, événements en groupe, etc.).
  - Répartition de la charge entre plusieurs instances de serveurs de jeu.
  - Scalabilité horizontale avec des containers Docker et orchestration Kubernetes.

### 5. **API pour le chat, messages et échanges entre joueurs**
- **Description** : Cette API gère la communication en temps réel entre les joueurs : chat privé, chat de groupe, échanges d'objets, etc.
- **Technologies** : Socket.IO, WebSockets, MongoDB pour la gestion des messages.
- **Fonctionnalités** :
  - Chat global, privé et de groupe.
  - Échange d'objets et d'informations entre joueurs.
  - Notifications push pour alerter les joueurs des nouveaux messages ou demandes.

### 6. **Base de Données (BDD)**
- **Description** : La base de données stocke l'état persistant des joueurs, les objets, les quêtes, etc.
- **Technologies** : PostgreSQL (relationnel), MongoDB (NoSQL), Redis (cache en mémoire).
- **Fonctionnalités** :
  - Stockage des profils des joueurs, des états de progression et des données relatives à l'inventaire.
  - Gestion des sessions de jeu en temps réel.
  - Accès rapide aux données via Redis et MongoDB pour les informations non relationnelles.

### 7. **API Big Data (Analyse et Reporting)**
- **Description** : Cette API collecte et analyse les données du jeu pour améliorer l'expérience de jeu et fournir des rapports d'analyse aux développeurs.
- **Technologies** : Apache Kafka, Spark, ElasticSearch.
- **Fonctionnalités** :
  - Collecte d'événements de jeu en temps réel.
  - Analyse des comportements des joueurs et des données d'engagement.
  - Rapports sur les performances du jeu, les tendances des joueurs et les mécaniques de jeu.

### 8. **API Adaptateur (Communication entre API)**
- **Description** : L'API Adaptateur sert de "pont" entre toutes les autres API, traduisant les demandes et les réponses entre les différents services.
- **Technologies** : GraphQL, API Gateway, Kong.
- **Fonctionnalités** :
  - Centralisation des appels API via GraphQL ou une API Gateway.
  - Traduction des requêtes entre les différents services pour garantir la compatibilité.
  - Gestion de l'authentification et de la sécurité des échanges entre services.

## Technologies Utilisées

- **Backend** : Node.js, Go, Microservices, Kafka, Redis, PostgreSQL, MongoDB, Docker, Kubernetes.
- **Frontend** : Angular, NgRx (State Management), WebSockets, RESTful APIs.
- **API** : GraphQL, API Gateway, Socket.IO, WebSockets.
- **Big Data** : Apache Kafka, Spark, ElasticSearch.
- **Cloud** : AWS, Google Cloud, Azure.

## Conclusion

Cette architecture modulaire permet une séparation claire des responsabilités, avec une capacité de montée en charge et une flexibilité adaptées à un jeu MMO RPG. Les différentes API permettent une interaction fluide entre les services tout en maintenant la cohérence de l'état du jeu et de la progression des joueurs. Cette approche garantit une expérience de jeu stable et réactive, même avec un grand nombre de joueurs actifs simultanément.

