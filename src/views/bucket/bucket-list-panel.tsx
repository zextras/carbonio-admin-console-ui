/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState, useMemo, useEffect } from 'react';
import { Container, Icon, Padding, List, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import ListPanelItem from '../list/list-panel-item';
import ListItems from '../list/list-items';
import { BUCKET_LIST, SERVERS_LIST, VOLUME, HMS_SETTINGS, INDEXER_SETTINGS } from '../../constants';

const BucketListPanel: FC = () => {
	const [isstoreselect, setIsStoreSelect] = useState(false);
	const [selectedOperationItem, setSelectedOperationItem] = useState('');
	const [isServerListExpand, setIsServerListExpand] = useState(true);
	const [isServerSpecificListExpand, setIsServerSpecificListExpand] = useState(true);

	const [t] = useTranslation();

	const globalServerOption = useMemo(
		() => [
			{
				id: SERVERS_LIST,
				name: t('label.servers_list', 'Servers List'),
				isSelected: isstoreselect
			},
			{
				id: BUCKET_LIST,
				name: t('label.bucket_list', 'Bucket List'),
				isSelected: isstoreselect
			}
		],
		[t, isstoreselect]
	);
	const serverSpecificOption = useMemo(
		() => [
			{
				id: VOLUME,
				name: t('label.volume', 'Volume'),
				isSelected: isstoreselect
			},
			{
				id: HMS_SETTINGS,
				name: t('label.hms_settings', 'HMS Settings'),
				isSelected: isstoreselect
			},
			{
				id: INDEXER_SETTINGS,
				name: t('label.indexer_settings', 'Indexer Settings'),
				isSelected: isstoreselect
			}
		],
		[t, isstoreselect]
	);
	useEffect(() => {
		setIsStoreSelect(true);
	}, []);

	useEffect(() => {
		setSelectedOperationItem(SERVERS_LIST);
	}, []);

	useEffect(() => {
		if (isstoreselect) {
			if (selectedOperationItem) {
				replaceHistory(`/${selectedOperationItem}`);
			} else {
				replaceHistory(`/${selectedOperationItem}`);
			}
		}
	}, [isstoreselect, selectedOperationItem]);

	const toggleServer = (): void => {
		setIsServerListExpand(!isServerListExpand);
	};
	const toggleServerSpecific = (): void => {
		setIsServerSpecificListExpand(!isServerSpecificListExpand);
	};

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			style={{ overflowY: 'auto' }}
			width="100%"
			background="gray5"
		>
			<Container crossAlignment="flex-start" mainAlignment="flex-start">
				<ListPanelItem
					title={t('label.global_servers', 'Global Servers')}
					isListExpanded={isServerListExpand}
					setToggleView={toggleServer}
				/>
				{isServerListExpand && (
					<ListItems
						items={globalServerOption}
						selectedOperationItem={selectedOperationItem}
						setSelectedOperationItem={setSelectedOperationItem}
					/>
				)}
				<ListPanelItem
					title={t('label.server_specific', 'Server Specific')}
					isListExpanded={isServerSpecificListExpand}
					setToggleView={toggleServerSpecific}
				/>
				{isServerSpecificListExpand && (
					<ListItems
						items={serverSpecificOption}
						selectedOperationItem={selectedOperationItem}
						setSelectedOperationItem={setSelectedOperationItem}
					/>
				)}
			</Container>
		</Container>
	);
};
export default BucketListPanel;
