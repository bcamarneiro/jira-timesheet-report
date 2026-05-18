# Hoursmith UX audit — launch readiness

A focused first-impressions pass on the surfaces a stranger will see when Hoursmith goes public. Read with the imagined POV of a developer landing from a Show HN post.

## Verdict

**Ship after the fixes in this PR land + one round of follow-up tickets.** The product is structurally sound: the dashboard works, the paywall flow is wired end-to-end, and the marketing surfaces exist. The gaps are launch-day-finish polish — page metadata, social preview, and the "what happens between Stripe Checkout return and the webhook firing" race condition.

## What this PR fixes inline

- `frontend/index.html` — rewritten title, description, and added `og:*` + `twitter:card` tags. Site name is `Hoursmith`. Previously the entire app advertised itself as "Jira Timesheet Report" with no Hoursmith branding.
- `frontend/react/hooks/usePageTitle.ts` (new) — small hook that sets `document.title` per-route in the format `"<page> — Hoursmith"`. Applied to all 7 frontend pages.
- Per-route titles in `premium/auth/SignInPage.tsx`, `SignUpPage.tsx`, `AccountPage.tsx` — inline `useEffect` (not the hook, to avoid the premium folder importing from frontend).
- `frontend/react/pages/SubProcessorsPage.tsx` — the visible "support email TBD" string is replaced with non-placeholder copy that doesn't ship as a public-facing TODO.

## First-run journey at `/`

`HomePage.tsx` opens with a "First run" / "Currently configured" badge based on whether `jiraHost` is set in the config store. For new users the primary CTA is "Start Setup" pointing at `/settings`. This is clear enough.

**Gap:** there's no one-sentence "what Hoursmith is" copy on the landing page. A new visitor reading the navigation bar has to click around to figure out what the product does. The README explains it well — the landing page does not. Tracked as a follow-up.

The PWA install card is rendered prominently for new users — that's a nice touch.

## Premium upgrade flow

Trace: `/pricing` → "Subscribe" button → `/api/checkout` → Stripe Checkout → return to `/account?upgrade=success`.

**Holes:**

1. **Webhook-race window.** When the user returns to `/account?upgrade=success`, the page does an initial `GET /api/account/subscription` fetch. If Stripe's `customer.subscription.created` webhook hasn't fired yet (latency of seconds to a minute is normal), the user sees their old "free" status and may think the payment failed. There's no polling loop, no "processing your subscription…" UI. **This is the most user-facing rough edge on the entire paywall.** Tracked as ADA-279.

2. **No success toast** after Checkout return — the user just sees the /account page unchanged (or eventually updated). A small "Welcome — your subscription is active" banner on `?upgrade=success` would help.

3. **No retry on entitlement failure during proxy use.** If a user's subscription expires mid-session (cancelled by webhook), the next proxy request returns 403 and the frontend has no UX for "your subscription lapsed, sign in to /account to renew."

## Cohesion across Premium surfaces

PricingPage, SignInPage, SignUpPage, AccountPage were built by parallel agents tonight. Reading their CSS modules:

- **Pricing page** uses a two-column comparison + anchor-button selector. Distinctive style.
- **Sign-in / Sign-up** share `SignInPage.module.css` and `SignUpPage.module.css` — visually similar (good).
- **Account page** uses `AccountPage.module.css` — sections + buttons in a different layout entirely.

Without a browser to render them side by side, I can't fully judge cohesion. The CSS uses the same root variables (verified by spot-checking `var(--color-*)` usage), so colors and typography should align. Spacing and button styles may drift. Tracked as a follow-up.

## Page metadata

`index.html` baseline was thin: it had a title (wrong product name), a description (pre-Hoursmith framing), and a PWA icon. **No** Open Graph tags, **no** Twitter card meta. Per-route `<title>` updates were also missing entirely — every page in the SPA showed the same browser-tab label.

This PR fixes both. The remaining gap is **no `og:image`** asset. Social shares (Twitter, Slack unfurls, LinkedIn) will render as text-only cards until a 1200x630 preview image is produced. Tracked as ADA-280.

## Accessibility quick scan

`npm run lint` reports 0 errors and 1 pre-existing warning unrelated to a11y (an unused helper in an e2e probe file). The earlier a11y errors (4 of them, from biome) were fixed in PR #9 during CI infrastructure work, so the lint surface is clean.

**I did not interactively test:** keyboard navigation, screen reader pass, color contrast in dark mode. Each is a real launch-readiness concern but requires a browser. Tracked as a single audit ticket post-launch.

## Empty / error states (not audited interactively)

The dashboard's behavior when Jira returns 401, the network is offline, or a workspace has no worklogs in the current week — none of these were verifiable from reading code. They're real UX risks: a HN visitor whose token is wrong will get an unhelpful error before they see any value. **Worth a real interactive pass** post-merge, with the dev server running. Tracked as a low-priority ticket.

## Follow-up Linear tickets

(See the next section for the IDs.)

1. **ADA-279** — `/account` post-Checkout polling for webhook race
2. **ADA-280** — Create `og:image` social preview asset
3. **ADA-281** — HomePage onboarding copy for first-time visitors
4. **ADA-282** — Visual cohesion pass on Premium surfaces (Pricing vs Account)
5. **ADA-283** — Real support email address + replace placeholders globally
6. **ADA-284** — Interactive audit of empty/error states across dashboard, reports, and Premium flow

## What's deliberately not in scope

- Brand identity (logo, accent palette, type scale) — chasing "looks like a real product" before there's product-market fit is premature
- Mobile responsiveness on the dashboard — power users are on laptops
- Animation, micro-interactions, motion polish
- Onboarding tour / tooltips — the dashboard is direct enough that a first-run guided tour would feel patronizing for the developer audience
