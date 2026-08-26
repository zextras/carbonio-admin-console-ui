/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Button } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import styles from './steps.module.css';

type StepFooterProps = {
	isFirstStep?: boolean;
	isLastStep?: boolean;
	isSubmitting?: boolean;
	primaryDisabled?: boolean;
	onBack?: () => void;
	onCancel: () => void;
	onPrimary: () => void;
};

export const StepFooter = ({
	isFirstStep = false,
	isLastStep = false,
	isSubmitting = false,
	primaryDisabled = false,
	onBack,
	onCancel,
	onPrimary,
}: StepFooterProps) => {
	const [t] = useTranslation();
	return (
		<div className={styles.footer}>
			<Button label={t('label.cancel', 'Cancel')} type="outlined" color="gray0" onClick={onCancel} />
			<div className={styles.footerActions}>
				{!isFirstStep && onBack && (
					<Button
						label={t('label.back', 'BACK')}
						type="outlined"
						color="gray0"
						onClick={onBack}
					/>
				)}
				<Button
					label={isLastStep ? t('label.create', 'Create') : t('label.next', 'Next')}
					icon={isLastStep ? 'CheckmarkCircle' : 'ArrowForwardOutline'}
					color="primary"
					disabled={primaryDisabled || isSubmitting}
					onClick={onPrimary}
				/>
			</div>
		</div>
	);
};
