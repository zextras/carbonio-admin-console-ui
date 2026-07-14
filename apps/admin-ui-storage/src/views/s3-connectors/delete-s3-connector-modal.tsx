/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './delete-s3-connector-modal.module.css';

export function DeleteS3ConnectorModal({
	open,
	closeHandler,
	saveHandler,
	connectorName = '',
}: Readonly<{
	open: boolean;
	closeHandler: () => void;
	saveHandler: () => void;
	connectorName?: string;
}>) {
	const [t] = useTranslation();
	const [isConfirmed, setIsConfirmed] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open) {
			popoverRef.current?.showPopover();
		} else {
			popoverRef.current?.hidePopover();
		}
	}, [open]);

	const onClose = (): void => {
		popoverRef.current?.hidePopover();
		setIsConfirmed(false);
		closeHandler();
	};

	const onDelete = (): void => {
		popoverRef.current?.hidePopover();
		saveHandler();
	};

	return (
		<div popover="manual" ref={popoverRef} className={styles.popover}>
			<div className={styles.header}>
				<ds-text as="h2" weight="bold" size="medium" className={styles.title}>
					{t('storages.s3Connectors.deleteConnectors', 'Delete connectors')}
				</ds-text>
				<button
					type="button"
					className={styles.closeButton}
					onClick={onClose}
					aria-label={t('label.close', 'Close')}
				>
					<ds-icon icon="CloseOutline" size="24px" />
				</button>
			</div>
			<div className={styles.topDivider} />
			<div className={styles.description}>
				<ds-text as="p" size="medium" color="gray0" overflow="break-word">
					{connectorName
						? t(
								'storages.s3Connectors.deleteConnectorWarningWithNameConfirm',
								`You are trying to delete ${connectorName} that is a never used S3 connector.\nAre you sure you want to proceed?`,
							)
						: t(
								'storages.s3Connectors.deleteConnectorWarningConfirm',
								`You are trying to delete a never used S3 connector.\nAre you sure you want to proceed?`,
							)}
				</ds-text>
			</div>
			<div className={styles.checkboxContainer}>
				<input
					type="checkbox"
					id="confirm-delete"
					checked={isConfirmed}
					onChange={(e) => setIsConfirmed(e.target.checked)}
					aria-label={t(
						'storages.s3Connectors.confirmDelete',
						'I am sure I want to delete this connector',
					)}
				/>
				<label htmlFor="confirm-delete">
					<ds-text as="span" size="medium">
						{t('storages.s3Connectors.confirmDelete', 'I am sure I want to delete this connector')}
					</ds-text>
				</label>
			</div>
			<div className={styles.divider} />
			<div className={styles.actions}>
				<Button
					type="outlined"
					color="gray0"
					label={t('storages.s3Connectors.deleteConnectorCancel', 'NO, CANCEL')}
					onClick={onClose}
				/>
				<Button
					type="default"
					color="error"
					label={t('storages.s3Connectors.proceedWithDeletion', 'PROCEED WITH DELETION')}
					onClick={onDelete}
					disabled={!isConfirmed}
				/>
			</div>
		</div>
	);
}


