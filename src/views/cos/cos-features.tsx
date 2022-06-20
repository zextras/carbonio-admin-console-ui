/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import { Container, Row, Text, Divider, Switch, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const CosFeatures: FC = () => {
	const [t] = useTranslation();
	const [checked1, setChecked1] = useState(true);
	const [checked2, setChecked2] = useState(true);
	const [checked3, setChecked3] = useState(true);
	const [checked4, setChecked4] = useState(true);

	return (
		<>
			<Container mainAlignment="flex-start" crossAlignment="flex-start" height="100%">
				<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
					<Text size="extralarge" weight="bold">
						{t('cos.features', 'Features')}
					</Text>
				</Row>
				<Divider />
				<Container
					mainAlignment="flex-start"
					width="100%"
					orientation="vertical"
					style={{ overflow: 'auto' }}
				>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ all: 'large' }}
						width="100%"
					>
						<Text size="extralarge" weight="bold">
							{t('cos.main_features', 'Main Features')}
						</Text>
						<Row
							mainAlignment="flex-start"
							orientation="horizontal"
							crossAlignment="flex-start"
							padding={{ top: 'large', bottom: 'large', left: 'large' }}
						>
							<Padding right="extralarge">
								<Switch value={checked1} onClick={() => setChecked1(!checked1)} label="Mail" />
							</Padding>
							<Padding right="extralarge">
								<Switch value={checked2} onClick={() => setChecked2(!checked2)} label="Calendar" />
							</Padding>
							<Padding right="extralarge">
								<Switch value={checked3} onClick={() => setChecked3(!checked3)} label="Contacts" />
							</Padding>
							<Padding right="extralarge">
								<Switch value={checked4} onClick={() => setChecked4(!checked4)} label="Calendar" />
							</Padding>
						</Row>
						<Divider />
					</Container>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.general_features', 'General Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch value={checked1} onClick={() => setChecked1(!checked1)} label="Tagging" />
							</Row>
							<Padding right="extralarge" />
							<Row width="35%" mainAlignment="flex-start">
								<Switch
									value={checked2}
									onClick={() => setChecked2(!checked2)}
									label="HTML compose"
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="35%" mainAlignment="flex-start">
								<Switch
									value={checked3}
									onClick={() => setChecked3(!checked3)}
									label="Offline support for Advanced (Ajax) client"
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.mail_features', 'Mail Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label="Message Priority"
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="35%" mainAlignment="flex-start">
								<Switch
									value={checked2}
									onClick={() => setChecked2(!checked2)}
									label="External POP Access"
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="35%" mainAlignment="flex-start">
								<Switch
									value={checked3}
									onClick={() => setChecked3(!checked3)}
									label="Out of the Office Reply"
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.contact_features', 'Contact Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label="Distribution List Folder"
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.calender_features', 'Calendar Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label="Group Calendar"
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="35%" mainAlignment="flex-start">
								<Switch
									value={checked2}
									onClick={() => setChecked2(!checked2)}
									label="SMS Reminders"
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.search_features', 'Search Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label="Advanced Search"
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={checked2}
									onClick={() => setChecked2(!checked2)}
									label="Saved Searches"
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={checked3}
									onClick={() => setChecked3(!checked3)}
									label="Initial Search Preference"
								/>
							</Row>
							<Padding right="extralarge" />
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={checked3}
									onClick={() => setChecked3(!checked3)}
									label="Search for People"
								/>
							</Row>
						</Row>
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} width="100%">
						<Text size="extralarge" weight="bold">
							{t('cos.s_mime_features', 'S/MIME Features')}
						</Text>
						<Row
							width="100%"
							mainAlignment="flex-start"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
						>
							<Row width="20%" mainAlignment="flex-start">
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label="Enable S/MIME"
								/>
							</Row>
						</Row>
					</Row>
				</Container>
			</Container>
		</>
	);
};

export default CosFeatures;
