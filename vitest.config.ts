import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./vitest.setup.ts'],
		include: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
		exclude: ['node_modules', 'dist', 'build'],
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
