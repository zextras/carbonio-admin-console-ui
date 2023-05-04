/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, IconButton, Text, Row } from '@zextras/carbonio-design-system';
import { FIRST_PAGE } from '../../constants';

const Paging: FC<{
	totalItem: any;
	firstPage?: any;
	lastPage?: any;
	nextPage?: any;
	previousPage?: any;
	setOffset?: any;
	pageSize?: number;
}> = ({ totalItem, firstPage, lastPage, nextPage, previousPage, setOffset, pageSize = 10 }) => {
	const [t] = useTranslation();
	const totalPages = Math.ceil(totalItem / pageSize);
	const [currentPage, setCurrentPage] = useState<number>(FIRST_PAGE);
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
	};

	const onLastPage = (): void => {
		setCurrentPage(totalPages);
		if (lastPage) {
			lastPage(totalPages);
		}
	};

	const onFirstPage = useCallback((): void => {
		setCurrentPage(FIRST_PAGE);
		if (firstPage) {
			firstPage(FIRST_PAGE);
		}
	}, [firstPage]);

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
			setOffset(0);
		} else {
			setOffset(currentPage * pageSize - pageSize);
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
				<IconButton
					size="large"
					icon="GoFirstOutline"
					iconColor="primary"
					onClick={onFirstPage}
					disabled={isFirstPageDisabled}
				/>
			</Row>
			<Row padding={{ right: 'small' }}>
				<IconButton
					size="large"
					icon="ChevronLeft"
					iconColor="primary"
					onClick={onPreviousPage}
					disabled={isPreviousPageDisabled}
				/>
			</Row>
			<Text size="medium" weight="bold" color="#828282" orientation="horizontal">
				<span
					style={{
						color: 'gray0',
						width: '41px',
						height: '23px',
						padding: '0.25rem 0 0 0',
						textAlign: 'center',
						display: 'inline-block',
						background: '#F5F6F8'
					}}
				>
					{currentPage}
				</span>{' '}
				{t('label.of', 'of')} {totalPages}
			</Text>
			<Row padding={{ left: 'small' }}>
				<IconButton
					size="large"
					icon="ChevronRight"
					iconColor="primary"
					onClick={onNextPage}
					disabled={isNextPageDisabled || currentPage === totalPages}
				/>
			</Row>
			<Row padding={{ left: 'small' }}>
				<IconButton
					size="large"
					icon="GoLastOutline"
					iconColor="primary"
					onClick={onLastPage}
					disabled={isLastPageDisabled || currentPage === totalPages}
				/>
			</Row>
		</Container>
	);
};

export default Paging;
