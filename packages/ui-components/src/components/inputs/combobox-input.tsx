/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { flip, limitShift, offset, shift } from '@floating-ui/dom';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { setupFloating } from '../../utils/floating-ui';
import type { IconName } from '../../web-components/icon-registry';
import { Portal } from '../utilities/Portal';
import popupStyles from './combobox-input.module.css';
import { InputShell } from './input-shell';
import styles from './input-shell.module.css';

type ComboboxItem = {
	/** Stable identifier; also used as the React key. */
	id: string;
	/** Text shown in the listbox row. */
	label: string;
	/** Renders the option as non-selectable and skips it during keyboard navigation. */
	disabled?: boolean;
	/** Optional leading icon name, rendered as a decorative ds-icon. */
	icon?: IconName;
};

type ComboboxInputProps = Omit<React.ComponentPropsWithRef<'input'>, 'size'> & {
	/** Always rendered as a visible <label> above the field. */
	label: string;
	/** Options shown in the listbox. Rendered as given: the component never filters. */
	items: Array<ComboboxItem>;
	/** Renders the description below the field and links it via aria-describedby. `null` is treated as absent. */
	description?: string | null;
	/** Marks the field as invalid (aria-invalid) and applies the error styling. */
	hasError?: boolean;
	/** Fired when the user picks an option (click or Enter). The component never writes the picked label back into the input. */
	onSelect: (item: ComboboxItem) => void;
	/** When provided, renders a clear button while the value is non-empty. */
	onClear?: () => void;
	/** Renders a "Loading..." row instead of the options. */
	loading?: boolean;
	/** Rendered as a non-interactive row when the list is open with no items and not loading. */
	emptyMessage?: string;
};

