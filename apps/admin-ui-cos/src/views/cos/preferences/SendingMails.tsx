/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row, Switch, Text } from '@zextras/carbonio-design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types/cos';
import ListRow from '../../list/list-row';
import { AttributeValue } from '../constants/types';

interface SendingMailsProps {
	cosPrefAttributes: CosPrefAttributes;
	isReadOnlyCosEntry: boolean;
	onCosAttributeChanged: (attribute: keyof CosPrefAttributes, value: AttributeValue) => void;
	changeSwitchOption: (value: keyof CosPrefAttributes) => void;
}

export const SendingMails = ({
	cosPrefAttributes,
	isReadOnlyCosEntry,
	changeSwitchOption
}: SendingMailsProps): React.JSX.Element => {
	const { t } = useTranslation();

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('label.sending_mails', 'Sending Mails')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start">
							<Switch
								value={cosPrefAttributes?.zimbraPrefSaveToSent === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraPrefSaveToSent')}
								label={t('cos.save_to_Sent', `Save to sent`)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
				>
					<ListRow>
						<Container crossAlignment="flex-start">
							<Switch
								value={cosPrefAttributes?.zimbraFeatureReadReceiptsEnabled === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraFeatureReadReceiptsEnabled')}
								label={t(
									'account_details.ask_read_receipts',
									`Permit the user to ask for read receipt`
								)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Row>
	);
};
