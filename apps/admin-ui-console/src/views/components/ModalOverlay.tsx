/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useRef } from 'react';


import { ModalOverlayContainer, ModalSubOverlayContainer } from './styled';

interface ModalOverlayProps {
	open: boolean;
	maxWidth?: string;
	children?: React.ReactNode;
}

const ModalOverlay: FC<ModalOverlayProps> = ({
	children,
	open,
	maxWidth
}) => {
	const ref = useRef<any>(null);

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