function optionDomId(listboxId: string, itemId: string): string {
	return `${listboxId}-${itemId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

function selectedIndexOf(items: Array<ComboboxItem>, value: string | undefined): number | null {
	const query = value?.toLowerCase() ?? '';
	const index = items.findIndex(
		(item) => !item.disabled && item.label.toLowerCase() === query,
	);
	return index >= 0 ? index : null;
}

function firstEnabledIndexOf(items: Array<ComboboxItem>): number | null {
	for (let index = 0; index < items.length; index += 1) {
		if (!items[index]?.disabled) return index;
	}
	return null;
}

function lastEnabledIndexOf(items: Array<ComboboxItem>): number | null {
	for (let index = items.length - 1; index >= 0; index -= 1) {
		if (!items[index]?.disabled) return index;
	}
	return null;
}

function nextEnabledIndexOf(
	items: Array<ComboboxItem>,
	from: number | null,
	direction: 1 | -1,
): number | null {
	let index = from === null ? (direction === 1 ? 0 : items.length - 1) : from + direction;
	while (index >= 0 && index < items.length) {
		if (!items[index]?.disabled) return index;
		index += direction;
	}
	return null;
}

type ComboboxOptionProps = {
	item: ComboboxItem;
	optionId: string;
	active: boolean;
	selected: boolean;
	onPick: (item: ComboboxItem) => void;
};

const ComboboxOption = ({ item, optionId, active, selected, onPick }: ComboboxOptionProps) => (
	<div
		id={optionId}
		role="option"
		tabIndex={-1}
		aria-selected={selected}
		aria-disabled={item.disabled || undefined}
		data-active={active || undefined}
		data-disabled={item.disabled || undefined}
		className={popupStyles.option}
		onMouseDown={(e) => {
			e.preventDefault();
		}}
		onClick={() => {
			if (!item.disabled) onPick(item);
		}}
		onKeyUp={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				if (!item.disabled) onPick(item);
			}
		}}
	>
		{item.icon && (
			<ds-icon icon={item.icon} size="0.875rem" color="var(--color-text-regular)" aria-hidden="true" />
		)}
		<span className={popupStyles.optionLabel}>{item.label}</span>
	</div>
);

const ComboboxInput = ({
	label,
	id,
	items,
	disabled,
	required,
	description,
	hasError = false,
	loading = false,
	emptyMessage,
	onSelect,
	onClear,
	className,
	onChange,
	onClick,
	onKeyDown,
	ref: callerRef,
	'aria-describedby': callerDescribedBy,
	...rest
}: ComboboxInputProps) => {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const descriptionId = useId();
	const listboxId = useId();
	const inputRef = useRef<HTMLInputElement | null>(null);
	const listboxRef = useRef<HTMLDivElement | null>(null);
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const resolvedDescription = description ?? '';
	const inputClassName = [styles.control, className].filter(Boolean).join(' ');
	const describedBy = [callerDescribedBy, description ? descriptionId : undefined]
		.filter(Boolean)
		.join(' ');
	const valueLower = rest.value?.toString().toLowerCase();

	function openList(): void {
		if (disabled) return;
		setOpen(true);
		setActiveIndex(selectedIndexOf(items, rest.value?.toString()));
	}

	function closeList(): void {
		setOpen(false);
		setActiveIndex(null);
	}

	function pick(item: ComboboxItem): void {
		closeList();
		onSelect(item);
	}

	function handleArrow(direction: 1 | -1): void {
		const nextIndex = nextEnabledIndexOf(items, activeIndex, direction);
		if (nextIndex !== null) setActiveIndex(nextIndex);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			const direction = e.key === 'ArrowDown' ? 1 : -1;
			if (open) {
				handleArrow(direction);
			} else {
				setOpen(true);
				setActiveIndex(nextEnabledIndexOf(items, null, direction));
			}
		} else if (e.key === 'Home') {
			e.preventDefault();
			if (!open) setOpen(true);
			setActiveIndex(firstEnabledIndexOf(items));
		} else if (e.key === 'End') {
			e.preventDefault();
			if (!open) setOpen(true);
			setActiveIndex(lastEnabledIndexOf(items));
		} else if (e.key === 'Enter' && open) {
			e.preventDefault();
			if (activeIndex !== null) {
				const item = items[activeIndex];
				if (item && !item.disabled) pick(item);
			} else {
				closeList();
			}
		} else if (e.key === 'Escape' && open) {
			e.preventDefault();
			closeList();
		} else if (e.key === 'Tab' && open) {
			closeList();
		}
		onKeyDown?.(e);
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		if (!open && !disabled) {
			setOpen(true);
			setActiveIndex(selectedIndexOf(items, e.target.value));
		}
		onChange?.(e);
	}

	function handleClick(e: React.MouseEvent<HTMLInputElement>): void {
		if (!open) openList();
		onClick?.(e);
	}

	useLayoutEffect(() => {
		if (!open) return undefined;
		const box = inputRef.current?.parentElement;
		const listbox = listboxRef.current;
		if (!box || !listbox) return undefined;
		listbox.style.width = `${box.offsetWidth}px`;
		return setupFloating(box, listbox, {
			placement: 'bottom-start',
			strategy: 'fixed',
			middleware: [offset(4), flip(), shift({ limiter: limitShift() })],
		});
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;
		function handlePointerDown(e: PointerEvent): void {
			const target = e.target as Node;
			const box = inputRef.current?.parentElement;
			const listbox = listboxRef.current;
			if (box?.contains(target) || listbox?.contains(target)) return;
			closeList();
		}
		document.addEventListener('pointerdown', handlePointerDown);
		return () => document.removeEventListener('pointerdown', handlePointerDown);
	}, [open]);

	const showClear = onClear !== undefined && !!valueLower;

	return (
		<InputShell
			id={inputId}
			label={label}
			disabled={disabled}
			required={required}
			hasError={hasError}
			description={resolvedDescription}
			descriptionId={descriptionId}
		>
			<input
				id={inputId}
				ref={(node: HTMLInputElement | null) => {
					inputRef.current = node;
					if (typeof callerRef === 'function') callerRef(node);
					else if (callerRef) callerRef.current = node;
				}}
				role="combobox"
				disabled={disabled}
				required={required}
				className={inputClassName}
				aria-haspopup="listbox"
				aria-autocomplete="list"
				aria-expanded={open}
				aria-controls={open ? listboxId : undefined}
				aria-activedescendant={
					activeIndex !== null ? optionDomId(listboxId, items[activeIndex]?.id ?? '') : undefined
				}
				aria-invalid={hasError || undefined}
				aria-describedby={describedBy || undefined}
				onChange={handleChange}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				{...rest}
			/>
			{showClear && (
				<button type="button" className={popupStyles.iconButton} aria-label="Clear" onClick={onClear}>
					<ds-icon icon="CloseOutline" size="1rem" color="var(--color-gray1-focus)" aria-hidden="true" />
				</button>
			)}
			<button
				type="button"
				className={popupStyles.iconButton}
				aria-label="Toggle suggestions"
				aria-expanded={open}
				aria-controls={open ? listboxId : undefined}
				disabled={disabled}
				onClick={() => {
					if (open) closeList();
					else openList();
				}}
			>
				<ds-icon
					icon={open ? 'ChevronUp' : 'ChevronDown'}
					size="1rem"
					color="var(--color-gray1-focus)"
					aria-hidden="true"
				/>
			</button>
			{open && !disabled && (
				<Portal show>
					<div
						ref={listboxRef}
						id={listboxId}
						role="listbox"
						aria-busy={loading || undefined}
						className={popupStyles.listbox}
					>
						{loading ? (
							<div role="presentation" className={popupStyles.messageRow}>
								Loading...
							</div>
						) : items.length === 0 ? (
							<div role="presentation" className={popupStyles.messageRow}>
								{emptyMessage}
							</div>
						) : (
							items.map((item, index) => (
								<ComboboxOption
									key={item.id}
									item={item}
									optionId={optionDomId(listboxId, item.id)}
									active={activeIndex === index}
									selected={item.label.toLowerCase() === valueLower}
									onPick={pick}
								/>
							))
						)}
					</div>
				</Portal>
			)}
		</InputShell>
	);
};

export { ComboboxInput };
export type { ComboboxInputProps,ComboboxItem };
