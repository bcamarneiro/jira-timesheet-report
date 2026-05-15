#!/usr/bin/env node
// Fails if anything under frontend/ imports from premium/.
// The Free tier (everything outside /premium/) must build standalone.
// See /premium/README.md and ADA-252.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const importRe = /from\s+['"][^'"]*\/?premium\//;

let tracked = '';
try {
	tracked = execFileSync(
		'git',
		['ls-files', '--', 'frontend'],
		{ cwd: repoRoot, encoding: 'utf8' },
	);
} catch (err) {
	console.error('check-premium-boundary: git ls-files failed', err.message);
	process.exit(2);
}

const offenders = [];
for (const rel of tracked.split('\n').filter(Boolean)) {
	if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(rel)) continue;
	const full = path.join(repoRoot, rel);
	let contents = '';
	try {
		contents = fs.readFileSync(full, 'utf8');
	} catch {
		continue;
	}
	const lines = contents.split('\n');
	lines.forEach((line, i) => {
		if (importRe.test(line)) {
			offenders.push(`${rel}:${i + 1}: ${line.trim()}`);
		}
	});
}

if (offenders.length > 0) {
	console.error(
		'check-premium-boundary: frontend/ must not import from premium/.',
	);
	console.error('Offending lines:');
	for (const line of offenders) console.error(`  ${line}`);
	process.exit(1);
}

console.log('check-premium-boundary: OK (no frontend/ → premium/ imports)');
