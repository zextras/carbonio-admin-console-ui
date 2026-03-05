/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/divider-wc';

import clsx from 'clsx';
import { debounce, filter, isEmpty, slice, trim, uniq } from 'lodash-es';
import React, {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { useCombinedRefs } from '../../../hooks/useCombinedRefs';
import {
  getKeyboardPreset,
  KeyboardPresetKey,
  KeyboardPresetObj,
  useKeyboard,
} from '../../../hooks/useKeyboard';
import { usePrevious } from '../../../hooks/usePrevious';
import { AnyColor } from '../../../types/utils';
import { INPUT_BACKGROUND_COLOR, INPUT_DIVIDER_COLOR } from '../../constants';
import { Chip, ChipProps } from '../../display/Chip';
import { Dropdown, DropdownItem } from '../../display/Dropdown';
import { Container, ContainerProps } from '../../layout/Container';
import { InputContainer } from '../commons/InputContainer';
import { InputDescription } from '../commons/InputDescription';
import { InputLabel } from '../commons/InputLabel';
import styles from './ChipInput.module.css';

function getThemeColorVar(colorName: string, state: string): string {
  if (!colorName) return '';
  const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
  if (hexPattern.test(colorName)) {
    return colorName;
  }
  const sanitized = colorName.replace(/[^a-zA-Z0-9-]/g, '');
  return `var(--color-${sanitized}-${state}, var(--color-${sanitized}-regular, ${colorName}))`;
}

/**
 * Adapt input width on typing
 *
 * By default, input html element has a fixed width and the content inside is hidden when overflowing,
 * but still reachable moving the caret. To avoid this behaviour and have instead an input which
 * extends its width on typing, a hidden span is used to set expand the width of the input container dynamically.
 * In order to accomplish this, the span is positioned over the input, but with height 0 and its content is set through
 * a listener (resizeInput), that keeps the span content synchronized with the input value.
 * Then, input receives its scroll width, which contains always the full content.
 *
 */
const AdjustWidthInput = ({
  color,
  ref,
  ...rest
}: {
  color: string;
  ref?: React.Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) => {
  const hiddenSpanRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useCombinedRefs<HTMLInputElement>(ref);

  const resizeInput = useCallback(() => {
    if (inputRef.current && hiddenSpanRef.current) {
      // fill hidden span with a string with same length of value to get right width
      hiddenSpanRef.current.textContent = '#'.repeat(inputRef.current.value.length);
      inputRef.current.style.width = inputRef.current.value
        ? `${inputRef.current.scrollWidth}px`
        : '';
    }
  }, [inputRef]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('input', resizeInput);
      inputElement.addEventListener('change', resizeInput);
    }
    return (): void => {
      if (inputElement) {
        inputElement.removeEventListener('input', resizeInput);
        inputElement.removeEventListener('change', resizeInput);
      }
    };
  }, [inputRef, resizeInput]);

  const inputStyle: React.CSSProperties = useMemo(
    () =>
      ({
        '--input-color': getThemeColorVar(color, 'regular'),
        '--input-color-disabled': getThemeColorVar(color, 'disabled'),
      } as React.CSSProperties),
    [color],
  );

  return (
    <div className={styles.adjustWidthInputContainer}>
      <span ref={hiddenSpanRef} className={styles.hiddenSpan} />
      <input className={styles.inputEl} style={inputStyle} {...rest} ref={inputRef} />
    </div>
  );
};

type ReducerAction<TValue> =
  | { type: 'push' | 'replace'; item: ChipItem<TValue> }
  | { type: 'pop'; index: number }
  | { type: 'popLast' }
  | { type: 'reset'; value: ChipItem<TValue>[] | undefined }
  | { type: 'pushMultiples'; items: ChipItem<TValue>[] };

function reducer<TValue>(
  state: ChipItem<TValue>[],
  action: ReducerAction<TValue>,
): ChipItem<TValue>[] {
  switch (action.type) {
    case 'push':
      return [...state, action.item];
    case 'pushMultiples':
      return [...state, ...action.items];
    case 'replace':
      return [action.item];
    case 'pop':
      return filter(state, (_value, index) => action.index !== index);
    case 'popLast':
      return slice(state, 0, state.length - 1);
    case 'reset':
      return action.value || [];
    default:
      return state;
  }
}

