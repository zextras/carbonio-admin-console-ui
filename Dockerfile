# SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only

FROM backplane/jq:latest

COPY dist/opt/zextras/admin/iris/ /opt/zextras/admin/iris/
