/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconCheckbox, Input, Padding, Row, Text, Tooltip } from '@zextras/ui-components';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './inherited-input.module.css';

interface InheritedInputProps {
  label: any;
  subValue: any;
  inheritedValue: any;
  background?: any;
  inputName: any;
  onChange: any;
  onChangeReset: any;
  fromSubValue: any;
  disabled?: boolean;
  hasError?: boolean;
  pref?: any;
  onClick?: any;
  onFocus?: any;
  onBlur?: any;
  description?: any;
  focus?: boolean;
  highlighted?: boolean;
}

export const InheritedInput: FC<InheritedInputProps> = ({
  label,
  subValue,
  inheritedValue,
  background = 'gray5',
  inputName,
  onChange,
  onChangeReset,
  fromSubValue,
  disabled = false,
  hasError = false,
  pref = {},
  onClick,
  onFocus,
  onBlur,
  description,
  focus = false,
  highlighted = false,
}) => {
  const [t] = useTranslation();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [highlight, setHighlight] = useState(false);

  // Effect to reset the highlight after a transition
  useEffect(() => {
    if (highlight) {
      const transitionEndHandler = () => {
        setHighlight(false);
      };

      const handleTransitionEnd = () => {
        document.removeEventListener('transitionend', transitionEndHandler);
        transitionEndHandler();
      };

      document.addEventListener('transitionend', handleTransitionEnd, { once: true });
    }
  }, [highlight]);

  useEffect(() => {
    if (highlighted) {
      setHighlight(true);
    }
  }, [highlighted]);

  useEffect(() => {
    if (focus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focus, inputRef]);

  return (
    <Input
      className={highlighted ? styles.highlighted : ''}
      data-testid={`inherited-${inputName}`}
      label={label}
      value={subValue === undefined ? inheritedValue || '' : subValue}
      background={background}
      inputName={inputName}
      onChange={onChange}
      disabled={disabled}
      hasError={hasError}
      onClick={(): void => {
        disabled && onClick && onClick();
      }}
      onFocus={(): void => {
        !disabled && onFocus && onFocus();
      }}
      onBlur={(): void => {
        !disabled && onBlur?.();
      }}
      CustomIcon={(): any => (
        <>
          {fromSubValue ? (
            <Tooltip
              label={
                <>
                  <Row>
                    <Text weight="bold">
                      {t('account_details.inherited_value_was', 'The inherited value was')} :
                    </Text>
                    <Text>{`  ${inheritedValue || ''}`}</Text>
                  </Row>
                  <Padding top="small">
                    <Text weight="bold">
                      {t('account_details.click_to_revert', 'Click to revert.')}
                    </Text>
                  </Padding>
                </>
              }
            >
              <IconCheckbox
                icon="RefreshOutline"
                onClick={onChangeReset}
                style={{ cursor: 'pointer' }}
                onChange={(): null => null}
                data-testid={`reset-${inputName}`}
              />
            </Tooltip>
          ) : (
            <></>
          )}
        </>
      )}
      description={description}
      {...pref}
      inputRef={inputRef}
      highlighted={highlight}
    />
  );
};
