/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';

import { Tooltip } from '../display/Tooltip';
import { IconCheckbox } from '../inputs/IconCheckbox';
import { Switch } from '../inputs/Switch';
import styles from './inherited-switch.module.css';

type InheritedSwitchProps = {
  label: string;
  /** Secondary text rendered under the label. */
  description?: string;
  subValue?: string | boolean;
  inheritedValue?: string | boolean;
  inputName: string;
  onChange: (inputName: string) => void;
  onChangeReset: () => void;
  fromSubValue?: string | boolean;
  /** @deprecated The new switch uses the design-system colors; this prop is ignored. */
  iconColor?: string;
  disabled?: boolean;
  onFocus?: () => void;
};

const InheritedSwitch = ({
  label,
  description,
  subValue,
  inheritedValue,
  inputName,
  onChange,
  onChangeReset,
  fromSubValue,
  disabled = false,
  onFocus,
}: InheritedSwitchProps) => {
  const [t] = useTranslation();

  return (
    <div data-testid={`inherited-${inputName}`} className={styles.root}>
      <Switch
        value={subValue ? subValue === 'TRUE' : inheritedValue === 'TRUE'}
        onClick={(): void => onChange(inputName)}
        label={label}
        description={description}
        disabled={disabled}
        onFocus={onFocus}
      />
      {fromSubValue ? (
        <Tooltip
          label={
            <>
              <div className={styles.tooltipRow}>
                <ds-text as="label" weight="bold">
                  {t('account_details.inherited_value_was', 'The inherited value was')} :
                </ds-text>
                <ds-text as="span">{`  ${
                  inheritedValue === 'TRUE' ? t('label.true', 'true') : t('label.false', 'false')
                }`}</ds-text>
              </div>
              <div className={styles.tooltipHint}>
                <ds-text as="label" weight="bold">
                  {t('account_details.click_to_revert', 'Click to revert.')}
                </ds-text>
              </div>
            </>
          }
        >
          <IconCheckbox
            icon="RefreshOutline"
            value={false}
            onClick={onChangeReset}
            style={{ cursor: 'pointer', pointerEvents: disabled ? 'none' : 'all' }}
            onChange={(): null => null}
            disabled={disabled}
            data-testid={`reset-${inputName}`}
          />
        </Tooltip>
      ) : null}
    </div>
  );
};

export { InheritedSwitch, type InheritedSwitchProps };
