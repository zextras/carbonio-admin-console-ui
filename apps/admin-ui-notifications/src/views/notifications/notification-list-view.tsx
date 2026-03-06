/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListRow, NotificationView } from '@zextras/ui-components';
import { FC } from 'react';

const NotificationListView: FC = () => (
	<Container background="gray6" height="auto" padding={{ top: 'large' }}>
		<ListRow>
			<NotificationView isShowTitle isAddPadding />
		</ListRow>
	</Container>
);

export default NotificationListView;
