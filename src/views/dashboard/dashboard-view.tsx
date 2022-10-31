/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useEffect, useMemo, useState } from 'react';
import { Container, Padding, Text, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import zxboat from '../../assets/zxboat.svg';
import packageJson from '../../../package.json';
import MatomoTracker from '../../matomo-tracker';
import { DASHBOARD } from '../../constants';
import { useGlobalConfigStore } from '../../store/global-config/store';

const Dashboard: FC = () => {
	const [t] = useTranslation();
	const matomo = useMemo(() => new MatomoTracker(), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const accounts = useUserAccounts();
	const [userName, setUserName] = useState<string>('');
	const [version, setVersion] = useState<string>('');

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${DASHBOARD}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	useEffect(() => {
		if (accounts[0]?.displayName) {
			setUserName(accounts[0]?.displayName);
		} else if (accounts[0]?.name) {
			setUserName(accounts[0]?.name.split('@')[0]);
		}
	}, [accounts]);
	useEffect(() => {
		if (packageJson?.version) {
			setVersion(packageJson?.version);
		}
	}, []);
	return (
		<Container height="100%" mainAlignment="center" crossAlignment="center" background="gray5">
			<Container>
				<Text
					overflow="break-word"
					weight="normal"
					size="large"
					style={{ whiteSpace: 'pre-line', textAlign: 'center', fontFamily: 'roboto' }}
				>
					<img src={zxboat} alt="logo" />
				</Text>
				<Text
					color="#828282"
					overflow="break-word"
					weight="light"
					size="large"
					style={{ fontSize: '36px', fontFamily: 'roboto', height: '45px' }}
				>
					{t('welcome_to_carbonio_display_name', {
						adminName: userName,
						carbonioVersion: version,
						defaultValue: 'Welcome {{adminName}}!'
					})}
				</Text>
				<Text color="#828282" overflow="break-word" weight="light" style={{ fontSize: '24px' }}>
					{t('select_section_from_left_menu', 'Please select a section from the left menu')}
				</Text>
			</Container>
		</Container>
	);
};
export default Dashboard;
