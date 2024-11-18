/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Input,
	Padding,
	Row,
	Select,
	SelectItem,
	Switch,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CosPrefAttributes } from '../../../../types';
import ListRow from '../../list/list-row';
import { bytesToHumanReadable, charactorSet, conversationGroupBy } from '../../utility/utils';
import { AttributeValue } from '../constants/types';

interface MailOptionsProps {
	changeSwitchOption: (key: keyof CosPrefAttributes) => void;
	cosPrefAttributes: CosPrefAttributes;
	isReadOnlyCosEntry: boolean;
	onCosAttributeChanged: (attribute: keyof CosPrefAttributes, value: AttributeValue) => void;
}

export const MailOptions = ({
	changeSwitchOption,
	cosPrefAttributes,
	isReadOnlyCosEntry,
	onCosAttributeChanged
}: MailOptionsProps): React.JSX.Element => {
	const { t } = useTranslation();
	const GROUP_BY: SelectItem[] = useMemo(() => conversationGroupBy(t), [t]);
	const CHARACTOR_SET: SelectItem[] = useMemo(() => charactorSet(), []);

	const bytesToHumanFriendlyFileUploadMaxSizePerFile = useCallback(
		(bytes: string | number): string => {
			const parsedBytes = Number(bytes);
			return parsedBytes === 0
				? t('cos.unlimited', 'Unlimited')
				: `~${bytesToHumanReadable(parsedBytes)}`;
		},
		[t]
	);

	const [
		humanFriendlyFileUploadMaxSizePerFileLabel,
		setHumanFriendlyFileUploadMaxSizePerFileLabel
	] = useState(
		bytesToHumanFriendlyFileUploadMaxSizePerFile(cosPrefAttributes.zimbraFileUploadMaxSizePerFile)
	);

	useEffect(() => {
		setHumanFriendlyFileUploadMaxSizePerFileLabel(
			bytesToHumanFriendlyFileUploadMaxSizePerFile(cosPrefAttributes.zimbraFileUploadMaxSizePerFile)
		);
	}, [
		bytesToHumanFriendlyFileUploadMaxSizePerFile,
		cosPrefAttributes.zimbraFileUploadMaxSizePerFile
	]);

	const updateHumanFriendlyFileUploadMaxSizePerFileLabel = (value: number): void => {
		const humanFriendlyLabel = bytesToHumanFriendlyFileUploadMaxSizePerFile(value <= 0 ? 0 : value);
		setHumanFriendlyFileUploadMaxSizePerFileLabel(humanFriendlyLabel);

		const newValue = value <= 0 ? '0' : value.toString();
		if (cosPrefAttributes.zimbraFileUploadMaxSizePerFile !== newValue) {
			onCosAttributeChanged('zimbraFileUploadMaxSizePerFile', newValue);
		}
	};

	return (
		<Row
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
			width="100%"
		>
			<Text size="extralarge" weight="bold">
				{t('label.mailing_options', 'Mail Options')}
			</Text>
			<Row mainAlignment="flex-start" width="100%">
				<Container
					height="fit"
					crossAlignment="flex-start"
					background={'gray6'}
					padding={{ top: 'large' }}
				>
					<Switch
						value={cosPrefAttributes?.zimbraPrefMessageViewHtmlPreferred === 'TRUE'}
						onClick={(): void => changeSwitchOption('zimbraPrefMessageViewHtmlPreferred')}
						label={t('cos.view_mail_as_html', 'View mail as HTML (when possible)')}
						iconColor="primary"
						disabled={isReadOnlyCosEntry}
					/>
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
							<Select
								background={'gray5'}
								label={t('cos.display_by', 'Display by')}
								showCheckbox={false}
								items={GROUP_BY}
								selection={
									GROUP_BY.find(
										(item) => item.value === cosPrefAttributes?.zimbraPrefGroupMailBy
									) || GROUP_BY[0]
								}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefGroupMailBy', value)
								}
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container padding={{ left: 'small' }}>
							<Select
								background={'gray5'}
								label={t('cos.default_charset', 'Default Charset')}
								showCheckbox={false}
								items={CHARACTOR_SET}
								selection={
									CHARACTOR_SET.find(
										(item) => item.value === cosPrefAttributes?.zimbraPrefMailDefaultCharset
									) || CHARACTOR_SET[0]
								}
								onChange={(value: AttributeValue): void =>
									onCosAttributeChanged('zimbraPrefMailDefaultCharset', value)
								}
								disabled={isReadOnlyCosEntry}
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
					padding={{ top: 'large', bottom: 'large' }}
				>
					<ListRow>
						<Container crossAlignment="flex-start" padding={{ right: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraPrefMessageIdDedupingEnabled === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraPrefMessageIdDedupingEnabled')}
								label={t('cos.auto_delete_duplicate_messages', 'Auto-Delete duplicate messages')}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
						<Container crossAlignment="flex-start" padding={{ left: 'small' }}>
							<Switch
								value={cosPrefAttributes?.zimbraPrefMailToasterEnabled === 'TRUE'}
								onClick={(): void => changeSwitchOption('zimbraPrefMailToasterEnabled')}
								label={t(
									'cos.enable_new_mail_toast_notification',
									`Enable New Mail Toast Notification`
								)}
								iconColor="primary"
								disabled={isReadOnlyCosEntry}
							/>
						</Container>
					</ListRow>
				</Container>
			</Row>
			<Row mainAlignment="flex-start" width="100%">
				<Container height="fit" crossAlignment="flex-start" width="50%">
					<Row mainAlignment="flex-start" width="100%">
						<Container width="75%" crossAlignment="flex-start">
							<Input
								type="number"
								label={t(
									'cos.upload_max_size_per_file',
									'Maximum size (bytes) allowed for each attachment'
								)}
								value={cosPrefAttributes?.zimbraFileUploadMaxSizePerFile}
								backgroundColor={'gray5'}
								disabled={isReadOnlyCosEntry}
								onKeyDown={(e): void => {
									if (
										![
											'Backspace',
											'Delete',
											'ArrowLeft',
											'ArrowRight',
											'ArrowUp',
											'ArrowDown',
											'0',
											'1',
											'2',
											'3',
											'4',
											'5',
											'6',
											'7',
											'8',
											'9'
										].includes(e.key)
									) {
										e.preventDefault();
									}
								}}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									const value = Number(e.target.value);
									updateHumanFriendlyFileUploadMaxSizePerFileLabel(value);
								}}
							/>
						</Container>
						<Container width="25%" crossAlignment="flex-start">
							<Padding left="small">
								<Text size="medium" color="gray1">
									{humanFriendlyFileUploadMaxSizePerFileLabel}
								</Text>
							</Padding>
						</Container>
					</Row>
				</Container>
			</Row>
		</Row>
	);
};
