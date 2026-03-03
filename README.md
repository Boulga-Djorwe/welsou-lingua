# Welsou Lingua

## Pourquoi "le backend ne fonctionne pas sur GitHub"

GitHub Pages heberge uniquement du statique (HTML/CSS/JS).  
Le backend LibreTranslate (Docker) ne peut pas tourner sur GitHub Pages.

## Architecture correcte

- Frontend: GitHub Pages (`public/`)
- Backend: heberge ailleurs (Railway, Render, VPS, etc.)

## Configuration backend pour GitHub Pages

Editez `public/config.js` et mettez l'URL de votre backend:

```js
window.APP_CONFIG = {
  API_BASE_URL: "https://votre-backend.exemple.com"
};
```

Puis poussez sur `main` pour redeployer Pages.

## Dev local

- `docker compose up --build`
- ouvrir `http://localhost:3000`

En local, `API_BASE_URL` peut rester vide.
