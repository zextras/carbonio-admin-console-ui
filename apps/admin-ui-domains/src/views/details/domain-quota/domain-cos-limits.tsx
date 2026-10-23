/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CustomHeaderFactory, HoverableRowFactory, Table } from '@zextras/ui-components';
import { useCosList } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { useSelectedDomain } from '../../../hooks/use-selected-domain';
import { useCountAccountByCos } from '../../../services/use-count-account';
import { buildCosLimitEntries, buildCosLimitRow } from './domain-cos-limits-rows';
import styles from './domain-quota.module.css';

type DomainCosLimitsProps = {
  domainName: string;
};

export const DomainCosLimits = ({ domainName }: DomainCosLimitsProps) => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const { data: cosList } = useCosList({ searchQuery: '', limit: 0, offset: 0 });
  const { data: counts } = useCountAccountByCos(domainName);

  const rows = buildCosLimitEntries(domain?.a, cosList?.cos, counts).map((entry) =>
    buildCosLimitRow(entry, t),
  );

  if (rows.length === 0) {
    return null;
  }

  const headers = [
    { id: 'name', label: t('label.cos_name', 'COS name'), width: '40%', bold: true },
    { id: 'used', label: t('label.used_cos', 'Used COS'), width: '30%', bold: true },
    { id: 'max', label: t('label.cos_max_limit', 'COS max limit'), width: '30%', bold: true },
  ];

  return (
    <div className={styles.section}>
      <ds-text as="h3" size="small" weight="bold" color="gray0">
        {t('label.class_of_service', 'Class of Service (cos)')}
      </ds-text>
      <Table
        rows={rows}
        headers={headers}
        showCheckbox={false}
        multiSelect={false}
        RowFactory={HoverableRowFactory}
        HeaderFactory={CustomHeaderFactory}
      />
    </div>
  );
};
