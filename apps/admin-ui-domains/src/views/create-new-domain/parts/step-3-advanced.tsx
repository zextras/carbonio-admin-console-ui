/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow,type SelectItem } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { DefaultCosField } from '../fields/default-cos-field';
import { DelegatedAdminField } from '../fields/delegated-admin-field';
import { NotificationFromField } from '../fields/notification-from-field';
import { NotificationRecipientsField } from '../fields/notification-recipients-field';
import type { CreateDomainFormApi } from '../types';
import { StepFooter } from './step-footer';
import { StepHeader } from './step-header';
import styles from './steps.module.css';

type Step3AdvancedProps = {
	form: CreateDomainFormApi;
	cosItems: Array<SelectItem>;
	onCancel: () => void;
	onBack: () => void;
};

export const Step3Advanced = ({ form, cosItems, onCancel, onBack }: Step3AdvancedProps) => {
	const [t] = useTranslation();

	return (
		<div className={styles.root}>
			<StepHeader />
			<div className={styles.scrollArea}>
				<div className={styles.formRow}>
					<div className={styles.formPanel}>
						<div className={styles.sectionTitle}>
							<ds-text as="strong" size="small" weight="bold" color="gray0">
								{t('label.class_of_service_cos', 'Class Of Service (COS)')}
							</ds-text>
						</div>
						<ListRow>
							<DefaultCosField form={form} items={cosItems} />
						</ListRow>
						<div className={styles.sectionTitle}>
							<ds-text as="strong" size="small" weight="bold" color="gray0">
								{t('label.delegated_administration_title', 'Delegated Administration')}
							</ds-text>
						</div>
						<ListRow>
							<DelegatedAdminField form={form} />
						</ListRow>
						<div className={styles.sectionTitle}>
							<ds-text as="strong" size="small" weight="bold" color="gray0">
								{t('label.domain_system_notifications', 'Domain System Notifications')}
							</ds-text>
						</div>
						<ListRow>
							<NotificationFromField form={form} />
						</ListRow>
						<ListRow>
							<NotificationRecipientsField form={form} />
						</ListRow>
					</div>
				</div>
			</div>
			<form.Subscribe
				selector={(state) =>
					!(
						(
							['carbonioNotificationFrom', 'carbonioNotificationRecipients'] as const
						).some((name) => (state.fieldMeta[name]?.errors?.length ?? 0) > 0)
					)
				}
			>
				{(canCreate) => (
					<StepFooter
						isLastStep
						onCancel={onCancel}
						onBack={onBack}
						onPrimary={() => form.handleSubmit()}
						primaryDisabled={!canCreate}
					/>
				)}
			</form.Subscribe>
		</div>
	);
};
