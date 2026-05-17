# Hoursmith launch comms — drafts

These are pre-launch drafts written ahead of M3 so the soft launch isn't done under deadline pressure. Polish on launch day. Post in this order: Hacker News first (Tuesday or Wednesday, 9am ET — that's the highest-signal window for Show HN), then r/jira about two hours later if HN gains traction (otherwise immediately, no reason to wait), then IndieHackers the same day, then Twitter/X and LinkedIn the same evening once the HN thread has had time to mature and you have real reactions to quote.

## Channels in this directory

- `hn-show.md` — Show HN post, plus pre-written author replies for the predictable top comments.
- `r-jira.md` — Reddit r/jira post. Premium is mentioned only in a follow-up comment, not in the post.
- `indiehackers.md` — IndieHackers "I shipped" post with numbers and candor.
- `twitter.md` — Twitter/X thread plus the LinkedIn long-form version.

## Channels deliberately NOT used

- **Product Hunt** — too generic, drowning in AI-generated launches, the audience there is buyers-of-buzz not engineers-with-Jira-pain. Conversion historically poor for indie B2B SaaS at this price point.
- **r/SaaS, r/Entrepreneur, r/SideProject** — wrong audience. The people who hang out there are other founders, not Jira users in pain. They will upvote politely and never convert.
- **Cold email** — illegal under GDPR without prior consent in every EU jurisdiction. Don't.
- **LinkedIn DMs to "potential customers"** — same problem, plus it's tacky.

## Placeholders to replace at launch

- `<DOMAIN>` → `hoursmith.io` (register the domain first; don't post until DNS resolves).
- `<SCREENSHOT>` → actual asset path. The Twitter thread leads with one; HN doesn't take images but the linked site needs to have a good above-the-fold hero.
- `<support email TBD>` → the real support email once configured (Fastmail or similar — don't use a personal Gmail).

## Pre-flight checklist

- [ ] `hoursmith.io` resolves, TLS valid, no mixed content warnings.
- [ ] Pricing page exists and the Stripe checkout actually completes end to end (do a live €4 test purchase, then refund yourself).
- [ ] Email capture on the landing page is wired to the list and the confirmation email actually arrives.
- [ ] Plausible (or equivalent) is firing on every page; verify in real-time view from a private window.
- [ ] Status page or at minimum a `/status` endpoint that returns OK, so the HN crowd can check uptime if the proxy hiccups.
- [ ] `npm run check:premium-boundary` passes on `main`.
- [ ] First 24h after posting: monitor sub count, comment threads on all four channels, support inbox. Reply within an hour to anything on HN — half the value of a Show HN is the author engagement.
- [ ] Have the next-day follow-up email drafted for new sub list members so it goes out automatically.
