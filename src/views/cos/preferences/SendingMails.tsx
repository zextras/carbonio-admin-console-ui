/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import {
	Container,
	Divider,
	Row,
	Select,
	SelectItem,
	Switch,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types';
import ListRow from '../../list/list-row';

interface SendingMails {
	cosPrefAttributes: CosPrefAttributes;
	readonlyCOS: boolean;
	// typing is hard to achieve here
	onMailSendReadReceipts: (value: any) => void;
	changeSwitchOption: (value: any) => void;
}

const SendingMails: React.FC<SendingMails> = ({
	cosPrefAttributes,
	readonlyCOS,
	onMailSendReadReceipts,
	changeSwitchOption
}) => {
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
								disabled={readonlyCOS}
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
						<Container crossAlignment="flex-start">
							<Switch
								value={cosPrefAttributes?.zimbraAllowAnyFromAddress === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraAllowAnyFromAddress')}
								label={t('cos.allow_sending_from_any_address', 'Allow sending from any address')}
								iconColor="primary"
								disabled
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
								selection={
									SEND_READ_RECEIPTS.find(
										(item) => item.value === cosPrefAttributes?.zimbraPrefMailSendReadReceipts
									) || SEND_READ_RECEIPTS[0]
								}
								onChange={onMailSendReadReceipts}
								disabled={readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Divider />
		</Row>
	);
};

export default SendingMails;
