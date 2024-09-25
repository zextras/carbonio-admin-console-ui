/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Row, Select, SelectItem, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types';
import ListRow from '../../list/list-row';
import { AttributeValue } from '../constants/types';

interface GeneralOptionsProps {
	cosPrefAttributes: CosPrefAttributes;
	locales: SelectItem[];
	isReadOnlyCosEntry: boolean;
	onCosAttributeChanged: (attribute: keyof CosPrefAttributes, value: AttributeValue) => void;
}

export const GeneralOptions = ({
	cosPrefAttributes,
	locales,
	isReadOnlyCosEntry,
	onCosAttributeChanged
}: GeneralOptionsProps): React.JSX.Element => {
	const { t } = useTranslation();

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('label.general_options', 'General Options')}
			</Text>

			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container>
							<Select
								items={locales}
								background={'gray5'}
								label={t('label.language', 'Language')}
								showCheckbox={false}
								selection={
									locales.find((item) => item.value === cosPrefAttributes?.zimbraPrefLocale) ||
									locales[0]
								}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefLocale', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Row>
	);
};
