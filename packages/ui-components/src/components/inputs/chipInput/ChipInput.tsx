/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../../../web-components/ds-divider';

import clsx from 'clsx';
import { debounce, filter, isEmpty, slice, trim, uniq } from 'lodash-es';
import React, {
  InputHTMLAttributes,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
} from 'react';

import { useCombinedRefs } from '../../../hooks/useCombinedRefs';
import { KeyboardPresetKey, KeyboardPresetObj, useKeyboard } from '../../../hooks/useKeyboard';
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
  const sanitized = colorName.replaceAll(/[^a-zA-Z0-9-]/g, '');
  return `var(--color-${sanitized}-${state}, var(--color-${sanitized}-regular, ${colorName}))`;
}

function clearInputElement(input: HTMLInputElement | null | undefined): void {
  if (input) {
    input.value = '';
    input.dispatchEvent(new Event('change'));
  }
}

function getChipDividerColor(deps: {
  hideBorder: boolean;
  hasError: boolean;
  hasFocus: boolean;
  bottomBorderColor: AnyColor;
  disabled?: boolean;
}): AnyColor {
  const base =
    (deps.hideBorder && 'transparent') ||
    (deps.hasError && 'error') ||
    (deps.hasFocus && 'primary') ||
    deps.bottomBorderColor;
  return `${base}${deps.disabled ? '.disabled' : ''}`;
}

function getChipCursorState(
  disabled: boolean | undefined,
  isInputDisabled: boolean,
  isDropdownDisabled: boolean,
): 'pointer' | 'text' | undefined {
  if (disabled || isInputDisabled) {
    return isDropdownDisabled ? undefined : 'pointer';
  }
  return 'text';
}

function splitPastedChips(pastedText: string, pasteSeparators: Array<string>): Array<string> {
  const separatorsRegex = new RegExp(pasteSeparators.join('|'), 'gi');
  return pastedText
    .split(separatorsRegex)
    .reduce<Array<string>>((values, textItem) => {
      if (textItem.trim() !== '') {
        values.push(textItem.trim());
      }
      return values;
    }, []);
}

function createOnPaste(deps: {
  createChipOnPaste: boolean;
  pasteSeparators: Array<string>;
  requireUniqueChips: boolean;
  savePastedValue: (valueToSave: Array<string>) => void;
}): React.ClipboardEventHandler {
  return (e) => {
    if (deps.createChipOnPaste) {
      e.preventDefault();
      const reducedChips = splitPastedChips(e.clipboardData.getData('Text'), deps.pasteSeparators);
      deps.savePastedValue(deps.requireUniqueChips ? uniq(reducedChips) : reducedChips);
    }
  };
}

