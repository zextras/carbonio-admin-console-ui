/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../../web-components/divider-wc';

import React, {
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { resolveThemeColor } from '../../theme/theme-utils';
import { AnyColor } from '../../types/utils';
import { TextProps } from '../basic/text/Text';
import { INPUT_BACKGROUND_COLOR, INPUT_DIVIDER_COLOR } from '../constants';
import { Container } from '../layout/Container';
import { InputContainer } from './commons/InputContainer';
import { InputDescription } from './commons/InputDescription';
import { InputLabel } from './commons/InputLabel';
import styles from './TextArea.module.css';

type HTMLTextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

type AdjustHeightTextAreaProps = HTMLTextAreaProps & {
  hasLabel: boolean;
  maxHeight?: string;
  color: string;
  ref?: React.Ref<HTMLTextAreaElement> | null;
};

export type TextAreaProps = HTMLTextAreaProps & {
  /** Description - helper text */
  description?: string;
  /** Ref for the textarea element */
  textAreaRef?: React.Ref<HTMLTextAreaElement> | null;
  /** Label for the textarea */
  label?: string;
  /** Background color for the textarea */
  backgroundColor?: string;
  /** Color for the text */
  textColor?: string;
  /** Max height for the text area, limit beyond which the scroll is enabled */
  maxHeight?: string;
  /** Divider color */
  borderColor?: string;
  ref?: React.Ref<HTMLDivElement> | null;
};

const AdjustHeightTextArea = ({
  hasLabel,
  onInput,
  color,
  ref,
  ...props
}: AdjustHeightTextAreaProps) => {
  const { maxHeight, value, defaultValue } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useCombinedRefs<HTMLTextAreaElement>(ref);

  const resizeTextArea = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.dataset.replicatedValue = textAreaRef.current?.value ?? '';
    }
  }, [textAreaRef]);

  useEffect(() => {
    resizeTextArea();
  }, [resizeTextArea, value, defaultValue]);

  const onInputHandler = useCallback<NonNullable<HTMLTextAreaProps['onInput']>>(
    (event) => {
      resizeTextArea();
      onInput?.(event);
    },
    [resizeTextArea, onInput],
  );

  const growContainerStyle = useMemo(
    () =>
      ({
        '--grow-container-margin-top': hasLabel ? 'calc(var(--font-size-extrasmall) * 1.5)' : '0px',
        '--grow-max-height': maxHeight,
        '--color-gray2-regular': resolveThemeColor('gray2', 'regular'),
      } as React.CSSProperties),
    [hasLabel, maxHeight],
  );

  const textAreaStyle = useMemo(
    () =>
      ({
        '--text-color-disabled': resolveThemeColor(color, 'disabled'),
      } as React.CSSProperties),
    [color],
  );

  return (
    <div className={styles.growContainer} style={growContainerStyle} ref={containerRef}>
      <textarea
        {...props}
        className={styles.textArea}
        style={textAreaStyle}
        onInput={onInputHandler}
        rows={1}
        ref={textAreaRef}
      />
    </div>
  );
};

export const TextArea = ({
  maxHeight = '10.313rem',
  textAreaRef = null,
  label,
  description,
  textColor = 'text',
  ref,
  ...props
}: TextAreaProps) => {
  const { defaultValue, value, onInput, disabled, onFocus, onBlur } = props;
  const innerTextAreaRef = useCombinedRefs(textAreaRef);
  const [hasFocus, setHasFocus] = useState(false);
  const [textAreaHasValue, setTextAreaHasValue] = useState(!!defaultValue || !!value);

  useEffect(() => {
    setTextAreaHasValue(!!defaultValue || !!value);
  }, [defaultValue, value]);

  const [id] = useState<string>(() => {
    if (TextArea._newId === undefined) {
      TextArea._newId = 0;
    }
    TextArea._newId += 1;
    return `textarea-${TextArea._newId}`;
  });

  const onTextAreaFocus = useCallback<NonNullable<HTMLTextAreaProps['onFocus']>>(
    (event) => {
      if (!disabled && innerTextAreaRef.current) {
        setHasFocus(true);
      }
      onFocus?.(event);
    },
    [disabled, innerTextAreaRef, onFocus],
  );

  const onTextAreaBlur = useCallback<NonNullable<HTMLTextAreaProps['onBlur']>>(
    (event) => {
      setHasFocus(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const onTextAreaInput = useCallback<NonNullable<HTMLTextAreaProps['onInput']>>(
    (event) => {
      setTextAreaHasValue(!!event.currentTarget.value);
      onInput?.(event);
    },
    [onInput],
  );

  const forceFocusOnTextArea = useCallback(() => {
    if (!disabled && innerTextAreaRef.current) {
      setHasFocus(true);
      innerTextAreaRef.current.focus();
    }
  }, [disabled, innerTextAreaRef]);

  const dividerColor = useMemo<AnyColor>(
    () => `${(hasFocus && 'primary') || INPUT_DIVIDER_COLOR}${disabled ? '.disabled' : ''}`,
    [disabled, hasFocus],
  );

  const descriptionColor = useMemo<TextProps['color']>(
    () => (hasFocus && 'primary') || 'secondary',
    [hasFocus],
  );

  const labelStyle = useMemo(
    () =>
      ({
        '--label-top': '50%',
        '--label-transform': 'translateY(-50%)',
        '--label-font-size': 'var(--font-size-medium)',
      } as React.CSSProperties),
    [],
  );

  const labelClassName = useMemo(() => {
    const classes = [styles.label];
    if (hasFocus || textAreaHasValue) {
      classes.push(styles.labelFocused);
    }
    return classes.join(' ');
  }, [hasFocus, textAreaHasValue]);

  return (
    <Container height="fit" width="fill" crossAlignment="flex-start" ref={ref}>
      <InputContainer
        orientation="horizontal"
        width="fill"
        height="fit"
        crossAlignment={label ? 'flex-end' : 'center'}
        borderRadius="half"
        background={INPUT_BACKGROUND_COLOR}
        onClick={forceFocusOnTextArea}
        $disabled={disabled}
        padding={{ horizontal: '0.75rem' }}
        gap={'0.5rem'}
      >
        <Container
          className={styles.relativeContainer}
          padding={{ vertical: label ? '0.0625rem' : '0.625rem' }}
          mainAlignment={'flex-end'}
          height={'fill'}
          width={'fill'}
          minHeight={'inherit'}
        >
          <AdjustHeightTextArea
            maxHeight={maxHeight}
            placeholder={label}
            color={textColor}
            {...props}
            id={id}
            ref={innerTextAreaRef}
            onInput={onTextAreaInput}
            onFocus={onTextAreaFocus}
            onBlur={onTextAreaBlur}
            hasLabel={!!label}
          />
          {label && (
            <InputLabel
              htmlFor={id}
              className={labelClassName}
              style={labelStyle}
              $hasFocus={hasFocus}
              $disabled={disabled}
            >
              {label}
            </InputLabel>
          )}
        </Container>
      </InputContainer>
      <divider-wc color={dividerColor}></divider-wc>
      {description !== undefined && (
        <InputDescription color={descriptionColor} disabled={disabled}>
          {description}
        </InputDescription>
      )}
    </Container>
  );
};

TextArea._newId = 0;
