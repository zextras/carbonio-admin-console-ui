/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, InheritedSelect, Row } from '@zextras/ui-components';
import { useIsAdvanced } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { deligateSendSettings } from '../../../utility/utils';
import { useAccountForm, useSetAccountValues } from '../account-form-context';
import { AdvancedDelegatesTable } from './advanced-delegates-table';
import { SimplifiedRightsPanel } from './simplified-rights-panel';
import { buildDelegateRows } from './utils';

/**
 * Delegates section shell: simplified/advanced view toggle, general send
 * settings, and the two view panels. Identities come from the account form
 * context; rows are derived during render (no effects).
 */
export const EditAccountDelegatesSection = () => {
	const [t] = useTranslation();
	const {
		form,
		identitiesList,
		cosDetail,
		accSpecificDetail,
		refetchGrants,
	} = useAccountForm();
	const setAccountValues = useSetAccountValues();
	const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);

	const isAdvanced = useIsAdvanced();
	const [isSimplified, setIsSimplified] = useState<boolean>(true);

	const identityRows = buildDelegateRows(identitiesList);

	const DELEGATE_SEND_SETTINGS = deligateSendSettings(t, accSpecificDetail?.mail);

	const onDeligateSendSettingsChange = (v: string): void => {
		setAccountValues((prev: Record<string, any>) => ({
			...prev,
			zimbraPrefDelegatedSendSaveTarget: v,
		}));
	};

	const setEmptyValue = (keyName: string): void => {
		setAccountValues((prev: Record<string, any>) => ({ ...prev, [keyName]: undefined }));
	};

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			orientation="vertical"
			style={{ overflow: 'auto' }}
		>
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="auto"
				padding={{ top: 'large', bottom: 'large' }}
			>
				<Row width="100%">
					{!isSimplified && (
						<ds-text
							as="span"
							color="primary"
							size="small"
							weight="bold"
							onClick={(): void => setIsSimplified(true)}
							style={{ cursor: 'pointer' }}
						>
							{t('account_details.switch_advanced', 'Switch to Advanced View')}
						</ds-text>
					)}
					{isSimplified && (
						<ds-text
							as="span"
							color="primary"
							size="small"
							weight="bold"
							onClick={(): void => setIsSimplified(false)}
							style={{ cursor: 'pointer' }}
						>
							{t('account_details.switch_simplified', 'Switch to Simplified View')}
						</ds-text>
					)}
				</Row>
			</Container>
			<Row padding={{ left: 'large', right: 'extralarge', bottom: 'large' }} mainAlignment="flex-start" width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<ds-text as="h2" size="small" color="gray0" weight="bold">
						{t(`label.delegate's_general_send_settings`, `Delegate's general Send Settings`)}
					</ds-text>
				</Row>
			</Row>
			<Row
				width="100%"
				padding={{ bottom: 'extralarge', right: 'extralarge', left: 'large' }}
				mainAlignment="space-between"
			>
				<Row width="100%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.delegate_send_settings', 'Delegate Send Settings')}
						items={DELEGATE_SEND_SETTINGS}
						subValue={accountDetail?.zimbraPrefDelegatedSendSaveTarget}
						inheritedValue={cosDetail.zimbraPrefDelegatedSendSaveTarget}
						fromSubValue={accSpecificDetail?.zimbraPrefDelegatedSendSaveTarget}
						background="gray5"
						selectName="zimbraPrefTimeZoneId"
						onChange={onDeligateSendSettingsChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefTimeZoneId')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<ds-divider></ds-divider>
			</Row>

			{isSimplified && (
				<SimplifiedRightsPanel
					identitiesList={identitiesList}
					identityRows={identityRows}
					refetchGrants={refetchGrants}
				/>
			)}

			{!isSimplified && isAdvanced && (
				<AdvancedDelegatesTable
					identitiesList={identitiesList}
					identityRows={identityRows}
					refetchGrants={refetchGrants}
				/>
			)}
		</Container>
	);
};
