/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { SimplifiedRightsActions } from './simplified-rights-actions';
import { SimplifiedRightsList } from './simplified-rights-list';
import { buildDelegateRows } from './utils';

type SimplifiedRightsPanelProps = {
	identitiesList: Array<any>;
	identityRows: ReturnType<typeof buildDelegateRows>;
	refetchGrants: () => void;
};

/**
 * Simplified delegates view: chip search over the directory, right checkboxes
 * and the three rights tables (read/write, read only, send) with revoke.
 */
export const SimplifiedRightsPanel = ({
	identitiesList,
	identityRows,
	refetchGrants,
}: SimplifiedRightsPanelProps) => {
	const [t] = useTranslation();

	return (
		<Container
			mainAlignment="flex-start"
			height="auto"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row padding={{ right: 'extralarge', bottom: 'large', top: 'large' }} mainAlignment="flex-start" width="100%">
				<ds-text as="h2" size="small" color="gray0" weight="bold">
					{t(`label.delegate's_rights`, `Delegate's Rights`)}
				</ds-text>
			</Row>
			<SimplifiedRightsActions refetchGrants={refetchGrants} />
			<Row width="100%" padding={{ top: 'medium' }}>
				<ds-divider></ds-divider>
			</Row>
			<SimplifiedRightsList
				identitiesList={identitiesList}
				identityRows={identityRows}
				refetchGrants={refetchGrants}
			/>
		</Container>
	);
};
