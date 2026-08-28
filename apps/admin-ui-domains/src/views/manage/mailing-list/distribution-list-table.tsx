/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Container,
	CustomHeaderFactory,
	HoverableRowFactory,
	Input,
	Paging,
	Row,
	Table,
	TrackNumberPerPage
} from '@zextras/ui-components';
import { debounce } from 'lodash';
import { type ChangeEvent, type FC, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../assets/gardian.svg';
import ScrollContainer from '../../components/scrollComponent';
import { FilterColumnIcon } from './filter-column-icon';

type DistributionListTableProps = {
	rows: Array<any>;
	headers: Array<any>;
	isFetching: boolean;
	hasError: boolean;
	searchString: string;
	onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
	totalAccount: number;
	offsetSetter: (offset: number) => void;
	pageSize: number;
	onPageSizeChange: (limit: number) => void;
};

export const DistributionListTable: FC<DistributionListTableProps> = ({
	rows,
	headers,
	isFetching,
	hasError,
	searchString,
	onSearchChange,
	totalAccount,
	offsetSetter,
	pageSize,
	onPageSizeChange
}) => {
	const [t] = useTranslation();
	const [selectedDlRow, setSelectedDlRow] = useState<any>([]);
	const [isTableTooTall, setIsTableTooTall] = useState(false);
	const tableRef = useRef<HTMLTableElement>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	useEffect(() => {
		const table = tableRef.current;

		const handleResize = debounce((): void => {
			if (table) {
				const tableHeight = table.clientHeight + 375;
				const viewportHeight = globalThis.innerHeight;
				setIsTableTooTall(tableHeight > viewportHeight);
			}
		}, 100);

		if (table && !resizeObserverRef.current) {
			const observer = new ResizeObserver(handleResize);
			resizeObserverRef.current = observer;
			observer.observe(table);
		}

		return () => {
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect();
				resizeObserverRef.current = null;
			}
		};
	}, []);

	return (
		<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
			<Container
				height="fit"
				crossAlignment="flex-start"
				background="gray6"
				style={{ position: 'relative' }}
			>
				<Row
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					padding={{ bottom: 'large' }}
				>
					<Container>
						<Input
							disabled={rows.length === 0 && searchString.length === 0 && !hasError}
							backgroundColor="gray5"
							label={t('label.search_dot', 'Search…')}
							onChange={onSearchChange}
							CustomIcon={FilterColumnIcon}
						/>
					</Container>
				</Row>
				<Row
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
				>
					<Table
						rows={isFetching ? [] : rows}
						headers={headers}
						showCheckbox={false}
						multiSelect={false}
						ref={tableRef}
						style={{
							overflow: 'auto',
							height: isFetching || rows.length === 0 ? '50%' : '100%'
						}}
						selectedRows={selectedDlRow}
						onSelectionChange={(selected: any): void => {
							setSelectedDlRow(selected);
						}}
						RowFactory={HoverableRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
					{isFetching && (
						<Container
							crossAlignment="center"
							mainAlignment="flex-start"
							height="auto"
							padding={{ top: 'medium' }}
						>
							<ds-spinner></ds-spinner>
						</Container>
					)}
					{rows.length === 0 && !isFetching && (
						<Container orientation="column" crossAlignment="center" mainAlignment="center">
							<Row>
								<img src={logo} alt="logo" />
							</Row>
							<Row
								padding={{ top: 'extralarge' }}
								orientation="vertical"
								crossAlignment="center"
								style={{ textAlign: 'center' }}
							>
								<ds-text
									as="p"
									weight="light"
									color="#828282"
									size="large"
									overflow="break-word"
								>
									{t('label.this_list_is_empty', 'This list is empty.')}
								</ds-text>
							</Row>
							<Row
								orientation="vertical"
								crossAlignment="center"
								style={{ textAlign: 'center' }}
								padding={{ top: 'small' }}
								width="53%"
							>
								<ds-text
									as="p"
									weight="light"
									color="#828282"
									size="large"
									overflow="break-word"
								>
									<Trans
										i18nKey="label.create_distribution_list_msg"
										defaults="You can create a new Distribution List by clicking on <bold>Create</bold> button (upper left corner) or on the Add (<bold>+</bold>) button up here"
										components={{ bold: <strong /> }}
									/>
								</ds-text>
							</Row>
						</Container>
					)}
				</Row>
				{rows && rows.length > 0 && (
					<Container
						style={{
							position: 'sticky',
							bottom: isTableTooTall ? '0' : '-4rem'
						}}
					>
						<ScrollContainer isVisible={isTableTooTall} />
						<Container
							orientation="horizontal"
							mainAlignment="space-between"
							background="gray6"
							width="100%"
							padding={{ right: 'extralarge' }}
							height="auto"
						>
							<Container crossAlignment="flex-start">
								<Paging totalItem={totalAccount} setOffset={offsetSetter} pageSize={pageSize} />
							</Container>
							<Container
								crossAlignment="flex-end"
								orientation="horizontal"
								mainAlignment="flex-end"
								padding={{ top: 'small' }}
							>
								<TrackNumberPerPage setPageSize={onPageSizeChange} />
							</Container>
						</Container>
					</Container>
				)}
			</Container>
		</Row>
	);
};
