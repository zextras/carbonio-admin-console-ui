# SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: AGPL-3.0-only

FROM alpine

RUN apk add --no-cache jq

# Copy all built components from the package directory
COPY package/opt/zextras/admin/iris/ /opt/zextras/admin/iris/

# Generate the components.json file
ENTRYPOINT ["/bin/sh", "-c", "jq -s '{components: .}' $(find /opt/zextras/admin/iris/ -maxdepth 3 -mindepth 3 -name component.json | sort) > /opt/zextras/admin/iris/components.json"]
