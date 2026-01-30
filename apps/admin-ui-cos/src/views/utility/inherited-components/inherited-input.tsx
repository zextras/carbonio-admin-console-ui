/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconCheckbox, Input, Padding, Row, Text, Tooltip } from '@zextras/ui-components';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

function getHighlightedInputStyle(highlighted: boolean, background: any) {
  return highlighted
    ? { backgroundColor: '#D5E3F6', transition: 'background-color 3s ease' }
    : { backgroundColor: background };
}

const InheritedInput: FC<InheritedInputProps> = ({
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

  // Effect to reset highlight after a transition
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
      data-testid={`inherited-${inputName}`}
      label={label}
      value={subValue === undefined ? inheritedValue || '' : subValue}
      background={highlighted ? undefined : background}
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
      highlighted={undefined}
      style={getHighlightedInputStyle(highlight, background)}
    />
  );
};
export default InheritedInput;
