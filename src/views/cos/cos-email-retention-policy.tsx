/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ChangeEvent, FC } from 'react';

import {
	Container,
	Divider,
	Input,
	Row,
	Select,
	SingleSelectionOnChange,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ListRow from '../list/list-row';

type EmailRetentionPolicyProps = {
	zimbraMailMessageLifetimeNum: any;
	zimbraMailMessageLifetimeType: any;
	zimbraMailTrashLifetimeNum: any;
	zimbraMailTrashLifetimeType: any;
	zimbraMailSpamLifetimeNum: any;
	zimbraMailSpamLifetimeType: any;
	readonlyCOS: boolean;
	timeItems: any[];
	onZimbraMailMessageLifetimeNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraMailMessageLifetimeTypeChange: SingleSelectionOnChange;
	onZimbraMailTrashLifetimeNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraMailTrashLifetimeTypeChange: SingleSelectionOnChange;
	onZimbraMailSpamLifetimeNumChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onZimbraMailSpamLifetimeTypeChange: SingleSelectionOnChange;
};

const COSEmailRetentionPolicy: FC<EmailRetentionPolicyProps> = ({
	zimbraMailMessageLifetimeNum,
	zimbraMailMessageLifetimeType,
	zimbraMailTrashLifetimeNum,
	zimbraMailTrashLifetimeType,
	zimbraMailSpamLifetimeNum,
	zimbraMailSpamLifetimeType,
	readonlyCOS,
	timeItems,
	onZimbraMailMessageLifetimeNumChange,
	onZimbraMailMessageLifetimeTypeChange,
	onZimbraMailTrashLifetimeNumChange,
	onZimbraMailTrashLifetimeTypeChange,
	onZimbraMailSpamLifetimeNumChange,
	onZimbraMailSpamLifetimeTypeChange
}) => {
	const [t] = useTranslation();
	const labels = {
		timeRange: t('cos.time_range', 'Time Range')
	};
	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ all: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('cos.email_retention_policy', 'Email Retention Policy')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background="gray6"
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('cos.email_message_lifetime', 'E-mail message lifetime')}
								value={zimbraMailMessageLifetimeNum}
								backgroundColor="gray5"
								inputName="zimbraMailMessageLifetime"
								onChange={onZimbraMailMessageLifetimeNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" padding={{ left: 'small', right: 'small' }}>
							<Select
								data-testid="zimbraMailTrashLifetimeSelect"
								items={timeItems}
								background="gray5"
								label={labels.timeRange}
								selection={
									zimbraMailMessageLifetimeType === ''
										? timeItems[-1]
										: timeItems.find(
												// eslint-disable-next-line max-len
												(item: any) => item.value === zimbraMailMessageLifetimeType
										  )
								}
								showCheckbox={false}
								onChange={onZimbraMailMessageLifetimeTypeChange}
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
					background="gray6"
					padding={{ top: 'large' }}
				>
					<ListRow>
						<Container width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('cos.trashed_message_lifetime', 'Trashed message lifetime')}
								value={zimbraMailTrashLifetimeNum}
								backgroundColor="gray5"
								inputName="zimbraMailTrashLifetime"
								onChange={onZimbraMailTrashLifetimeNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" padding={{ left: 'small', right: 'small' }}>
							<Select
								items={timeItems}
								background="gray5"
								label={labels.timeRange}
								selection={
									zimbraMailTrashLifetimeType === ''
										? timeItems[-1]
										: timeItems.find(
												// eslint-disable-next-line max-len
												(item: any) => item.value === zimbraMailTrashLifetimeType
										  )
								}
								showCheckbox={false}
								onChange={onZimbraMailTrashLifetimeTypeChange}
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
					background="gray6"
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container width="100%" padding={{ right: 'small' }}>
							<Input
								label={t('cos.spam_message_lifetime', 'Spam message lifetime')}
								value={zimbraMailSpamLifetimeNum}
								backgroundColor="gray5"
								inputName="zimbraMailSpamLifetime"
								onChange={onZimbraMailSpamLifetimeNumChange}
								disabled={readonlyCOS}
							/>
						</Container>
						<Container width="17%" padding={{ left: 'small', right: 'small' }}>
							<Select
								items={timeItems}
								background="gray5"
								label={labels.timeRange}
								selection={
									zimbraMailSpamLifetimeType === ''
										? timeItems[-1]
										: timeItems.find(
												// eslint-disable-next-line max-len
												(item: any) => item.value === zimbraMailSpamLifetimeType
										  )
								}
								showCheckbox={false}
								onChange={onZimbraMailSpamLifetimeTypeChange}
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

export default COSEmailRetentionPolicy;
