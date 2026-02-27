# Application Web de Traduction (Mono-conteneur Docker)

Application frontend integree directement dans l'image LibreTranslate.

## Demarrage mono-conteneur (Docker Compose)

Depuis la racine du projet:

```bash
docker compose up --build -d
```

Puis ouvrir:

- `http://localhost:3000`

Architecture:

- `traduction-app` (conteneur unique):
  - base: `libretranslate/libretranslate`
  - `index.html` remplace l'UI web LibreTranslate
  - `app.js` et `Styles.css` sont servis via `/static/*`
  - API locale exposee nativement: `/languages`, `/translate`, `/detect`

Le frontend appelle des routes relatives (`/languages`, `/translate`), donc pas de probleme CORS dans cette config.

## Build/Run sans Compose

```bash
docker build -t traduction-app ./traduction
docker run --rm -p 3000:5000 --name traduction-app traduction-app
```

## Endpoints API attendus

- `GET /languages`
- `POST /translate`

Payload de traduction:

```json
{
  "q": "Bonjour",
  "source": "fr",
  "target": "en",
  "format": "text"
}
```
