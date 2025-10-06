/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

const useOutsideClick = (ref: Record<any, any>, callback: () => void): void => {
	useEffect(() => {
		const handleClickOutside = (evt: any): void => {
			if (ref.current && !ref.current.contains(evt.target)) {
				callback();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [ref, callback]);
};

export default useOutsideClick;
