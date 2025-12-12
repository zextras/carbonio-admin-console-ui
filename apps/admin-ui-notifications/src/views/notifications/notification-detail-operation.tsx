/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FC } from 'react';
import { useParams } from 'react-router-dom';

import { LIST } from '../../constants';
import NotificationListView from './notification-list-view';

const NotificationDetailOperation: FC = () => {
	const { operation }: { operation: string } = useParams();
	return (
		<>
			{((): any => {
				// eslint-disable-next-line sonarjs/no-small-switch
				switch (operation) {
					case LIST:
						return <NotificationListView />;
					default:
						return null;
				}
			})()}
		</>
	);
};

export default NotificationDetailOperation;
