/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding, Text } from '@zextras/carbonio-design-system';

import ListRow from '../../list/list-row';

export const SwitchDescription = ({ label }: { label: string }) => {
	return (
		<ListRow>
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ left: 'extralarge' }}
			>
				<Padding left="large">
					<Text size="small" weight="regular" color="gray1">
						{label}
					</Text>
				</Padding>
			</Container>
		</ListRow>
	);
};
