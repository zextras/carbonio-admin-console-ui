/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Row, Text, Divider, useSnackbar } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { OperationsTable } from './operations-table';
import { OperationsDoneHeader } from '../utility/utils';
import OperationsWizardDetailPanel from './operations-wizard-detail-panel';
import { useOperationStore } from '../../store/operation/store';
import ModalOverlay from '../components/ModalOverlay';
import { getAllDoneOperations } from '../../services/get-all-done-operation';
import Paging from '../components/paging';
import TrackNumberPerPage from '../app/shared/track-number-per-page';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const DoneDetailPanel: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { doneData, setDoneData } = useOperationStore((state) => state);
	const operationsDoneHeader = useMemo(() => OperationsDoneHeader(t), [t]);
	const [wizardDetailToggle, setWizardDetailToggle] = useState(false);
	const [selectedData, setSelectedData] = useState<any>();
	const [isSelectedRow, setIsSelectedRow] = useState([]);
	const [limit, setLimit] = useState<number>(10);
	const [doneOffset, setDoneOffset] = useState<number>(10);
	const [totalData, setTotalData] = useState<number>(0);
	const [doneOperationPaginationData, setDoneOperationPaginationData] = useState<any[]>([]);

	const getDoneOperationAPICallHandler = useCallback(() => {
		getAllDoneOperations()
			.then((response: any) => {
				const res = JSON.parse(response?.Body?.response?.content);
				if (res?.ok) {
					const result = res?.response?.operationList;
					console.log('__doneData', result);
					setTotalData(result?.length);
					setDoneData(result);
				}
			})
			.catch((err) => {
				createSnackbar({
					key: '1',
					type: 'error',
					label: t('label.operation.get_done_operation_error', '{{name}}', {
						name: err
					})
				});
			});
	}, [createSnackbar, setDoneData, t]);

	const handleClick = (i: any): any => {
		const volumeObject: any = doneData?.find((s: any, index: any) => index === i);
		setSelectedData(volumeObject);
		setWizardDetailToggle(true);
	};

	useEffect(() => {
		getDoneOperationAPICallHandler();
	}, [getDoneOperationAPICallHandler]);

	useEffect(() => {
		const startIndex = doneOffset * 1;
		const endIndex = startIndex + limit;
		const paginatedData = doneData.slice(startIndex, endIndex);
		setDoneOperationPaginationData(paginatedData);
	}, [doneData, doneOffset, limit, totalData]);

	return (
		<>
			{wizardDetailToggle && (
				<ModalOverlay setOpen={setWizardDetailToggle} open={wizardDetailToggle}>
					<OperationsWizardDetailPanel
						setWizardDetailToggle={setWizardDetailToggle}
						setOpen=""
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
					height="calc(100vh - 12.5rem)"
					padding={{ all: 'large' }}
				>
					<Row width="100%" padding={{ top: 'large' }}>
						<OperationsTable
							operations={doneOperationPaginationData}
							headers={operationsDoneHeader}
							donePanel
							selectedRows={isSelectedRow}
							onSelectionChange={(selected: any): any => {
								setIsSelectedRow(selected);
							}}
							onClick={(i: any): any => {
								handleClick(i);
							}}
						/>
					</Row>
				</Container>
				{doneData.length !== 0 && (
					<Container
						orientation="horizontal"
						mainAlignment="space-between"
						width="100%"
						style={{ position: 'absolute', bottom: '0rem' }}
						height="auto"
						padding={{ all: 'large' }}
					>
						<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
							<Paging totalItem={totalData} setOffset={setDoneOffset} pageSize={limit} />
						</Container>
						<Container
							crossAlignment="flex-end"
							orientation="horizontal"
							mainAlignment="flex-end"
							padding={{ all: 'small' }}
						>
							<TrackNumberPerPage pageSize={limit} />
						</Container>
					</Container>
				)}
			</RelativeContainer>
		</>
	);
};

export default DoneDetailPanel;
