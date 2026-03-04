# Rally MVP — Group Trip Commitment Engine

## What This Is
A 5-screen web app that solves group trip coordination by combining commitment deposits with AI-powered itinerary generation and group voting.

## The Flow
1. **Create Trip** → One person sets destination, dates, budget, deposit amount
2. **Join + Commit** → Friends open share link, pay deposit via Stripe
3. **Preferences** → Each member submits travel preferences (async, with deadline)
4. **AI Options** → Claude generates 2-3 itinerary options from everyone's input
5. **Vote + Lock** → Group votes, majority wins, trip is confirmed

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Payments**: Stripe Checkout (deposits)
- **AI**: Anthropic Claude API (itinerary generation)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Project Structure
```
rally-mvp/
├── app/
│   ├── layout.tsx              # Root layout with fonts + providers
│   ├── page.tsx                # Home/redirect
│   ├── create/
│   │   └── page.tsx            # Screen 1: Create a trip
│   ├── trip/
│   │   └── [id]/
│   │       ├── page.tsx        # Screen 2: Join + pay deposit
│   │       ├── preferences/
│   │       │   └── page.tsx    # Screen 3: Submit preferences
│   │       ├── options/
│   │       │   └── page.tsx    # Screen 4: AI-generated options
│   │       └── vote/
│   │           └── page.tsx    # Screen 5: Vote + lock
│   └── api/
│       ├── create-trip/
│       │   └── route.ts        # POST: create trip in Supabase
│       ├── checkout/
│       │   └── route.ts        # POST: create Stripe Checkout session
│       ├── webhook/
│       │   └── route.ts        # POST: Stripe webhook → confirm member
│       ├── preferences/
│       │   └── route.ts        # POST: save member preferences
│       ├── generate-options/
│       │   └── route.ts        # POST: call Claude API → itinerary options
│       └── vote/
│           └── route.ts        # POST: cast vote, check majority
├── lib/
│   ├── supabase.ts             # Supabase client init
│   ├── stripe.ts               # Stripe client init
│   └── types.ts                # TypeScript types
├── components/
│   ├── TripCard.tsx            # Trip summary display
│   ├── MemberList.tsx          # Shows committed members
│   ├── PreferenceForm.tsx      # Travel preference inputs
│   ├── OptionCard.tsx          # Single itinerary option display
│   └── VoteButton.tsx          # Vote interaction
├── supabase/
│   └── schema.sql              # Database schema (run this first)
├── .env.local.example          # Environment variables template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Setup Instructions

### 1. Create Supabase Project
- Go to supabase.com → New Project
- Copy your project URL and anon key
- Go to SQL Editor → paste contents of `supabase/schema.sql` → Run

### 2. Create Stripe Account
- Go to stripe.com → Create account
- Get your test API keys from Dashboard → Developers → API keys
- Set up a webhook endpoint pointing to your-domain.com/api/webhook
  - Listen for: `checkout.session.completed`

### 3. Get Anthropic API Key
- Go to console.anthropic.com
- Create an API key

### 4. Environment Variables
```bash
cp .env.local.example .env.local
# Fill in all values
```

### 5. Install & Run
```bash
npm install
npm run dev
```

## 7-Day Build Plan (2-3 hrs/day)

### Day 1: Foundation
- [ ] Run `npx create-next-app@latest rally-mvp` with TypeScript + Tailwind + App Router
- [ ] Set up Supabase project, run schema.sql
- [ ] Create lib/supabase.ts and lib/stripe.ts
- [ ] Create lib/types.ts
- [ ] Test database connection

**Claude Code prompt for Day 1:**
> "Set up a Next.js 14 project with App Router, TypeScript, and Tailwind. Create a Supabase client in lib/supabase.ts using @supabase/supabase-js. Create a Stripe client in lib/stripe.ts. Define TypeScript types in lib/types.ts matching this schema: [paste schema.sql]. Make a simple test page that reads from Supabase to verify the connection works."

### Day 2: Create + Join
- [ ] Build Screen 1: Create Trip form
- [ ] Build API route: POST /api/create-trip
- [ ] Build Screen 2: Trip join page (public, shareable link)
- [ ] Display trip details + committed members list

**Claude Code prompt for Day 2:**
> "Build the Create Trip page at app/create/page.tsx with a form for: trip name, destination, date range (start/end), budget per person, and deposit amount. On submit, POST to /api/create-trip which inserts into Supabase and redirects to /trip/[id]. Then build the trip join page at app/trip/[id]/page.tsx that fetches trip details and shows committed members. Style with Tailwind, white/black/blue color scheme matching our landing page."

### Day 3: Stripe Deposits
- [ ] Build API route: POST /api/checkout (creates Stripe Checkout session)
- [ ] Build API route: POST /api/webhook (handles payment confirmation)
- [ ] Add "Commit & Pay" button to join page
- [ ] On payment success, insert member into Supabase

**Claude Code prompt for Day 3:**
> "Add Stripe Checkout to the trip join page. When someone clicks 'Commit & Pay $[deposit]', POST to /api/checkout with trip_id, member email, and name. Create a Stripe Checkout session with the deposit amount and redirect to Stripe. Build the webhook at /api/webhook that listens for checkout.session.completed, extracts trip_id and member info from metadata, and inserts a new row into the members table in Supabase with status='committed'. After payment, redirect back to /trip/[id] showing them as committed."

### Day 4: Preferences
- [ ] Build Screen 3: Preference form
- [ ] Build API route: POST /api/preferences
- [ ] Show preference deadline countdown
- [ ] Show completion status (3/5 submitted, etc.)

**Claude Code prompt for Day 4:**
> "Build the preferences page at app/trip/[id]/preferences/page.tsx. Show a form with: budget_flexibility (strict/flexible/whatever), accommodation_style (hostel/airbnb/hotel), activity_interests (multi-select: food, nightlife, outdoors, culture, relaxation, adventure), pace (packed/balanced/chill), and any hard_nos (free text). POST to /api/preferences which saves to Supabase. Show a progress bar of how many members have submitted. Add the preference deadline from the trip."

### Day 5: AI Itinerary Generation
- [ ] Build API route: POST /api/generate-options
- [ ] Aggregate all member preferences
- [ ] Call Claude API with structured prompt
- [ ] Parse response into 2-3 options
- [ ] Build Screen 4: Display options

**Claude Code prompt for Day 5:**
> "Build the AI options page at app/trip/[id]/options/page.tsx. Create /api/generate-options that fetches all member preferences for the trip from Supabase, then calls the Anthropic Claude API with a prompt that includes: destination, dates, budget range, all member preferences aggregated. Ask Claude to return exactly 3 itinerary options as JSON, each with: option_name, description, accommodation, daily_activities array, estimated_cost_per_person, and why_this_works. Parse the JSON response, save options to Supabase, and display them as cards on the options page."

### Day 6: Voting + Lock
- [ ] Build Screen 5: Vote UI
- [ ] Build API route: POST /api/vote
- [ ] Add majority detection logic
- [ ] Show results in real-time
- [ ] Lock trip when majority reached

**Claude Code prompt for Day 6:**
> "Build the vote page at app/trip/[id]/vote/page.tsx. Display the 3 itinerary options as cards with a 'Vote for this' button on each. POST to /api/vote with trip_id, member_id, and option_id. After each vote, check if any option has majority (>50% of committed members). If yes, update trip status to 'locked' and set the winning option. Show vote counts in real-time. When locked, show a confirmation screen: 'Your trip is locked! [Destination] on [Dates]' with the winning itinerary details."

### Day 7: Polish + Deploy
- [ ] Test full flow end-to-end
- [ ] Add loading states and error handling
- [ ] Mobile responsive pass
- [ ] Deploy to Vercel
- [ ] Connect custom domain

**Claude Code prompt for Day 7:**
> "Review the entire Rally app for bugs, missing error handling, and mobile responsiveness. Add loading spinners for all async operations. Add error toasts for failed API calls. Make sure all pages look good on mobile (375px width). Add a simple navigation header with the Rally logo. Test the full flow: create trip → share link → pay deposit → fill preferences → generate options → vote → lock."

## Design System (matches landing page)
- **Fonts**: Instrument Serif (headings), Satoshi (body)
- **Colors**: White (#FFFFFF), Black (#08080A), Blue (#2563EB), Off-white (#F8F9FB)
- **Border radius**: 14-16px for cards, 100px for buttons/badges
- **Shadows**: Subtle, 0 4px 16px rgba(0,0,0,0.06)
