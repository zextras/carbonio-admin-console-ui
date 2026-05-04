/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Chip } from '@zextras/ui-components';
import React, { ReactElement } from 'react';

const copyClipboard = (label: string): void => {
	navigator.clipboard.writeText(label);
};

const CustomChip = (props: React.ComponentProps<typeof Chip> & { value?: unknown }): ReactElement => {
	const label = typeof props?.label === 'string' ? props.label : '';
	const actions: React.ComponentProps<typeof Chip>['actions'] = props?.actions ?? [
		{
			id: 'copy-to-clipboard',
			type: 'button' as const,
			icon: 'CopyOutline' as const,
			onClick: (): void => copyClipboard(label),
		},
	];
	return <Chip {...props} actions={actions} color="black"></Chip>;
};

export default CustomChip;
