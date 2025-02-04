/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, FC } from 'react';

import {
	Container,
	Divider,
	Icon,
	Input,
	Padding,
	Row,
	Switch,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { AccountType } from '../domain/manange/accounts/account-types/account-types';
import ListRow from '../list/list-row';

const CustomIcon = styled(Icon)`
	width: 1.25rem;
	height: 1.25rem;
`;

type COSPasswordProps = {
	cosAdvanced: AccountType;
	readonlyCOS: boolean;
	changeSwitchOption: (key: keyof AccountType) => void;
	changeValue: (e: ChangeEvent<HTMLInputElement>) => void;
};

const COSPassword: FC<COSPasswordProps> = ({
	cosAdvanced,
	readonlyCOS,
	changeSwitchOption,
	changeValue
}) => {
	const [t] = useTranslation();
	const labels = {
		password: t('cos.password', 'Password'),
		externalAuthenticationMessage: t(
			'cos.password_set_to_use_external_authentication_information_msg',
			'These settings do not affect the passwords set by users in domains that are configured to use external authentication'
		),
		preventChange: t(
			'cos.prevent_user_from_changing_password',
			'Prevent user from changing password'
		),
		characters: {
			minimumUppercase: t('cos.minimum_upper_case_characters', 'Minimum upper case characters'),
			minimumLowercase: t('cos.minimum_lower_case_characters', 'Minimum lower case characters'),
			minimumNumeric: t('cos.minimum_numeric_chracters', 'Minimum numeric characters')
		},
		length: {
			minimum: t('cos.minimum_password_length', 'Minimum password length'),
			maximum: t('cos.maximum_password_length', 'Maximum password length')
		},
		age: {
			minimum: t('cos.minimum_password_age', 'Minimum password age (Days)'),
			maximum: t('cos.maximum_password_age', 'Maximum password age (Days)')
		},
		minimumPunctuationSymbol: t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols'),
		minDigitsOrPuncs: t(
			'cos.minimum_numeric_characters_or_punctuation_symbols',
			'Minimum numeric characters or punctuation symbols'
		),
		enforceHistory: t(
			'cos.minimum_number_of_unique_password_history',
			'Minimum number of unique passwords history'
		),
		blockCommonEnabled: t('cos.reject_common_passwords', 'Reject common passwords')
	};

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{labels.password}
			</Text>
			<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
				<Container
					orientation="horizontal"
					width="99%"
					crossAlignment="center"
					mainAlignment="space-between"
					background={'#D3EBF8'}
					padding={{
						top: 'large',
						bottom: 'large'
					}}
					style={{ borderRadius: '2px 2px 0px 0px' }}
				>
					<Row mainAlignment="flex-start">
						<Padding horizontal="small">
							<CustomIcon icon="InfoOutline" color="primary"></CustomIcon>
						</Padding>
					</Row>
					<Row
						mainAlignment="flex-start"
						width="100%"
						padding={{
							top: 'small',
							bottom: 'small'
						}}
					>
						<Text overflow="break-word">{labels.externalAuthenticationMessage}</Text>
					</Row>
				</Container>
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start">
							<Switch
								value={cosAdvanced.zimbraPasswordLocked === 'TRUE'}
								label={labels.preventChange}
								onClick={(): void => changeSwitchOption('zimbraPasswordLocked')}
								iconColor="primary"
								disabled={readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
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
								label={labels.length.minimum}
								value={cosAdvanced.zimbraPasswordMinLength}
								backgroundColor="gray5"
								inputName="zimbraPasswordMinLength"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small', right: 'small' }}>
							<Input
								label={labels.length.maximum}
								value={cosAdvanced.zimbraPasswordMaxLength}
								backgroundColor="gray5"
								inputName="zimbraPasswordMaxLength"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small', right: 'small' }}>
							<Input
								label={labels.characters.minimumUppercase}
								value={cosAdvanced.zimbraPasswordMinUpperCaseChars}
								backgroundColor="gray5"
								inputName="zimbraPasswordMinUpperCaseChars"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Input
								label={labels.characters.minimumLowercase}
								value={cosAdvanced.zimbraPasswordMinLowerCaseChars}
								backgroundColor="gray5"
								inputName="zimbraPasswordMinLowerCaseChars"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
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
								label={labels.minimumPunctuationSymbol}
								value={cosAdvanced.zimbraPasswordMinPunctuationChars}
								backgroundColor="gray5"
								inputName="zimbraPasswordMinPunctuationChars"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small', right: 'small' }}>
							<Input
								label={labels.characters.minimumNumeric}
								value={cosAdvanced.zimbraPasswordMinNumericChars}
								backgroundColor="gray5"
								inputName="zimbraPasswordMinNumericChars"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small', right: 'small' }}>
							<Input
								label={labels.age.minimum}
								value={cosAdvanced.zimbraPasswordMinAge}
								backgroundColor="gray5"
								inputName="zimbraPasswordMinAge"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Input
								label={labels.age.maximum}
								value={cosAdvanced.zimbraPasswordMaxAge}
								backgroundColor="gray5"
								inputName="zimbraPasswordMaxAge"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
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
								label={labels.minDigitsOrPuncs}
								value={cosAdvanced.zimbraPasswordMinDigitsOrPuncs}
								backgroundColor="gray5"
								inputName="zimbraPasswordMinDigitsOrPuncs"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Input
								label={labels.enforceHistory}
								value={cosAdvanced.zimbraPasswordEnforceHistory}
								backgroundColor="gray5"
								inputName="zimbraPasswordEnforceHistory"
								onChange={changeValue}
								disabled={readonlyCOS}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ bottom: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start" padding={{ top: 'large' }}>
							<Switch
								value={cosAdvanced.zimbraPasswordBlockCommonEnabled === 'TRUE'}
								label={labels.blockCommonEnabled}
								onClick={(): void => changeSwitchOption('zimbraPasswordBlockCommonEnabled')}
								iconColor="primary"
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

export default COSPassword;
