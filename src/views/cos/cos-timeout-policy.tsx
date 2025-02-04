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
	Row,
	Select,
	SingleSelectionOnChange,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { TimeItems } from '../../../types';
import ListRow from '../list/list-row';

type TimeoutPolicyProps = {
	zimbraAdminAuthTokenLifetimeNum: string | undefined;
	zimbraAdminAuthTokenLifetimeType: string | undefined;
	zimbraAuthTokenLifetimeNum: string | undefined;
	zimbraAuthTokenLifetimeType: string | undefined;
	zimbraMailIdleSessionTimeoutNum: string | undefined;
	zimbraMailIdleSessionTimeoutType: string | undefined;
	readonlyCOS: boolean;
	timeItems: TimeItems;
	onZimbraAdminAuthTokenLifetimeNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraAdminAuthTokenLifetimeTypeChange: SingleSelectionOnChange;
	onZimbraAuthTokenLifetimeNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraAuthTokenLifetimeTypeChange: SingleSelectionOnChange;
	onZimbraMailIdleSessionTimeoutNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraMailIdleSessionTimeoutTypeChange: SingleSelectionOnChange;
};

const COSTimeoutPolicy: FC<TimeoutPolicyProps> = ({
	zimbraAdminAuthTokenLifetimeNum,
	zimbraAdminAuthTokenLifetimeType,
	zimbraAuthTokenLifetimeNum,
	zimbraAuthTokenLifetimeType,
	zimbraMailIdleSessionTimeoutNum,
	zimbraMailIdleSessionTimeoutType,
	readonlyCOS,
	timeItems,
	onZimbraAdminAuthTokenLifetimeNumChange,
	onZimbraAdminAuthTokenLifetimeTypeChange,
	onZimbraAuthTokenLifetimeNumChange,
	onZimbraAuthTokenLifetimeTypeChange,
	onZimbraMailIdleSessionTimeoutNumChange,
	onZimbraMailIdleSessionTimeoutTypeChange
}) => {
	const [t] = useTranslation();
	const labels = {
		timeRange: t('cos.time_range', 'Time Range')
	};
	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('cos.timeout_policy', 'Timeout Policy')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container width="100%" crossAlignment="flex-start" padding={{ right: 'small' }}>
							<Input
								label={t(
									'cos.admin_console_auth_token_lifetime',
									'Admin console auth token lifetime'
								)}
								value={zimbraAdminAuthTokenLifetimeNum}
								backgroundColor={'gray5'}
								inputName="zimbraAdminAuthTokenLifetime"
								onChange={onZimbraAdminAuthTokenLifetimeNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								data-testid="zimbraAdminAuthTokenLifetimeType"
								items={timeItems}
								background={'gray5'}
								label={labels.timeRange}
								selection={
									timeItems.find((item) => item.value === zimbraAdminAuthTokenLifetimeType) ??
									timeItems[-1]
								}
								showCheckbox={false}
								onChange={onZimbraAdminAuthTokenLifetimeTypeChange}
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
						<Container width="100%" crossAlignment="flex-start" padding={{ right: 'small' }}>
							<Input
								label={t('cos.auth_token_lifetime', 'Auth token lifetime')}
								value={zimbraAuthTokenLifetimeNum}
								backgroundColor={'gray5'}
								inputName="zimbraAuthTokenLifetime"
								onChange={onZimbraAuthTokenLifetimeNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background={'gray5'}
								label={labels.timeRange}
								selection={
									timeItems.find((item) => item.value === zimbraAuthTokenLifetimeType) ??
									timeItems[-1]
								}
								showCheckbox={false}
								onChange={onZimbraAuthTokenLifetimeTypeChange}
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
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container width="100%" crossAlignment="flex-start" padding={{ right: 'small' }}>
							<Input
								label={t('cos.session_idle_timeout', 'Session idle timeout')}
								value={zimbraMailIdleSessionTimeoutNum}
								backgroundColor={'gray5'}
								inputName="zimbraMailIdleSessionTimeout"
								onChange={onZimbraMailIdleSessionTimeoutNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background={'gray5'}
								label={labels.timeRange}
								selection={
									timeItems.find((item) => item.value === zimbraMailIdleSessionTimeoutType) ??
									timeItems[-1]
								}
								showCheckbox={false}
								onChange={onZimbraMailIdleSessionTimeoutTypeChange}
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

export default COSTimeoutPolicy;
