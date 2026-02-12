# BALLISTiQ Landing Page

## Overview
Professional single-page landing website for BALLISTiQ - a ballistic calculator and ammo database app. Dark-themed, mobile-first, defense-tech style.

## Tech Stack
- React + Vite + TypeScript
- TailwindCSS with custom dark theme
- Express backend (minimal, serves static content)
- Google Font: Jura

## Project Structure
- `client/src/App.tsx` - Main app component, assembles all sections
- `client/src/components/` - All section components (Navbar, Hero, Features, Pricing, B2B, Reviews, Team, Contact, Footer, Logo)
- `client/src/data/siteContent.ts` - All editable content data (features, pricing, reviews, team, social links)
- `attached_assets/` - Source images (team photos, product images, backgrounds)

## Color Palette
- Background: dark (HSL 220 15% 5%)
- Primary accent: rgb(0, 151, 178) - teal/cyan
- CTA green: #13CE66
- Cards: slightly lighter than background
- Text: white with opacity variants for hierarchy

## Key Design Decisions
- Single-page with smooth scroll navigation
- No database needed (static landing page)
- Contact form uses mailto: (no backend form processing)
- Images imported via @assets alias from attached_assets/
- Dark theme only (no light/dark toggle)

## Running
- `npm run dev` starts the dev server on port 5000
