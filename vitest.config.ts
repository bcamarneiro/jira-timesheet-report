import { defineConfig } from 'vitest/config';

const buildTier = (process.env.BUILD_TIER || 'free').toLowerCase();

export default defineConfig({
	define: {
		__BUILD_TIER__: JSON.stringify(
			buildTier === 'premium' ? 'premium' : 'free',
		),
	},
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./vitest.setup.ts'],
		include: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
		exclude: ['node_modules', 'dist', 'build', '.claude/**', '**/node_modules/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'json', 'lcov'],
			include: ['frontend/**/*.{ts,tsx}', 'types/**/*.ts'],
			exclude: [
				'**/*.test.{ts,tsx}',
				'**/__tests__/**',
				'**/node_modules/**',
				'**/dist/**',
				'**/build/**',
				'**/*.config.{ts,js}',
				'**/*.d.ts',
				'**/types/**',
				'frontend/main.ts',
				'frontend/public/**',
			],
			// No thresholds set - just reporting for now
			all: true,
		},
	},
	resolve: {
		alias: {
			'@': '/frontend',
		},
	},
});
