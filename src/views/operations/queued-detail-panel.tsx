/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Text,
	Divider,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { OperationsTable } from './operations-table';
import { OperationsHeader } from '../utility/utils';
import DeleteOpearationsModel from './delete-operations-model';
import OperationsWizardDetailPanel from './operations-wizard-detail-panel';
import { AbsoluteContainer } from '../components/styled';
import { useOperationStore } from '../../store/operation/store';
import { stopOperations } from '../../services/stop-operation';
import { useServerStore } from '../../store/server/store';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const QuededDetailPanel: FC<{ getAllOperationAPICallHandler: any }> = ({
	getAllOperationAPICallHandler
}) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const serverList = useServerStore((state) => state?.serverList)[0]?.name;
	const { queuedData } = useOperationStore((state) => state);
	const operationsHeader = useMemo(() => OperationsHeader(t), [t]);
	const [wizardDetailToggle, setWizardDetailToggle] = useState(false);
	const [open, setOpen] = useState(false);
	const [selectedData, setSelectedData] = useState<any>();
	const [isSelectedRow, setIsSelectedRow] = useState([]);

	const closeHandler = (): any => {
		setOpen(false);
	};

	const stopHandler = (): any => {
		stopOperations(selectedData?.id)
			.then((res) => {
				const result = JSON.parse(res?.Body?.response?.content);
				if (result?.response?.[`${serverList}`]?.ok) {
					createSnackbar({
						key: '1',
						type: 'success',
						label: t(
							'label.cancel_operation_sucess',
							'The {{name}} operation has been canceled successfully',
							{
								name: selectedData?.name
							}
						)
					});
					setOpen(false);
					setWizardDetailToggle(false);
					getAllOperationAPICallHandler();
				} else {
					createSnackbar({
						key: '1',
						type: 'error',
						label: t('label.stop_operation_helperText', '{{message}}', {
							message: result?.response?.[`${serverList}`]?.error?.message
						})
					});
					setOpen(false);
					setWizardDetailToggle(false);
				}
			})
			.catch((err) => {
				createSnackbar({
					key: '1',
					type: 'error',
					label: t('label.operation.stop_operation_error', '{{name}}', {
						name: err
					})
				});
			});
	};

	const handleClick = (i: any): any => {
		const volumeObject: any = queuedData?.find((s: any, index: any) => index === i);
		setSelectedData(volumeObject);
		setWizardDetailToggle(true);
	};

	return (
		<>
			{wizardDetailToggle && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<OperationsWizardDetailPanel
						setWizardDetailToggle={setWizardDetailToggle}
						setOpen={setOpen}
						selectedData={selectedData}
					/>
				</AbsoluteContainer>
			)}
			<RelativeContainer
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflowY: 'auto' }}
				background="white"
			>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
					<Text size="extralarge" weight="bold">
						{t('operations.queued_panel_heading', 'Queued Operations')}
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
					<DeleteOpearationsModel
						open={open}
						closeHandler={closeHandler}
						saveHandler={stopHandler}
						selectedData={selectedData}
					/>
					<Row width="100%" padding={{ top: 'large' }}>
						{queuedData && (
							<OperationsTable
								operations={queuedData}
								headers={operationsHeader}
								donePanel={false}
								selectedRows={isSelectedRow}
								onSelectionChange={(selected: any): any => {
									setIsSelectedRow(selected);
								}}
								onClick={(i: any): any => {
									handleClick(i);
								}}
							/>
						)}
					</Row>
				</Container>
			</RelativeContainer>
		</>
	);
};

export default QuededDetailPanel;