function DefaultOnAdd<TValue>(valueToAdd: unknown): ChipItem<TValue> {
  if (typeof valueToAdd === 'string') {
    return { label: valueToAdd };
  }
  if (valueToAdd !== null && typeof valueToAdd === 'object') {
    return {
      label: 'no label',
      ...valueToAdd, // if valueToAdd has a label, spread will replace the default "no label"
    };
  }
  return { label: 'unknown value' };
}

type ChipItem<TValue = unknown> = { label?: string } & ChipProps & {
    value?: TValue;
  };

type ChipInputProps<TValue = unknown> = Omit<ContainerProps, 'defaultValue' | 'onChange'> & {
  /** ref to the input element */
  inputRef?: React.ForwardedRef<HTMLInputElement> | null;
  /** HTML input name */
  inputName?: string;
  /** Input Placeholder */
  placeholder?: string;
  /** ChipInput value */
  value?: ChipItem<TValue>[];
  /** ChipInput default value */
  defaultValue?: ChipItem<TValue>[];
  /** Callback to call when ChipInput's value changes */
  onChange?: (items: ChipItem<TValue>[]) => void;
  /**
   * Dropdown items.
   * If disableOptions is true but options are provided, dropdown is still shown.
   * To avoid dropdown to open at all, leave this prop empty
   */
  options?: Array<DropdownItem & { value?: unknown }>;
  /**
   * Callback to call when Input typing occurs
   * - returns the keyup event object with an additional textContent value
   * - the event is debounced using the debounce function from lodash
   */
  onInputType?: (
    event: React.KeyboardEvent<HTMLInputElement> & { textContent: string | null },
  ) => void;
  /** Debounce value in ms to which debounce the 'onInputType' callback */
  onInputTypeDebounce?: number;
  /** Callback called when a value is going to be added in the Chip Input, should return the configuration for the Chip */
  onAdd?: (value: unknown) => ChipItem<TValue>;
  /** Set the current input text as a Chip when it loses focus */
  confirmChipOnBlur?: boolean;
  /** ChipInput backgroundColor */
  background?: string;
  /** Chip generation triggers */
  separators?: KeyboardPresetKey[];
  /** Show the error  */
  hasError?: boolean;
  /** Background color for the error status */
  errorBackgroundColor?: string;
  /** Set the limit for chip inputs <br />
   * <strong>Warning</strong>: be aware that this check is performed only on internal changes on items.
   * If you change the value from outside, you are in charge of apply this check on the new value itself.
   */
  maxChips?: number | null;
  /**
   * Hide options to select values (on click).
   * This prop does not prevent dropdown to open if options are
   * provided. It only prevents it to open when clicking on the input.
   * To avoid options to be shown at all, leave options empty
   */
  disableOptions?: boolean;
  /** select single replaceable value from options */
  singleSelection?: boolean;
  /** hide the input's bottom border */
  hideBorder?: boolean;
  /** disable the input (but not the dropdown, use disableOptions for this) */
  disabled?: boolean;
  /**
   * Allow entering unique chips only <br />
   * <strong>Warning</strong>: be aware that this check is performed only on internal changes on items.
   * If you change the value from outside, you are in charge of apply this check on the new value itself.
   */
  requireUniqueChips?: boolean;
  /** Input divider color */
  bottomBorderColor?: AnyColor;
  /** Dropdown max height */
  dropdownMaxHeight?: string;
  /** Dropdown width */
  dropdownWidth?: string;
  /** Dropdown max width */
  dropdownMaxWidth?: string;
  /** Description for the input */
  description?: string;
  /** Custom Chip component */
  ChipComponent?: React.ComponentType<ChipItem<TValue>>;
  /** allow creating chips from pasted values */
  createChipOnPaste?: boolean;
  /** Chip generation triggers on paste */
  pasteSeparators?: string[];
  /** Strategy on chips overflow */
  wrap?: 'nowrap' | 'wrap';
  /** maxHeight of Input in case of no horizontal scroll */
  maxHeight?: string;
  onOptionsDisplayChange?: (isVisible: boolean) => void;
};

