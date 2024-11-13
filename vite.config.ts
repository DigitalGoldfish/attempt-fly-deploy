import { vitePlugin as remix } from '@remix-run/dev'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { glob } from 'glob'
import { flatRoutes } from 'remix-flat-routes'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import topLevelAwait from 'vite-plugin-top-level-await'

const MODE = process.env.NODE_ENV

declare module '@remix-run/server-runtime' {
	interface Future {
		v3_singleFetch: true // 👈 enable _types_ for single-fetch
	}
}

export default defineConfig({
	build: {
		cssMinify: MODE === 'production',

		rollupOptions: {
			external: [/node:.*/, 'fsevents'],
		},

		assetsInlineLimit: (source: string) => {
			if (source.endsWith('sprite.svg')) {
				return false
			}
		},

		sourcemap: true,
	},
	server: {
		watch: {
			ignored: ['**/playwright-report/**'],
		},
	},
	plugins: [
		viteStaticCopy({
			// Make the files necessary for running the Scanbot SDK WebAssembly modules available as static files
			targets: [
				{
					src: 'node_modules/scanbot-web-sdk/bundle/bin/complete/*',
					dest: 'wasm',
				},
			],
			structured: false,
		}),
		envOnlyMacros(),
		topLevelAwait({
			// The export name of top-level await promise for each chunk module
			promiseExportName: '__tla',
			// The function to generate import names of top-level await promise in each chunk module
			promiseImportName: (i: number) => `__tla_${i}`,
		}),
		// it would be really nice to have this enabled in tests, but we'll have to
		// wait until https://github.com/remix-run/remix/issues/9871 is fixed
		process.env.NODE_ENV === 'test'
			? null
			: remix({
					future: {
						v3_singleFetch: true,
					},
					ignoredRouteFiles: ['**/*'],
					serverModuleFormat: 'esm',
					routes: async (defineRoutes) => {
						return flatRoutes('routes', defineRoutes, {
							ignoredRouteFiles: [
								'.*',
								'**/*.css',
								'**/*.test.{js,jsx,ts,tsx}',
								'**/__*.*',
								// This is for server-side utilities you want to colocate
								// next to your routes without making an additional
								// directory. If you need a route that includes "server" or
								// "client" in the filename, use the escape brackets like:
								// my-route.[server].tsx
								'**/*.server.*',
								'**/*.client.*',
							],
						})
					},
				}),
		process.env.SENTRY_AUTH_TOKEN
			? sentryVitePlugin({
					disable: MODE !== 'production',
					authToken: process.env.SENTRY_AUTH_TOKEN,
					org: process.env.SENTRY_ORG,
					project: process.env.SENTRY_PROJECT,
					release: {
						name: process.env.COMMIT_SHA,
						setCommits: {
							auto: true,
						},
					},
					sourcemaps: {
						filesToDeleteAfterUpload: await glob([
							'./build/**/*.map',
							'.server-build/**/*.map',
						]),
					},
				})
			: null,
	],
	test: {
		include: ['./app/**/*.test.{ts,tsx}'],
		setupFiles: ['./tests/setup/setup-test-env.ts'],
		globalSetup: ['./tests/setup/global-setup.ts'],
		restoreMocks: true,
		coverage: {
			include: ['app/**/*.{ts,tsx}'],
			all: true,
		},
	},
})
