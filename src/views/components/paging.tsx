/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, IconButton } from '@zextras/carbonio-design-system';
import { FIRST_PAGE } from '../../constants';

const Paginig: FC<{
	offset: number;
	totalItem: any;
	firstPage: any;
	lastPage: any;
	nextPage: any;
	previousPage: any;
}> = ({ offset, totalItem, firstPage, lastPage, nextPage, previousPage }) => {
	const [t] = useTranslation();
	const pageSize = 10;
	const totalPages = Math.ceil(totalItem / pageSize);
	const [currentPage, setCurrentPage] = useState(FIRST_PAGE);
	const [isNextPageDisabled, setIsNextPageDisabled] = useState(false);
	const [isPreviousPageDisabled, setIsPreviousPageDisabled] = useState(false);
	const [isFirstPageDisabled, setIsFirstPageDisabled] = useState(false);
	const [isLastPageDisabled, setIsLastPageDisabled] = useState(false);

	const onNextPage = (): void => {
		setCurrentPage(currentPage + 1);
		setIsPreviousPageDisabled(false);
		setIsFirstPageDisabled(false);
		nextPage();
	};

	const onPreviousPage = (): void => {
		if (currentPage !== 1) {
			setCurrentPage(currentPage - 1);
			setIsNextPageDisabled(false);
			setIsLastPageDisabled(false);
		}
		previousPage();
	};

	const onLastPage = (): void => {
		setCurrentPage(totalPages);
		lastPage();
	};

	const onFirstPage = (): void => {
		setCurrentPage(FIRST_PAGE);
		firstPage();
	};

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
	}, [currentPage, totalPages]);

	return (
		<Container orientation="horizontal" crossAlignment="center" width="fill">
			<IconButton
				size="large"
				icon="ArrowheadLeftOutline"
				iconColor="primary"
				onClick={onFirstPage}
				disabled={isFirstPageDisabled}
			/>
			<IconButton
				size="large"
				icon="ChevronLeft"
				iconColor="primary"
				onClick={onPreviousPage}
				disabled={isPreviousPageDisabled}
			/>
			{currentPage} {t('label.of', 'of')} {totalPages}
			<IconButton
				size="large"
				icon="ChevronRight"
				iconColor="primary"
				onClick={onNextPage}
				disabled={isNextPageDisabled}
			/>
			<IconButton
				size="large"
				icon="ArrowheadRightOutline"
				iconColor="primary"
				onClick={onLastPage}
				disabled={isLastPageDisabled}
			/>
		</Container>
	);
};

export default Paginig;
