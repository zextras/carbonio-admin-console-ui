# SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only
include .env

build-%:
	cd apps/$* && pnpm build
deploy-%:
	cd apps/$* && npm run deploy -- -v -d -h ${TEST_HOST}

all: build-admin-ui-bootstrap build-admin-ui-subscription deploy-admin-ui-bootstrap deploy-admin-ui-subscription