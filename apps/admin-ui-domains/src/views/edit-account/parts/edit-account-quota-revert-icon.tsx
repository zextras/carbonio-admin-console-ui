/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconCheckbox, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

type EditAccountQuotaRevertIconProps = {
  inheritedValue: string | number | undefined;
  onClick: () => void;
};

export const EditAccountQuotaRevertIcon = ({
  inheritedValue,
  onClick,
}: EditAccountQuotaRevertIconProps) => {
  const [t] = useTranslation();

  return (
    <Tooltip
      label={
        <>
          <ds-text weight="bold" as="span">
            {t('account_details.inherited_value_was', 'The inherited value was: {{value}}', {
              value: inheritedValue || '',
            })}
          </ds-text>
          <div className="pt-sm">
            <ds-text weight="bold" as="span">
              {t('account_details.click_to_revert', 'Click to revert.')}
            </ds-text>
          </div>
        </>
      }
    >
      <IconCheckbox
        icon="RefreshOutline"
        onClick={onClick}
        style={{ cursor: 'pointer' }}
        onChange={(): null => null}
      />
    </Tooltip>
  );
};
