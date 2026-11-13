# ACN — Auxiliary Calibration Network (Full-Stack + ML)

Full-stack clinical dermoscopy calibration application featuring a React + Tailwind frontend, an Express.js API backend, and a PyTorch ResNet-18 + Auxiliary Calibration Network (ACN) ML service.

---

## Project Structure

```text
├── src/                        # React + TypeScript + Tailwind frontend
│   ├── App.tsx                 # 3-screen workflow + session & API integration
│   ├── types.ts                # Shared clinical & calibration data contracts
│   ├── data/samples.ts         # Client reference fallback data
│   └── components/             # Login, Navigation, Upload, Result, Calibration, Footer
├── server.ts                   # Express API backend + Vite dev / dist prod server (port 3000)
├── server/
│   ├── mlEngine.ts             # Built-in ACN mathematical engine + Python ML proxy
│   ├── samplesData.ts          # HAM10000 reference lesions & benchmark metrics
│   └── store.ts                # Local JSON persistence (data/predictions.json)
└── ml/                         # Python PyTorch ML pipeline & FastAPI service
    ├── model.py                # Frozen ResNet-18 signal extractor + ACN MLP (Softplus + 1.0)
    ├── metrics.py              # 15-bin ECE, MCE, Brier, NLL, CWR@0.9
    ├── train_acn.py            # Training script (HAM10000 or --synthetic smoke mode)
    ├── inference_server.py     # FastAPI ML inference microservice (port 8000)
    └── requirements.txt
```

---

## Option 1: Quick Start on Localhost (Frontend + Express Backend)

Runs the full React UI, Express API (`/api/auth/*`, `/api/samples`, `/api/predict`, `/api/benchmarks`), local persistence, and the built-in ACN mathematical calibration engine with a single command:

```bash
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

For production build & run:
```bash
npm run build
NODE_ENV=production npm start
```

---

## Option 2: Full PyTorch ML + Express + React Stack

To run live PyTorch ResNet-18 feature extraction and ACN temperature prediction (`T(x)`) via FastAPI:

### 1. Start the Python PyTorch ML Microservice (Terminal 1)
```bash
cd ml
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Optional: train ACN weights (use --data_dir /path/to/ham10000 or --synthetic)
python train_acn.py --synthetic --epochs 20

# Start FastAPI server on port 8000
uvicorn inference_server:app --host 0.0.0.0 --port 8000
```

### 2. Start the Express + React App (Terminal 2)
Set `ML_SERVICE_URL=http://127.0.0.1:8000` in `.env` (or pass it inline):

```bash
ML_SERVICE_URL=http://127.0.0.1:8000 npm run dev
```

Open **http://localhost:3000**. Uploaded dermoscopy images will now route through Express `POST /api/predict` directly to your PyTorch ResNet-18 + ACN model on port 8000 (and automatically fall back to the built-in Node ACN engine if the Python server is stopped).

---

## Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend health & active ML engine (`python-pytorch` or `node-acn-engine`) |
| `POST` | `/api/auth/login` | Authenticates clinician session |
| `POST` | `/api/auth/guest` | Starts guest review session |
| `GET` | `/api/samples` | Returns 4 HAM10000 reference lesions + persisted uploaded scans |
| `GET` | `/api/benchmarks` | Returns 5-baseline calibration metrics (ECE, MCE, Brier, NLL, Acc) |
| `POST` | `/api/predict` | Runs signal extraction + ACN calibration `T(x)` on uploaded image |
| `DELETE` | `/api/predictions/:id` | Removes a saved uploaded scan |
