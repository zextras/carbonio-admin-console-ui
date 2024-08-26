/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Row,
	Text,
	Divider,
	useSnackbar,
	Icon,
	Input
} from '@zextras/carbonio-design-system';
import { find, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { OperationsTable } from './operations-table';
import OperationsWizardDetailPanel from './operations-wizard-detail-panel';
import { getAllDoneOperations } from '../../services/get-all-done-operation';
import { useMailstoreListStore } from '../../store/mailstore-list/store';
import { useOperationStore } from '../../store/operation/store';
import ModalOverlay from '../components/ModalOverlay';
import Paging from '../components/paging';
import { OperationsDoneHeader } from '../utility/utils';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const DoneDetailPanel: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const allServersList = useMailstoreListStore((state) => state.allMailstoreList);
	const { doneData, setDoneData } = useOperationStore((state) => state);
	const operationsDoneHeader = useMemo(() => OperationsDoneHeader(t), [t]);
	const [wizardDetailToggle, setWizardDetailToggle] = useState(false);
	const [selectedData, setSelectedData] = useState<any>();
	const [isSelectedRow, setIsSelectedRow] = useState([]);
	const [limit, setLimit] = useState<number>(10);
	const [doneOffset, setDoneOffset] = useState<number>(10);
	const [totalData, setTotalData] = useState<number>(0);
	const [doneOperationPaginationData, setDoneOperationPaginationData] = useState<
		{ [key: string]: string }[]
	>([]);
	const [filteredOperationData, setFilteredOperationData] = useState(doneData);
	const [searchOperation, setSearchOperation] = useState<string>('');

	const getDoneOperationAPICallHandler = useCallback(() => {
		getAllDoneOperations()
			.then((response: any) => {
				const res = JSON.parse(response?.Body?.response?.content);
				if (res?.ok) {
					const result = res?.response?.operationList;
					const updatedData = map(result, (item1) => {
						const matchingItem2 = find(allServersList, { id: item1.serverId });
						if (matchingItem2) {
							return { ...item1, serverName: matchingItem2.name };
						}
						return item1;
					});
					setSearchOperation('');
					setTotalData(updatedData?.length);
					setDoneData(updatedData);
				}
			})
			.catch((err) => {
				createSnackbar({
					key: '1',
					severity: 'error',
					label: t('label.operation.get_done_operation_error', '{{name}}', {
						name: err
					})
				});
			});
	}, [allServersList, createSnackbar, setDoneData, t]);

	const handleClick = (i: number): void => {
		const volumeObject = doneOperationPaginationData?.find((s, index: number) => index === i);
		setSelectedData(volumeObject);
		setWizardDetailToggle(true);
	};

	useEffect(() => {
		getDoneOperationAPICallHandler();
	}, [getDoneOperationAPICallHandler]);

	useEffect(() => {
		const startIndex = doneOffset * 1;
		const endIndex = startIndex + limit;
		const paginatedData = filteredOperationData.slice(startIndex, endIndex);
		setDoneOperationPaginationData(paginatedData);
		setTotalData(filteredOperationData?.length);
	}, [doneOffset, filteredOperationData, limit, totalData]);

	useEffect(() => {
		const searchText = searchOperation?.toLocaleLowerCase();
		const filterList = doneData.filter(
			(item) =>
				item?.name?.toLowerCase().includes(searchText) ||
				item?.serverName?.toLowerCase().includes(searchText) ||
				item.parameters?.requesterAddress?.toLowerCase().includes(searchText)
		);

		setFilteredOperationData(filterList);
	}, [doneData, searchOperation]);

	return (
		<>
			{wizardDetailToggle && (
				<ModalOverlay setOpen={setWizardDetailToggle} open={wizardDetailToggle}>
					<OperationsWizardDetailPanel
						setWizardDetailToggle={setWizardDetailToggle}
						setOpen={(): void => {
							('');
						}}
						selectedData={selectedData}
					/>
				</ModalOverlay>
			)}
			<RelativeContainer
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				background="white"
			>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
					<Text size="extralarge" weight="bold">
						{t('operations.done_panel_heading', 'Done Operations')}
					</Text>
				</Row>
				<Divider />
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					width="100%"
					padding={{ all: 'large' }}
				>
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="fill"
					>
						<Container>
							<Input
								label={t(
									'label.search_for_a_completed_operation',
									`Search for a completed operation`
								)}
								value={searchOperation}
								backgroundColor="gray5"
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setSearchOperation(e.target.value);
								}}
								CustomIcon={(): JSX.Element => (
									<Icon icon="FunnelOutline" size="large" color="primary" />
								)}
							/>
						</Container>
					</Row>
					<Row width="100%" padding={{ top: 'large' }}>
						<OperationsTable
							operations={doneOperationPaginationData}
							headers={operationsDoneHeader}
							donePanel
							selectedRows={isSelectedRow}
							onSelectionChange={(selected: any): void => {
								setIsSelectedRow(selected);
							}}
							onClick={(i: number): void => {
								handleClick(i);
							}}
						/>
					</Row>
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						width="fill"
						padding={{ top: 'large' }}
					>
						<Divider />
					</Row>
					{filteredOperationData.length !== 0 && (
						<Container
							orientation="horizontal"
							mainAlignment="space-between"
							width="100%"
							height="auto"
						>
							<Container crossAlignment="flex-end">
								<Paging totalItem={totalData} setOffset={setDoneOffset} pageSize={limit} />
							</Container>
						</Container>
					)}
				</Container>
			</RelativeContainer>
		</>
	);
};

export default DoneDetailPanel;
