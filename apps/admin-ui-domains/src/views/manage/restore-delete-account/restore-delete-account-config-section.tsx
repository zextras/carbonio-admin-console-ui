/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, Padding, Row } from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useDomainSearch } from '../../../services/use-domain-search';
import { RestoreDeleteAccountContext } from './restore-delete-account-context';

export const RestoreDeleteAccountConfigSection = () => {
	const { t } = useTranslation();
	const { restoreAccountDetail, setRestoreAccountDetail } = useContext(RestoreDeleteAccountContext);
	const [searchDomainName, setSearchDomainName] = useState(restoreAccountDetail?.copyDomain || '');
	const debouncedSearchDomainName = useDebouncedValue(searchDomainName, 700);

	const {
		data: domainSearchData,
		error: domainSearchError,
		isPending
	} = useDomainSearch({
		searchQuery: debouncedSearchDomainName,
		limit: 50,
		offset: 0,
		enabled: debouncedSearchDomainName !== ''
	});

	const noDomainFoundError =
		!isPending && debouncedSearchDomainName !== '' && (domainSearchData?.searchTotal ?? 0) === 0
			? t('label.not_found_check_the_text_and_try_again', 'Not found - check the text and try again')
			: null;
	useQueryErrorSnackbar(domainSearchError ?? noDomainFoundError);

	const handleChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
		setSearchDomainName(ev.target.value);
		setRestoreAccountDetail((prev: Record<string, unknown>) => ({
			...prev,
			copyDomain: ev.target.value
		}));
	};

	return (
		<Container background="gray5" padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
			<Container background="gray5" padding={{ top: 'large' }} width="100%">
				<Row>
					<Padding right="large">
						<ds-text as="h3" size="small" weight="bold">
							{t('label.domain', 'Domain')}
						</ds-text>
					</Padding>
					<Padding left="large">
						<Input
							isRequired
							label={t('label.search', 'Search')}
							value={searchDomainName}
							onChange={handleChange}
						/>
					</Padding>
				</Row>
			</Container>
		</Container>
	);
};
