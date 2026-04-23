# fura_zavod-b

Backend API for Temir Zavod.

## Local run

```bash
npm install
npm start
```

## Vercel

This repo exposes the API from `api/index.js` for serverless deployment.

Set `MONGO_URI` in Vercel environment variables so every request writes to MongoDB.
`PORT` is only needed for local development.
