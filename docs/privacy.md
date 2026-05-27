# Privacy Policy

**Effective date:** 2026-05-27.

This Privacy Policy explains how Hoursmith ("we", "us") collects, uses, and protects personal data when you use the hosted service at hoursmith.io.

The data controller is **Future Sketches**, established in **Portugal**. Contact: `privacy@hoursmith.io`. <!-- TODO(ADA-283): replace placeholder once support@hoursmith.io is provisioned. -->

Hoursmith is a Jira worklog dashboard. The product is designed so that the data you care most about — your Jira tokens, your worklog content, your report configurations — never leaves your browser and is never sent to our servers. This policy describes the small amount of personal data we do process to operate authentication, billing, and the hosted CORS proxy.

## What we collect

We collect the minimum data needed to operate the service.

**Account data.** When you create a Hoursmith account we store your email address and an authentication identifier through our auth provider, Supabase. If you sign in with GitHub OAuth we also store your GitHub user ID. No password is ever stored in plaintext.

**Billing data.** Premium is sold through **Polar** (Polar Software Inc.), which acts as our **Merchant of Record**. When you upgrade, Polar — as the seller of record — collects and stores your name, billing address, payment instrument and tax identifier (if you provide one) on its own systems, issues your invoice, and handles VAT. Polar is an independent controller for that payment and tax data. From Polar we receive and store only a customer ID, subscription ID, current period end, and subscription status. We never see or store your card number.

**Operational logs.** Vercel produces standard server logs that include request paths, timestamps, response codes, and the IP address that made each request. These logs are retained by Vercel under their data-retention policy and are used only for security and abuse detection.

**Audit log.** A small server-side `audit_log` table records material account events (account deletion, data export). Entries reference a user ID and an event type. No request bodies or tokens are written.

**Analytics.** When Plausible Analytics is enabled it counts page views without setting cookies and without collecting any identifiers that could identify you personally.

## What we do **not** collect

Hoursmith does not store any of the following server-side:

- **Jira API tokens.** Your token is held in your browser's local storage and attached to Jira requests client-side. The hosted CORS proxy forwards the request and returns the response without inspecting, logging, or persisting the token.
- **Jira workspace data.** Issues, worklogs, comments, attachments, sprints, and any other Jira content are processed entirely in the browser.
- **User settings and templates.** Report configurations, saved filters, favorite issues, calendar mappings, and team setups live in your browser's local storage. There is no cloud sync.
- **Calendar feed contents.** ICS feeds are fetched and parsed in the browser. The hosted proxy may relay the fetch when CORS requires it but does not retain feed contents.

## Lawful basis for processing

We rely on the following lawful bases under Article 6 GDPR:

- **Contract (Article 6(1)(b)):** to provide the service you signed up for, including authentication, billing, and the hosted CORS proxy.
- **Legitimate interest (Article 6(1)(f)):** to detect abuse, protect the service from misuse, and improve product quality through aggregated analytics. You can object to this processing at any time.
- **Legal obligation (Article 6(1)(c)):** to retain billing records as required by Portuguese and EU tax law.

We do not rely on consent for any processing other than optional marketing communications (which we do not currently send).

## Who we share data with

We use a small set of sub-processors to operate the service. The full list, with regions and links to each provider's Data Processing Agreement, is at [/sub-processors](https://hoursmith.io/sub-processors).

We do not sell personal data. We do not share personal data with advertisers. We do not transfer personal data outside the EU except where a sub-processor or our Merchant of Record (Polar, in the United States) requires it; that transfer relies on the Standard Contractual Clauses adopted by the European Commission, with additional safeguards.

## Where your data is stored

All Hoursmith application data is stored in the EU.

- Vercel serverless functions run in the `fra1` region (Frankfurt, Germany).
- Supabase databases (auth + Postgres) are hosted in `eu-central-1` (Frankfurt, Germany).
- Polar (Polar Software Inc.) operates from the United States; transfers of your billing data rely on the Standard Contractual Clauses. As Merchant of Record, Polar collects and remits EU VAT under the One-Stop-Shop (OSS) scheme.

## How long we keep it

- **Account data** is kept while your account exists. When you delete your account, your profile row, subscription row, and Supabase auth record are removed within 30 days.
- **Billing records** and invoices are issued and retained by Polar, as Merchant of Record, in line with its own legal and tax record-keeping obligations. We cannot delete invoices held by Polar.
- **Operational logs** (Vercel) are retained for the standard Vercel log-retention window (typically seven days).
- **Audit log** entries are retained for as long as your account exists, plus one year after deletion to allow for fraud investigation.

## Your rights

Under GDPR you have the right to:

- **Access** the personal data we hold about you. Use the "Export my data" button on the /account page to download a JSON export.
- **Rectify** inaccurate data by editing your profile or by contacting us.
- **Erase** your data by clicking "Delete my account" on the /account page. This is immediate, irreversible, and cascades through Polar (cancelling any active subscription) and Supabase (removing your auth identity).
- **Portability**: the same JSON export covers this right.
- **Object** to processing based on legitimate interest. Email us to lodge an objection.
- **Lodge a complaint** with the Portuguese supervisory authority (CNPD — Comissão Nacional de Proteção de Dados) or with the authority of your habitual residence in the EU.

To exercise any of these rights, contact `privacy@hoursmith.io`. We respond within one calendar month.

## Security

We follow industry-standard practice: TLS everywhere, secrets stored in Vercel's encrypted env-var system, principle-of-least-privilege keys, row-level security on every Postgres table that holds user data. The audit log captures sign-in and account-deletion events to support detection of unauthorized access.

If we discover a breach affecting your data we will notify you within 72 hours of becoming aware of it, in line with Article 33 GDPR.

## Children

Hoursmith is not directed at children under 16. We do not knowingly collect personal data from children. If you believe we hold data about a child, contact us and we will delete it.

## Changes to this policy

We may update this Privacy Policy from time to time. The "Effective date" at the top reflects the latest revision. Material changes will be communicated to active subscribers by email at least 30 days in advance of taking effect.

Historical versions of this policy can be reviewed in the git history of this page.

## Contact

Email `privacy@hoursmith.io`. <!-- TODO(ADA-283): replace placeholder once support@hoursmith.io is provisioned. -->

---

**Effective date:** 2026-05-27.
