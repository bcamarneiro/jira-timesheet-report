# IndieHackers — "I shipped"

**Title:**

`Shipped Hoursmith: open-source app + name-your-price hosted proxy (€3 floor, €10 default)`

## Body

After about eight months of evenings-and-weekends work, I shipped Hoursmith today. It's a Jira worklog dashboard — heatmap, week view, day breakdown, manager rollups, CSV export. The free version is MIT-licensed and runs locally. The paid version is exactly the same app, except I host the CORS proxy so you don't need to run one yourself — €10/year (name your price, minimum €3).

### What it is, honestly

One feature is paid: the hosted proxy. That's it. I considered building a "Team tier" with shared dashboards and scheduled reports, and I cut all of it from scope because I'm one person and I'd rather ship something I can support than something I can market. If you want the full app and you're comfortable running `npm run cors-proxy` in a terminal, the MIT version gives you 100% of the functionality forever.

### Revenue target

~€2,000/year is the number that makes this sustainable — Vercel, Supabase, Stripe fees, the domain, and an hour or two a week of support email all covered, with a little left over. At the €10 default that's 200 paying users; with the long tail of people who pay €30 to be kind, it's fewer. I'm not chasing a SaaS business; I want a small product that pays for itself, that I'll still be running in three years.

### Pricing rationale

I price it name-your-price with a €3 floor and a €10 default. €3 is the lowest where Stripe fees still make sense (€0.30 + 3% on €3 is already ~13% gone). €10 is roughly what one paying user costs me to host for a year — high enough to cover the lights, low enough to be a no-brainer if you log Jira time daily. €30 is the "thanks" tier for people who want to be generous. 100 paying users at €10 covers the lights; everything above that is runway.

### Stack

- Frontend: React + Zustand + rspack. (rspack instead of Vite because the bundle had grown enough that cold builds were getting annoying.)
- Auth + DB for the paid side: Supabase.
- Payments: Stripe (with a small wrapper because the paid tier is just a subscription flag).
- Hosting: Vercel for the proxy and the marketing site.
- License split: MIT at the root, BSL 1.1 under `/premium/` for the hosted-proxy code.

### What worked

- Picking one paid feature and refusing to add a second. The temptation to bolt on "cloud sync" or "team dashboards" was constant; saying no every time made the launch tractable.
- Source-available BSL for the paid bit, instead of pretending the whole thing is open while gating features behind license keys. People can read the proxy code.

### Open questions

- Conversion. ~80 people on the email list from a quiet beta, plus a handful of pilot users on the hosted proxy. Name-your-price conversion is hard to predict from a list that size, so I'll have real numbers in 30 days rather than guess now.
- Channel mix. I expect r/jira and HN to be the two posts that actually move the needle; everything else is supporting. The OSS-plus-hosted framing is the part I'm watching most closely.
- Enterprise ceiling. I'm EU-based, selling in the EU, with a sub-processor list and a DPA. SOC 2 is a deliberate "not yet" — it's the wrong investment until there's enough revenue to justify it.

Happy to dig into numbers. Reporting back in 30 days with real conversion data.

Link: <DOMAIN>
