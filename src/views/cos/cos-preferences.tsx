/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useMemo, useState } from 'react';
import {
	Container,
	Divider,
	Row,
	Text,
	Input,
	Icon,
	Select,
	Switch,
	Padding,
	SnackbarManagerContext,
	Button
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import ListRow from '../list/list-row';
import { charactorSet, conversationGroupBy } from '../utility/utils';

const CosPreferences: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const GROUP_BY = useMemo(() => conversationGroupBy(t), [t]);
	const CHARACTOR_SET = useMemo(() => charactorSet(), []);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('cos.preferences', 'Preferences')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && <Button label={t('label.cancel', 'Cancel')} color="secondary" />}
							</Padding>
							{isDirty && <Button label={t('label.save', 'Save')} color="primary" />}
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				mainAlignment="flex-start"
				width="100%"
				orientation="vertical"
				style={{ overflow: 'auto' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('label.mailing_options', 'Mail Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<Switch value label={t('label.view_mail_as_html', 'View mail as HTML')} />
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										background="gray5"
										label={t('label.group_by', 'Group by')}
										showCheckbox={false}
										padding={{ right: 'medium' }}
										items={GROUP_BY}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Select
										background="gray5"
										label={t('label.default_charset', 'Default Charset')}
										showCheckbox={false}
										padding={{ right: 'medium' }}
										items={CHARACTOR_SET}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
				</Row>
			</Container>
		</Container>
	);
};

export default CosPreferences;
