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
	pnpm run deploy ${TEST_HOST}

all: build-admin-ui-bootstrap build-admin-ui-dashboard build-admin-ui-subscription deploy-admin-ui-bootstrap deploy-admin-ui-subscription deploy-admin-ui-dashboard
