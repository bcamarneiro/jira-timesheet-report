# IndieHackers — "I shipped"

**Title:**

`Shipped Hoursmith: open-source app + paid hosted proxy ($4/mo)`

## Body

After about eight months of evenings-and-weekends work, I shipped Hoursmith today. It's a Jira worklog dashboard — heatmap, week view, day breakdown, manager rollups, CSV export. The free version is MIT-licensed and runs locally. The paid version (€4/mo or €40/yr) is exactly the same app, except I host the CORS proxy so you don't need to run one yourself.

### What it is, honestly

One feature is paid: the hosted proxy. That's it. I considered building a "Team tier" with shared dashboards and scheduled reports, and I cut all of it from scope because I'm one person and I'd rather ship something I can support than something I can market. If you want the full app and you're comfortable running `npm run cors-proxy` in a terminal, the MIT version gives you 100% of the functionality forever.

### Revenue target

€200/mo is the number that makes this sustainable — Vercel, Supabase, Stripe fees, the domain, and an hour or two a week of support email all covered, with a little left over. That's 50 paying users. I'm not chasing a SaaS business; I want a small product that pays for itself, that I'll still be running in three years.

### Pricing rationale

€4 is the floor. Below that, Stripe's €0.30 + 3% per transaction eats double-digit percentages of the revenue and the math stops working. I looked at €3 and €5 and €4 felt like the honest number — high enough that I can afford to support it, low enough that it's a no-brainer if you log Jira time daily.

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

- Conversion. ~80 people on the email list from a quiet beta, plus a handful of pilot users on the hosted proxy. €4/mo conversion is hard to predict from a list that size, so I'll have real numbers in 30 days rather than guess now.
- Channel mix. I expect r/jira and HN to be the two posts that actually move the needle; everything else is supporting. The OSS-plus-hosted framing is the part I'm watching most closely.
- Enterprise ceiling. I'm EU-based, selling in the EU, with a sub-processor list and a DPA. SOC 2 is a deliberate "not yet" — it's the wrong investment until there's enough revenue to justify it.

Happy to dig into numbers. Reporting back in 30 days with real conversion data.

Link: <DOMAIN>
