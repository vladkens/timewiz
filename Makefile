.PHONY: prepare patch

prepare:
	pnpm run lint
	pnpm run format

patch: export COREPACK_ENABLE_DOWNLOAD_PROMPT := 0
patch:
	pnpm update npm-check-updates --latest
	pnpm exec npm-check-updates --dep packageManager --target minor --upgrade --install never
	pnpm exec npm-check-updates --target patch -u && pnpm i --lockfile-only
	pnpm audit --audit-level high --fix=override && pnpm i --lockfile-only
	pnpm audit --audit-level=high
