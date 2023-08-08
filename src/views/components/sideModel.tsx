/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useRef } from 'react';
import { SideModelContainer, SideSubModelContainer } from './styled';

interface SideModelProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	maxWidth?: string;
}

const SideModel: FC<SideModelProps> = ({ children, open, setOpen, maxWidth }) => {
	const ref = useRef<any>(null);

	const handleClickOutside = (event: any): void => {
		if (
			ref.current &&
			!ref.current.contains(event.srcElement as Node) &&
			event.target.closest('.Dropdown__PopperList-sc-1jmq2vf-2') === null &&
			event.target.closest('.styled__SideSubModelContainer-sc-881g33-2') === null &&
			event.target.closest('.ModalComponents__ModalContainer-sc-3bij4r-0') === null
		) {
			setOpen(false);
			document.body.style.overflowY = '';
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (open) {
			document.body.style.overflowY = 'hidden';
		}
	}, [open]);

	return (
		<SideModelContainer>
			<SideSubModelContainer ref={ref} maxWidth={maxWidth}>
				{children}
			</SideSubModelContainer>
		</SideModelContainer>
	);
};

export default SideModel;
