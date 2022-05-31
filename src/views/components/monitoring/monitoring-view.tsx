/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const MonitoringView: FC = () => {
	const [t] = useTranslation();
	return (
		<Container height="100%" mainAlignment="center" crossAlignment="center" background="gray5">
			{t('label.monitoring', 'Monitoring')}
		</Container>
	);
};

export default MonitoringView;
