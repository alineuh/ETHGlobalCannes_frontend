# Audithor — AI-Powered Smart Contract Security Scanner

> **ETHGlobal Cannes 2026** · Hedera + Chainlink + Uniswap

Audithor is the first real-time smart contract security audit platform with **per-second payment streaming** and **confidential report delivery**. AI agents scan your Solidity code for vulnerabilities while you pay only for the exact seconds of compute used — from $0.01 per scan.

---

## Demo

**Landing page** → click **Launch an Analysis** → select an AI agent → paste your contract or enter an on-chain address → **⚡ Launch Analysis**

The dashboard shows:
- Live vulnerability findings appearing in real time
- Nanopayment stream ticking per second at the bottom
- Severity filter by clicking CRITICAL / HIGH / MEDIUM / LOW cards
- Automatic refund of unused deposit at scan completion

---

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Blockchain** | Hedera HCS + HTS | Immutable audit proof + nanopayments |
| **Privacy** | Chainlink Confidential HTTP | Encrypted report delivery via TEE |
| **Payments** | Uniswap API | Multi-token payment routing |
| **Identity** | World ID | Human-backed agent verification |
| **Frontend** | React + Vite + TypeScript | Dashboard |
| **Styling** | Tailwind CSS + inline styles | Dark navy theme |
| **Web3** | viem | EVM interactions |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install & Run

```bash
# Clone the repo
git clone git@github.com:alineuh/ETHGlobalCannes_frontend.git
cd ETHGlobalCannes_frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at `http://localhost:5173`

### Build for production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── App.tsx                    # Main dashboard + demo logic
├── LandingPage.tsx            # Landing page with CTA
├── types.ts                   # TypeScript types
├── hooks/
│   └── useCoordinator.ts      # WebSocket coordinator hook
├── components/
│   ├── AudithorLogo.tsx       # SVG shield + hammer logo
│   ├── ClickSpark.tsx         # Click spark animation
│   ├── NanoCounter.tsx        # Animated USDC counter
│   ├── RippleGrid.tsx         # WebGL ripple background
│   ├── MagicBento.tsx         # Bento card with glow effect
│   └── ContractInput.tsx      # Code / address input tabs
└── index.css                  # Global styles + animations
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              AUDITHOR FRONTEND              │
│                                             │
│  Landing Page ──→ Dashboard                 │
│                                             │
│  LEFT COLUMN          RIGHT COLUMN          │
│  ┌─────────────┐      ┌─────────────┐       │
│  │ Agent Select│      │ Severity    │       │
│  │ Code Input  │      │ Stat Cards  │       │
│  │ Launch Btn  │      │ Findings    │       │
│  └─────────────┘      │ List        │       │
│                       └─────────────┘       │
│                                             │
│  BOTTOM BAR: Payment Stream + Nano TXs      │
└─────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   Coordinator WS        Hedera HCS
   (localhost:3001)      (audit proof)
```

### Payment Flow

```
User deposits USDC
      │
      ▼
Stream opens on Hedera
      │
      ▼  (every second)
EIP-3009 signature → Coordinator
      │
      ▼
Agent IA analyses code
      │
      ▼
Finding detected → onchain event
      │
      ▼
Chainlink Confidential HTTP → Report delivered
      │
      ▼
Unused deposit refunded automatically
```

---

## AI Agent Tiers

| Agent | Model | Rate | Best for |
|-------|-------|------|---------|
| **Basic** | GPT-4o mini | $0.00005/s | MVPs, frequent scans |
| **Pro** ⭐ | Claude Sonnet | $0.00015/s | Active protocols |
| **Enterprise** | Claude Opus | $0.00040/s | DeFi with $1M+ TVL |

**Pricing formula:** `cost = (duration × agent_rate) + criticality_bonuses`

| Severity | Bonus |
|----------|-------|
| CRITICAL | +$0.05 |
| HIGH | +$0.02 |
| MEDIUM | +$0.005 |
| LOW | +$0.001 |

---

## Demo Mode

The frontend includes a **built-in demo mode** that works without any backend. It simulates:
- 6 pre-written vulnerability findings against the `VulnerableVault` sample contract
- Real-time nanopayment stream ticking every second
- Automatic refund calculation at scan completion

To use demo mode: simply open the app without starting the coordinator backend.

---

## Environment Variables

Create a `.env` file at the root:

```env
# Coordinator backend
VITE_COORDINATOR_URL=ws://localhost:3001

# Hedera testnet
VITE_HEDERA_NETWORK=testnet

# Optional: World ID
VITE_WORLD_APP_ID=app_...
```

---

## Sponsors & Prize Tracks

| Sponsor | Track | Prize |
|---------|-------|-------|
| **Hedera** | Tokenization + No Solidity | $2,500 |
| **Chainlink** | Confidential HTTP | $2,000 |
| **Uniswap** | Best API Integration | $5,000 |

**Total targeted: $9,500**

---

## Team

Built at **ETHGlobal Cannes 2026** — April 3-5, 2026

---

## License

MIT
