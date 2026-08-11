/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Padding, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

export const DomainOverflowMessage = () => {
  const [t] = useTranslation();
  return (
    <>
      <Row mainAlignment="flex-start">
        <Padding horizontal="small">
          <ds-icon
            style={{ width: '1.25rem', height: '1.25rem' }}
            icon="InfoOutline"
          ></ds-icon>
        </Padding>
      </Row>
      <Row
        mainAlignment="flex-start"
        width="100%"
        padding={{
          all: 'small',
        }}
      >
        <ds-text as="p" overflow="break-word">
          {t(
            'many_domain_info_msg',
            'So many domains! Which one would you like to see? Start typing to filter.',
          )}
        </ds-text>
      </Row>
    </>
  );
};
