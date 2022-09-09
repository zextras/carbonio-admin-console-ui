/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import ListPanelItem from '../list/list-panel-item';
import { ADVANCED, IMPORT_EXTERNAL_BACKUP, SERVERS_LIST, SERVER_CONFIG } from '../../constants';
import ListItems from '../list/list-items';

const BackupListPanel: FC = () => {
	const [t] = useTranslation();
	const [selectedOperationItem, setSelectedOperationItem] = useState(SERVER_CONFIG);
	const [isDefaultSettingsExpanded, setIsDefaultSettingsExpanded] = useState(true);
	const [isServerSettingsEpanded, setIsServerSettingsEpanded] = useState(true);
	const [isActionExpanded, setIsActionExpanded] = useState(true);
	const defaultSettingsOptions = useMemo(
		() => [
			{
				id: SERVER_CONFIG,
				name: t('label.server_config', 'Server Config'),
				isSelected: true
			},
			{
				id: ADVANCED,
				name: t('label.advanced', 'Advanced'),
				isSelected: true
			}
		],
		[t]
	);

	const serverSettingsOptions = useMemo(
		() => [
			{
				id: SERVERS_LIST,
				name: t('label.servers_list', 'Servers List'),
				isSelected: true
			}
		],
		[t]
	);

	const actionOptions = useMemo(
		() => [
			{
				id: IMPORT_EXTERNAL_BACKUP,
				name: t('label.import_an_external_backup', 'Import an External Backup'),
				isSelected: true
			}
		],
		[t]
	);

	useEffect(() => {
		replaceHistory(`/${selectedOperationItem}`);
	}, [selectedOperationItem]);

	const toggleDefaultSettingsView = (): void => {
		setIsDefaultSettingsExpanded(!isDefaultSettingsExpanded);
	};
	const toggleServerSettingsView = (): void => {
		setIsServerSettingsEpanded(!isServerSettingsEpanded);
	};
	const toggleActionView = (): void => {
		setIsActionExpanded(!isActionExpanded);
	};

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
		>
			<ListPanelItem
				title={t('label.default_settings', 'Default Settings')}
				isListExpanded={isDefaultSettingsExpanded}
				setToggleView={toggleDefaultSettingsView}
			/>
			{isDefaultSettingsExpanded && (
				<ListItems
					items={defaultSettingsOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}

			<ListPanelItem
				title={t('label.server_settings', 'Server Settings')}
				isListExpanded={isServerSettingsEpanded}
				setToggleView={toggleServerSettingsView}
			/>
			{isServerSettingsEpanded && (
				<ListItems
					items={serverSettingsOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}

			<ListPanelItem
				title={t('label.actions', 'Actions')}
				isListExpanded={isActionExpanded}
				setToggleView={toggleActionView}
			/>
			{isActionExpanded && (
				<ListItems
					items={actionOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}
		</Container>
	);
};
export default BackupListPanel;
