/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import React from 'react';

import { Button } from '../../basic/button/Button';
import { Tooltip } from '../../display/Tooltip';
import { Row } from '../../layout/Row';
import styles from './ModalHeader.module.css';

type ModalHeaderProps = {
	centered?: boolean;
	type?: 'default' | 'error';
	title?: string | React.ReactElement;
	showCloseIcon?: boolean;
	onClose?: (event: React.MouseEvent | KeyboardEvent) => void;
	closeIconTooltip?: string;
	closeIconAriaLabel?: string;
};

function ModalHeader({
	centered,
	onClose,
	showCloseIcon,
	title,
	type,
	closeIconTooltip,
	closeIconAriaLabel = 'Close',
}: Readonly<ModalHeaderProps>): React.JSX.Element {
	return (
		<Row width="100%" padding={{ bottom: 'small' }}>
			<ds-text
				as="h2"
				className={clsx(styles.modalTitle, centered && styles.centered)}
				color={type === 'error' ? 'error' : undefined}
				size="medium"
				weight="bold"
			>
				{title}
			</ds-text>
			{showCloseIcon && onClose && (
				<Tooltip label={closeIconTooltip} disabled={!closeIconTooltip}>
					<Button
						icon="Close"
						size="large"
						onClick={onClose}
						type="ghost"
						color="text"
						aria-label={closeIconAriaLabel}
					/>
				</Tooltip>
			)}
		</Row>
	);
}

export type { ModalHeaderProps };
export { ModalHeader };
