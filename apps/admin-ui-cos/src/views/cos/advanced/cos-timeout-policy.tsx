/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow, Row, Select } from '@zextras/ui-components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TimeItems } from '../../../../types/general';
import { TimeFieldState } from './hooks/use-time-field-state';

type TimeoutPolicyProps = {
	adminAuthTokenLifetime: TimeFieldState;
	authTokenLifetime: TimeFieldState;
	mailIdleSessionTimeout: TimeFieldState;
	readonlyCOS: boolean;
	timeItems: TimeItems;
};

const COSTimeoutPolicy: FC<TimeoutPolicyProps> = ({
	adminAuthTokenLifetime,
	authTokenLifetime,
	mailIdleSessionTimeout,
	readonlyCOS,
	timeItems,
}) => {
	const [t] = useTranslation();
	const labels = {
		timeRange: t('cos.time_range', 'Time Range'),
		timeoutPolicy: t('cos.timeout_policy', 'Timeout Policy'),
		adminAuthTokenLifetime: t(
			'cos.admin_console_auth_token_lifetime',
			'Admin console auth token lifetime'
		),
		authTokenLifetime: t('cos.auth_token_lifetime', 'Auth token lifetime'),
		mailIdleSessionTimeout: t('cos.session_idle_timeout', 'Session idle timeout')
	};
	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<ds-text as="strong" weight="bold">
				{labels.timeoutPolicy}
			</ds-text>
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
								label={labels.adminAuthTokenLifetime}
								value={adminAuthTokenLifetime.num}
								backgroundColor={'gray5'}
								inputName="zimbraAdminAuthTokenLifetime"
								onChange={adminAuthTokenLifetime.onNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background={'gray5'}
								label={labels.timeRange}
								selection={
									timeItems.find((item) => item.value === adminAuthTokenLifetime.type) ??
									timeItems[-1]
								}
								showCheckbox={false}
								onChange={adminAuthTokenLifetime.onTypeChange}
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
								label={labels.authTokenLifetime}
								value={authTokenLifetime.num}
								backgroundColor={'gray5'}
								inputName="zimbraAuthTokenLifetime"
								onChange={authTokenLifetime.onNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background={'gray5'}
								label={labels.timeRange}
								selection={
									timeItems.find((item) => item.value === authTokenLifetime.type) ??
									timeItems[-1]
								}
								showCheckbox={false}
								onChange={authTokenLifetime.onTypeChange}
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
								label={labels.mailIdleSessionTimeout}
								value={mailIdleSessionTimeout.num}
								backgroundColor={'gray5'}
								inputName="zimbraMailIdleSessionTimeout"
								onChange={mailIdleSessionTimeout.onNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background={'gray5'}
								label={labels.timeRange}
								selection={
									timeItems.find((item) => item.value === mailIdleSessionTimeout.type) ??
									timeItems[-1]
								}
								showCheckbox={false}
								onChange={mailIdleSessionTimeout.onTypeChange}
								disabled={readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<ds-divider></ds-divider>
		</Row>
	);
};

export default COSTimeoutPolicy;
