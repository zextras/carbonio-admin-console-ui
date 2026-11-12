/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback,useEffect, useMemo, useState } from 'react';

import { getKeyboardPreset, useKeyboard } from './useKeyboard';

type UseCheckboxArgs = {
	ref: React.RefObject<HTMLElement | null>;
	value?: boolean;
	defaultChecked?: boolean;
	disabled?: boolean;
	onClick?: (event: Event) => void;
	onChange?: (newValue: boolean) => void;
};

function useCheckbox({
	ref,
	value,
	defaultChecked,
	disabled,
	onClick,
	onChange
}: UseCheckboxArgs): boolean {
	const [internalChecked, setInternalChecked] = useState<boolean>(defaultChecked || false);
	const checked = value ?? internalChecked;

	const uncontrolledMode = useMemo(() => value === undefined, [value]);

	const handleClick = useCallback(
		(ev: Event) => {
			if (!disabled) {
				if (uncontrolledMode) {
					const nextChecked = !checked;
					setInternalChecked(nextChecked);
					onChange?.(nextChecked);
				}
				if (onClick) {
					onClick(ev);
				}
			}
		},
		[disabled, uncontrolledMode, checked, onClick, onChange]
	);

	const keyEvents = useMemo(() => getKeyboardPreset('button', handleClick), [handleClick]);
	useKeyboard(ref, keyEvents);

	useEffect(() => {
		const refSave = ref.current;
		refSave?.addEventListener('click', handleClick);
		return () => {
			refSave?.removeEventListener('click', handleClick);
		};
	}, [ref, handleClick]);

	return checked;
}

export { useCheckbox };
export type { UseCheckboxArgs };
