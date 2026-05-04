/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Input, ListRow, Row } from '@zextras/ui-components';
import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountType } from '../../../../types/account';

type ForwardingProps = {
	cosAdvanced: AccountType;
	changeValue: (e: ChangeEvent<HTMLInputElement>) => void;
	readonlyCOS: boolean;
};

const COSForwarding: FC<ForwardingProps> = ({ cosAdvanced, changeValue, readonlyCOS }) => {
	const [t] = useTranslation();
	const labels = {
		cosForwarding: t('cos.forwarding', 'Forwarding'),
		address: {
			maxLength: t(
				'cos.limit_user_specified_forwarding_addresses',
				'Limit user-specified forwarding addresses to (char)'
			),
			maxNumAddress: t(
				'cos.max_user_specific_forwarding_address',
				'Max user-specific forwarding address'
			)
		}
	};

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<ds-text as="strong" weight="bold">
				{labels.cosForwarding}
			</ds-text>
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
								label={labels.address.maxLength}
								value={cosAdvanced.zimbraMailForwardingAddressMaxLength}
								backgroundColor="gray5"
								inputName="zimbraMailForwardingAddressMaxLength"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Input
								label={labels.address.maxNumAddress}
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

export default COSForwarding;
