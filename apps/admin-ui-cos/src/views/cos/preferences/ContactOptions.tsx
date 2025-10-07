/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row, Switch, Text } from '@zextras/carbonio-design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types/cos';
import ListRow from '../../list/list-row';

interface ContactOptionsProps {
	cosPrefAttributes: CosPrefAttributes;
	isReadOnlyCosEntry: boolean;
	changeSwitchOption: (value: keyof CosPrefAttributes) => void;
}

export const ContactOptions = ({
	cosPrefAttributes,
	isReadOnlyCosEntry,
	changeSwitchOption
}: ContactOptionsProps): React.JSX.Element => {
	const { t } = useTranslation();
	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('label.contact_options', 'Contact Options')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraPrefAutoAddAddressEnabled === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraPrefAutoAddAddressEnabled')}
								label={t('cos.enable_auto_add_contacts', `Enable auto-add contacts`)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraPrefGalAutoCompleteEnabled === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraPrefGalAutoCompleteEnabled')}
								label={t('cos.use_gal_to_auto_fill', 'Use GAL to auto-fill')}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Row>
	);
};
