/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, Row, Select, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types';
import ListRow from '../../list/list-row';

interface GeneralOptionsProps {
	cosPrefAttributes: CosPrefAttributes;
	localeZone: any[];
	readonlyCOS: boolean;
	onPrefLocaleChange: (selection: any) => void;
}

const GeneralOptions: React.FC<GeneralOptionsProps> = ({
	cosPrefAttributes,
	localeZone,
	readonlyCOS,
	onPrefLocaleChange
}) => {
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
								items={localeZone}
								background={'gray5'}
								label={t('label.language', 'Language')}
								showCheckbox={false}
								selection={
									cosPrefAttributes?.zimbraPrefLocale === ''
										? localeZone[-1]
										: localeZone.find((item) => item.value === cosPrefAttributes?.zimbraPrefLocale)
								}
								onChange={onPrefLocaleChange}
								disabled={readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Divider />
		</Row>
	);
};

export default GeneralOptions;
