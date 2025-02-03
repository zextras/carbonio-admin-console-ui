/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, FC } from 'react';

import { Container, Input, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { AccountType } from '../domain/manange/accounts/account-types/account-types';
import ListRow from '../list/list-row';

type ForwardingProps = {
	cosAdvanced: AccountType;
	changeValue: (e: ChangeEvent<HTMLInputElement>) => void;
	readonlyCOS: boolean;
};

const CosForwarding: FC<ForwardingProps> = ({ cosAdvanced, changeValue, readonlyCOS }) => {
	const [t] = useTranslation();
	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('cos.forwarding', 'Forwarding')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container padding={{ right: 'small' }}>
							<Input
								label={t(
									'cos.limit_user_specified_forwarding_addresses',
									'Limit user-specified forwarding addresses to (char)'
								)}
								value={cosAdvanced.zimbraMailForwardingAddressMaxLength}
								backgroundColor="gray5"
								inputName="zimbraMailForwardingAddressMaxLength"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Input
								label={t(
									'cos.max_user_specific_forwarding_address',
									'Max user-specific forwarding address'
								)}
								value={cosAdvanced.zimbraMailForwardingAddressMaxNumAddrs}
								backgroundColor="gray5"
								inputName="zimbraMailForwardingAddressMaxNumAddrs"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
		</Row>
	);
};

export default CosForwarding;
