/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import clsx from 'clsx';
import React, { useMemo } from 'react';

import { AnyColor } from '../../../types/utils';
import { Button } from '../../basic/button/Button';
import { Tooltip } from '../../display/Tooltip';
import { Container } from '../../layout/Container';
import { Padding } from '../../layout/Padding';
import styles from './ModalFooter.module.css';

type ModalFooterProps = {
	/** Modal type */
	type?: 'default' | 'error';
	/** Centered Modal */
	centered?: boolean;
	/** Callback for main action */
	onConfirm?: (event: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
	/** Label for the Main action Button */
	confirmLabel?: string;
	/** Disabled status for main action Button */
	confirmDisabled?: boolean;
	/** Confirm tooltip label */
	confirmTooltip?: string;
	/** BackgroundColor for the Main action Button */
	confirmColor?: AnyColor;
	/** Callback for secondary action */
	onSecondaryAction?: (event: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
	/** Label for the Secondary action Button */
	secondaryActionLabel?: string;
	/** Disabled status for secondary action Button */
	secondaryActionDisabled?: boolean;
	/** Secondary action tooltip label */
	secondaryActionTooltip?: string;
	/** Callback to close the Modal */
	onClose?: (event: React.MouseEvent | KeyboardEvent) => void;
	/** Label for the Modal close Button */
	dismissLabel?: string;
	/** Optional element to show in the footer of the Modal */
	optionalFooter?: React.ReactElement;
	/** Prop to override the default footer buttons */
	customFooter?: React.ReactElement;
	/** Label for dismiss button in the Error Modal */
	errorActionLabel?: string;
	/** Action called on error dismiss button */
	onErrorAction?: () => void;
};

type ModalFooterContentProps = Omit<ModalFooterProps, 'customFooter'>;

function ModalFooterContent({
	type,
	centered,
	onConfirm,
	confirmLabel,
	confirmDisabled,
	confirmTooltip,
	confirmColor,
	onSecondaryAction,
	secondaryActionLabel,
	secondaryActionDisabled,
	onClose,
	dismissLabel,
	errorActionLabel,
	optionalFooter,
	onErrorAction,
	secondaryActionTooltip,
}: ModalFooterContentProps): React.JSX.Element {
	const secondaryButton = useMemo(() => {
		let button;
		if (type === 'error' && onErrorAction) {
			button = (
				<Button
					className={styles.dismissButton}
					onClick={onErrorAction}
					color="secondary"
					label={errorActionLabel}
				/>
			);
		} else {
			button =
				(onSecondaryAction && secondaryActionLabel && (
					<Tooltip disabled={!secondaryActionTooltip} label={secondaryActionTooltip}>
						<Button
							className={styles.dismissButton}
							color="primary"
							type="outlined"
							onClick={onSecondaryAction}
							label={secondaryActionLabel}
							disabled={secondaryActionDisabled}
						/>
					</Tooltip>
				)) ||
				(dismissLabel && onClose && (
					<Button
						className={styles.dismissButton}
						color="secondary"
						onClick={onClose}
						label={dismissLabel}
					/>
				)) ||
				undefined;
		}
		return button;
	}, [
		type,
		onErrorAction,
		errorActionLabel,
		onSecondaryAction,
		secondaryActionLabel,
		secondaryActionDisabled,
		secondaryActionTooltip,
		dismissLabel,
		onClose,
	]);

	return (
		<>
			{optionalFooter && centered && (
				<Container
					className={styles.optionalFooterContainer}
					padding={{ bottom: 'large' }}
					orientation="horizontal"
					mainAlignment="flex-start"
				>
					{optionalFooter}
				</Container>
			)}
			<Container
				className={clsx(styles.buttonContainer, optionalFooter && !centered && styles.pushLeftFirstChild)}
				orientation="horizontal"
				mainAlignment={centered ? 'center' : 'flex-end'}
			>
				{!centered && optionalFooter}
				{!centered && <Padding right="large" />}
				{secondaryButton}
				{(onConfirm || onClose) && (
					<Tooltip label={confirmTooltip} disabled={!confirmTooltip}>
						<Button
							className={styles.confirmButton}
							color={confirmColor}
							onClick={(onConfirm || onClose) as NonNullable<typeof onClose | typeof onConfirm>}
							label={confirmLabel}
							disabled={confirmDisabled}
						/>
					</Tooltip>
				)}
			</Container>
		</>
	);
}

const ModalFooter = ({
	customFooter,
	...modalFooterContentProps
}: ModalFooterProps): React.JSX.Element => (
	<Container
		orientation={modalFooterContentProps.centered ? 'vertical' : 'horizontal'}
		mainAlignment="flex-end"
		padding={{ top: 'large' }}
	>
		{customFooter ?? <ModalFooterContent {...modalFooterContentProps} />}
	</Container>
);

export type { ModalFooterContentProps, ModalFooterProps };
export { ModalFooter, ModalFooterContent };
