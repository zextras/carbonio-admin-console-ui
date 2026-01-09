# SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only
include .env

build-dev:
	cd scripts && node build_unified.ts --dev

deploy-dev:
	rm -rf package
	pnpm deploy:unified ${TEST_HOST}

build-%:
	cd apps/$* && pnpm build:dev
deploy-%:
	cd apps/$* && npm run deploy -- -v -d -h ${TEST_HOST}

all: build-admin-ui-bootstrap build-admin-ui-dashboard build-admin-ui-subscription deploy-admin-ui-bootstrap deploy-admin-ui-subscription deploy-admin-ui-dashboard
