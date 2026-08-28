/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Select } from '@zextras/ui-components';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

type GrantTypeSelectProps = {
	items: Array<any>;
	selection: any;
	onChange: (v: any) => void;
};

export const GrantTypeSelect: FC<GrantTypeSelectProps> = ({ items, selection, onChange }) => {
	const [t] = useTranslation();

	return (
		<Container>
			<Select
				items={items}
				background="gray5"
				label={t('domain.distributionList.sendTo.acceptMessageFrom', 'Accept message from')}
				showCheckbox={false}
				onChange={onChange}
				selection={selection}
			/>
		</Container>
	);
};
