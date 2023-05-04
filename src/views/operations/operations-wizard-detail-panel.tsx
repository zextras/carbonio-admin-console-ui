/* eslint-disable no-shadow */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import {
	Container,
	Input,
	Row,
	IconButton,
	Divider,
	Padding,
	Button,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import ListRow from '../list/list-row';
import MiliSecondToDate from './functions/miliSecondToDate';
import {
	DONE_ROUTE_ID,
	FALSE_OPERTION,
	QUEUED,
	RUNNING_ROUTE_ID,
	STARTED,
	STOPPING,
	TRUE_OPERTION
} from '../../constants';
import { copyTextToClipboard } from '../utility/utils';

const OperationsWizardDetailPanel: FC<{
	setWizardDetailToggle: any;
	setOpen: any;
	selectedData: any;
}> = ({ setWizardDetailToggle, setOpen, selectedData }) => {
	const [t] = useTranslation();
	const [status, setStatus] = useState('');
	const createSnackbar = useSnackbar();

	useEffect(() => {
		if (selectedData?.state === STARTED) {
			setStatus(RUNNING_ROUTE_ID.charAt(0).toUpperCase() + RUNNING_ROUTE_ID.slice(1));
		} else if (selectedData?.state === QUEUED) {
			setStatus(QUEUED);
		} else {
			setStatus(DONE_ROUTE_ID.charAt(0).toUpperCase() + DONE_ROUTE_ID.slice(1));
		}
	}, [selectedData?.state]);

	const copyOperation = useCallback(() => {
		const operationItem = `
			${t('operations.label.operation_type', 'Operation Type')} : ${selectedData?.module || ''} \n
			${t('operations.label.who_started_it', 'Who started it?')} : ${
			selectedData?.parameters?.requesterAddress || ''
		} \n
			${t('operations.label.status', 'Status')} : ${status || ''} \n
			${t('operations.label.submitted_at', 'Submitted at')}:  ${
			selectedData?.startTime ? MiliSecondToDate(selectedData?.startTime) : ''
		} \n
			${t('operations.label.started_at', 'Started at')} : ${
			selectedData?.queuedTime ? MiliSecondToDate(selectedData?.queuedTime) : ''
		} \n
			${t('operations.label.notifications', 'Notifications')} : ${
			selectedData?.parameters?.additionalNotificationAddresses
				? selectedData?.parameters?.additionalNotificationAddresses?.length
				: ''
		} \n
			${t('operations.label.create_fake_blob', 'Create Fake Blob')} : ${
			selectedData?.parameters?.createFakeBlob ? TRUE_OPERTION : FALSE_OPERTION
		} \n
			${t('operations.label.Deep', 'Deep')} : ${
			selectedData?.parameters?.isDeep ? TRUE_OPERTION : FALSE_OPERTION
		} \n
		`;
		copyTextToClipboard(operationItem);
		createSnackbar({
			key: 'success',
			type: 'success',
			label: t('operations.copy_operation_successfully', 'Operation details copied successfully'),
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		});
	}, [t, selectedData, createSnackbar, status]);

	const copyOperationHandler = useCallback(() => {
		copyOperation();
	}, [copyOperation]);

	return (
		<Container background="gray6">
			<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
					<Text size="extralarge" weight="bold">
						{t('operations.operationname_on_servername', '{{operationName}} on {{serverName}}', {
							operationName: selectedData?.name,
							serverName: selectedData?.host
						})}
					</Text>
				</Row>
				<Row padding={{ horizontal: 'small' }}>
					<IconButton
						icon="CloseOutline"
						color="gray1"
						onClick={(): void => setWizardDetailToggle(false)}
					/>
				</Row>
			</Row>
			<Divider />
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" crossAlignment="flex-start">
				<Row
					takeAvwidth="fill"
					mainAlignment="flex-end"
					crossAlignment="flex-end"
					width="100%"
					padding={{ vertical: 'large' }}
				>
					<Padding right="large">
						<Button
							type="outlined"
							label={t('operations.copy_btn', 'COPY')}
							color="primary"
							icon="CopyOutline"
							iconPlacement="right"
							onClick={copyOperationHandler}
						/>
					</Padding>
					{selectedData?.state !== STOPPING && (
						<Button
							type="outlined"
							label={
								selectedData?.state === STARTED
									? t('operations.stop_opearation_btn', 'STOP OPERATION')
									: t('operations.cancel_opearation_btn', 'CANCEL OPERATION')
							}
							color="error"
							icon={selectedData?.state === STARTED ? 'StopCircleOutline' : 'Close'}
							iconPlacement="right"
							onClick={(): void => setOpen(true)}
						/>
					)}
				</Row>
				<Row mainAlignment="flex-start" padding={{ vertical: 'large' }} width="100%">
					<Text size="medium" color="gray0" weight="bold">
						{t('operations.details', 'Details')}
					</Text>
					<Row width="100%" padding={{ top: 'large' }}>
						<ListRow>
							<Container padding={{ right: 'small' }}>
								<Input
									background="gray6"
									label={t('operations.label.operation_type', 'Operation Type')}
									value={selectedData?.module || ''}
									readOnly
								/>
							</Container>
							<Container padding={{ right: 'small', left: 'small' }}>
								<Input
									background="gray6"
									label={t('operations.label.who_started_it', 'Who started it?')}
									value={selectedData?.parameters?.requesterAddress || ''}
									readOnly
								/>
							</Container>
							<Container padding={{ left: 'small' }}>
								<Input
									background="gray6"
									label={t('operations.label.status', 'Status')}
									value={status || ''}
									readOnly
								/>
							</Container>
						</ListRow>
					</Row>
					<Row width="100%" padding={{ top: 'large' }}>
						<ListRow>
							<Container padding={{ right: 'small' }}>
								<Input
									background="gray6"
									label={t('operations.label.submitted_at', 'Submitted at')}
									value={selectedData?.startTime ? MiliSecondToDate(selectedData?.startTime) : ''}
									readOnly
								/>
							</Container>
							<Container padding={{ left: 'small' }}>
								<Input
									background="gray6"
									label={t('operations.label.started_at', 'Started at')}
									value={selectedData?.queuedTime ? MiliSecondToDate(selectedData?.queuedTime) : ''}
									readOnly
								/>
							</Container>
						</ListRow>
					</Row>
				</Row>
				<Padding vertical="large" />
				<Divider />
				<Padding vertical="large" />
				<Row mainAlignment="flex-start" padding={{ vertical: 'large' }} width="100%">
					<Text size="medium" color="gray0" weight="bold">
						{t('operations.other', 'Other')}
					</Text>
					<Row width="100%" padding={{ top: 'large' }}>
						<Input
							background="gray6"
							label={t('operations.label.notifications', 'Notifications')}
							value={
								selectedData?.parameters?.additionalNotificationAddresses &&
								selectedData?.parameters?.additionalNotificationAddresses?.length
							}
							readOnly
						/>
					</Row>
					<Row width="100%" padding={{ top: 'large' }}>
						<ListRow>
							<Container padding={{ right: 'small' }}>
								<Input
									background="gray6"
									label={t('operations.label.create_fake_blob', 'Create Fake Blob')}
									value={selectedData?.parameters?.createFakeBlob ? TRUE_OPERTION : FALSE_OPERTION}
									readOnly
								/>
							</Container>
							<Container padding={{ left: 'small' }}>
								<Input
									background="gray6"
									label={t('operations.label.Deep', 'Deep')}
									value={selectedData?.parameters?.isDeep ? TRUE_OPERTION : FALSE_OPERTION}
									readOnly
								/>
							</Container>
						</ListRow>
					</Row>
				</Row>
			</Container>
		</Container>
	);
};

export default OperationsWizardDetailPanel;
