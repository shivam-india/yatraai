# YATRA AI — Full-Stack AI Mobility + Local Discovery Platform

> **"Turn every journey into an experience."**

YATRA AI combines **public transportation + AI journey planning + local tourism + local businesses + real-time discovery**.

Rather than treating public transportation merely as A-to-B transit, YATRA AI dynamically weaves in historical sights, culinary gems, cultural stops, and local artisans along the route within the traveler's exact budget, walking tolerance, and time constraints.

---

## 🌟 Key Differentiators

### 1. Smart Detour Engine
- Discovers meaningful places **along the traveler's journey** (e.g. "+14 min travel time, 40 min visit, ₹50 entry, Explore Value: 91").
- **1-Click Dynamic Recalculation**: Adding or removing a detour instantly recalibrates route waypoints, timeline timestamps, dwell times, and total budget.
- **Transparent Explore Value (0-100)**: Calculated algorithmically from:
  - Interest Match (35%)
  - Rating & Review Depth (25%)
  - Time Efficiency & Route Deviation (20%)
  - Budget Compatibility (10%)
  - Cultural Uniqueness & Local Artisan Value (10%)

### 2. Waiting-Time Exploration
- Detects transit delays (e.g. bus delayed by 38 minutes).
- Calculates a guaranteed safe exploration window:
  $$\text{Safe Window} = \text{Delay Duration} - 2 \times \text{Walk Time} - \text{10 min Safety Buffer}$$
- Never recommends anything that could realistically cause the user to miss their departure.

### 3. Explore Along My Route
- Interactive corridor map with categorized filters: Food & Dhabas, History & Forts, Culture & Art, Nature & Lakes, Bazaars & Crafts, Artisans & Guilds, Hidden Gems.

### 4. Multi-Agent AI Orchestration
Modular agent architecture powered by **Google Gemini**:
- **Transport Agent**: Public transit schedules, bus frequencies, and connections.
- **Discovery Agent**: Corridor scanning for hidden sights.
- **Local Experience Agent**: Dhaba specialties, food trails, and artisan workshops.
- **Culture & History Agent**: Authentic stories and monument significance.
- **Local Business Agent**: Independent family enterprises and craft guilds.
- **Safety & Timing Agent**: Strict schedule enforcement and walking buffers.
- **Journey Planning Agent**: Master itinerary synthesis.

### 5. SerpApi Discovery Integration
Dedicated decoupled service layer:
- `services/serpapi/client.ts`: Typed, secure client reading `SERPAPI_API_KEY`.
- `services/serpapi/places.ts`: Google Maps engine place search & normalization.
- `services/serpapi/maps.ts`: Navigation URLs and route geometry.
- `services/serpapi/reviews.ts`: Review sentiment and trust signals.
- `services/serpapi/search.ts`: Cultural stories and web discovery.
- **Abstract Interface**: `PlacesProvider` implemented by `SerpApiPlacesProvider` and `DemoPlacesProvider`.

### 6. Demo Mode (`DEMO_MODE=true`)
- Ready out-of-the-box even before API keys are added.
- Authentic high-fidelity Northern India corridor data (Ambala ↔ Chandigarh, Delhi ↔ Jaipur, Punjab & Haryana highway corridors).
- Real geographic coordinates, ratings, opening hours, local artisan stories, and dish recommendations.
- Clear trust tags: `Verified Place`, `Community Reported`, `Pending Review`, `AI Suggested`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server & Client Components)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, custom warm saffron/terracotta palette, soft shadows, 16-24px radius
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS transitions
- **Interactive Map**: Leaflet with CartoDB Positron minimalist tiles (SSR-safe, Apple-Maps aesthetic)
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Discovery Layer**: SerpApi (`google_maps`, `google_maps_reviews`)
- **Database & Auth**: Supabase PostgreSQL + Row Level Security, with browser local storage sync fallback

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your keys in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key

# SerpApi API Key
SERPAPI_API_KEY=your-serpapi-key

# Demo Mode (default: true)
DEMO_MODE=true
```

> **Note on SerpApi & Gemini Keys:**
> The application will run smoothly in Demo Mode (`DEMO_MODE=true`) without any keys. Once you provide your `SERPAPI_API_KEY` and `GEMINI_API_KEY`, simply change `DEMO_MODE=false` to switch to live Google Maps search and live Gemini 1.5 Flash generation.

### 3. Database Setup (Supabase)
Run the migration script located at `supabase/schema.sql` in your Supabase SQL Editor to initialize:
- `profiles`, `user_preferences`, `places`, `place_reviews`, `local_businesses`, `journeys`, `journey_stops`, `transport_routes`, `transport_updates`, `saved_places`, `saved_journeys`, `community_submissions`.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Application Routes

- `/` — Clean hero with natural-language prompt input and quick scenario chips.
- `/journey` — 65% Interactive Map + 35% Journey Timeline on desktop; full-width map + expandable bottom sheet on mobile.
- `/planner` — Structured trip designer with origin/destination, time slider, budget, transit mode, and interest filters.
- `/explore` — Search and filter places along routes (Food, History, Culture, Nature, Bazaars, Artisans).
- `/saved` — Saved itineraries and bookmarked places with reopen, duplicate, and delete actions.
- `/community` — Verified community gem feed and submission modal with review statuses (`pending`, `approved`).
- `/profile` — Personalization settings: walking tolerance, transport preferences, diet, budget tier.

---

## 🔒 Security & Best Practices

- All private API keys (`GEMINI_API_KEY`, `SERPAPI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept strictly server-side in API routes and never exposed to the client bundle.
- Inputs are validated via `zod`.
- No raw third-party payloads leak to the client; all results are normalized into the internal `Place` model.
- Strict departure buffers prevent recommending detours that cause travelers to miss transportation.

