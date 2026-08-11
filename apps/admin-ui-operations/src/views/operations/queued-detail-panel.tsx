/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, ModalOverlay, Row, useSnackbar } from '@zextras/ui-components';
import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { QUEUED } from '../../constants';
import { useAllOperations } from '../../services/use-all-operations';
import { useStopOperation } from '../../services/use-stop-operation';
import { type Operation } from '../../types/operations';
import { OperationsHeader } from '../utility/utils';
import DeleteOpearationsModel from './delete-operations-model';
import { OperationsTable } from './operations-table';
import OperationsWizardDetailPanel from './operations-wizard-detail-panel';

const QueuedDetailPanel: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { data: queuedData = [], isError } = useAllOperations({
		select: (operations) => operations.filter((item) => item.state === QUEUED),
	});
	const operationsHeader = useMemo(() => OperationsHeader(t), [t]);
	const [wizardDetailToggle, setWizardDetailToggle] = useState(false);
	const [open, setOpen] = useState(false);
	const [selectedData, setSelectedData] = useState<Operation | undefined>();
	const [isSelectedRow, setIsSelectedRow] = useState<Array<string>>([]);

	useEffect(() => {
		if (isError) {
			createSnackbar({
				key: '1',
				severity: 'error',
				label: t('label.operation.get_all_operation_error', '{{name}}', {
					name: '',
				}),
			});
		}
	}, [createSnackbar, isError, t]);

	const closeHandler = (): void => {
		setOpen(false);
	};

	const stopMutation = useStopOperation(
		() => {
			setOpen(false);
			setWizardDetailToggle(false);
		},
		'label.cancel_operation_sucess',
		'The {{name}} operation has been canceled successfully',
	);

	const stopHandler = (): void => {
		if (selectedData?.id) {
			stopMutation.mutate({ id: selectedData.id, name: selectedData?.name });
		}
	};

	const handleClick = (i: number): void => {
		const volumeObject = queuedData?.find((s: Operation, index: number) => index === i);
		setSelectedData(volumeObject);
		setWizardDetailToggle(true);
	};

	return (
		<>
			{wizardDetailToggle && (
				<ModalOverlay open={wizardDetailToggle}>
				<OperationsWizardDetailPanel
					setWizardDetailToggle={setWizardDetailToggle}
					setOpen={setOpen}
					selectedData={selectedData}
					allowStop
				/>
				</ModalOverlay>
			)}
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflowY: 'auto', position: 'relative' }}
				background="white"
			>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
					<ds-text as="h2"  weight="bold">
						{t('operations.queued_panel_heading', 'Queued Operations')}
					</ds-text>
				</Row>
				<ds-divider></ds-divider>
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
								onSelectionChange={(selected: Array<string>): void => {
									setIsSelectedRow(selected);
								}}
								onClick={(i: number): void => {
									handleClick(i);
								}}
							/>
						)}
					</Row>
				</Container>
			</Container>
		</>
	);
};

export default QueuedDetailPanel;
