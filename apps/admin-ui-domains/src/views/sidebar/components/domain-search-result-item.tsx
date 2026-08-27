/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Row } from '@zextras/ui-components';

import type { SoapEntity } from '../../../services/search-domain-service';

type DomainSearchResultItemProps = {
  domain: SoapEntity;
  onSelect: (domain: SoapEntity) => void;
};

export const DomainSearchResultItem = ({ domain, onSelect }: DomainSearchResultItemProps) => {
  return (
    <Row
      style={{
        display: 'block',
        textAlign: 'left',
        height: 'inherit',
        padding: '0.188rem',
        width: 'inherit',
      }}
      onClick={(): void => {
        onSelect(domain);
      }}
    >
      {domain?.name}
    </Row>
  );
};
