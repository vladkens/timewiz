.PHONY: prepare update

prepare:
	pnpm run lint
	pnpm run format

update:
	pnpm exec npm-check-updates --target minor -u && pnpm i --lockfile-only
	pnpm audit --audit-level high --fix=override && pnpm i --lockfile-only
	$(MAKE) prepare
