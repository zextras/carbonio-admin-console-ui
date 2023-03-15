/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Icon, Button, Table, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListRow from '../list/list-row';
import { useServerStore } from '../../store/server/store';
import { Server } from '../../../types';
import { getVersionInfo } from '../../services/get-version-info';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';

export const VersionText = styled(Text)`
	background: #2b73d2;
	width: 4.813rem;
	border-radius: 3.125rem;
	padding: 0.188rem 0 0 0;
	height: 1.188rem;
	text-align: center;
`;

const DashboardServerList: FC<{
	goToMailStoreServerList: () => void;
}> = ({ goToMailStoreServerList }) => {
	const [t] = useTranslation();
	const serverList = useServerStore((state) => state.serverList || []);
	const [serverListRow, setServerListRow] = useState<Array<any>>([]);
	const [serverVersion, setServerVersion] = useState<any>({});
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const getVersionInformation = useCallback(() => {
		getVersionInfo().then((res) => {
			if (res && res?.info && Array.isArray(res?.info)) {
				setServerVersion(res?.info[0]);
			}
		});
	}, []);
	useEffect(() => {
		getVersionInformation();
	}, [getVersionInformation]);

	useEffect(() => {
		if (serverList.length > 0) {
			const allRows = serverList.map((item: Server) => ({
				id: item?.id,
				columns: [
					<Text
						size="small"
						color="gray1"
						weight="bold"
						key={item}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
						}}
					>
						{item?.name}
					</Text>,
					<VersionText
						size="small"
						weight="regular"
						color="gray6"
						key={item?.name}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
						}}
					>
						{`${serverVersion?.majorversion}.${serverVersion?.minorversion}.${serverVersion?.microversion}`}
					</VersionText>,
					isAdvanced ? (
						<VersionText
							size="small"
							weight="regular"
							color="gray6"
							key={item?.name}
							onClick={(event: { stopPropagation: () => void }): void => {
								event.stopPropagation();
							}}
						>
							{`${serverVersion?.majorversion}.${serverVersion?.minorversion}.${serverVersion?.microversion}`}
						</VersionText>
					) : (
						''
					),
					<Text
						size="small"
						weight="bold"
						color="gray1"
						key={item?.name}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
						}}
					>
						{item && item?.a
							? item?.a.find((attribute: any) => attribute?.n === 'description')?._content
							: ''}
					</Text>
				]
			}));
			setServerListRow(allRows);
		} else {
			setServerListRow([]);
		}
	}, [serverList, serverVersion, isAdvanced]);

	const headers: any[] = useMemo(
		() => [
			{
				id: 'server_name',
				label: t('dashboard.server_name', 'Server name'),
				width: '25%',
				bold: true
			},
			{
				id: 'carbonio_core',
				label: t('dashboard.core_version', 'Core Version'),
				width: '20%',
				bold: true
			},
			{
				id: 'carbonio',
				label: '',
				width: isAdvanced ? '20%' : '0%',
				bold: true
			},
			{
				id: 'description',
				label: t('dashboard.description', 'Description'),
				width: '35%',
				bold: true
			}
		],
		[t, isAdvanced]
	);

	return (
		<Container background="gray6">
			<ListRow>
				<Container
					padding={{ all: 'extralarge' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
				>
					<ListRow>
						<Container mainAlignment="flex-start" crossAlignment="flex-start" width="2.2rem">
							<Icon icon="HardDriveOutline" height={'1.5rem'} width="1.5rem" />
						</Container>
						<Container mainAlignment="center" crossAlignment="flex-start">
							<Text size="medium" color="gray0" weight="bold">
								{t('label.server_list', 'Servers List')}
							</Text>
						</Container>
					</ListRow>
				</Container>
				<Container
					mainAlignment="flex-end"
					crossAlignment="flex-end"
					padding={{ all: 'extralarge' }}
				>
					<Button
						type="ghost"
						label={t('dashboard.go_to_mailstores_server_list', 'Go to mailstores servers list')}
						color="primary"
						onClick={goToMailStoreServerList}
						size="large"
					/>
				</Container>
			</ListRow>
			<ListRow>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					maxHeight="calc(100vh - 25rem)"
					minHeight="auto"
				>
					<Table
						rows={serverListRow}
						headers={headers}
						showCheckbox={false}
						multiSelect={false}
						style={{ overflow: 'auto', height: '100%' }}
						RowFactory={CustomRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
		</Container>
	);
};
export default DashboardServerList;
