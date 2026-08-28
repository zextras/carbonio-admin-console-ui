/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/ui-components';
import { type FC } from 'react';

import { MainSettingsSection } from './main-settings-section';
import { OwnersSettingsSection } from './owners-settings-section';
import { SendingOptionsSection } from './sending-options-section';

const SettingsSection: FC = () => (
	<Container mainAlignment="flex-start">
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="calc(100vh - 13.125rem)"
			background="white"
			style={{ overflow: 'auto', padding: '1rem' }}
		>
			<MainSettingsSection />
			<OwnersSettingsSection />
			<SendingOptionsSection />
		</Container>
	</Container>
);

export default SettingsSection;
