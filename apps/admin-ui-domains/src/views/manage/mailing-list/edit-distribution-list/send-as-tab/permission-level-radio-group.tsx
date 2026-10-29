/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Radio, RadioGroup } from '@zextras/ui-components';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

export type PermissionLevelValue = 'sendAs' | 'sendOnBehalfOf';

type PermissionLevelRadioGroupProps = {
	value: PermissionLevelValue;
	onChange: (value: PermissionLevelValue) => void;
};

export const PermissionLevelRadioGroup: FC<PermissionLevelRadioGroupProps> = ({
	value,
	onChange
}) => {
	const [t] = useTranslation();

	return (
		<RadioGroup
			aria-label={t('domain.distributionList.sendAs.permissionLevel', 'Permission level')}
			value={value}
			onChange={(changed: string | undefined): void => {
				if (changed) onChange(changed as PermissionLevelValue);
			}}
		>
			<Radio
				key="sendAs"
				label={t('domain.distributionList.sendAs.sendAs', 'Send As')}
				description={t(
					'domain.distributionList.sendAs.permissionLevelSendMsg',
					'Allows a user to send emails that appear to come directly from a distribution list, with no indication of who actually sent it'
				)}
				value="sendAs"
			/>
			<Radio
				key="sendOnBehalfOf"
				label={t('domain.distributionList.sendAs.sendOnBehalfOf', 'Send on behalf of')}
				description={t(
					'domain.distributionList.sendAs.permissionLevelSendOnBehalfOfMsg',
					'Allows a user to send an email where the recipient sees e.g. "name.surname@mail.com on behalf of a distribution list"'
				)}
				value="sendOnBehalfOf"
			/>
		</RadioGroup>
	);
};
