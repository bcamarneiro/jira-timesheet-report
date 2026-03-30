function normalizeBasePath(basePath: string): string {
	const trimmed = basePath.trim();
	if (!trimmed || trimmed === '/') {
		return '/';
	}

	return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

export const appBasePath = normalizeBasePath(process.env.APP_BASE_PATH || '/');
export const isHashRouterMode = process.env.APP_ROUTER_MODE === 'hash';

export function withBasePath(pathname: string): string {
	if (!pathname || pathname === '/') {
		return appBasePath;
	}

	const normalizedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
	return appBasePath === '/' ? `/${normalizedPath}` : `${appBasePath}${normalizedPath}`;
}
