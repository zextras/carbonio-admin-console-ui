/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, FC } from 'react';

import {
	Container,
	Divider,
	Input,
	Padding,
	Row,
	Select,
	SingleSelectionOnChange,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import Textarea from '../components/textarea';
import ListRow from '../list/list-row';

type QuotaProps = {
	isAdvanced: boolean;
	showFileQuotaLimitMsg: boolean;
	showAccountQuotaLimitMsg: boolean;
	readonlyCOS: boolean;
	cosAdvanced: any;
	initFileQuotaLimitGBValue: number | undefined;
	fileQuotaLimitGBValue: string | undefined;
	accountQuotaGBValue: string;
	zimbraQuotaWarnIntervalNum: any;
	timeItems: any[];
	zimbraQuotaWarnIntervalType: any;
	onFileQuotaChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraMailQuotaChange: (e: ChangeEvent<HTMLInputElement>) => void;
	changeValue: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraQuotaWarnIntervalNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraQuotaWarnIntervalTypeChange: SingleSelectionOnChange;
};

const COSQuotas: FC<QuotaProps> = ({
	isAdvanced,
	showFileQuotaLimitMsg,
	showAccountQuotaLimitMsg,
	readonlyCOS,
	cosAdvanced,
	initFileQuotaLimitGBValue,
	fileQuotaLimitGBValue,
	accountQuotaGBValue,
	zimbraQuotaWarnIntervalNum,
	timeItems,
	zimbraQuotaWarnIntervalType,
	onFileQuotaChange,
	onZimbraMailQuotaChange,
	changeValue,
	onZimbraQuotaWarnIntervalNumChange,
	onZimbraQuotaWarnIntervalTypeChange
}) => {
	const [t] = useTranslation();

	const labels = {
		quotas: t('cos.quotas', 'Quotas'),
		filesAccountQuotaGB: t('cos.files_account_quota_gb', 'Files Account quota (GB)'),
		mailsAccountQuotaGB: t('cos.mails_account_quota_gb', 'Mails Account quota (GB)'),
		maximumDigitsAllowed: t(
			'label.maximum_3_digits_allowed_decimal_point',
			'Maximum 3 digits allowed after the decimal point'
		),
		maxContactsAllowedInTheFolder: t(
			'cos.max_contacts_allowed_in_the_folder',
			'Max contacts allowed in the folder'
		),
		percentageThresholdForQuotaWarningMessages: t(
			'cos.percentage_threshold_for_quota_warning',
			'Percentage threshold for quota warning messages (%)'
		),
		minimumDurationOfTimeBetweenQuotaWarnings: t(
			'cos.minimum_duration_of_time_between_quota_warnings',
			'Minimum duration of time between quota warnings'
		),
		timeRange: t('cos.time_range', 'Time Range'),
		quotaWarningMessageTemplate: t(
			'cos.quota_warning_message_template',
			'Quota warning message template'
		)
	};
	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{labels.quotas}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
					padding={{ top: 'large' }}
				>
					<ListRow>
						{isAdvanced && initFileQuotaLimitGBValue && (
							<Container padding={{ right: 'small' }}>
								<Input
									label={labels.filesAccountQuotaGB}
									value={fileQuotaLimitGBValue}
									backgroundColor="gray5"
									inputName="fileQuotaLimit"
									onChange={onFileQuotaChange}
									disabled={readonlyCOS}
								/>
								{showFileQuotaLimitMsg && (
									<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
										<Padding top="small">
											<Text size="extrasmall" weight="regular" color="primary">
												{labels.maximumDigitsAllowed}
											</Text>
										</Padding>
									</Container>
								)}
							</Container>
						)}
						<Container padding={{ right: 'small' }}>
							<Input
								label={labels.mailsAccountQuotaGB}
								value={accountQuotaGBValue}
								backgroundColor="gray5"
								inputName="zimbraMailQuota"
								onChange={onZimbraMailQuotaChange}
								disabled={readonlyCOS}
							/>
							{showAccountQuotaLimitMsg && (
								<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
									<Padding top="small">
										<Text size="extrasmall" weight="regular" color="primary">
											{labels.maximumDigitsAllowed}
										</Text>
									</Padding>
								</Container>
							)}
						</Container>
						<Container padding={{ left: 'small' }}>
							<Input
								label={labels.maxContactsAllowedInTheFolder}
								value={cosAdvanced.zimbraContactMaxNumEntries}
								backgroundColor="gray5"
								inputName="zimbraContactMaxNumEntries"
								onChange={changeValue}
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
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container width="100%" padding={{ right: 'small' }}>
							<Input
								label={labels.percentageThresholdForQuotaWarningMessages}
								value={cosAdvanced.zimbraQuotaWarnPercent}
								backgroundColor="gray5"
								inputName="zimbraQuotaWarnPercent"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="72%" padding={{ left: 'small', right: 'small' }}>
							<Input
								label={labels.minimumDurationOfTimeBetweenQuotaWarnings}
								value={zimbraQuotaWarnIntervalNum}
								backgroundColor="gray5"
								inputName="zimbraQuotaWarnInterval"
								onChange={onZimbraQuotaWarnIntervalNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="26%" padding={{ left: 'small' }}>
							{/* TODO: rember that you can add type on select component */}
							<Select
								items={timeItems}
								background="gray5"
								// eslint-disable-next-line sonarjs/no-duplicate-string
								label={labels.timeRange}
								selection={
									zimbraQuotaWarnIntervalType === ''
										? timeItems[0]
										: // eslint-disable-next-line max-len
										  timeItems.find((item: any) => item.value === zimbraQuotaWarnIntervalType)
								}
								showCheckbox={false}
								onChange={onZimbraQuotaWarnIntervalTypeChange}
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
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container>
							<Textarea
								label={labels.quotaWarningMessageTemplate}
								value={cosAdvanced.zimbraQuotaWarnMessage}
								backgroundColor="gray5"
								inputName="zimbraQuotaWarnMessage"
								onChange={changeValue}
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

export default COSQuotas;
