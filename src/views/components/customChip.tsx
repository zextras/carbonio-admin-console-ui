/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Chip } from '@zextras/carbonio-design-system';

export const copyClipboard = (label: string): any => {
	navigator.clipboard.writeText(label);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const CustomChip = (props: any): any => {
	const label = props?.label;
	return (
		<Chip
			{...props}
			actions={[
				{
					type: 'button',
					icon: 'CopyOutline',
					onClick: () => copyClipboard(label)
				}
			]}
		></Chip>
	);
};

export default CustomChip;
