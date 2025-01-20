# Quiz-Webapp

Eine interaktive Quiz-Anwendung, die es Benutzern ermöglicht, eigene Quiz-Fragen zu erstellen und gegen andere zu spielen.

## Features
- Benutzerverwaltung mit Login-System
- Erstellung eigener Quiz-Fragen
- Zwei Spielmodi: Eigene Fragen und Gegen Andere
- Bestenliste mit Top 10 Scores
- Bearbeitung und Löschung eigener Fragen

## Technologien
- Frontend: HTML5, CSS3, jQuery
- Backend: Node.js, Express
- Datenbank: PostgreSQL
- Hosting: Heroku

## Installation
1. Repository klonen
2. Dependencies installieren:
   ```bash
   npm install express
   npm install pg
   npm install express-session
   npm install bcrypt

PostgreSQL Datenbank einrichten

.env Datei erstellen mit:
DATABASE_URL=postgres://localhost:5432/quiz_db
SESSION_SECRET=your-secret
NODE_ENV=development
PORT=3000

Server starten:
npm start

Live Demo
Die Anwendung ist unter quiz-heroku-ui-projekt.herokuapp.com erreichbar.

Entwickelt von Vadim Styr
Diese README gibt einen schnellen Überblick über:
- Was das Projekt ist
- Hauptfunktionen
- Verwendete Technologien
- Installationsanleitung
- Wie man das Projekt startet
- Wo man eine Live-Version findet