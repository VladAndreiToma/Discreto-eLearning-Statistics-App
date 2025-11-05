# 🧮 Discreto — Interactive Statistical Physics & Mathematics Playground

> “Where equations come alive in real time.”

**Discreto** is an interactive e-learning app that merges **advanced statistics**, **mathematical discretization**, and **thermodynamic simulation** — all in the browser.  
It’s built as a **SPA (Single Page Application)** with blazing-fast rendering and smooth WebGL-based visuals.  

---

## 🌐 Live Concept

Discreto transforms the abstract world of statistical physics into **gamified, visual experiences**.  
Each module explores a fundamental concept through **real-time 3D simulation**, interactive sliders, and data visualization.  

Examples of chapters & simulations include:
- 🎲 *Quantum Crowd* — statistical behavior of fermions, bosons, and classical gases  
- 🔥 *ThermoSync* — energy transfer and thermal equilibrium between reservoirs  
- 📈 *Population Surge* — Boltzmann distribution and level occupation  
- 🌊 *Fluctuation Verse* — macroscopic and microscopic fluctuations  
- 🧩 *Density Matrix — The Hidden Spectrum* — density of states shaping material properties  

---

## ⚙️ Technologies Used

| Stack | Description |
|-------|--------------|
| **React + Vite** | SPA structure with instant HMR and modular architecture |
| **Three.js (WebGL)** | 3D engine for real-time particle and field simulations |
| **Leva** | Intuitive GUI controllers for dynamic simulation parameters |
| **ECharts / D3 (optional)** | For visual analytics of distributions & trends |
| **CSS / Tailwind / Inline Styles** | Responsive, minimalistic, dark UI optimized for mobile |
| **JavaScript (ES Modules)** | Core logic for physics, randomization, and discretization |

---

## 🧠 Scientific Core

Discreto applies **statistical mechanics** and **advanced mathematical discretization** to model:
- Distributions (Maxwell–Boltzmann, Fermi–Dirac, Bose–Einstein)  
- Energy quantization and population dynamics  
- Thermal diffusion and relaxation (heat transfer between systems)  
- Density of states and correlation effects  
- Stochastic fluctuations and entropy-based processes  

All simulations are **computed locally** — no server load, no backend computation.  
Everything runs efficiently **in the browser GPU** via WebGL.

---

## 🧪 Tests & Metrics

- ✅ GPU-safe simulation caps to prevent overload  
- ✅ Stable energy conservation within numerical tolerance  
- ✅ Adaptive timestep to ensure smooth frame rate  
- ✅ Dynamic particle counts and velocity scaling  
- ✅ Responsiveness verified for mobile & desktop  

---

## 🧰 Build & Run

```bash
# clone the repo
git clone git@github.com:VladAndreiToma/Discreto-eLearning-Statistics-App.git
cd Discreto-eLearning-Statistics-App

# install dependencies
npm install

# run locally
npm run dev

# build for production
npm run build
