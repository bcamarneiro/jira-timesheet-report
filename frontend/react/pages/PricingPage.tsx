import type React from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PremiumWaitlistForm } from '../components/marketing/PremiumWaitlistForm';
import * as styles from './PricingPage.module.css';

/**
 * Public pricing page. Lives in the Free-tier app shell (everyone sees it).
 *
 * Linear: ADA-267. Embeds the waitlist form (ADA-268). Premium isn't
 * purchasable yet — Stripe Checkout is wired but the Stripe Product/Price
 * objects are deferred to ADA-258. The page is intentionally quiet: no
 * gradients, no emojis, no animated badges.
 *
 * Pricing model: name-your-price annual subscription with a €3 floor, €10
 * anchor (pre-selected), and €30 generous tier. Backend (ADA-260) validates
 * the floor/cap and creates the Checkout Session with inline price_data.
 */

/** Cents. Mirrors AMOUNT_FLOOR_CENTS / AMOUNT_CAP_CENTS in premium/api/checkout. */
const FLOOR_CENTS = 300;
const CAP_CENTS = 100_000;
const DEFAULT_ANCHOR_CENTS = 1000;

type AnchorId = 'lights' | 'fair' | 'thanks' | 'custom';

interface Anchor {
	id: AnchorId;
	amountCents: number;
	label: string;
	caption: string;
}

const ANCHORS: ReadonlyArray<Anchor> = [
	{ id: 'lights', amountCents: 300, label: '€3', caption: 'Lights on' },
	{ id: 'fair', amountCents: 1000, label: '€10', caption: 'Fair' },
	{ id: 'thanks', amountCents: 3000, label: '€30', caption: 'Thanks' },
];

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

function formatEur(cents: number): string {
	if (cents % 100 === 0) return `€${cents / 100}`;
	return `€${(cents / 100).toFixed(2)}`;
}

export const PricingPage: React.FC = () => {
	const [selectedAnchor, setSelectedAnchor] = useState<AnchorId>('fair');
	const [customEuros, setCustomEuros] = useState<string>('15');
	const [showForm, setShowForm] = useState(false);

	const selectedCents = useMemo(() => {
		if (selectedAnchor === 'custom') {
			const parsed = Number.parseFloat(customEuros);
			if (!Number.isFinite(parsed)) return null;
			return Math.round(parsed * 100);
		}
		return ANCHORS.find((a) => a.id === selectedAnchor)?.amountCents ?? null;
	}, [selectedAnchor, customEuros]);

	const customError = useMemo((): string | null => {
		if (selectedAnchor !== 'custom') return null;
		if (selectedCents === null) return 'Enter an amount.';
		if (selectedCents < FLOOR_CENTS)
			return `Minimum is ${formatEur(FLOOR_CENTS)}/year.`;
		if (selectedCents > CAP_CENTS)
			return `Max ${formatEur(CAP_CENTS)}/year (Stripe sanity cap).`;
		return null;
	}, [selectedAnchor, selectedCents]);

	const ctaLabel = useMemo(() => {
		if (selectedCents === null || customError)
			return 'Enter an amount to subscribe';
		return `Subscribe ${formatEur(selectedCents)}/year`;
	}, [selectedCents, customError]);

	return (
		<div className={styles.page}>
			<header className={styles.hero}>
				<h1 className={styles.title}>Pricing.</h1>
			</header>

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
							<span className={styles.priceAmount}>
								{formatEur(DEFAULT_ANCHOR_CENTS)}
							</span>
							<span className={styles.priceCadence}>/year</span>
						</p>
						<p className={styles.tierTagline}>
							Or whatever feels fair — minimum {formatEur(FLOOR_CENTS)}. We host
							the proxy, you sign in and go.
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

					<fieldset
						className={styles.anchorGroup}
						aria-label="Pick your annual price"
					>
						<legend className={styles.anchorLegend}>
							Pick your annual price
						</legend>
						<div className={styles.anchorRow}>
							{ANCHORS.map((anchor) => {
								const active = selectedAnchor === anchor.id;
								return (
									<button
										key={anchor.id}
										type="button"
										aria-pressed={active}
										// TODO(plausible): emit "pricing_anchor_selected" with anchor.id
										className={
											active ? styles.anchorButtonActive : styles.anchorButton
										}
										onClick={() => setSelectedAnchor(anchor.id)}
									>
										<span className={styles.anchorAmount}>{anchor.label}</span>
										<span className={styles.anchorCaption}>
											{anchor.caption}
											{anchor.id === 'fair' ? ' (default)' : ''}
										</span>
									</button>
								);
							})}
						</div>
						<div className={styles.customRow}>
							{selectedAnchor === 'custom' ? (
								<label className={styles.customLabel}>
									<span>Custom amount (€/year)</span>
									<input
										type="number"
										min={FLOOR_CENTS / 100}
										max={CAP_CENTS / 100}
										step="1"
										inputMode="decimal"
										value={customEuros}
										onChange={(e) => setCustomEuros(e.target.value)}
										className={styles.customInput}
										aria-invalid={customError !== null}
									/>
								</label>
							) : (
								<button
									type="button"
									className={styles.customToggle}
									onClick={() => setSelectedAnchor('custom')}
								>
									Custom amount
								</button>
							)}
							{customError ? (
								<p className={styles.customError} role="alert">
									{customError}
								</p>
							) : null}
						</div>
					</fieldset>

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
									disabled={selectedCents === null || customError !== null}
									onClick={() => setShowForm(true)}
								>
									{ctaLabel}
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
						<dt className={styles.faqQuestion}>Why name-your-price?</dt>
						<dd className={styles.faqAnswer}>
							Hoursmith costs about €10/year per user to run. The floor covers
							that. The other tiers are for people who want to give more —
							entirely up to you.
						</dd>
					</div>
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
