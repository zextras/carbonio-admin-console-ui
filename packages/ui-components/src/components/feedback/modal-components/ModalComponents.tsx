/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import React from 'react';

import { Container } from '../../layout/Container';
import styles from './ModalComponents.module.css';

const modalMinWidth = {
	extrasmall: '20%',
	small: '25%',
	medium: '35%',
	large: '50%'
};
const modalWidth = {
	extrasmall: '25rem',
	small: '31.25rem',
	medium: '40.625rem',
	large: '50rem'
};

function isBodyOverflowing(modalRef: React.RefObject<HTMLDivElement | null>, windowObj: Window): boolean {
	if (!windowObj) {
		return false;
	}

	const modalElement = modalRef.current;
	if (!modalElement) {
		return false;
	}

	return (
		windowObj.document.body.scrollHeight > modalElement.clientHeight ||
		windowObj.document.body.scrollWidth > windowObj.document.body.clientWidth
	);
}

function getScrollbarSize(windowObj: Window): number {
	const scrollDiv = windowObj.document.createElement('div');
	if (scrollDiv && windowObj) {
		scrollDiv.style.width = '99px';
		scrollDiv.style.height = '99px';
		scrollDiv.style.position = 'absolute';
		scrollDiv.style.top = '-9999px';
		scrollDiv.style.overflow = 'scroll';
		windowObj.document.body.appendChild(scrollDiv);
		const scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
		windowObj.document.body.removeChild(scrollDiv);
		return scrollbarSize;
	}
	return 0;
}

type ModalContainerProps = React.HTMLAttributes<HTMLDivElement> & {
	$mounted?: boolean;
	$open?: boolean;
	$zIndex?: number;
};

function ModalContainer({
	$mounted,
	$open,
	$zIndex,
	className,
	style,
	...props
}: ModalContainerProps) {
	return (
		<div
			className={clsx(styles.modalContainer, $open && styles.open, className)}
			style={{
				...style,
				zIndex: $mounted || $open ? $zIndex : -1,
			}}
			{...props}
		/>
	);
}

type ModalWrapperProps = React.HTMLAttributes<HTMLDivElement>;

function ModalWrapper({ className, ...props }: ModalWrapperProps) {
	return <div className={clsx(styles.modalWrapper, className)} {...props} />;
}

type ModalContentProps = React.HTMLAttributes<HTMLDivElement> & {
	$size: keyof typeof modalMinWidth & keyof typeof modalWidth;
};

function ModalContent({
	$size,
	className,
	style,
	...props
}: ModalContentProps) {
	return (
		<Container
			className={clsx(styles.modalContent, className)}
			background="gray6"
			maxWidth="100%"
			minWidth={modalMinWidth[$size]}
			width={modalWidth[$size]}
			padding="2rem"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="auto"
			tabIndex={-1}
			style={{
				...style,
				marginTop: 0,
				marginRight: 'auto',
				marginBottom: 'var(--padding-medium, 0.75rem)',
				marginLeft: 'auto',
			}}
			{...props}
		/>
	);
}

export { getScrollbarSize, isBodyOverflowing, ModalContainer, ModalContent, ModalWrapper };
