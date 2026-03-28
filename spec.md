# MijnBeleggerspagina

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Personal investor dashboard with stock watchlist (user can select/add/remove stocks to follow)
- Stock price data fetched via HTTP outcalls from Yahoo Finance or similar free API
- Financial news feed per stock via HTTP outcalls
- Ability to write, publish and share news/insight articles (written by user / AI-assisted)
- Login/auth so data is personal per user
- Market summary (major indices)
- Portfolio overview section
- Published insights list

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - User watchlist: store list of stock symbols per user
   - Articles/insights: create, read, list articles with title, body, author, timestamp
   - HTTP outcalls: fetch stock quotes and news from external APIs (Yahoo Finance / Finnhub free tier)
   - Authorization for personal data
2. Frontend:
   - Dashboard layout: sidebar, header, 3-column grid
   - Watchlist management: search stocks, add/remove
   - Stock price cards with sparkline
   - News feed per watchlist stocks
   - Market summary (S&P, NASDAQ, DJI, BTC)
   - Write/edit article page with rich text
   - Published insights list
   - Dark fintech theme matching design preview
