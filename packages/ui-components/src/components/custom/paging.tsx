/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Container, Row, Text } from '@zextras/ui-components';
import { type FC,useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const FIRST_PAGE = 1;

type PagingProps = {
	totalItem: number;
	firstPage?: (page: number) => void;
	lastPage?: (page: number) => void;
	nextPage?: (page: number) => void;
	previousPage?: (page: number) => void;
	setOffset?: (offset: number) => void;
	pageSize?: number;
	onPageChange?: (page: number) => void;
	currentPageProp?: number;
};

const Paging: FC<PagingProps> = ({
	totalItem,
	firstPage,
	lastPage,
	nextPage,
	previousPage,
	setOffset,
	pageSize = 10,
	onPageChange,
	currentPageProp,
}) => {
	const [t] = useTranslation();
	const totalPages = Math.ceil(totalItem / pageSize);
	const [currentPage, setCurrentPage] = useState<number>(currentPageProp ?? FIRST_PAGE);
	const [isNextPageDisabled, setIsNextPageDisabled] = useState(false);
	const [isPreviousPageDisabled, setIsPreviousPageDisabled] = useState(false);
	const [isFirstPageDisabled, setIsFirstPageDisabled] = useState(false);
	const [isLastPageDisabled, setIsLastPageDisabled] = useState(false);

	const onNextPage = (): void => {
		const page = currentPage + 1;
		setCurrentPage(page);
		setIsPreviousPageDisabled(false);
		setIsFirstPageDisabled(false);
		if (nextPage) {
			nextPage(page);
		}
		onPageChange?.(page);
	};

	const onPreviousPage = (): void => {
		let page = currentPage;
		if (currentPage !== 1) {
			page = currentPage - 1;
			setCurrentPage(page);
			setIsNextPageDisabled(false);
			setIsLastPageDisabled(false);
		}
		if (previousPage) {
			previousPage(page);
		}
		onPageChange?.(page);
	};

	const onLastPage = (): void => {
		setCurrentPage(totalPages);
		if (lastPage) {
			lastPage(totalPages);
		}
		onPageChange?.(totalPages);
	};

	const onFirstPage = (): void => {
		setCurrentPage(FIRST_PAGE);
		if (firstPage) {
			firstPage(FIRST_PAGE);
		}
		onPageChange?.(FIRST_PAGE);
	};

	useEffect(() => {
		currentPageProp && setCurrentPage(currentPageProp);
	}, [currentPageProp]);

	useEffect(() => {
		if (currentPage >= totalPages) {
			setIsNextPageDisabled(true);
			setIsPreviousPageDisabled(false);
			setIsFirstPageDisabled(false);
			setIsLastPageDisabled(true);
		}
		if (currentPage === 1) {
			setIsPreviousPageDisabled(true);
			setIsNextPageDisabled(false);
			setIsFirstPageDisabled(true);
			setIsLastPageDisabled(false);
		}
		if (currentPage === 1 && totalItem < pageSize) {
			setIsPreviousPageDisabled(true);
			setIsNextPageDisabled(true);
			setIsFirstPageDisabled(true);
			setIsLastPageDisabled(true);
		}
		if (totalPages === 0) {
			setCurrentPage(FIRST_PAGE);
			setOffset?.(0);
		} else {
			setOffset?.(currentPage * pageSize - pageSize);
		}
	}, [currentPage, totalPages, setOffset, pageSize, totalItem]);

	return (
		<Container
			orientation="horizontal"
			crossAlignment="center"
			mainAlignment="flex-start"
			width="fit"
			padding={{ top: 'medium' }}
		>
			<Row padding={{ right: 'small' }}>
				<Button
					size="large"
					type="ghost"
					icon="GoFirstOutline"
					color="primary"
					onClick={onFirstPage}
					disabled={isFirstPageDisabled}
				/>
			</Row>
			<Row padding={{ right: 'small' }}>
				<Button
					size="large"
					type="ghost"
					icon="ChevronLeft"
					color="primary"
					onClick={onPreviousPage}
					disabled={isPreviousPageDisabled}
				/>
			</Row>
			<Text size="medium" weight="bold" color="#828282">
				<span
					style={{
						color: 'gray0',
						width: '41px',
						height: '23px',
						padding: '0.25rem 0 0 0',
						textAlign: 'center',
						display: 'inline-block',
						background: '#F5F6F8',
					}}
				>
					{currentPage}
				</span>{' '}
				{t('label.of', 'of')} {totalPages}
			</Text>
			<Row padding={{ left: 'small' }}>
				<Button
					size="large"
					type="ghost"
					icon="ChevronRight"
					color="primary"
					onClick={onNextPage}
					data-testid="next-page"
					disabled={isNextPageDisabled || currentPage === totalPages}
				/>
			</Row>
			<Row padding={{ left: 'small' }}>
				<Button
					size="large"
					type="ghost"
					icon="GoLastOutline"
					color="primary"
					onClick={onLastPage}
					disabled={isLastPageDisabled || currentPage === totalPages}
				/>
			</Row>
		</Container>
	);
};

export { Paging, type PagingProps };
