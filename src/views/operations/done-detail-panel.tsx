/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo, useState } from 'react';
import { Container, Row, Text, Divider } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { OperationsTable } from './operations-table';
import { OperationsDoneHeader } from '../utility/utils';
import { AbsoluteContainer } from '../components/styled';
import OperationsWizardDetailPanel from './operations-wizard-detail-panel';
import { useOperationStore } from '../../store/operation/store';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const DoneDetailPanel: FC = () => {
	const [t] = useTranslation();
	const { doneData } = useOperationStore((state) => state);
	const operationsDoneHeader = useMemo(() => OperationsDoneHeader(t), [t]);
	const [wizardDetailToggle, setWizardDetailToggle] = useState(false);
	const [selectedData, setSelectedData] = useState<any>();
	const [isSelectedRow, setIsSelectedRow] = useState([]);

	const handleClick = (i: any): any => {
		const volumeObject: any = doneData?.find((s: any, index: any) => index === i);
		setSelectedData(volumeObject);
		setWizardDetailToggle(true);
	};

	return (
		<>
			{wizardDetailToggle && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<OperationsWizardDetailPanel
						setWizardDetailToggle={setWizardDetailToggle}
						setOpen=""
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
							operations={doneData}
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
			</RelativeContainer>
		</>
	);
};

export default DoneDetailPanel;
