/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row, Text } from '@zextras/carbonio-design-system';
import React, { FC, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceContext } from './resource-context';
import { SendInviteAccounts } from './send-invite-accounts';

const ResourceSharingSection: FC = () => {
	const context = useContext(ResourceContext);
	const { t } = useTranslation();
	const { resourceDetail, setResourceDetail } = context;

	const setSendInviteList = useCallback(
		(v: any) => {
			setResourceDetail((prev: any) => ({ ...prev, sendInviteList: v }));
		},
		[setResourceDetail]
	);

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 300px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row>
					<Text size="small" weight="bold">
						{t('label.invites', 'Invites')}
					</Text>
				</Row>

				<SendInviteAccounts
					isEditable
					sendInviteList={resourceDetail?.sendInviteList}
					setSendInviteList={setSendInviteList}
					hideHeaderBar
				/>
			</Container>
		</Container>
	);
};

export default ResourceSharingSection;
