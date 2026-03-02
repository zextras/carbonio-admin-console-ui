/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import React, { HTMLAttributes } from 'react';

import styles from './ModalBody.module.css';

type ModalBodyProps = HTMLAttributes<HTMLDivElement> & {
	/** Max height of the body container */
	maxHeight?: string;
	/** Align text to the center */
	centered?: boolean;
	ref?: React.Ref<HTMLDivElement>;
};

function ModalBody({ maxHeight, centered, children, ref, ...rest }: ModalBodyProps) {
	return (
		<div
			className={clsx(styles.modalBody, centered && styles.centered)}
			style={{ maxHeight }}
			ref={ref}
			{...rest}
		>
			{children}
		</div>
	);
}

export type { ModalBodyProps };
export { ModalBody };
