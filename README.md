# Quiz-Webapp

Eine interaktive Quiz-Anwendung, die es Benutzern ermöglicht, eigene Quiz-Fragen zu erstellen und gegen andere zu spielen.

## Features

- **Benutzerverwaltung mit Login-System**
- **Erstellung eigener Quiz-Fragen**
- **Zwei Spielmodi:**
  - Eigene Fragen
  - Gegen andere
- **Bestenliste mit Top 10 Scores**
- **Bearbeitung und Löschung eigener Fragen**

---

## Technologien

- **Frontend:** HTML5, CSS3, jQuery
- **Backend:** Node.js, Express
- **Datenbank:** PostgreSQL
- **Hosting:** Heroku

---

## Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd <repository-name>

---

### Abhängigkeiten installieren

```bash
npm install express
npm install pg
npm install express-session
npm install bcrypt

---
# Konfiguration

## Für Produktionsumgebung (Heroku)
Die Anwendung ist für die Produktionsumgebung auf Heroku konfiguriert und läuft dort ohne weitere Anpassungen.

---

## Für lokale Entwicklung
Für lokales Testing gibt es zwei Möglichkeiten:

---

### Mit lokaler PostgreSQL Datenbank:

- PostgreSQL lokal installieren
- Lokale Datenbank erstellen
- `.env` Datei erstellen mit:
  ```plaintext
  DATABASE_URL=postgresql://username:password@localhost:5432/quiz_db
  SESSION_SECRET=your-secret
  NODE_ENV=development
  PORT=3000

---

### Mit Heroku-Datenbank:

- Firewall-Regeln in Heroku anpassen für externen Zugriff
- Heroku `DATABASE_URL` in `.env` Datei verwenden
  **Beachten:** Heroku ändert regelmäßig Datenbank-Credentials

**Wichtiger Hinweis:** Für lokales Testing wird Port 3000 verwendet. Stellen Sie sicher, dass dieser Port verfügbar ist oder ändern Sie den Port in der `.env` Datei.

---

### Server starten

```bash
npm start

# ODER
node node.js
Die Anwendung ist dann unter http://localhost:3000 (oder dem konfigurierten Port) erreichbar.

## Live Demo
Die Anwendung ist unter [quiz-heroku-ui-projekt.herokuapp.com](https://quiz-heroku-ui-projekt-9a26bdbd114f.herokuapp.com/html/userNameLoginIndex.html) erreichbar.

## Bekannte Einschränkungen

- Lokales Testing mit der Heroku-Datenbank kann aufgrund von Firewall-Einstellungen und sich ändernden Credentials problematisch sein
- Bei lokalem Testing wird empfohlen, eine eigene PostgreSQL-Instanz zu verwenden

**Entwickelt von Vadim Styr**