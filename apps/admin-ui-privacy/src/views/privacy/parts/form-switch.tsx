/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Switch } from '@zextras/carbonio-design-system';

import ListRow from '../../list/list-row';

export const FormSwitch = ({
	fieldValue,
	allowSetPrivacy,
	onClick,
	label
}: {
	fieldValue: boolean;
	allowSetPrivacy: boolean;
	onClick: () => void;
	label: string;
}) => {
	return (
		<ListRow>
			<Container
				orientation="horizontal"
				mainAlignment="space-between"
				crossAlignment="flex-start"
				padding={{ all: 'small' }}
			>
				<Switch
					value={fieldValue}
					label={label}
					onClick={onClick}
					iconColor="primary"
					disabled={!allowSetPrivacy}
				/>
			</Container>
		</ListRow>
	);
};
