/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { ModalOverlayContainer, ModalSubOverlayContainer } from './styled';

interface ModalOverlayProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	maxWidth?: string;
	setShowModal?: (showModal: boolean) => void;
	isDirty?: boolean;
	children?: React.ReactNode;
}

const ModalOverlay: FC<ModalOverlayProps> = ({
	children,
	open,
	setOpen,
	maxWidth,
	setShowModal,
	isDirty
}) => {
	const ref = useRef<any>(null);
	const [t] = useTranslation();

	const handleClickOutside = (event: any): void => {
		if (
			ref.current &&
			!ref.current.contains(event.srcElement as Node) &&
			event.target.closest('.Dropdown__PopperList-sc-1jmq2vf-2') === null &&
			event.target.closest('.styled__SideSubModelContainer-sc-881g33-2') === null &&
			event.target.closest('.ModalComponents__ModalContainer-sc-3bij4r-0') === null
		) {
			if (isDirty) {
				if (setShowModal) {
					setShowModal(true);
				}
			} else {
				setOpen(false);
				document.body.style.overflowY = '';
			}
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDirty, setOpen, setShowModal]);

	useEffect(() => {
		if (open) {
			document.body.style.overflowY = 'hidden';
		}
	}, [open]);

	return (
		<ModalOverlayContainer>
			<ModalSubOverlayContainer ref={ref} maxWidth={maxWidth}>
				{children}
			</ModalSubOverlayContainer>
		</ModalOverlayContainer>
	);
};

export default ModalOverlay;
