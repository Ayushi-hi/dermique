# DERMIQUÉ — Luxury Skincare Ingredient Intelligence

![DERMIQUÉ](https://img.shields.io/badge/DERMIQUÉ-Luxury%20AI-c9a84c?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![AI](https://img.shields.io/badge/AI-Groq%20Vision-FF6B35?style=for-the-badge)

> **Know What Touches Your Skin** — A luxury AI-powered skincare ingredient scanner that decodes product labels and delivers personalised safety reports.

---

## 🌟 Live Demo

- **Frontend:** [https://dermique.vercel.app](https://dermique-git-main-ayushis-projects-cea11562.vercel.app)
- **Backend API:** [https://dermique-backend.onrender.com](https://dermique-backend.onrender.com)

---

## 📱 Features

- 🔍 **AI Vision Scanning** — Upload any product label or barcode photo
- 👤 **8 Skin Profiles** — Normal, Dry, Oily, Combination, Sensitive, Acne-Prone, Mature, Hyperpigmented
- ⚠️ **Harmful Ingredient Detection** — Flags parabens, SLS, fragrance, formaldehyde releasers
- ✅ **Beneficial Ingredient Recognition** — Highlights niacinamide, hyaluronic acid, ceramides, peptides
- 📊 **Safety Score** — 0-100 personalised safety rating
- 💾 **Scan History** — Save and review past scans (with account)
- 📱 **Fully Responsive** — Works on mobile, tablet and desktop
- 🎨 **Luxury Off-White Design** — Editorial aesthetic with gold accents

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool |
| CSS-in-JS | Styling |
| Vercel | Deployment |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Multer | Image upload |
| Groq AI (Llama 4) | Vision AI analysis |
| Render | Deployment |

### AI & Data
| Technology | Purpose |
|---|---|
| Groq Llama 4 Scout | Product image reading |
| Hugging Face | Custom trained model |
| Google Flan-T5 | Fine-tuned ingredient classifier |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key (free at console.groq.com)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Ayushi-hi/dermique.git
cd dermique
```

**2. Setup Backend**
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dermique
GROQ_API_KEY=gsk_your_key_here
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
npm start
```

**3. Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

**4. Open your browser:**
```
http://localhost:5173
```

---

## 📖 How It Works

```
1. User selects their skin profile (8 types available)
2. User uploads a product label or barcode photo
3. Groq AI Vision reads the INCI ingredient list
4. AI analyses each ingredient for safety and compatibility
5. Personalised safety report is generated and displayed
6. Scan is saved to MongoDB for history tracking
```

---

## 🤖 Custom AI Model

This project includes a custom fine-tuned AI model trained on skincare ingredient data:

- **Base Model:** Google Flan-T5-Base
- **Training Data:** 376+ ingredient-skin type pairs
- **Platform:** Google Colab (free GPU)
- **Hosting:** Hugging Face
- **Dataset Sources:** EWG Skin Deep, CosDNA, INCIDecoder

### Training the model yourself:
```bash
# 1. Generate dataset
python generate_dataset.py

# 2. Upload to Google Colab
# 3. Run training script
# 4. Model auto-uploads to Hugging Face
```

---

## 📁 Project Structure

```
dermique/
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── App.jsx           # Main application
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js + Express API
│   ├── routes/
│   │   ├── analyze.js        # AI analysis endpoint
│   │   ├── auth.js           # Authentication
│   │   └── scans.js          # Scan history
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Scan.js           # Scan schema
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── server.js             # Express server
│   └── .env                  # Environment variables
│
├── ingredients.json          # Training dataset
├── generate_dataset.py       # Dataset generator
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| POST | `/api/analyze` | Analyse product |
| GET | `/api/scans` | Scan history |
| GET | `/api/scans/stats` | Personal stats |
| DELETE | `/api/scans/:id` | Delete scan |
| GET | `/api/health` | Health check |

---

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
GROQ_API_KEY=gsk_...
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-vercel-url.vercel.app
```

---

## 📊 Ingredient Safety Ratings

| Rating | Description |
|---|---|
| ✅ Safe (90-100) | Zero harmful ingredients found |
| ⚠️ Caution (60-89) | Some ingredients need monitoring |
| ❌ Unsafe (0-59) | Contains harmful ingredients |

### Always Flagged as Harmful:
- Fragrance / Parfum
- Parabens (Methyl, Propyl, Butyl, Ethyl)
- Sodium Lauryl Sulfate (SLS/SLES)
- Formaldehyde releasers (DMDM Hydantoin)
- Oxybenzone

### Always Celebrated as Beneficial:
- Niacinamide
- Hyaluronic Acid
- Ceramides
- Peptides
- Retinol
- Vitamin C

---

## 🎓 Built By

**Ayushi Singh** — Student Developer

Built as a portfolio project demonstrating:
- Full-stack web development
- AI/ML model training
- REST API design
- UX/UI design

---

## 📄 License

This project is for educational purposes. For informational use only — not a substitute for professional dermatological advice.

---

## 🙏 Acknowledgements

- [EWG Skin Deep](https://ewg.org/skindeep) — Ingredient safety data
- [CosDNA](https://cosdna.com) — Ingredient analysis
- [INCIDecoder](https://incidecoder.com) — Ingredient explanations
- [Groq](https://console.groq.com) — Free AI vision API
- [Hugging Face](https://huggingface.co) — Model hosting

---

*DERMIQUÉ — Your skin is the canvas. We illuminate what's on the brush.*
