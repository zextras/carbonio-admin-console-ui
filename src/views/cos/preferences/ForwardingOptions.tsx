/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Row, Switch, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types';
import ListRow from '../../list/list-row';

interface ForwardingOptionsProps {
	cosPrefAttributes: CosPrefAttributes;
	isReadonlyCOSEntry: boolean;
	changeSwitchOption: (key: keyof CosPrefAttributes) => void;
}

const ForwardingOptions: React.FC<ForwardingOptionsProps> = ({
	cosPrefAttributes,
	isReadonlyCOSEntry,
	changeSwitchOption
}) => {
	const { t } = useTranslation();

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('label.forwarding', 'Forwarding')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraFeatureMailForwardingEnabled === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraFeatureMailForwardingEnabled')}
								label={t(
									'cos.user_can_specify_forwarding_address',
									`User can specify forwarding address`
								)}
								iconColor="primary"
								disabled={isReadonlyCOSEntry}
							/>
						</Container>
						<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraFeatureMailForwardingInFiltersEnabled === 'TRUE'}
								onClick={(): void =>
									changeSwitchOption('zimbraFeatureMailForwardingInFiltersEnabled')
								}
								label={t(
									'cos.user_can_specify_mail_forwarding_filter',
									'User can specify mail forwarding filter'
								)}
								iconColor="primary"
								disabled={isReadonlyCOSEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Row>
	);
};

export default ForwardingOptions;
