/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../basic/button/button';
import { Container } from '../layout/Container';
import { Row } from '../layout/Row';

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
  const [internalPage, setInternalPage] = useState<number>(currentPageProp ?? FIRST_PAGE);
  const [prevTotalPages, setPrevTotalPages] = useState(totalPages);
  if (totalPages !== prevTotalPages) {
    setPrevTotalPages(totalPages);
    if (totalPages === 0) {
      setInternalPage(FIRST_PAGE);
    }
  }
  const currentPage = totalPages === 0 ? FIRST_PAGE : (currentPageProp ?? internalPage);

  const onFirstPageBoundary = currentPage <= 1;
  const onLastPageBoundary = currentPage >= totalPages;
  const singlePageList = onFirstPageBoundary && totalItem < pageSize;
  const isFirstPageDisabled = onFirstPageBoundary || singlePageList;
  const isPreviousPageDisabled = onFirstPageBoundary || singlePageList;
  const isNextPageDisabled = onLastPageBoundary || singlePageList;
  const isLastPageDisabled = onLastPageBoundary || singlePageList;

  const onNextPage = (): void => {
    const page = currentPage + 1;
    setInternalPage(page);
    setOffset?.(page * pageSize - pageSize);
    if (nextPage) {
      nextPage(page);
    }
    onPageChange?.(page);
  };

  const onPreviousPage = (): void => {
    let page = currentPage;
    if (currentPage !== 1) {
      page = currentPage - 1;
      setInternalPage(page);
      setOffset?.(page * pageSize - pageSize);
    }
    if (previousPage) {
      previousPage(page);
    }
    onPageChange?.(page);
  };

  const onLastPage = (): void => {
    setInternalPage(totalPages);
    setOffset?.(totalPages * pageSize - pageSize);
    if (lastPage) {
      lastPage(totalPages);
    }
    onPageChange?.(totalPages);
  };

  const onFirstPage = (): void => {
    setInternalPage(FIRST_PAGE);
    setOffset?.(0);
    if (firstPage) {
      firstPage(FIRST_PAGE);
    }
    onPageChange?.(FIRST_PAGE);
  };

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
          aria-label={t('label.first_page', 'First page')}
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
          aria-label={t('label.previous_page', 'Previous page')}
        />
      </Row>
      <ds-text as="span" size="medium" weight="bold" color="#828282">
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
      </ds-text>
      <Row padding={{ left: 'small' }}>
        <Button
          size="large"
          type="ghost"
          icon="ChevronRight"
          color="primary"
          onClick={onNextPage}
          data-testid="next-page"
          disabled={isNextPageDisabled}
          aria-label={t('label.next_page', 'Next page')}
        />
      </Row>
      <Row padding={{ left: 'small' }}>
        <Button
          size="large"
          type="ghost"
          icon="GoLastOutline"
          color="primary"
          onClick={onLastPage}
          disabled={isLastPageDisabled}
          aria-label={t('label.last_page', 'Last page')}
        />
      </Row>
    </Container>
  );
};

export { Paging, type PagingProps };
