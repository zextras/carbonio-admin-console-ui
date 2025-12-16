/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Button,
	Container,
	Divider,
	Icon,
	Input,
	Row,
	Table,
	Text,
	useSnackbar} from '@zextras/carbonio-design-system';
import { debounce } from 'lodash-es';
import React, { FC, ReactElement,useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../assets/gardian.svg';
import { GENERAL_INFORMATION, RECORD_DISPLAY_LIMIT } from '../../constants';
import { getCosList } from '../../services/search-cos-service';
import { useCosStore } from '../../store/cos/store';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import TrackNumberPerPage from '../app/shared/track-number-per-page';
import Paging from '../components/paging';
import ScrollContainer from '../components/scrollComponent';
import { generateSnackbarFromError } from '../error/generate-snackbar-error';

type StatusTypes = {
	[key: string]: {
		[key: string]: string;
	};
};
type ZimbraCosAttribute = {
	n: string;
	_content: string;
};

type ZimbraCos = {
	name: string;
	id: string;
	a: ZimbraCosAttribute[];
};

type ZimbraCosResponse = {
	Cos: ZimbraCos[];
	more: boolean;
	searchTotal: number;
	_jsns: string;
};

type ZimbraCosEntry = {
	name: string;
	id: string;
	a: ZimbraCosAttribute[];
	zimbraCosType: string;
	zimbraCosStatus: string;
	zimbraCosName: string;
	zimbraId: string;
};

const CosList: FC = () => {
	const [t] = useTranslation();
	const { setCos, setCosView } = useCosStore();
	const [limit, setLimit] = useState<number>(RECORD_DISPLAY_LIMIT);
	const [hasError, setHasError] = useState<boolean>(false);
	const createSnackbar = useSnackbar();
	const [isTableTooTall, setIsTableTooTall] = useState(false);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	const tableRef = useRef<HTMLTableElement>(null);

	const headers = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.Cos_name', 'Cos Name'),
				width: '25%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '75%',
				bold: true
			}
		],
		[t]
	);

	const [cosList, setcosList] = useState<
		{
			id: string;
			columns: ReactElement[];
			iteam: ZimbraCosEntry;
			clickable: boolean;
		}[]
	>([]);
	const [offset, setOffset] = useState<number>(0);
	const [searchString, setSearchString] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [totalCos, setTotalCos] = useState<number>(0);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const STATUS_COLOR: StatusTypes = useMemo(
		() => ({
			active: {
				color: '#8BC34A',
				label: t('label.active', 'Active')
			},
			maintenance: {
				color: '#2196D3',
				label: t('label.in_maintenance', 'In maintenance')
			},
			locked: {
				color: '#D74942',
				label: t('label.locked', 'Locked')
			},
			closed: {
				color: '#828282',
				label: t('label.closed', 'Closed')
			},
			pending: {
				color: '#828282',
				label: t('label.pending', 'Pending')
			},
			lockout: {
				color: '#D74942',
				label: t('label.lockout', 'Lockout')
			}
		}),
		[t]
	);

	const onCosSelect = useCallback(
		(Cos: ZimbraCosEntry) => {
			setCos({
				a: Cos?.a,
				id: Cos?.id,
				name: Cos?.name
			});
			setCosView(GENERAL_INFORMATION);
		},
		[setCos, setCosView]
	);

	const getAllcosList = useCallback((): void => {
		setIsRequestInProgress(true);
		getCosList(searchQuery, limit, offset)
			.then((data: any) => {
				const cosListResponse: ZimbraCosResponse = data?.cos || [];
				if (cosListResponse && Array.isArray(cosListResponse)) {
					const cosListArr: {
						id: string;
						columns: ReactElement[];
						iteam: ZimbraCosEntry;
						clickable: boolean;
					}[] = [];
					setTotalCos(data.searchTotal || 0);
					cosListResponse.forEach((item: ZimbraCosEntry) => {
						const CosIteam: ZimbraCosEntry = {
							name: item.name,
							id: item.id,
							zimbraCosType: '',
							zimbraCosStatus: 'active',
							zimbraCosName: '',
							zimbraId: '',
							a: item.a
						};
						item?.a?.forEach((ele: ZimbraCosAttribute) => {
							if (ele.n === 'zimbraCosType') {
								CosIteam.zimbraCosType = ele._content;
							} else if (ele.n === 'zimbraCosStatus') {
								CosIteam.zimbraCosStatus = ele._content;
							} else if (ele.n === 'zimbraCosName') {
								CosIteam.zimbraCosName = ele._content;
							} else if (ele.n === 'zimbraId') {
								CosIteam.zimbraId = ele._content;
							}
						});
						cosListArr.push({
							id: item?.id,
							columns: [
								<Text
									size="small"
									key={item?.id}
									color="gray0"
									weight="regular"
									onClick={(): void => {
										onCosSelect(CosIteam);
									}}
								>
									{item?.name || ' '}
								</Text>,

								<Text
									size="small"
									weight="light"
									key={item?.id}
									color={STATUS_COLOR[CosIteam.zimbraCosStatus].color}
									onClick={(): void => {
										onCosSelect(CosIteam);
									}}
								>
									{STATUS_COLOR[CosIteam.zimbraCosStatus].label}
								</Text>
							],
							iteam: CosIteam,
							clickable: true
						});
					});
					setcosList(cosListArr);
				}
				setIsRequestInProgress(false);
			})
			.catch((error) => {
				const snackbarConfig = generateSnackbarFromError(error, t);
				createSnackbar(snackbarConfig);
				setHasError(true);
			});
	}, [STATUS_COLOR, offset, onCosSelect, searchQuery, limit, t, createSnackbar]);
	useEffect(() => {
		getAllcosList();
	}, [getAllcosList]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchcosList = useCallback(
		debounce((searchText) => {
			setSearchQuery(searchText);
		}, 700),
		[debounce]
	);
	useEffect(() => {
		searchcosList(searchString);
	}, [offset, searchcosList, searchString]);

	useEffect(() => {
		const table: any = tableRef.current;

		const handleResize = debounce((): void => {
			if (table) {
				const tableHeight = table.clientHeight + 375;
				const viewportHeight = window.innerHeight;
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
		<Container
			padding={{ top: 'large', left: 'large', right: 'large' }}
			mainAlignment="flex-start"
			background="gray6"
		>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="3.625rem"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('label.Cos_list', 'COS List')}
							</Text>
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				style={{
					position: 'relative',
					overflow: 'auto',
					minHeight: '10rem'
				}}
				padding={{ top: 'small', left: 'small', right: 'small' }}
			>
				<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							padding={{ bottom: 'large' }}
						>
							<Container>
								<Input
									label={t('label.i_am_looking_for_this_Cos', `I'm looking for this Cos…`)}
									disabled={cosList.length === 0 && searchString.length === 0 && !hasError}
									value={searchString}
									backgroundColor="gray5"
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
										setSearchString(e.target.value);
									}}
									CustomIcon={(): React.JSX.Element => (
										<Icon icon="FunnelOutline" size="large" color="primary" />
									)}
								/>
							</Container>
						</Row>
						<Row
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							width="fill"
							style={{
								position: 'relative'
							}}
						>
							<Table
								rows={!isRequestInProgress ? cosList : []}
								headers={headers}
								showCheckbox={false}
								multiSelect={false}
								ref={tableRef}
								style={{
									overflow: 'auto',
									height: isRequestInProgress || cosList.length === 0 ? '50%' : '100%'
								}}
								RowFactory={CustomRowFactory}
								HeaderFactory={CustomHeaderFactory}
							/>
							{isRequestInProgress && (
								<Container
									crossAlignment="center"
									mainAlignment="center"
									height="auto"
									padding={{ top: 'medium' }}
								>
									<Button
										type="ghost"
										color="primary"
										label=""
										loading
										onClick={(): null => null}
									/>
								</Container>
							)}
							{cosList.length === 0 && !isRequestInProgress && (
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
										<Text weight="light" color="#828282" size="large" overflow="break-word">
											{t('label.this_list_is_empty', 'This list is empty.')}
										</Text>
									</Row>
									<Row
										orientation="vertical"
										crossAlignment="center"
										style={{ textAlign: 'center' }}
										padding={{ top: 'small' }}
										width="53%"
									>
										<Text weight="light" color="#828282" size="large" overflow="break-word">
											<Trans
												i18nKey="label.create_Cos_list_msg"
												defaults="You can create a new Cos by clicking on <bold>Create</bold> button on header menu"
												components={{ bold: <strong /> }}
											/>
										</Text>
									</Row>
								</Container>
							)}
							{cosList.length !== 0 && (
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
											<Paging totalItem={totalCos} setOffset={setOffset} pageSize={limit} />
										</Container>
										<Container
											crossAlignment="flex-end"
											orientation="horizontal"
											mainAlignment="flex-end"
											padding={{ top: 'small' }}
										>
											<TrackNumberPerPage setPageSize={setLimit} />
										</Container>
									</Container>
								</Container>
							)}
						</Row>
					</Container>
				</Row>
			</Container>
		</Container>
	);
};

export default CosList;
