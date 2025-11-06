/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container } from '@zextras/carbonio-design-system';
import React, { FC } from 'react';


import NotificationView from '../app/shared/notification-view';
import ListRow from '../list/list-row';

const NotificationListView: FC = () => (
	<Container background="gray6" height="auto" padding={{ top: 'large' }}>
		<ListRow>
			<NotificationView isShowTitle isAddPadding />
		</ListRow>
	</Container>
);

export default NotificationListView;
