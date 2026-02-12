# BALLISTiQ Landing Page

## Overview
Professional single-page landing website for BALLISTiQ - a ballistic calculator and ammo database app. Defense-tech styled, mobile-first design with light/dark theme support and multi-language translations (EN/FR/IT/ES).

## Tech Stack
- React + Vite + TypeScript
- TailwindCSS with custom light/dark theme using CSS variables
- Express backend (minimal, serves static content)
- Google Font: Jura

## Project Structure
- `client/src/App.tsx` - Main app component with ThemeProvider and I18nProvider
- `client/src/components/` - All section components (Navbar, Hero, Features, Pricing, B2B, Reviews, Team, Contact, Footer, Logo)
- `client/src/hooks/use-theme.ts` - ThemeProvider with dark/light toggle, persists to localStorage
- `client/src/hooks/use-i18n.ts` - I18n system with all translations for EN/FR/IT/ES
- `client/src/data/siteContent.ts` - Non-translatable data (reviews, team members, social links)
- `attached_assets/` - Source images (team photos, product images, backgrounds)

## Color Palette (CSS Variables)
- Background: HSL 220 15% 5% (dark) / HSL 220 15% 97% (light)
- Primary accent: HSL 188 100% 35% (teal/cyan) - used via `text-primary`, `bg-primary`
- CTA green: #13CE66 (hero badge pulse)
- Cards: slightly elevated from background
- All colors use semantic tokens (text-foreground, text-muted-foreground, bg-card, etc.)

## Key Design Decisions
- Single-page with smooth scroll navigation
- Light/dark mode toggle persists to localStorage, defaults to dark
- Multi-language support (EN, FR, IT, ES) with language switcher in navbar
- Hero section always uses dark wash over background image regardless of theme
- No database needed (static landing page)
- Contact form uses mailto: (no backend form processing)
- Images imported via @assets alias from attached_assets/
- All components use semantic Tailwind color tokens for theme compatibility

## Running
- `npm run dev` starts the dev server on port 5000