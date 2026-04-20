/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { Select } from '../inputs/Select';
import { Container } from '../layout/Container';
import { Row } from '../layout/Row';

type PaginationItem = {
  label: string;
  value: number;
};

const paginationItems: Array<PaginationItem> = [
  {
    label: '5',
    value: 5,
  },
  {
    label: '10',
    value: 10,
  },
  {
    label: '15',
    value: 15,
  },
  {
    label: '25',
    value: 25,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];

type TrackNumberPerPageProps = {
  setPageSize: (value: number) => void;
};

const TrackNumberPerPage: FC<TrackNumberPerPageProps> = ({ setPageSize }) => {
  const [t] = useTranslation();

  return (
    <Container
      orientation="horizontal"
      mainAlignment="flex-end"
      crossAlignment="center"
      width="fit"
      padding={{ bottom: 'small' }}
    >
      <Row padding={{ right: 'small' }}>
        <ds-text as="span" size="small">{t('label.showing', 'Showing')}</ds-text>
      </Row>
      <Row padding={{ right: 'small' }}>
        <Select
          items={paginationItems}
          data-testid="pagination-select"
          background="gray5"
          defaultSelection={paginationItems[1]}
          onChange={(value): void => setPageSize(value ?? 10)}
          showCheckbox={false}
          itemTextSize="medium"
          style={{ minWidth: '4rem' }}
        />
      </Row>
      <Row>
        <ds-text as="span" size="small">{t('label.items_per_page', 'items per page')}</ds-text>
      </Row>
    </Container>
  );
};

export { TrackNumberPerPage, type TrackNumberPerPageProps };