function createOnBackspace<TValue>(deps: {
  uncontrolledMode: boolean;
  dispatch: React.Dispatch<ReducerAction<TValue>>;
  onChange: ChipInputProps<TValue>['onChange'];
  items: Array<ChipItem<TValue>>;
}): (e: KeyboardEvent) => boolean {
  return (e) => {
    const inputElement = e.currentTarget instanceof HTMLInputElement && e.currentTarget;
    if (
      inputElement &&
      inputElement.selectionStart === 0 &&
      inputElement.selectionStart === inputElement.selectionEnd
    ) {
      e.preventDefault();
      if (deps.uncontrolledMode) {
        deps.dispatch({ type: 'popLast' });
      }
      deps.onChange?.(slice(deps.items, 0, deps.items.length - 1));
      return false;
    }
    return true;
  };
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
  isRequired = false,
  color,
  ref,
  ...rest
}: {
  color: string;
  isRequired: boolean;
  ref?: React.Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>) => {
  const hiddenSpanRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useCombinedRefs<HTMLInputElement>(ref);

  const resizeInput = () => {
    const input = inputRef.current;
    const hiddenSpan = hiddenSpanRef.current;
    if (input && hiddenSpan) {
      hiddenSpan.textContent = '#'.repeat(input.value.length);
      input.style.setProperty('width', input.value ? `${input.scrollWidth}px` : '');
    }
  };

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

  const inputStyle = {
    '--input-color': getThemeColorVar(color, 'regular'),
    '--input-color-disabled': getThemeColorVar(color, 'disabled'),
  } as React.CSSProperties;

  return (
    <div className={styles.adjustWidthInputContainer}>
      <span ref={hiddenSpanRef} className={styles.hiddenSpan} />
      <input
        required={isRequired}
        aria-required={isRequired}
        className={styles.inputEl}
        style={inputStyle}
        {...rest}
        ref={inputRef}
      />
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

function defaultOnAdd<TValue>(valueToAdd: unknown): ChipItem<TValue> {
  if (typeof valueToAdd === 'string') {
    return { label: valueToAdd };
  }
  if (valueToAdd !== null && typeof valueToAdd === 'object') {
    return {
      label: 'no label',
      ...valueToAdd,
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
  isRequired?: boolean;
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
  onAdd = defaultOnAdd<TValue>,
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
  isRequired = false,
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
  const [inputHasValue, setInputHasValue] = useState(false);
  const inputElRef = useCombinedRefs<HTMLInputElement>(inputRef);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const generatedId = useId();
  const id = `chipInput-${generatedId}`;

  const isInputDisabled = !!maxChips && items.length >= maxChips;
  const isDropdownDisabled = disableOptions || isInputDisabled;
  const suggestionOpen = isDropdownDisabled && !isEmpty(options);
  const [forceShowDropdown, setForceShowDropdown] = useState(suggestionOpen);
  const [prevSuggestionOpen, setPrevSuggestionOpen] = useState(suggestionOpen);
  if (suggestionOpen !== prevSuggestionOpen) {
    setPrevSuggestionOpen(suggestionOpen);
    setForceShowDropdown(suggestionOpen);
  }

  const uncontrolledMode = value === undefined;

  const setFocus = () => {
    inputElRef.current?.focus();
  };

  const saveValue = (valueToSave: unknown) => {
    const trimmedValue = typeof valueToSave === 'string' ? trim(valueToSave) : valueToSave;

    const isDuplicated = requireUniqueChips && items.some((item) => item.label === trimmedValue);

    if (trimmedValue && !isDuplicated) {
      const item = onAdd(trimmedValue);
      if (uncontrolledMode) {
        dispatch({ type: 'push', item });
      }
      onChange?.([...items, item]);
    }
    clearInputElement(inputElRef.current);
    setInputHasValue(false);
  };

  const savePastedValue = (valueToSave: string[]) => {
    const pastedItems = valueToSave.map((vts) => onAdd(vts));
    if (uncontrolledMode) {
      dispatch({ type: 'pushMultiples', items: pastedItems });
    }
    onChange?.([...items, ...pastedItems]);
  };

  const replaceValue = (valueToSave: unknown) => {
    const item = onAdd(valueToSave);
    if (uncontrolledMode) {
      dispatch({ type: 'replace', item });
    }
    onChange?.([...items, item]);
    clearInputElement(inputElRef.current);
    setInputHasValue(false);
  };

  const saveCurrentValue = () => {
    const inputValue = inputElRef.current?.value ?? '';
    if (inputValue.length > 0) {
      saveValue(inputValue);
    }
  };

  const saveCurrentEvent: KeyboardPresetObj[] =
    separators.length > 0 ? [{ type: 'keydown', callback: saveCurrentValue, keys: separators }] : [];

  useKeyboard(inputElRef, saveCurrentEvent);

  const onBackspace = createOnBackspace<TValue>({
    uncontrolledMode,
    dispatch,
    onChange,
    items,
  });

  const backspaceEvent: KeyboardPresetObj[] = [
    {
      type: 'keydown',
      callback: onBackspace,
      keys: [{ key: 'Backspace', ctrlKey: false }],
      haveToPreventDefault: false,
    },
  ];

  useKeyboard(inputElRef, backspaceEvent);

  const onChipClose = (index: number) => {
    if (uncontrolledMode) {
      dispatch({ type: 'pop', index });
    }
    onChange?.(filter(items, (_item, i) => index !== i));
    inputElRef.current?.focus();
  };

  const onInputBlur = () => {
    setIsActive(false);
    if (confirmChipOnBlur && options.length === 0) {
      saveCurrentValue();
    }
  };

  const onInputKeyUp = debounce((ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (onInputType) {
      onInputType({
        ...ev,
        textContent: (ev.target as HTMLInputElement)?.value ?? null,
      });
    }
  }, onInputTypeDebounce);

  useEffect(
    () => (): void => {
      onInputKeyUp.cancel();
    },
    [onInputKeyUp],
  );

  const onOptionClick = (valueToAdd: unknown) => {
    if (singleSelection) {
      replaceValue(valueToAdd);
    } else {
      saveValue(valueToAdd);
    }
    setFocus();
  };

  const showDropdown = (isVisible: boolean) => {
    if (onOptionsDisplayChange && !isEmpty(options)) {
      onOptionsDisplayChange(isVisible);
    }
  };

  const onOpen = () => {
    showDropdown(true);
  };

  const onClose = () => {
    setForceShowDropdown(false);
    showDropdown(false);
  };

  const initialSuggestionOpenRef = useRef(suggestionOpen);
  useEffect(() => {
    if (initialSuggestionOpenRef.current && !isEmpty(options)) {
      onOptionsDisplayChange?.(true);
    }
  }, []);

  const [prevValue, setPrevValue] = useState<ChipItem<TValue>[] | undefined>(undefined);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== undefined) {
      dispatch({ type: 'reset', value });
    }
  }

  const dropdownItems = options.map((o) => ({
    ...o,
    onClick: (event: React.SyntheticEvent<HTMLElement> | KeyboardEvent): void => {
      o.onClick?.(event);
      onOptionClick(o.value ? o.value : o.label);
    },
  }));

  const flipScroll = (ev: WheelEvent): void => {
    const scrollableElement = ev.currentTarget;
    if (
      scrollableElement instanceof HTMLElement &&
      scrollableElement.scrollWidth > scrollableElement.clientWidth
    ) {
      ev.preventDefault();
      scrollableElement.scrollLeft += ev.deltaY;
    }
  };

  useEffect(() => {
    const wrapperElement = scrollContainerRef.current;
    wrapperElement?.addEventListener('wheel', flipScroll);
    return (): void => {
      wrapperElement?.removeEventListener('wheel', flipScroll);
    };
  }, [flipScroll, scrollContainerRef]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [items]);

  const hasFocus = isActive && !isInputDisabled;

  const onInputFocus = () => setIsActive(true);

  const onPaste: React.ClipboardEventHandler = createOnPaste({
    createChipOnPaste,
    pasteSeparators,
    requireUniqueChips,
    savePastedValue,
  });

  const ChipComp = ChipComponent || Chip;

  const dividerColor: AnyColor = getChipDividerColor({
    hideBorder,
    hasError,
    hasFocus,
    bottomBorderColor,
    disabled,
  });

  const cursorState = getChipCursorState(disabled, isInputDisabled, isDropdownDisabled);

  const containerElClassName = clsx(styles.containerEl);

  const descriptionStyle = {
    '--description-bg-color': errorBackgroundColor
      ? getThemeColorVar(errorBackgroundColor, 'regular')
      : 'transparent',
    paddingTop: description ? '0.25rem' : undefined,
    minHeight: description ? '1.125rem' : undefined,
    lineHeight: description ? '1.5' : undefined,
  } as React.CSSProperties;

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
                isRequired={isRequired}
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
                onInput={(e) => setInputHasValue(e.currentTarget.value.length > 0)}
              />
              {placeholder && (
                <InputLabel
                  className={styles.label}
                  data-has-items={items.length > 0 || inputHasValue ? 'true' : undefined}
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
      <ds-divider color={dividerColor}></ds-divider>
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
  defaultOnAdd,
  getThemeColorVar,
  reducer,
};
