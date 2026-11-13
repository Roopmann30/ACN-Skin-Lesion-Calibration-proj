import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { REFERENCE_SAMPLES, BENCHMARK_COMPARISONS } from './server/samplesData.ts';
import { inferLesionWithFallback } from './server/mlEngine.ts';
import { loadSavedPredictions, savePrediction, deletePrediction } from './server/store.ts';

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Allow large base64 dermatoscopic image payloads (up to 15 MB)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Lightweight CORS headers for localhost multi-port development
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // =========================================================================
  // API ROUTES
  // =========================================================================

  app.get('/api/health', async (_req, res) => {
    const mlUrl = process.env.ML_SERVICE_URL?.trim();
    let pythonOnline = false;
    if (mlUrl) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1200);
        const r = await fetch(`${mlUrl.replace(/\/$/, '')}/health`, { signal: controller.signal });
        clearTimeout(timer);
        pythonOnline = r.ok;
      } catch {
        pythonOnline = false;
      }
    }

    res.json({
      status: 'ok',
      backend: 'express',
      mlEngine: pythonOnline ? 'python-pytorch' : 'node-acn-engine',
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const email = typeof req.body?.email === 'string' && req.body.email.trim()
      ? req.body.email.trim()
      : 'clinician@acn.ai';

    const token = crypto.randomBytes(24).toString('hex');
    const namePart = email.split('@')[0] || 'Clinician';
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    res.json({
      token,
      user: {
        name: formattedName,
        email,
        role: 'Dermatology Clinician',
        institution: 'HAM10000 Calibration Workspace',
        avatarLetter: formattedName.charAt(0).toUpperCase(),
      },
    });
  });

  app.post('/api/auth/guest', (_req, res) => {
    const token = crypto.randomBytes(16).toString('hex');
    res.json({
      token,
      user: {
        name: 'Guest Reviewer',
        email: 'guest@acn.local',
        role: 'Guest Session',
        institution: 'Local Demo',
        avatarLetter: 'G',
      },
    });
  });

  app.get('/api/samples', (_req, res) => {
    const savedCustom = loadSavedPredictions();
    res.json({
      samples: [...savedCustom, ...REFERENCE_SAMPLES],
      referenceCount: REFERENCE_SAMPLES.length,
      uploadedCount: savedCustom.length,
    });
  });

  app.get('/api/benchmarks', (_req, res) => {
    res.json({
      benchmarks: BENCHMARK_COMPARISONS,
      bins: 15,
      dataset: 'HAM10000',
      backbone: 'ResNet-18 (Frozen)',
    });
  });

  app.post('/api/predict', async (req, res) => {
    try {
      const { imageBase64, fileName } = req.body ?? {};
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Missing imageBase64 payload' });
        return;
      }

      const safeFileName =
        typeof fileName === 'string' && fileName.trim().length > 0
          ? fileName.trim()
          : `lesion_${Date.now()}.png`;

      const { sample, engine } = await inferLesionWithFallback(imageBase64, safeFileName);
      savePrediction(sample);

      res.json({
        sample,
        engine,
      });
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: 'Failed to analyze dermoscopy image' });
    }
  });

  app.delete('/api/predictions/:id', (req, res) => {
    const removed = deletePrediction(req.params.id);
    if (!removed) {
      res.status(404).json({ error: 'Prediction not found' });
      return;
    }
    res.json({ deleted: true, id: req.params.id });
  });

  // =========================================================================
  // FRONTEND SERVING (Vite dev middleware in dev, dist/ static in production)
  // =========================================================================

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ACN Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
