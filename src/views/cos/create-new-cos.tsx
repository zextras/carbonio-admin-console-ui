/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useContext, useState } from 'react';
import {
	Container,
	Row,
	Button,
	Text,
	SnackbarManagerContext,
	Input,
	Padding,
	Divider
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useHistory } from 'react-router-dom';
import { COS_ROUTE_ID, MANAGE } from '../../constants';
import { createCos } from '../../services/create-cos';
import ListRow from '../list/list-row';

const CreateCos: FC = () => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const history = useHistory();
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [cosName, setCosName] = useState<string>('');

	const showSuccessSnackBar = (): void => {
		createSnackbar({
			key: 'success',
			type: 'success',
			label: t('label.create_cos_success_msg', {
				cosName,
				defaultValue: '{{cosName}} has been created successfully'
			}),
			autoHideTimeout: 3000,
			hideButton: true,
			replace: true
		});
	};

	const routeToCos = (resp: any): void => {
		const cosId = resp?.Body?.CreateCosResponse?.cos[0]?.id;
		if (cosId) {
			replaceHistory(`/${cosId}/general_information`);
		} else {
			replaceHistory(`/`);
		}
	};

	const onCreate = (): void => {
		const attributes: any[] = [];
		attributes.push({
			n: 'zimbraNotes',
			_content: zimbraNotes
		});
		attributes.push({
			n: 'cn',
			_content: cosName
		});
		createCos(cosName, attributes)
			.then((data) => {
				const cos: any = data?.cos[0];
				if (cos) {
					showSuccessSnackBar();
					routeToCos(data);
				}
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error.message
						? error.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};

	const onCancel = (): void => {
		history.push(`/${MANAGE}/${COS_ROUTE_ID}`);
	};

	return (
		<Container padding={{ all: 'large' }} mainAlignment="flex-start" background="gray6">
			<Container
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				background="gray6"
				height="58px"
			>
				<Row width="100%" mainAlignment="flex-start">
					<Padding all="large">
						<Text size="medium" weight="bold" color="gray0">
							{t('label.new_cos', 'New COS')}
						</Text>
					</Padding>
					<Divider />
				</Row>
			</Container>
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 150px)"
				padding={{ top: 'large' }}
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container height="fit" crossAlignment="flex-start" background="gray6">
						<Row
							takeAvwidth="fill"
							mainAlignment="flex-start"
							width="100%"
							background="gray6"
							padding={{ left: 'large', top: 'large' }}
						>
							<Text size="small" weight="bold" color="gray0">
								{t('label.general_information', 'General Information')}
							</Text>
						</Row>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.cos_name', 'Cos Name')}
									background="gray5"
									value={cosName}
									onChange={(e: any): any => {
										setCosName(e.target.value);
									}}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container padding={{ all: 'small' }}>
								<Input
									label={t('label.notes', 'Notes')}
									background="gray5"
									value={zimbraNotes}
									onChange={(e: any): any => {
										setZimbraNotes(e.target.value);
									}}
								/>
							</Container>
						</ListRow>
					</Container>
				</Row>
			</Container>
			<Container
				orientation="horizontal"
				crossAlignment="flex-start"
				mainAlignment="flex-end"
				background="gray6"
				height="58px"
				padding={{ top: 'small', right: 'large' }}
			>
				<Padding right="medium">
					<Button
						label={t('label.cancel', 'Cancel')}
						icon="Close"
						color="secondary"
						onClick={onCancel}
					/>
				</Padding>

				<Button
					label={t('label.create', 'Create')}
					icon="CheckmarkCircle"
					color="primary"
					disabled={cosName === ''}
					onClick={onCreate}
				/>
			</Container>
		</Container>
	);
};
export default CreateCos;
