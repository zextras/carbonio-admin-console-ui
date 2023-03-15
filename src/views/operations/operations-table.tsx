/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo } from 'react';
import { Container, Row, Text, Table, Icon } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import MiliSecondToDate from './functions/miliSecondToDate';
import { DISMMISED, STARTED, STOPPING } from '../../constants';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';

export const OperationsTable: FC<{
	operations: Array<any>;
	headers: any;
	donePanel: boolean;
	selectedRows: any;
	onSelectionChange: any;
	onClick: any;
}> = ({ operations, headers, donePanel, selectedRows, onSelectionChange, onClick }) => {
	const [t] = useTranslation();

	const tableRows = donePanel
		? useMemo(
				() =>
					operations?.map((v, i) => ({
						id: i?.toString(),
						columns: [
							<Row
								style={{ textAlign: 'left', justifyContent: 'flex-start' }}
								key={i}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.host || ''}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.name || ''}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-center'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.state === STOPPING && (
									<Icon icon="StopCircleOutline" size="medium" color="secondary" />
								)}
								{v?.state === DISMMISED && (
									<Icon icon="CloseCircleOutline" size="medium" color="error" />
								)}
								{v?.state === STARTED && (
									<Icon icon="CheckmarkCircleOutline" size="medium" color="success" />
								)}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.parameters?.requesterAddress}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-center'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.startTime ? MiliSecondToDate(v?.startTime) : ''}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-center'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.queuedTime ? MiliSecondToDate(v?.queuedTime) : ''}
							</Row>
						],
						clickable: true
					})),
				[onClick, operations]
		  )
		: useMemo(
				() =>
					operations?.map((v, i) => ({
						id: i?.toString(),
						columns: [
							<Row
								style={{ textAlign: 'left', justifyContent: 'flex-start' }}
								key={i}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.host || ''}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.name || ''}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-start'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.parameters?.requesterAddress}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-center'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.startTime ? MiliSecondToDate(v?.startTime) : ''}
							</Row>,
							<Row
								key={i}
								style={{
									textAlign: 'left',
									justifyContent: 'flex-center'
								}}
								onClick={(): any => {
									onClick(i);
								}}
							>
								{v?.queuedTime ? MiliSecondToDate(v?.queuedTime) : ''}
							</Row>
						],
						clickable: true
					})),
				[onClick, operations]
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
			{tableRows.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>{t('operations.empty_table_helperText', 'Empty Table')}</Text>
				</Row>
			)}
		</Container>
	);
};
