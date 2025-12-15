#!/bin/bash
#
# SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
#
# SPDX-License-Identifier: GPL-2.0-only
#

# This script builds system packages (deb/rpm) for the Carbonio Admin UI.
# It uses the YAP (Yet Another Packager) tool within a Docker container to create
# distribution-specific packages from the unified build output.
# This script is used to test how the CI produces the deb packages without having to use the CI.
#
OS=${1:-"ubuntu-jammy"}

echo "Building for OS: $OS"

docker run -it --rm \
	--entrypoint=yap \
	-v "$(pwd)/artifacts/${OS}":/artifacts \
	-v "$(pwd)":/tmp/build \
	"docker.io/m0rf30/yap-${OS}:1.8" \
	build "${OS}" /tmp/build
