/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Container,
  CustomHeaderFactory,
  HoverableRowFactory,
  ListRow,
  Table,
} from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { TRow } from '../../../../../types';

type InstancesSectionProps = {
  instancesTableRows: Array<TRow>;
};

export const InstancesSection = ({
  instancesTableRows,
}: Readonly<InstancesSectionProps>) => {
  const [t] = useTranslation();

  const instanceTableHeader = [
    {
      id: 'servername',
      label: t('mta.server_name', 'Server Name'),
      width: '30%',
      bold: true,
    },
    {
      id: 'antispam',
      label: t('mta.antispam', 'Antispam'),
      width: '20%',
      bold: true,
    },
    {
      id: 'antivirus',
      label: t('mta.antivirus', 'Antivirus'),
      width: '15%',
      bold: true,
    },
    {
      id: 'authentication',
      label: t('mta.authentication', 'Authentication'),
      width: '20%',
      bold: true,
    },
    {
      id: 'dkim',
      label: t('mta.dkim', 'DKIM'),
      width: '15%',
      bold: true,
    },
  ];

  return (
    <>
      <Container
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        height="auto"
        padding={{ top: 'extralarge', bottom: 'extralarge' }}
      >
        <ds-text as="h3" size="small" weight="bold" color="gray0">
          {t('mta.instances', 'Instances')}
        </ds-text>
      </Container>
      <ListRow>
        <Container
          padding={{
            top: 'small',
            bottom: 'small',
          }}
          mainAlignment="flex-start"
        >
          <Table
            multiSelect={false}
            rows={instancesTableRows}
            headers={instanceTableHeader}
            showCheckbox={false}
            RowFactory={HoverableRowFactory}
            HeaderFactory={CustomHeaderFactory}
          />
        </Container>
      </ListRow>
    </>
  );
}
