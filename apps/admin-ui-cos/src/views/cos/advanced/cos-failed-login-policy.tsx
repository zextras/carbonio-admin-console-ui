/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Divider,
	Input,
	Row,
	Select,
	SingleSelectionOnChange,
	Switch,
	Text
} from '@zextras/carbonio-design-system';
import React, { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountType } from '../../../../types/account';
import { TimeItems } from '../../../../types/general';
import ListRow from '../../list/list-row';

type FailedLoginPolicyProps = {
	cosAdvanced: AccountType;
	readonlyCOS: boolean;
	timeItems: TimeItems;
	zimbraPasswordLockoutDurationNum: string | undefined;
	zimbraPasswordLockoutDurationType: string | undefined;
	zimbraPasswordLockoutFailureLifetimeNum: string | undefined;
	zimbraPasswordLockoutFailureLifetimeType: string | undefined;
	changeSwitchOption: (key: keyof AccountType) => void;
	changeValue: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraPasswordLockoutDurationNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraPasswordLockoutDurationTypeChange: SingleSelectionOnChange;
	onZimbraPasswordLockoutFailureLifetimeNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraPasswordLockoutFailureLifetimeTypeChange: SingleSelectionOnChange;
};

const COSFailedLoginPolicy: FC<FailedLoginPolicyProps> = ({
	cosAdvanced,
	readonlyCOS,
	timeItems,
	changeSwitchOption,
	zimbraPasswordLockoutDurationNum,
	zimbraPasswordLockoutDurationType,
	zimbraPasswordLockoutFailureLifetimeNum,
	zimbraPasswordLockoutFailureLifetimeType,
	changeValue,
	onZimbraPasswordLockoutDurationNumChange,
	onZimbraPasswordLockoutDurationTypeChange,
	onZimbraPasswordLockoutFailureLifetimeNumChange,
	onZimbraPasswordLockoutFailureLifetimeTypeChange
}) => {
	const [t] = useTranslation();
	const labels = {
		failedLoginPolicy: t('cos.failed_login_policy', 'Failed Login Policy'),
		timeRange: t('cos.time_range', 'Time Range'),
		passwordLockout: {
			enabled: t('cos.enable_failed_login_lockout', 'Enable failed login lockout'),
			maxFailures: t(
				'cos.number_of_consecutive_failed_login_allowed',
				'Number of consecutive failed logins allowed'
			),
			duration: t('cos.time_to_lockout_account', 'Time to lockout the account'),

			failureLifetime: t(
				'cos.time_window_failed_logins_must_occur_to_lock_account',
				'Time window in which the failed logins must occur to lock the account:'
			)
		}
	};

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{labels.failedLoginPolicy}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start">
							<Switch
								value={cosAdvanced.zimbraPasswordLockoutEnabled === 'TRUE'}
								label={labels.passwordLockout.enabled}
								onClick={(): void => changeSwitchOption('zimbraPasswordLockoutEnabled')}
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
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start">
							<Input
								label={labels.passwordLockout.maxFailures}
								value={cosAdvanced.zimbraPasswordLockoutMaxFailures}
								backgroundColor={'gray5'}
								inputName="zimbraPasswordLockoutMaxFailures"
								onChange={changeValue}
								disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container width="72%" padding={{ right: 'small' }}>
							<Input
								label={labels.passwordLockout.duration}
								value={zimbraPasswordLockoutDurationNum}
								backgroundColor={'gray5'}
								inputName="zimbraPasswordLockoutDuration"
								onChange={onZimbraPasswordLockoutDurationNumChange}
								disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
							/>
						</Container>
						<Container width="28%" padding={{ left: 'small', right: 'small' }}>
							<Select
								items={timeItems}
								background={'gray5'}
								label={labels.timeRange}
								selection={
									timeItems.find((item) => item.value === zimbraPasswordLockoutDurationType) ??
									timeItems[-1]
								}
								showCheckbox={false}
								onChange={onZimbraPasswordLockoutDurationTypeChange}
								disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
							/>
						</Container>
						<Container width="72%" padding={{ left: 'small', right: 'small' }}>
							<Input
								label={labels.passwordLockout.failureLifetime}
								value={zimbraPasswordLockoutFailureLifetimeNum}
								backgroundColor={'gray5'}
								inputName="zimbraPasswordLockoutFailureLifetime"
								onChange={onZimbraPasswordLockoutFailureLifetimeNumChange}
								disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
							/>
						</Container>
						<Container width="28%" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background={'gray5'}
								label={labels.timeRange}
								selection={
									timeItems.find(
										(item) => item.value === zimbraPasswordLockoutFailureLifetimeType
									) ?? timeItems[-1]
								}
								showCheckbox={false}
								onChange={onZimbraPasswordLockoutFailureLifetimeTypeChange}
								disabled={cosAdvanced.zimbraPasswordLockoutEnabled !== 'TRUE' || readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Divider />
		</Row>
	);
};

export default COSFailedLoginPolicy;
