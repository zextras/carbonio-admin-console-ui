/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type AccountSaveCancelActionsProps = {
  hasQuotaError: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export const AccountSaveCancelActions = ({
  hasQuotaError,
  onSave,
  onCancel,
}: AccountSaveCancelActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center rounded-[var(--border-radius)] bg-gray6">
      <div className="pr-sm">
        <Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onCancel} />
      </div>
      <div className="pr-sm">
        <Button
          label={t('label.save', 'Save')}
          color="primary"
          onClick={onSave}
          disabled={hasQuotaError}
        />
      </div>
    </div>
  );
};
