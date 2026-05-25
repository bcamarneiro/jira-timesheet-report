# IndieHackers — "I shipped"

**Title:**

`Shipped Hoursmith: open-source Jira worklog app + €29/year hosted proxy`

## Body

After about eight months of evenings-and-weekends work, I shipped Hoursmith today. It's a Jira worklog dashboard — heatmap, week view, day breakdown, manager rollups, CSV export. The free version is MIT-licensed and runs locally. The paid version is exactly the same app, except I host the CORS proxy so you don't need to run one yourself — €29/year (€19 for early subscribers, locked in for life).

### What it is, honestly

One feature is paid: the hosted proxy. That's it. I considered building a "Team tier" with shared dashboards and scheduled reports, and I cut all of it from scope because I'm one person and I'd rather ship something I can support than something I can market. If you want the full app and you're comfortable running `npm run cors-proxy` in a terminal, the MIT version gives you 100% of the functionality forever.

### Revenue target

~€2,000/year is the number that makes this sustainable — Vercel, Supabase, payment fees, the domain, and an hour or two a week of support email all covered, with a little left over. At €29/year that's about 70 paying users — fewer once you mix in the Lead tier (€60/year for team leads juggling multiple clients). I'm not chasing a SaaS business; I want a small product that pays for itself, that I'll still be running in three years.

### Pricing rationale

Flat €29/year for the hosted tier, with a €19 founding rate for early subscribers that stays locked as long as they keep the subscription. I started with name-your-price and dropped it: pay-what-you-want averages out near the floor, and €10/year frankly signals "toy" when the competing Jira timesheet tools charge €8–10 per user per *month* — and bill every licensed Jira seat, not just the people who use them. A clean €29 is still 10×+ cheaper than one month of those, it's a single line you can expense, and it gets me to my number with ~70 users instead of 200. There's a Lead tier at €60/year (rising to €120 as more features land) for team leads who report to multiple clients.

### Stack

- Frontend: React + Zustand + rspack. (rspack instead of Vite because the bundle had grown enough that cold builds were getting annoying.)
- Auth + DB for the paid side: Supabase.
- Payments: Polar (Merchant of Record — it's the legal seller and handles EU VAT so I don't have to).
- Hosting: Vercel for the proxy and the marketing site.
- License split: MIT at the root, BSL 1.1 under `/premium/` for the hosted-proxy code.

### What worked

- Picking one paid feature and refusing to add a second. The temptation to bolt on "cloud sync" or "team dashboards" was constant; saying no every time made the launch tractable.
- Source-available BSL for the paid bit, instead of pretending the whole thing is open while gating features behind license keys. People can read the proxy code.

### Open questions

- Conversion. ~80 people on the email list from a quiet beta, plus a handful of pilot users on the hosted proxy. Conversion is hard to predict from a list that size, so I'll have real numbers in 30 days rather than guess now.
- Channel mix. I expect r/jira and HN to be the two posts that actually move the needle; everything else is supporting. The OSS-plus-hosted framing is the part I'm watching most closely.
- Enterprise ceiling. I'm EU-based, selling in the EU, with a sub-processor list and a DPA. SOC 2 is a deliberate "not yet" — it's the wrong investment until there's enough revenue to justify it.

Happy to dig into numbers. Reporting back in 30 days with real conversion data.

Link: <DOMAIN>
