# Project memory

## Product intent & audience

- Agricultural crop rotation analysis tool that uses NASA satellite climate data
- Users select a geographic region and click "Analyze Rotations" to get rotation recommendations
- Audience: farmers, agronomists, or agricultural planners needing climate-informed rotation insights

## Brand personality & voice

- Practical, data-driven, user-facing product that surfaces real satellite data
- Error states are transparent (e.g., explicitly names NASA POWER API and HTTP status)

## Visual design & UX direction

- Map-based region selection UI (inferred from "selected region" and geographic data flow)
- Action button labeled "Analyze Rotations" triggers the primary workflow
- Tailwind CSS styling with React components; Lucide React icons for UI elements
- Production-quality design expected (per global prompt)

## Decisions, constraints & rationale

- NASA POWER API is the data source for climate/satellite data
- Correct precipitation parameter is `PRECTOTCORR` (not `PRECTOTSCORR` — the typo caused 422 errors)
- Monthly time-series endpoint used as primary: `/api/temporal/monthly/point`
- Climatology endpoint used as fallback: returns 20-year climate normals (2001–2020)
- Fallback strategy: if monthly endpoint fails for any reason, automatically fall back to climatology API for resilience
- Framework: Vite + React; path alias `@/` maps to `src/`
- No extra UI packages beyond what the template provides (Tailwind, Lucide React, React hooks)

## Open questions & assumptions

- Exact UI layout and component structure unknown (map provider, dashboard format)
- Which climate parameters besides precipitation are used for rotation analysis
- How rotation recommendations are computed from climate data
- Whether the climatology fallback format is fully normalized to match monthly format