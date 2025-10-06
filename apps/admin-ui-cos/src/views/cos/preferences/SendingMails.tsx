/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Row, Select, SelectItem, Switch, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types';
import ListRow from '../../list/list-row';
import { AttributeValue } from '../constants/types';
import { findSelectItemWithFallback } from '../utils';

interface SendingMailsProps {
	cosPrefAttributes: CosPrefAttributes;
	isReadOnlyCosEntry: boolean;
	onCosAttributeChanged: (attribute: keyof CosPrefAttributes, value: AttributeValue) => void;
	changeSwitchOption: (value: keyof CosPrefAttributes) => void;
}

export const SendingMails = ({
	cosPrefAttributes,
	isReadOnlyCosEntry,
	onCosAttributeChanged,
	changeSwitchOption
}: SendingMailsProps): React.JSX.Element => {
	const { t } = useTranslation();

	const SEND_READ_RECEIPTS: SelectItem[] = useMemo(
		() => [
			{ label: t('label.never_send_read_receipt', 'Never send a read receipt'), value: 'never' },
			{ label: t('label.always_send_read_receipt', 'Always send a read receipt'), value: 'always' },
			{ label: t('label.ask_me', 'Ask me'), value: 'prompt' }
		],
		[t]
	);
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
					padding={{ bottom: 'large' }}
				>
					<ListRow>
						<Container>
							<Select
								items={SEND_READ_RECEIPTS}
								background="gray5"
								label={t('cos.read_receipt_settings', 'Read Receipt settings')}
								showCheckbox={false}
								selection={findSelectItemWithFallback(
									SEND_READ_RECEIPTS,
									cosPrefAttributes?.zimbraPrefMailSendReadReceipts
								)}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefMailSendReadReceipts', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Row>
	);
};
