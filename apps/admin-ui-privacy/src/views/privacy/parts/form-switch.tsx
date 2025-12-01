/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Switch } from '@zextras/carbonio-design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ListRow from '../../list/list-row';

export const FormSwitch = ({
	fieldValue,
	allowSetPrivacy,
	onClick
}: {
	fieldValue: boolean;
	allowSetPrivacy: boolean;
	onClick: () => void;
}) => {
	const [t] = useTranslation();

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
					label={t('privacy.allow_live_survey_feedbacks', 'Allow live survey feedbacks')}
					onClick={onClick}
					iconColor="primary"
					disabled={!allowSetPrivacy}
				/>
			</Container>
		</ListRow>
	);
};
