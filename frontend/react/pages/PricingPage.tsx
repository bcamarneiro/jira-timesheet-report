import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PremiumWaitlistForm } from '../components/marketing/PremiumWaitlistForm';
import * as styles from './PricingPage.module.css';

/**
 * Public pricing page. Lives in the Free-tier app shell (everyone sees it).
 *
 * Linear: ADA-267. Embeds the waitlist form (ADA-268). Premium isn't
 * purchasable yet — Stripe Checkout is deferred to M3 launch. The page is
 * intentionally quiet: no gradients, no emojis, no animated badges.
 */
type Cadence = 'yearly' | 'monthly';

const PREMIUM_PRICE: Record<Cadence, { amount: string; cadenceLabel: string }> =
	{
		yearly: { amount: '€40', cadenceLabel: '/year' },
		monthly: { amount: '€4', cadenceLabel: '/month' },
	};

// Shared feature list — Free and Premium are at parity on the product itself.
// Only the proxy column and support diverges.
const SHARED_FEATURES = [
	'Personal weekly dashboard',
	'Team and monthly reports',
	'CSV and JSON exports',
	'Calendar feeds, absence tracking, holidays',
	'GitLab and RescueTime suggestions',
	'Local-only credentials',
];

export const PricingPage: React.FC = () => {
	const [cadence, setCadence] = useState<Cadence>('yearly');
	const [showForm, setShowForm] = useState(false);
	const price = PREMIUM_PRICE[cadence];

	return (
		<div className={styles.page}>
			<header className={styles.hero}>
				<h1 className={styles.title}>Pricing.</h1>
			</header>

			<section className={styles.toggleSection} aria-label="Billing cadence">
				<div className={styles.toggle} role="tablist">
					<button
						type="button"
						role="tab"
						aria-selected={cadence === 'monthly'}
						className={
							cadence === 'monthly'
								? styles.toggleButtonActive
								: styles.toggleButton
						}
						onClick={() => setCadence('monthly')}
					>
						Monthly
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={cadence === 'yearly'}
						className={
							cadence === 'yearly'
								? styles.toggleButtonActive
								: styles.toggleButton
						}
						onClick={() => setCadence('yearly')}
					>
						Yearly <span className={styles.savings}>save €8</span>
					</button>
				</div>
			</section>

			<section className={styles.tiers}>
				<article className={styles.tier}>
					<header className={styles.tierHeader}>
						<h2 className={styles.tierName}>Free</h2>
						<p className={styles.tierPrice}>
							<span className={styles.priceAmount}>€0</span>
							<span className={styles.priceCadence}>forever</span>
						</p>
						<p className={styles.tierTagline}>
							Bring your own proxy. Full app, MIT-licensed. Run{' '}
							<code>npm run cors-proxy</code> and you're set.
						</p>
					</header>
					<ul className={styles.featureList}>
						{SHARED_FEATURES.map((feature) => (
							<li key={feature} className={styles.featureItem}>
								{feature}
							</li>
						))}
						<li className={styles.featureItem}>Self-hosted CORS proxy</li>
						<li className={styles.featureItem}>Community support</li>
					</ul>
					<div className={styles.ctaSlot}>
						<Link to="/settings" className={styles.secondaryCta}>
							Get started
						</Link>
					</div>
				</article>

				<article className={`${styles.tier} ${styles.tierFeatured}`}>
					<header className={styles.tierHeader}>
						<h2 className={styles.tierName}>Premium</h2>
						<p className={styles.tierPrice}>
							<span className={styles.priceAmount}>{price.amount}</span>
							<span className={styles.priceCadence}>{price.cadenceLabel}</span>
						</p>
						<p className={styles.tierTagline}>
							We host the proxy. Sign in and go — works on every device, no
							terminal required.
						</p>
					</header>
					<ul className={styles.featureList}>
						{SHARED_FEATURES.map((feature) => (
							<li key={feature} className={styles.featureItem}>
								{feature}
							</li>
						))}
						<li className={styles.featureItem}>
							<strong>Hosted CORS proxy</strong>
						</li>
						<li className={styles.featureItem}>
							<strong>Priority email support</strong>
						</li>
					</ul>
					<div className={styles.ctaSlot}>
						{showForm ? (
							<PremiumWaitlistForm source="pricing" />
						) : (
							<>
								<p className={styles.ctaCopy}>
									Premium isn't ready yet — leave your email to be the first to
									know.
								</p>
								<button
									type="button"
									className={styles.primaryCta}
									onClick={() => setShowForm(true)}
								>
									Join the waitlist
								</button>
							</>
						)}
					</div>
				</article>
			</section>

			<section className={styles.faq} aria-labelledby="pricing-faq-heading">
				<h2 id="pricing-faq-heading" className={styles.faqHeading}>
					Questions
				</h2>
				<dl className={styles.faqList}>
					<div className={styles.faqItem}>
						<dt className={styles.faqQuestion}>Why pay if it's open source?</dt>
						<dd className={styles.faqAnswer}>
							Convenience — the hosted proxy means there's no terminal step and
							it works on every device. Paying also supports continued
							development of the open-source app.
						</dd>
					</div>
					<div className={styles.faqItem}>
						<dt className={styles.faqQuestion}>Where is my data?</dt>
						<dd className={styles.faqAnswer}>
							Your Jira token stays in your browser. The hosted proxy passes
							requests through to Jira without persisting anything. See the full{' '}
							<Link to="/sub-processors" className={styles.inlineLink}>
								sub-processors list
							</Link>
							.
						</dd>
					</div>
					<div className={styles.faqItem}>
						<dt className={styles.faqQuestion}>Can I self-host the proxy?</dt>
						<dd className={styles.faqAnswer}>
							Yes — free forever. Run <code>npm run cors-proxy</code> locally
							and point Settings at it. The Free tier is the full app.
						</dd>
					</div>
					<div className={styles.faqItem}>
						<dt className={styles.faqQuestion}>What about a team plan?</dt>
						<dd className={styles.faqAnswer}>
							Not planned. If you'd benefit from one, leave your email above and
							tell us what you'd want — we'll listen before building.
						</dd>
					</div>
				</dl>
			</section>

			<footer className={styles.footer}>
				<Link to="/sub-processors" className={styles.footerLink}>
					Sub-processors and data handling
				</Link>
			</footer>
		</div>
	);
};
