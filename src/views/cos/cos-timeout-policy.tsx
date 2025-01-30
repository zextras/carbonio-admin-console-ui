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
	SelectItem,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ListRow from '../list/list-row';

type TimeoutPolicyProps = {
	zimbraAdminAuthTokenLifetimeNum: any;
	zimbraAdminAuthTokenLifetimeType: any;
	zimbraAuthTokenLifetimeNum: any;
	zimbraAuthTokenLifetimeType: any;
	zimbraMailIdleSessionTimeoutNum: any;
	zimbraMailIdleSessionTimeoutType: any;
	readonlyCOS: boolean;
	timeItems: any[];
	onZimbraAdminAuthTokenLifetimeNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraAdminAuthTokenLifetimeTypeChange: (v: SelectItem[] | string | null) => void;
	onZimbraAuthTokenLifetimeNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraAuthTokenLifetimeTypeChange: (v: SelectItem[] | string | null) => void;
	onZimbraMailIdleSessionTimeoutNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraMailIdleSessionTimeoutTypeChange: (v: SelectItem[] | string | null) => void;
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
					background="gray6"
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
								backgroundColor="gray5"
								inputName="zimbraAdminAuthTokenLifetime"
								onChange={onZimbraAdminAuthTokenLifetimeNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background="gray5"
								label={labels.timeRange}
								selection={
									zimbraAdminAuthTokenLifetimeType === ''
										? timeItems[-1]
										: timeItems.find(
												// eslint-disable-next-line max-len
												(item: any) => item.value === zimbraAdminAuthTokenLifetimeType
										  )
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
					background="gray6"
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container width="100%" crossAlignment="flex-start" padding={{ right: 'small' }}>
							<Input
								label={t('cos.auth_token_lifetime', 'Auth token lifetime')}
								value={zimbraAuthTokenLifetimeNum}
								backgroundColor="gray5"
								inputName="zimbraAuthTokenLifetime"
								onChange={onZimbraAuthTokenLifetimeNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background="gray5"
								label={labels.timeRange}
								selection={
									zimbraAuthTokenLifetimeType === ''
										? timeItems[-1]
										: // eslint-disable-next-line max-len
										  timeItems.find((item: any) => item.value === zimbraAuthTokenLifetimeType)
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
					background="gray6"
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container width="100%" crossAlignment="flex-start" padding={{ right: 'small' }}>
							<Input
								label={t('cos.session_idle_timeout', 'Session idle timeout')}
								value={zimbraMailIdleSessionTimeoutNum}
								backgroundColor="gray5"
								inputName="zimbraMailIdleSessionTimeout"
								onChange={onZimbraMailIdleSessionTimeoutNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
							<Select
								items={timeItems}
								background="gray5"
								label={labels.timeRange}
								selection={
									zimbraMailIdleSessionTimeoutType === ''
										? timeItems[-1]
										: timeItems.find(
												// eslint-disable-next-line max-len
												(item: any) => item.value === zimbraMailIdleSessionTimeoutType
										  )
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
