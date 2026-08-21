/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Padding } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import logo from '../../assets/ninja_robo.svg';

export const LegalHoldEmptyState = () => {
  const [t] = useTranslation();

  return (
    <Container crossAlignment="center" mainAlignment="flex-start" padding={{ all: '3rem' }}>
      <ds-text as="p" overflow="break-word" weight="regular" size="large">
        <img src={logo} alt="" />
      </ds-text>
      <Padding all="medium">
        <ds-text
          as="p"
          color="gray1"
          overflow="break-word"
          weight="regular"
          size="large"
          style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
        >
          {t('label.this_list_is_empty', 'This list is empty.')}
        </ds-text>
      </Padding>
    </Container>
  );
};
