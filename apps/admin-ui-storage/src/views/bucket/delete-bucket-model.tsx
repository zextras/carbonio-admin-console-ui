/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button } from '@zextras/ui-components';
import { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './delete-bucket-model.module.css';

const DeleteBucketModel: FC<{
	open: boolean;
	closeHandler: () => void;
	saveHandler: () => void;
}> = ({ open, closeHandler, saveHandler }) => {
	const [t] = useTranslation();
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
					{t(
						'storages.s3Connectors.deleteConnectorWarning',
						'You are trying to delete a never used S3 connector.',
					)}
				</ds-text>
				<ds-text as="p" size="medium" color="gray0" overflow="break-word">
					{t('storages.s3Connectors.deleteConnectorConfirm', 'Are you sure you want to proceed?')}
				</ds-text>
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
					label={t('storages.s3Connectors.deleteConnectorConfirmAction', 'YES, DELETE')}
					onClick={onDelete}
				/>
			</div>
		</div>
	);
};

export default DeleteBucketModel;
