/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Chip } from '@zextras/carbonio-design-system';
import React from 'react';

const copyClipboard = (label: string): any => {
	navigator.clipboard.writeText(label);
};

const CustomChip = (props: any): any => {
	const label = props?.label;
	const actions = props?.actions
		? props?.actions
		: [
				{
					type: 'button',
					icon: 'CopyOutline',
					onClick: () => copyClipboard(label)
				}
			];
	return <Chip {...props} actions={actions} color="black"></Chip>;
};

export default CustomChip;
