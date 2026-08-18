/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type RestoreAccountHeaderProps = {
  accountName?: string;
  onBack: () => void;
};

export const RestoreAccountHeader = ({ accountName, onBack }: RestoreAccountHeaderProps) => {
  const [t] = useTranslation();

  return (
    <>
      <Row
        mainAlignment="flex-start"
        crossAlignment="center"
        orientation="horizontal"
        background="white"
        width="fill"
        height="3.5rem"
      >
        <Row padding={{ horizontal: 'small' }}></Row>
        <Row takeAvailableSpace mainAlignment="flex-start">
          <ds-text as="h2" size="medium" overflow="ellipsis" weight="bold">
            {t('legal_hold.restore', 'Restore')} {' - '}
            {accountName}
          </ds-text>
        </Row>
        <Row padding={{ right: 'extrasmall', left: 'small' }}>
          <Button
            type="ghost"
            color="text"
            size="medium"
            icon="CloseOutline"
            aria-label={t('label.close', 'Close')}
            onClick={onBack}
          />
        </Row>
      </Row>
      <Row>
        <ds-divider></ds-divider>
      </Row>
    </>
  );
};
