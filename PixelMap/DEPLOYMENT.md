# Deployment Guide - PixelMap

## Prérequis

1. **Comptes requis** :
   - Compte [Vercel](https://vercel.com) (gratuit)
   - Compte [Fly.io](https://fly.io) (gratuit)

2. **Outils à installer** :
   ```bash
   # Vercel CLI
   npm install -g vercel
   
   # Fly.io CLI
   curl -L https://fly.io/install.sh | sh
   ```

## Déploiement du Backend (Fly.io)

1. **Connexion à Fly.io** :
   ```bash
   fly auth login
   ```

2. **Initialiser l'application** (depuis `/PixelMap/backend`) :
   ```bash
   cd PixelMap/backend
   fly launch --no-deploy
   ```
   - Acceptez les paramètres par défaut
   - L'app sera nommée `pixelmap-backend` (modifiable dans `fly.toml`)

3. **Déployer** :
   ```bash
   fly deploy
   ```

4. **Récupérer l'URL du backend** :
   ```bash
   fly status
   ```
   L'URL sera du type : `https://pixelmap-backend.fly.dev`
   
   > **Important** : Notez cette URL, vous en aurez besoin pour le frontend.

5. **Vérifier les logs** :
   ```bash
   fly logs
   ```

## Déploiement du Frontend (Vercel)

### Option 1 : Via GitHub (Recommandé)

1. Poussez votre code sur GitHub :
   ```bash
   git push origin main
   ```

2. Connectez-vous sur [vercel.com](https://vercel.com)

3. Cliquez sur "New Project" et importez votre repository

4. **Configuration** :
   - Framework Preset : Vite
   - Root Directory : `PixelMap/frontend`
   - Build Command : `npm run build`
   - Output Directory : `dist`

5. **Variables d'environnement** :
   Ajoutez dans les settings du projet :
   - Name: `VITE_WS_URL`
   - Value: `wss://pixelmap-backend.fly.dev` (remplacez par votre URL Fly.io)

6. Cliquez sur "Deploy"

### Option 2 : Via CLI

1. **Depuis le dossier frontend** :
   ```bash
   cd PixelMap/frontend
   ```

2. **Mettre à jour `.env.production`** :
   ```bash
   VITE_WS_URL=wss://votre-app.fly.dev
   ```
   Remplacez par l'URL de votre backend Fly.io.

3. **Déployer** :
   ```bash
   vercel --prod
   ```

4. Suivez les instructions :
   - Project name : `pixelmap`
   - Acceptez les paramètres par défaut

## Vérification

Une fois déployé, testez :

1. Ouvrez l'URL Vercel dans votre navigateur
2. Entrez un pseudo
3. Dessinez quelques pixels
4. Ouvrez une fenêtre incognito avec la même URL
5. Vérifiez que les pixels sont synchronisés en temps réel

## Dépannage

### Le WebSocket ne se connecte pas

- Vérifiez que `VITE_WS_URL` utilise `wss://` (et non `ws://`)
- Vérifiez que l'URL correspond à votre déploiement Fly.io
- Consultez les logs : `fly logs`

### Erreur de build Vercel

- Vérifiez que le Root Directory est bien `PixelMap/frontend`
- Vérifiez que la variable d'environnement `VITE_WS_URL` est définie

### Le backend Fly.io ne démarre pas

- Consultez les logs : `fly logs`
- Vérifiez que le port 8080 est bien configuré dans `fly.toml`

## Mises à jour

### Backend :
```bash
cd PixelMap/backend
fly deploy
```

### Frontend (GitHub) :
Poussez simplement sur main, Vercel redéploie automatiquement.

### Frontend (CLI) :
```bash
cd PixelMap/frontend
vercel --prod
```

## Monitoring

- **Fly.io dashboard** : https://fly.io/dashboard
- **Vercel dashboard** : https://vercel.com/dashboard
