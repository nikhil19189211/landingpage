# Her First Income — High-Converting Landing Page & Funnel

A mobile-first, performance-optimized, single-page landing page and post-purchase upgrade funnel built for direct-response paid traffic from Meta ads.

Positioned with warm, honest, and realistic guidance for choosing and starting an independent at-home income stream.

---

## Table of Contents
1. [Full File Tree](#full-file-tree)
2. [Master Offer Configuration (`/config/offer.ts`)](#master-offer-configuration)
3. [Funnel Flow & Post-Purchase Mechanics](#funnel-flow--post-purchase-mechanics)
4. [Pages Architecture](#pages-architecture)
5. [Cloudflare Pages Functions (`/api/*`)](#cloudflare-pages-functions)
6. [Meta Pixel & Conversions API (CAPI) Tracking](#meta-tracking--audiences)
7. [Environment Variables](#environment-variables)
8. [Cloudflare Pages Deployment & Custom Domain](#cloudflare-pages-deployment)
9. [Pre-Launch Checklist](#pre-launch-checklist)

---

## Full File Tree

```
landingpage/
├── config/
│   └── offer.ts                      # Master offer config: tiers, prices, links, toggles
├── functions/
│   └── api/
│       ├── _crypto.ts                # Web Crypto HMAC-SHA256 signing & verification helper
│       ├── capi.ts                   # Meta Conversions API (CAPI) proxy endpoint
│       ├── starter-success.ts        # Starter post-purchase redirect (sets signed cookie -> /upgrade)
│       └── verify-upgrade.ts         # Upgrade gating verifier & countdown timer calculator
├── public/
│   ├── fonts/
│   │   └── playfair-display.woff2    # Self-hosted serif display font (12 KB, zero Google font calls)
│   ├── tracker.js                    # Dual Meta Pixel + CAPI client tracking engine
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AnnouncementBar.astro     # Slim top bar: instant access + 30-day guarantee
│   │   ├── ComparisonTable.astro     # 11-item desktop table & mobile stacked card views
│   │   ├── CookieBanner.astro        # UK / EU / CA / AU compliant cookie consent banner
│   │   ├── FAQAccordion.astro        # 8-question native HTML details/summary accordion
│   │   ├── FinalCTA.astro            # Compact closing section with both tier cards
│   │   ├── Footer.astro              # Legal footer with FTC & Meta disclaimers + links
│   │   ├── GuaranteeBox.astro        # Plain-language 30-day money-back guarantee box
│   │   ├── Hero.astro                # Hero section with 3 A/B headlines (?v=1|2|3) + trust bullets
│   │   ├── MockupGraphic.astro       # Realistic digital PDF tablet & phone CSS/SVG mockup
│   │   ├── PathsSection.astro        # 5 path cards with one-line benefits
│   │   ├── PricingCards.astro        # Reusable Starter & Complete cards (mobile complete-first)
│   │   ├── ProblemSection.astro      # Compliant general observations (no "Are you...?" statements)
│   │   ├── SolutionSection.astro     # The philosophy of Her First Income & "Pick One" principle
│   │   ├── StickyMobileCTA.astro     # Sticky mobile bar past hero linking to #pricing
│   │   ├── Testimonials.astro        # Placeholder component (hidden if no real reviews)
│   │   ├── VaultSpotlight.astro      # 145 templates spotlight (~$0.19 each breakdown)
│   │   ├── WalletIcons.astro         # Apple Pay, Google Pay, PayPal, Visa/Mastercard SVG icons
│   │   └── WhoItsFor.astro           # Grounded who it's for / who it's not for expectations
│   ├── layouts/
│   │   ├── BaseLayout.astro          # Landing & legal layout (header bar, footer, sticky mobile bar)
│   │   └── FunnelLayout.astro        # Distraction-free funnel layout (no nav links, legal footer only)
│   ├── pages/
│   │   ├── index.astro               # High-converting mobile-first landing page
│   │   ├── upgrade.astro             # /upgrade: Post-purchase $30 upgrade offer for Starter buyers
│   │   ├── downsell.astro            # /downsell: $12 Execution Guide + 30-Day Roadmap offer
│   │   ├── thank-you.astro           # /thank-you: Starter & downsell order confirmation
│   │   ├── thank-you-complete.astro  # /thank-you-complete: Complete tier order confirmation
│   │   ├── privacy.astro             # /privacy: International GDPR/CCPA/PIPEDA privacy policy
│   │   ├── terms.astro               # /terms: Single-user digital product terms of service
│   │   └── refund.astro              # /refund: Plain-language 30-day refund policy instructions
│   └── styles/
│       └── global.css                # Brand design tokens: Ivory, muted sage, warm taupe, terracotta
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

---

## Master Offer Configuration

All pricing, estimated values, links, and switches live in `/config/offer.ts`:

```typescript
export const offerConfig = {
  checkoutProvider: 'lemonsqueezy', // 'lemonsqueezy' | 'gumroad' | 'thrivecart'
  upgradeOfferWindowHours: 24,       // Cookie expiry window
  tierOrderMobile: 'complete-first', // Shows Complete card first on mobile
  defaultHeadlineVariant: 'v1',      // Switchable via ?v=1 | ?v=2 | ?v=3
  showTestimonials: false,           // Set to true only once real customer reviews exist
  orderBump: { enabled: false },     // OFF by default
  ...
}
```

### Offer Tiers
| Tier | Price | Est. Value | Core Assets Included |
| :--- | :--- | :--- | :--- |
| **Starter** | **$27** | **$120** | 5 Honest Ways Guide (16 pp), 145 Template Vault, Zero-Dollar Tech Stack (12 pp), Confidence & Mindset Guide (12 pp), 90-Min Launch Blueprint (10 pp), First Dollar Checklist (8 pp). |
| **Complete** | **$57** | **$275** | Everything in Starter PLUS: Step-by-Step Execution Guide (38 pp), 30-Day Momentum Roadmap (13 pp), 9 Essential Pitch Templates (21 pp), Side Hustle Video Library (13 pp, 21 videos), AI Prompt Pack (25 pp, 60+ prompts). |
| **Upgrade** | **+$30** | **$155** | The 5 Complete extras for Starter buyers ($27 + $30 = $57 total paid). |
| **Downsell** | **+$12** | **$78** | Execution Guide (38 pp, $49) + 30-Day Momentum Roadmap (13 pp, $29). |

---

## Funnel Flow & Post-Purchase Mechanics

```
               [ Cold Meta Ad Traffic ]
                          │
                          ▼
            [ Landing Page: / (A/B ?v=1|2|3) ]
             /                             \
    (Buys Complete: $57)          (Buys Starter: $27)
           │                               │
           ▼                               ▼
  [/thank-you-complete]        Redirects to: [/api/starter-success]
                                           │
                                (Sets HMAC signed cookie:
                                 hfi_upgrade_token for 24h)
                                           │
                                           ▼
                                    [/upgrade ($30)]
                                     /             \
                           (Accepts: $30)       (Declines)
                                 │                   │
                                 ▼                   ▼
                       [/thank-you-complete]    [/downsell ($12)]
                                                 /             \
                                       (Accepts: $12)       (Declines)
                                             │                   │
                                             ▼                   ▼
                                       [/thank-you]         [/thank-you]
```

### Hosted Checkout Integration Notes
- **Lemon Squeezy & Gumroad**: Do not support native 1-click tokenized upsells on hosted checkouts. The upgrade and downsell route to dedicated checkouts. Customer email is automatically carried through in query parameters (`?checkout[email]=...` or `?email=...`) so the buyer never has to re-type their email.
- **ThriveCart**: Supports native 1-click upsell redirects. Set `checkoutProvider: 'thrivecart'` in `/config/offer.ts` and paste your ThriveCart upsell URL into `upgrade.checkoutUrl`.

---

## Pages Architecture

| Route | Purpose | Navigation |
| :--- | :--- | :--- |
| `/` | Single-page landing page (Hero, Problem, Solution, Paths, Pricing, Comparison, Vault, Who It's For, Guarantee, FAQ, Final CTA) | Full announcement bar, sticky mobile bar, legal footer |
| `/upgrade` | Post-purchase upgrade ($30) for Starter buyers. Gated by signed cookie. | Distraction-free: brand title + legal footer only |
| `/downsell` | Post-purchase downsell ($12) if upgrade is declined. Gated by signed cookie. | Distraction-free: brand title + legal footer only |
| `/thank-you` | Order fulfillment for Starter / Downsell. Delivery instructions, spam notice, support email. | Fulfillment only, zero upselling |
| `/thank-you-complete`| Order fulfillment for Complete / Upgraded buyers. 11-part inventory, first steps guide. | Fulfillment only, zero upselling |
| `/privacy` | International privacy policy (UK GDPR, EU GDPR, PIPEDA, Australian Privacy Act). | Base layout |
| `/terms` | Single-user digital license, intellectual property, disclaimer. | Base layout |
| `/refund` | Plain-language 30-day money-back guarantee instructions. | Base layout |

---

## Cloudflare Pages Functions

Cloudflare Pages natively compiles files in `/functions/api/` as high-performance edge Workers running on Web Crypto and standard Web Fetch:

1. **`functions/api/capi.ts`**:
   - Receives events via POST from `/tracker.js`.
   - Hashes user information with SHA-256 via Web Crypto (`crypto.subtle.digest`).
   - Forwards directly to Meta Conversions API (`https://graph.facebook.com/v19.0/{PIXEL_ID}/events`).
   - Deduplicates with browser Pixel via matching `event_id`.

2. **`functions/api/starter-success.ts`**:
   - Set as the post-purchase redirect URL in your Starter checkout settings.
   - Signs an HMAC-SHA256 token payload `{ issuedAt, expiresAt, starterProductId }` using `COOKIE_SIGNING_KEY`.
   - Sets secure `HttpOnly` cookie `hfi_upgrade_token` valid for `upgradeOfferWindowHours` (24h).
   - Redirects (302) to `/upgrade`.

3. **`functions/api/verify-upgrade.ts`**:
   - Validates the HMAC signature and timestamp of `hfi_upgrade_token`.
   - Returns `{ valid: boolean, remainingSeconds: number }` to drive the countdown timer on `/upgrade` and `/downsell`.
   - Unauthorized visits without a valid cookie are redirected back to `/`.

---

## Meta Tracking & Audiences

### Dual-Fired Deduplicated Events
All events fire both on the client via Meta Pixel and on the server via Cloudflare Pages Function CAPI with an identical `event_id`:

- `PageView`: Fired when cookie consent is granted.
- `ViewContent`: Fired on landing page view.
- `InitiateCheckout`: Fired on checkout button click (parameters: `content_name: 'starter' | 'complete' | 'upgrade' | 'downsell'`, `value`, `currency: 'USD'`).
- `Purchase`: Fired on `/thank-you` ($27) and `/thank-you-complete` ($57).
- `UpgradeViewed`: Custom event fired on `/upgrade` and `/downsell`.
- `UpgradeAccepted`: Custom event fired when buyer clicks the upgrade checkout CTA.

### Parameter Preservation & A/B Tracking
- UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) and `fbclid` are captured from the entry URL into `sessionStorage` and automatically appended to outgoing checkout links.
- `headlineVariant` (`v1`, `v2`, `v3`) is captured and sent with every single tracking event.

### Required Meta Audiences to Create in Ads Manager:
1. **Audience 1 — Starter Buyers Not Upgraded** (Target with follow-up upgrade creative):
   - Include: People who triggered `Purchase` with `content_name = starter`.
   - Exclude: People who triggered `Purchase` with `content_name = complete` OR custom event `UpgradeAccepted`.
2. **Audience 2 — Complete Buyers (Global Exclusion)**:
   - Include: People who triggered `Purchase` with `content_name = complete` OR `content_name = upgrade`.
   - Use: Exclude from ALL top-of-funnel acquisition ad sets.
3. **Audience 3 — Landing Page Visitors Who Did Not Purchase** (Retargeting):
   - Include: People who triggered `ViewContent` or `PageView` in the last 14 days.
   - Exclude: People who triggered `Purchase` (any tier).

---

## Email Follow-Up Copy

Located in `/emails/`:
- **`01-delivery-starter.txt`**: Sent immediately after purchase. Direct download links, "where to start first" reading guide, support contact, and one gentle note about the Complete upgrade.
- **`02-day-1-follow-up.txt`**: "Which path stood out to you yesterday?" Normalizes busy schedules, reinforces picking ONE path, and presents the $30 upgrade credit for day-by-day instructions.
- **`03-day-3-final-reminder.txt`**: Honest, non-hype closing reminder. Clear criteria for when to stay with Starter vs when to upgrade to Complete.

---

## Environment Variables

Configure these in the **Cloudflare Pages Dashboard** under **Settings > Environment variables**:

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `META_PIXEL_ID` | Your Meta Pixel ID from Events Manager | `987654321098765` |
| `META_CAPI_TOKEN` | Meta Conversions API System User Access Token | `EAAB...` |
| `COOKIE_SIGNING_KEY` | High-entropy secret key for HMAC-SHA256 cookie signing | `a98f7e2c5d...64chars` |
| `UPGRADE_WINDOW_HOURS` | Number of hours the $30 upgrade offer cookie remains valid | `24` |
| `META_TEST_EVENT_CODE` | *(Optional)* Test event code from Meta Test Events tab for debugging | `TEST12345` |

---

## Cloudflare Pages Deployment

### 1. Build & Local Testing
```bash
# Install dependencies
npm install

# Test build locally
npm run build

# Preview build locally
npm run preview
```

### 2. Connect to Cloudflare Pages
1. Push this repository to GitHub or GitLab.
2. In the Cloudflare Dashboard, navigate to **Compute (Workers) > Pages > Connect to Git**.
3. Select your repository and configure build settings:
   - **Framework preset**: `None` or `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
4. Add the environment variables listed above under **Settings > Environment variables**.
5. Click **Save and Deploy**. Cloudflare automatically discovers the `/functions` directory and deploys both the static site and the edge APIs!

### 3. Custom Domain Setup
1. In Cloudflare Pages, go to **Custom domains > Set up a custom domain**.
2. Enter your apex domain (`herfirstincome.com`) or subdomain.
3. Cloudflare will automatically provision an edge SSL certificate with HTTP/2 and HTTP/3 support.

---

## Pre-Launch Checklist

- [ ] **Checkout Links Updated**: In `/config/offer.ts`, replace placeholder URLs with your live store links for Starter ($27), Complete ($57), Upgrade ($30), and Downsell ($12).
- [ ] **Starter Redirect URL Set**: In your checkout platform's Starter product settings, set the post-purchase redirect URL to:  
  `https://yourdomain.com/api/starter-success`
- [ ] **Complete Redirect URL Set**: Set Complete product post-purchase redirect URL to:  
  `https://yourdomain.com/thank-you-complete`
- [ ] **Cloudflare Environment Variables Added**: `META_PIXEL_ID`, `META_CAPI_TOKEN`, and `COOKIE_SIGNING_KEY` configured in Cloudflare Pages.
- [ ] **Meta Test Events Verification**: Send a test purchase using `META_TEST_EVENT_CODE` to confirm both Pixel and CAPI events arrive deduplicated with 100% match score in Events Manager.
- [ ] **Email Sequence Loaded**: Copy the text from `/emails/` into your email marketing platform (Kit/ConvertKit, MailerLite, ActiveCampaign) triggered on the `starter_purchase` tag.
- [ ] **Support Inbox Verified**: Confirm emails to `support@herfirstincome.com` forward to your team.
- [ ] **Compliance Review**: Confirm no income claims or restricted audience callouts are in your ad creatives or page copy.
