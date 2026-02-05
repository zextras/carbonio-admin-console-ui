# SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only
include .env

build:
	pnpm build

build-dev:
	pnpm build:dev

deploy:
	pnpm run deploy ${TEST_HOST}

deploy-dev:
	pnpm run deploy:dev ${TEST_HOST}
