/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button, Padding, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type LegalHoldToolbarProps = {
  isShowOnlyLegalHoldAccount: boolean;
  disableSwitch: boolean;
  legalHoldOperationLabel: string;
  isLegalHoldEnabled: boolean;
  isRestoreDisabled: boolean;
  onToggleLegalHoldFilter: () => void;
  onLegalHoldPress: () => void;
  onRestore: () => void;
};

export const LegalHoldToolbar = ({
  isShowOnlyLegalHoldAccount,
  disableSwitch,
  legalHoldOperationLabel,
  isLegalHoldEnabled,
  isRestoreDisabled,
  onToggleLegalHoldFilter,
  onLegalHoldPress,
  onRestore,
}: LegalHoldToolbarProps) => {
  const [t] = useTranslation();

  return (
    <Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
      <Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
        <ds-text as="h3" size="medium" weight="bold" color="gray0">
          <Switch
            label={t(
              'legalHold.show_only_accounts_on_legal_hold',
              'Show only accounts on Legal Hold',
            )}
            value={isShowOnlyLegalHoldAccount}
            disabled={disableSwitch}
            onClick={onToggleLegalHoldFilter}
            iconColor="primary"
          />
        </ds-text>
      </Row>
      <Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
        <Padding right="small">
          <Button
            type="outlined"
            label={legalHoldOperationLabel}
            color="primary"
            onClick={onLegalHoldPress}
            disabled={!isLegalHoldEnabled}
          />
        </Padding>
        <Button
          type="outlined"
          label={t('legal_hold.restore', 'Restore')}
          color="primary"
          onClick={onRestore}
          disabled={isRestoreDisabled}
        />
      </Row>
    </Row>
  );
};
