/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ListRow } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { DescriptionField } from '../fields/description-field';
import { DomainNameField } from '../fields/domain-name-field';
import { MaxAccountsField } from '../fields/max-accounts-field';
import { NotesField } from '../fields/notes-field';
import { QuotaField } from '../fields/quota-field';
import type { CreateDomainFormApi } from '../types';
import { StepFooter } from './step-footer';
import { StepHeader } from './step-header';
import styles from './steps.module.css';

type Step1GeneralInformationProps = {
	form: CreateDomainFormApi;
	isSubmitting: boolean;
	onCancel: () => void;
	onBack: () => void;
};

export const Step1GeneralInformation = ({
	form,
	isSubmitting,
	onCancel,
	onBack,
}: Step1GeneralInformationProps) => {
	const [t] = useTranslation();

	return (
		<div className={styles.root}>
			<StepHeader />
			<div className={styles.scrollArea}>
				<div className={styles.formRow}>
					<div className={styles.formPanel}>
						<div className={styles.sectionTitle}>
							<ds-text as="strong" size="small" weight="bold" color="gray0">
								{t('label.general_information', 'General Information')}
							</ds-text>
						</div>
						<ListRow>
							<DomainNameField form={form} />
						</ListRow>
						<ListRow>
							<MaxAccountsField form={form} />
						</ListRow>
						<ListRow>
							<QuotaField form={form} />
						</ListRow>
						<ListRow>
							<DescriptionField form={form} />
						</ListRow>
						<ListRow>
							<NotesField form={form} />
						</ListRow>
					</div>
				</div>
			</div>
			<form.Subscribe
				selector={(state) =>
					!(
						(
							['domainName', 'zimbraDomainMaxAccounts', 'domainQuotaGB'] as const
						).some((name) => (state.fieldMeta[name]?.errors?.length ?? 0) > 0)
					)
				}
			>
				{(canProceed) => (
					<StepFooter
						isFirstStep
						isSubmitting={isSubmitting}
						onCancel={onCancel}
						onBack={onBack}
						onPrimary={() => form.handleSubmit()}
						primaryDisabled={!canProceed}
					/>
				)}
			</form.Subscribe>
		</div>
	);
};