type ChipInputType = (<TValue = unknown>(
  p: ChipInputProps<TValue> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement<ChipInputProps> | null) & {
  _newId?: number;
};

const ChipInputComponent = <TValue = unknown,>({
  inputRef = null,
  inputName,
  placeholder,
  value,
  defaultValue,
  onChange,
  options = [],
  onInputType,
  onInputTypeDebounce = 300,
  onAdd = DefaultOnAdd<TValue>,
  background = INPUT_BACKGROUND_COLOR,
  confirmChipOnBlur = true,
  separators = [
    { key: 'Enter', ctrlKey: false },
    { key: ',', ctrlKey: false },
    { key: ' ', ctrlKey: false },
  ],
  disabled = false,
  requireUniqueChips = false,
  createChipOnPaste = false,
  pasteSeparators = [','],
  maxChips = null,
  hasError = false,
  hideBorder = false,
  errorBackgroundColor,
  disableOptions = true,
  singleSelection = false,
  bottomBorderColor = INPUT_DIVIDER_COLOR,
  dropdownMaxHeight,
  dropdownWidth = '100%',
  dropdownMaxWidth,
  description,
  ChipComponent,
  wrap = 'wrap',
  maxHeight = '8.125rem',
  onOptionsDisplayChange,
  ref,
  ...rest
}: ChipInputProps<TValue>) => {
  const [items, dispatch] = useReducer(reducer, defaultValue || value || []);
  const [isActive, setIsActive] = useState(false);
  const inputElRef = useCombinedRefs<HTMLInputElement>(inputRef);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const id = useMemo(() => {
    const ChipInputCast = ChipInputComponent as ChipInputType;
    if (ChipInputCast._newId === undefined) {
      ChipInputCast._newId = 0;
    }
    const { _newId } = ChipInputCast;
    ChipInputCast._newId += 1;
    return `chipInput-${_newId}`;
  }, []);

  const [forceShowDropdown, setForceShowDropdown] = useState(false);
  const [dropdownItems, setDropdownItems] = useState<DropdownItem[]>(options);

  const uncontrolledMode = useMemo(() => value === undefined, [value]);

  const dropdownVisibilityRef = useRef<boolean>(forceShowDropdown);

  const setFocus = useCallback(() => {
    inputElRef.current?.focus();
  }, [inputElRef]);

  const saveValue = useCallback(
    (valueToSave: unknown) => {
      const trimmedValue = typeof valueToSave === 'string' ? trim(valueToSave) : valueToSave;

      const isDuplicated = requireUniqueChips && items.some((item) => item.label === trimmedValue);

      if (trimmedValue && !isDuplicated) {
        const item = onAdd(trimmedValue);
        if (uncontrolledMode) {
          dispatch({ type: 'push', item });
        }
        onChange?.([...items, item]);
      }
      if (inputElRef.current) {
        inputElRef.current.value = '';
        inputElRef.current.dispatchEvent(new Event('change'));
      }
    },
    [requireUniqueChips, items, inputElRef, onAdd, uncontrolledMode, onChange],
  );

  const savePastedValue = useCallback(
    (valueToSave: string[]) => {
      const pastedItems = valueToSave.map((vts) => onAdd(vts));
      if (uncontrolledMode) {
        dispatch({ type: 'pushMultiples', items: pastedItems });
      }
      onChange?.([...items, ...pastedItems]);
    },
    [uncontrolledMode, onChange, items, onAdd],
  );

  const replaceValue = useCallback(
    (valueToSave: unknown) => {
      const item = onAdd(valueToSave);
      if (uncontrolledMode) {
        dispatch({ type: 'replace', item });
      }
      onChange?.([...items, item]);
      if (inputElRef.current) {
        inputElRef.current.value = '';
        inputElRef.current.dispatchEvent(new Event('change'));
      }
    },
    [onAdd, uncontrolledMode, onChange, items, inputElRef],
  );

  const saveCurrentValue = useCallback(() => {
    const inputValue = inputElRef.current?.value ?? '';
    if (inputValue.length > 0) {
      saveValue(inputValue);
    }
  }, [inputElRef, saveValue]);

  const saveCurrentEvent = useMemo(
    () =>
      separators.length > 0
        ? getKeyboardPreset('chipInputKeys', saveCurrentValue, undefined, separators)
        : [],
    [saveCurrentValue, separators],
  );

  useKeyboard(inputElRef, saveCurrentEvent);

  const onBackspace = useCallback(
    (e: KeyboardEvent) => {
      const inputElement = e.currentTarget instanceof HTMLInputElement && e.currentTarget;
      if (
        inputElement &&
        inputElement.selectionStart === 0 &&
        inputElement.selectionStart === inputElement.selectionEnd
      ) {
        e.preventDefault();
        if (uncontrolledMode) {
          dispatch({ type: 'popLast' });
        }
        onChange?.(slice(items, 0, items.length - 1));
        return false;
      }
      return true;
    },
    [uncontrolledMode, onChange, items],
  );

  const backspaceEvent = useMemo<KeyboardPresetObj[]>(
    () => [
      {
        type: 'keydown',
        callback: onBackspace,
        keys: [{ key: 'Backspace', ctrlKey: false }],
        haveToPreventDefault: false,
      },
    ],
    [onBackspace],
  );

  useKeyboard(inputElRef, backspaceEvent);

  const onChipClose = useCallback(
    (index: number) => {
      if (uncontrolledMode) {
        dispatch({ type: 'pop', index });
      }
      onChange?.(filter(items, (_item, i) => index !== i));
      inputElRef.current?.focus();
    },
    [inputElRef, items, onChange, uncontrolledMode],
  );

  const onInputBlur = useCallback(() => {
    setIsActive(false);
    if (confirmChipOnBlur && options.length === 0) {
      saveCurrentValue();
    }
  }, [confirmChipOnBlur, options, saveCurrentValue]);

  const onInputKeyUp = useMemo(
    () =>
      debounce((ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (onInputType) {
          onInputType({
            ...ev,
            textContent: inputElRef.current?.value ?? null,
          });
        }
      }, onInputTypeDebounce),
    [inputElRef, onInputType, onInputTypeDebounce],
  );

  useEffect(
    () => (): void => {
      onInputKeyUp.cancel();
    },
    [onInputKeyUp],
  );

  const onOptionClick = useCallback(
    (valueToAdd: unknown) => {
      if (singleSelection) {
        replaceValue(valueToAdd);
      } else {
        saveValue(valueToAdd);
      }
      setFocus();
    },
    [saveValue, setFocus, singleSelection, replaceValue],
  );

  const showDropdown = useCallback(
    (isVisible: boolean) => {
      if (onOptionsDisplayChange && !isEmpty(options)) {
        onOptionsDisplayChange(isVisible);
      }
    },
    [onOptionsDisplayChange, options],
  );

  const onOpen = useCallback(() => {
    showDropdown(true);
  }, [showDropdown]);

  const onClose = useCallback(() => {
    setForceShowDropdown(false);
    showDropdown(false);
  }, [showDropdown]);

  useEffect(() => {
    if (!uncontrolledMode) {
      dispatch({ type: 'reset', value });
    }
  }, [uncontrolledMode, value]);

  useEffect(() => {
    setDropdownItems((prevState) => {
      if (options.length === 0 && prevState.length === 0) {
        return prevState;
      }
      return options.map((o) => ({
        ...o,
        onClick: (event): void => {
          o.onClick?.(event);
          onOptionClick(o.value ? o.value : o.label);
        },
      }));
    });
  }, [onOptionClick, options]);

  // allow horizontal scroll without a scroll bar
  const flipScroll = useCallback<(e: WheelEvent) => void>((ev) => {
    const scrollableElement = ev.currentTarget;
    if (
      scrollableElement instanceof HTMLElement &&
      // avoid catching scroll if entire content is visible
      scrollableElement.scrollWidth > scrollableElement.clientWidth
    ) {
      ev.preventDefault();
      // intercept the mouse wheel and use the delta to scroll the container horizontally
      // noinspection JSSuspiciousNameCombination
      scrollableElement.scrollLeft += ev.deltaY;
    }
  }, []);

  useEffect(() => {
    const wrapperElement = scrollContainerRef.current;
    wrapperElement?.addEventListener('wheel', flipScroll);
    return (): void => {
      wrapperElement?.removeEventListener('wheel', flipScroll);
    };
  }, [flipScroll, scrollContainerRef]);

  useEffect(() => {
    /*
     * Scroll to end of horizontal or vertical scrollable container when items change,
     * so that the last chip and the input are fully visible.
     * This is done with an effect to be sure that every change on the items trigger this
     * update with the final dimensions of the container
     */
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [items]);

  const isInputDisabled = useMemo(
    () => !!maxChips && items.length >= maxChips,
    [items.length, maxChips],
  );

  const previousIsInputDisabled = usePrevious<boolean>(isInputDisabled);

  useEffect(() => {
    if (onOptionsDisplayChange && forceShowDropdown !== dropdownVisibilityRef.current) {
      dropdownVisibilityRef.current = forceShowDropdown;
      onOptionsDisplayChange(dropdownVisibilityRef.current);
    }
  }, [forceShowDropdown, onOptionsDisplayChange]);

  useEffect(() => {
    if (isInputDisabled && !previousIsInputDisabled) {
      setIsActive(false);
    }
  }, [previousIsInputDisabled, isInputDisabled]);

  // dropdown disabled does not depend on chipInput disabled, so that options can be still used
  // even if input is disabled (chip can be added through dropdown but not typing)
  const isDropdownDisabled = useMemo(
    () => disableOptions || isInputDisabled,
    [disableOptions, isInputDisabled],
  );

  useEffect(() => {
    // if dropdown is set to not open on click (dropdownDisabled),
    // force open it on options change to simulate suggestion mode
    setForceShowDropdown(isDropdownDisabled && !isEmpty(options));
  }, [isDropdownDisabled, options]);

  const hasFocus = useMemo(() => isActive && !isInputDisabled, [isActive, isInputDisabled]);

  const onInputFocus = useCallback(() => setIsActive(true), []);

  const onPaste = useCallback<React.ClipboardEventHandler>(
    (e) => {
      if (createChipOnPaste) {
        e.preventDefault();
        // TODO: investigate if reading data from text with uppercase T is right
        const pastedText = e.clipboardData.getData('Text');
        const separatorsRegex = new RegExp(pasteSeparators.join('|'), 'gi');
        const reducedChips = pastedText
          .split(separatorsRegex)
          .reduce<string[]>((values, textItem) => {
            if (textItem.trim() !== '') {
              values.push(textItem.trim());
            }
            return values;
          }, []);
        savePastedValue(requireUniqueChips ? uniq(reducedChips) : reducedChips);
      }
    },
    [createChipOnPaste, pasteSeparators, requireUniqueChips, savePastedValue],
  );

  const ChipComp = useMemo(() => ChipComponent || Chip, [ChipComponent]);

  const dividerColor = useMemo<AnyColor>(
    () =>
      `${
        (hideBorder && 'transparent') ||
        (hasError && 'error') ||
        (hasFocus && 'primary') ||
        bottomBorderColor
      }${disabled ? '.disabled' : ''}`,
    [bottomBorderColor, disabled, hasError, hasFocus, hideBorder],
  );

  const cursorState = useMemo(() => {
    if (disabled || isInputDisabled) {
      if (!isDropdownDisabled) return 'pointer';
      return undefined;
    }
    return 'text';
  }, [disabled, isInputDisabled, isDropdownDisabled]);

  const containerElClassName = clsx(styles.containerEl);

  const descriptionStyle: React.CSSProperties = useMemo(
    () =>
      ({
        '--description-bg-color': errorBackgroundColor
          ? getThemeColorVar(errorBackgroundColor, 'regular')
          : 'transparent',
        paddingTop: description ? '0.25rem' : undefined,
        minHeight: description ? '1.125rem' : undefined,
        lineHeight: description ? '1.5' : undefined,
      } as React.CSSProperties),
    [description, errorBackgroundColor],
  );

  return (
    <Container height="fit" width="fill" crossAlignment="flex-start">
      <Dropdown
        items={dropdownItems}
        display="block"
        width={dropdownWidth}
        disableAutoFocus
        disableRestoreFocus
        forceOpen={forceShowDropdown}
        onOpen={onOpen}
        onClose={onClose}
        disabled={isDropdownDisabled}
        maxHeight={dropdownMaxHeight}
        maxWidth={dropdownMaxWidth}
      >
        <InputContainer
          ref={ref}
          className={containerElClassName}
          data-cursor={cursorState}
          orientation="horizontal"
          width="fill"
          maxWidth={'fill'}
          height="fit"
          mainAlignment="flex-start"
          crossAlignment={'center'}
          padding={{ horizontal: '0.75rem' }}
          gap={'0.5rem'}
          borderRadius="half"
          background={background}
          $disabled={(disabled || isInputDisabled) && isDropdownDisabled}
          onClick={setFocus}
          {...rest}
        >
          <Container
            className={styles.relativeContainer}
            padding={{
              top: placeholder ? '0.0625rem' : '0.625rem',
              bottom: placeholder ? '0.175rem' : '0.625rem',
            }}
            mainAlignment={'flex-end'}
            height={'fill'}
            width={'fill'}
            minHeight={'inherit'}
            orientation={'horizontal'}
            crossAlignment={'flex-end'}
            flexGrow={0}
            flexShrink={1}
            minWidth={0}
          >
            <Container
              ref={scrollContainerRef}
              className={styles.scrollContainer}
              data-wrap={wrap}
              data-has-label={placeholder ? 'true' : undefined}
              flexBasis={'auto'}
              flexGrow={1}
              flexShrink={1}
              orientation={'horizontal'}
              mainAlignment={'flex-start'}
              crossAlignment={'flex-end'}
              width={'auto'}
              gap={'0.5rem'}
              wrap={wrap}
              maxHeight={maxHeight}
            >
              {items.map((item, index) => (
                <ChipComp
                  key={`${index}-${item.value}`}
                  maxWidth={(wrap === 'wrap' && '100%') || undefined}
                  {...item}
                  onClose={(): void => onChipClose(index)}
                />
              ))}
              <AdjustWidthInput
                color="text"
                autoComplete="off"
                ref={inputElRef}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                onKeyUp={onInputType && onInputKeyUp}
                id={id}
                name={inputName ?? placeholder}
                disabled={disabled || isInputDisabled}
                placeholder={placeholder}
                onPaste={onPaste}
              />
              {placeholder && (
                <InputLabel
                  className={styles.label}
                  data-has-items={
                    items.length > 0 || !!inputElRef.current?.value ? 'true' : undefined
                  }
                  htmlFor={id}
                  $hasFocus={hasFocus}
                  $hasError={hasError}
                  $disabled={disabled && isDropdownDisabled}
                >
                  {placeholder}
                </InputLabel>
              )}
            </Container>
          </Container>
        </InputContainer>
      </Dropdown>
      <divider-wc color={dividerColor}></divider-wc>
      {description !== undefined && (
        <InputDescription
          className={styles.customInputDescription}
          style={descriptionStyle}
          color={(hasError && 'error') || (hasFocus && 'primary') || 'secondary'}
          disabled={disabled && isDropdownDisabled}
        >
          {description}
        </InputDescription>
      )}
    </Container>
  );
};

const ChipInput = ChipInputComponent as ChipInputType;
ChipInput._newId = 0;

export {
  ChipInput,
  ChipInputComponent,
  type ChipInputProps,
  type ChipInputType,
  type ChipItem,
  DefaultOnAdd,
};
