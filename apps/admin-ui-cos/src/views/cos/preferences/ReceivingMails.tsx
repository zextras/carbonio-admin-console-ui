/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow, Row, Select, SelectItem } from '@zextras/ui-components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types/cos';
import { AttributeValue } from '../constants/types';
import { findSelectItemWithFallback } from '../utils';

interface ReceivingMailsProps {
	cosPrefAttributes: CosPrefAttributes;
	isReadOnlyCosEntry: boolean;
	onCosAttributeChanged: (attribute: keyof CosPrefAttributes, value: AttributeValue) => void;
}

export const ReceivingMails = ({
	cosPrefAttributes,
	isReadOnlyCosEntry,
	onCosAttributeChanged
}: ReceivingMailsProps): React.JSX.Element => {
	const { t } = useTranslation();

	const TIME_TYPES: SelectItem[] = [
		{ label: `${t('label.days', 'Days')}`, value: 'd' },
		{ label: `${t('label.hours', 'Hours')}`, value: 'h' },
		
		{ label: `${t('label.minutes', 'Minutes')}`, value: 'm' },
		{ label: `${t('label.seconds', 'Seconds')}`, value: 's' }
	];

	const POLLING_INTERVAL: SelectItem[] = [
		{
			label: t('cos.as_new_mail_arrives', 'As New Mail Arrives'),
			value: '500'
		},
		{ label: `2 ${t('label.minutes', 'minutes')}`, value: '2m' },
		{ label: `3 ${t('label.minutes', 'minutes')}`, value: '3m' },
		{ label: `4 ${t('label.minutes', 'minutes')}`, value: '4m' },
		{ label: `5 ${t('label.minutes', 'minutes')}`, value: '5m' },
		{ label: `6 ${t('label.minutes', 'minutes')}`, value: '6m' },
		{ label: `7 ${t('label.minutes', 'minutes')}`, value: '7m' },
		{ label: `8 ${t('label.minutes', 'minutes')}`, value: '8m' },
		{ label: `9 ${t('label.minutes', 'minutes')}`, value: '9m' },
		{ label: `10 ${t('label.minutes', 'minutes')}`, value: '10m' },
		{ label: `15 ${t('label.minutes', 'minutes')}`, value: '15m' },
		{
			label: t('cos.manuallly', 'Manually'),
			value: '31536000s'
		}
	];

	const [zimbraPrefMailPollingIntervalNum, setZimbraPrefMailPollingIntervalNum] = useState(
		cosPrefAttributes?.zimbraMailMinPollingInterval?.slice(0, -1) || ''
	);
	const [prefMailPollingIntervalType, setPrefMailPollingIntervalType] = useState(
		cosPrefAttributes?.zimbraMailMinPollingInterval?.slice(-1) || ''
	);

	const onPrefMailPollingIntervalNumChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		onCosAttributeChanged(
			'zimbraMailMinPollingInterval',
			e.target.value ? `${e.target.value}${prefMailPollingIntervalType}` : ''
		);
		setZimbraPrefMailPollingIntervalNum(e.target.value);
	};

	const onPrefMailPollingIntervalTypeChange = (
		v: SelectItem[] | string | null
	) => {
		let typeValue = '';
		if (typeof v === 'string') {
			typeValue = v;
		} else if (Array.isArray(v)) {
			typeValue = v[0]?.value ?? '';
		}
		onCosAttributeChanged(
			'zimbraMailMinPollingInterval',
			zimbraPrefMailPollingIntervalNum ? `${zimbraPrefMailPollingIntervalNum}${typeValue}` : ''
		);
	};

	useEffect(() => {
		setZimbraPrefMailPollingIntervalNum(
			cosPrefAttributes?.zimbraMailMinPollingInterval?.slice(0, -1)
		);
		setPrefMailPollingIntervalType(cosPrefAttributes?.zimbraMailMinPollingInterval?.slice(-1));
	}, [cosPrefAttributes?.zimbraMailMinPollingInterval]);

	const SEND_READ_RECEIPTS: SelectItem[] = [
		{ label: t('label.never_send_read_receipt', 'Never send a read receipt'), value: 'never' },
		{ label: t('label.always_send_read_receipt', 'Always send a read receipt'), value: 'always' },
		{ label: t('label.ask_me', 'Ask me'), value: 'prompt' }
	];

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<ds-text as="strong" weight="bold">
				{t('label.receiving_mails', 'Receiving Mails')}
			</ds-text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container padding={{ right: 'small' }}>
							<Input
								inputName="zimbraPrefMailMinPollingInterval"
								label={t('cos.minimum_mail_polling_interval', 'Minimum mail polling interval')}
								backgroundColor="gray5"
								value={zimbraPrefMailPollingIntervalNum}
								type="number"
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									onPrefMailPollingIntervalNumChange(e);
								}}
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Select
								items={TIME_TYPES}
								background={'gray5'}
								label={t('cos.days_hours_minutes_sec', 'Days / Hours / Minutes / Sec')}
								showCheckbox={false}
								selection={
									prefMailPollingIntervalType === ''
										? TIME_TYPES[-1]
										: TIME_TYPES.find((item) => item.value === prefMailPollingIntervalType) ||
											TIME_TYPES[0]
								}
								onChange={onPrefMailPollingIntervalTypeChange}
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Row mainAlignment="center" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start">
							<Select
								items={POLLING_INTERVAL}
								background={'gray5'}
								label={t('cos.polling_interval', 'Polling interval')}
								showCheckbox={false}
								selection={
									cosPrefAttributes?.zimbraPrefMailPollingInterval === ''
										? POLLING_INTERVAL[-1]
										: POLLING_INTERVAL.find(
												(item) => item.value === cosPrefAttributes?.zimbraPrefMailPollingInterval
											) || POLLING_INTERVAL[0]
								}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefMailPollingInterval', value)
								}
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
