/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Input, ListRow, type SelectItem, Tooltip } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { DatasourceNameField } from '../fields/datasource-name-field';
import { GalFolderNameField } from '../fields/gal-folder-name-field';
import { MailServerField } from '../fields/mail-server-field';
import type { CreateDomainFormApi } from '../types';
import { StepFooter } from './step-footer';
import { StepHeader } from './step-header';
import styles from './steps.module.css';

type Step2GalProps = {
	form: CreateDomainFormApi;
	mailServerItems: Array<SelectItem>;
	onCancel: () => void;
	onBack: () => void;
};

export const Step2Gal = ({ form, mailServerItems, onCancel, onBack }: Step2GalProps) => {
	const [t] = useTranslation();

	return (
		<div className={styles.root}>
			<StepHeader />
			<div className={styles.scrollArea}>
				<div className={styles.formRow}>
					<div className={styles.formPanel}>
						<div className={styles.sectionTitle}>
							<ds-text as="strong" size="small" weight="bold" color="gray0">
								{t('label.gal', 'GAL')}
							</ds-text>
							<Tooltip
								placement="top"
								label={t('label.global_address_list', 'Global Address List')}
							>
								<ds-text
									as="span"
									size="small"
									color="gray0"
									style={{ textDecoration: 'underline' }}
								>
									({t('label.what_is_a_gal', "What's a GAL?")})
								</ds-text>
							</Tooltip>
						</div>
						<ListRow>
							<div className={styles.fieldStart}>
								<Input
									label={t('label.gal_mode', 'GAL Mode')}
									value="Internal"
									disabled
									backgroundColor="gray5"
									onChange={(): void => undefined}
								/>
							</div>
						</ListRow>
						<ListRow>
							<GalFolderNameField form={form} />
						</ListRow>
						<ListRow>
							<MailServerField form={form} items={mailServerItems} />
						</ListRow>
						<ListRow>
							<DatasourceNameField form={form} />
						</ListRow>
					</div>
				</div>
			</div>
			<form.Subscribe selector={() => true}>
				{() => (
					<StepFooter
						onCancel={onCancel}
						onBack={onBack}
						onPrimary={() => form.handleSubmit()}
					/>
				)}
			</form.Subscribe>
		</div>
	);
};
