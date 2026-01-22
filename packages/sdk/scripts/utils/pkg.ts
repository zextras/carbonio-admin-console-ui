/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type CarbonioConfig = {
	type: string;
	name: string;
};

type SdkConfig = {
	svgr?: boolean;
};

type PackageJson = {
	carbonio?: CarbonioConfig;
	sdk?: SdkConfig;
};

export const pkg: PackageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'));
