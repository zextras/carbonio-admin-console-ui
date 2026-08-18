/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ListRow, NotificationView } from '@zextras/ui-components';

export const NotificationListView = () => (
	<Container background="gray6" height="auto" padding={{ top: 'large' }}>
		<ListRow>
			<NotificationView isShowTitle isAddPadding />
		</ListRow>
	</Container>
);
