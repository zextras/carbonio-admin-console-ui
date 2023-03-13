/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo } from 'react';
import { Container, Row, Text, Table } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { LOCAL_VALUE, NO, YES } from '../../../../constants';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';

const IndexerVolumeTable: FC<{
	volumes: Array<any>;
	selectedRows: any;
	onSelectionChange: any;
	headers: any;
	onClick: any;
}> = ({ volumes, selectedRows, onSelectionChange, headers, onClick }) => {
	const [t] = useTranslation();
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: v?.id,
				columns: [
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.id}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.name}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.storeType === LOCAL_VALUE
							? t('volume.volume_allocation_list.local_block_device', 'Local Block Device')
							: t('volume.volume_allocation_list.object_storage', 'ObjectStorage')}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.storeType === LOCAL_VALUE
							? v?.path
							: t('label.prefix_volume', 'Prefix - {{volumePrefix}}', {
									volumePrefix: v?.volumePrefix
							  })}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						<Text color={v?.isCurrent ? 'text' : 'error'}>{v?.isCurrent ? YES : NO}</Text>
					</Row>
				],
				clickable: true
			})),
		[onClick, t, volumes]
	);
	return (
		<Container crossAlignment="flex-start">
			<Table
				headers={headers}
				rows={tableRows}
				showCheckbox={false}
				multiSelect={false}
				selectedRows={selectedRows}
				onSelectionChange={onSelectionChange}
				RowFactory={CustomRowFactory}
				HeaderFactory={CustomHeaderFactory}
			/>
			{tableRows?.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>{t('label.empty_table_helperText', 'Empty Table')}</Text>
				</Row>
			)}
		</Container>
	);
};

export default IndexerVolumeTable;
