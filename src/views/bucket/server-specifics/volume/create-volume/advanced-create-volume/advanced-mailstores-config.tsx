/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
	Container,
	Row,
	Input,
	Switch,
	Text,
	Padding,
	Radio,
	Link
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import {
	AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
	AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
	EMPTY_TYPE_VALUE,
	PRIMARY_TYPE_VALUE,
	S3,
	SECONDARY_TYPE_VALUE
} from '../../../../../../constants';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';
import ListRow from '../../../../../list/list-row';

const AdvancedMailstoresConfig: FC<{
	onSelection: any;
	externalData: any;
	setCompleteLoading: any;
}> = ({ onSelection, externalData, setCompleteLoading }) => {
	const context = useContext(AdvancedVolumeContext);
	const { t } = useTranslation();
	const { advancedVolumeDetail, setAdvancedVolumeDetail } = context;
	const setIsAllocationToggle = useBucketVolumeStore((state) => state?.setIsAllocationToggle);
	const [primaryRadio, setPrimaryRadio] = useState(false);
	const [secondaryRadio, setSecondaryRadio] = useState(false);
	const [bucketS3, setBucketS3] = useState(false);

	const changeVolDetail = useCallback(
		(e) => {
			setAdvancedVolumeDetail((prev: any) => ({ ...prev, [e?.target?.name]: e?.target?.value }));
		},
		[setAdvancedVolumeDetail]
	);

	useEffect(() => {
		if (primaryRadio) {
			setAdvancedVolumeDetail((prev: any) => ({ ...prev, volumeMain: PRIMARY_TYPE_VALUE }));
			onSelection({ volumeMain: PRIMARY_TYPE_VALUE }, true);
		} else if (secondaryRadio) {
			setAdvancedVolumeDetail((prev: any) => ({ ...prev, volumeMain: SECONDARY_TYPE_VALUE }));
			onSelection({ volumeMain: SECONDARY_TYPE_VALUE }, true);
		} else {
			setAdvancedVolumeDetail((prev: any) => ({ ...prev, volumeMain: EMPTY_TYPE_VALUE }));
			onSelection({ volumeMain: EMPTY_TYPE_VALUE }, true);
		}
	}, [onSelection, primaryRadio, secondaryRadio, setAdvancedVolumeDetail]);

	useEffect(() => {
		if (advancedVolumeDetail?.volumeMain === PRIMARY_TYPE_VALUE) {
			setPrimaryRadio(true);
		} else if (advancedVolumeDetail?.volumeMain === SECONDARY_TYPE_VALUE) {
			setSecondaryRadio(true);
		}
	}, [advancedVolumeDetail?.volumeMain]);

	const changeSwitchInfraquentAccess = useCallback((): void => {
		setAdvancedVolumeDetail((prev: object) => ({
			...prev,
			useInfrequentAccess: !advancedVolumeDetail?.useInfrequentAccess
		}));
		onSelection({ useInfrequentAccess: !advancedVolumeDetail?.useInfrequentAccess }, true);
	}, [advancedVolumeDetail?.useInfrequentAccess, onSelection, setAdvancedVolumeDetail]);

	const changeSwitchInfraquentTiering = useCallback((): void => {
		setAdvancedVolumeDetail((prev: object) => ({
			...prev,
			useIntelligentTiering: !advancedVolumeDetail?.useIntelligentTiering
		}));
		onSelection({ useIntelligentTiering: !advancedVolumeDetail?.useIntelligentTiering }, true);
	}, [advancedVolumeDetail?.useIntelligentTiering, onSelection, setAdvancedVolumeDetail]);

	const changeSwitchIsCurrent = useCallback((): void => {
		setAdvancedVolumeDetail((prev: object) => ({
			...prev,
			isCurrent: !advancedVolumeDetail?.isCurrent
		}));
		onSelection({ isCurrent: !advancedVolumeDetail?.isCurrent }, true);
	}, [advancedVolumeDetail?.isCurrent, onSelection, setAdvancedVolumeDetail]);

	const changeSwitchCentralized = useCallback((): void => {
		setAdvancedVolumeDetail((prev: object) => ({
			...prev,
			centralized: !advancedVolumeDetail?.centralized
		}));
		onSelection({ centralized: !advancedVolumeDetail?.centralized }, true);
	}, [advancedVolumeDetail?.centralized, onSelection, setAdvancedVolumeDetail]);

	useEffect(() => {
		if (advancedVolumeDetail?.volumeMain !== 0) {
			setCompleteLoading(true);
			setIsAllocationToggle(false);
		} else {
			setCompleteLoading(false);
			setIsAllocationToggle(true);
		}
	}, [
		advancedVolumeDetail?.prefix,
		advancedVolumeDetail?.volumeMain,
		setCompleteLoading,
		setIsAllocationToggle
	]);

	useEffect(() => {
		if (advancedVolumeDetail?.unusedBucketType === S3) {
			setBucketS3(true);
		} else {
			setBucketS3(false);
		}
	}, [advancedVolumeDetail?.unusedBucketType]);

	return (
		<>
			<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="server"
						label={t('label.volume_server_name', 'Server')}
						backgroundColor="gray6"
						value={externalData}
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.storage_type', 'Storage Type')}
						backgroundColor="gray6"
						value={advancedVolumeDetail?.volumeAllocation}
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.volume_name', 'Volume Name')}
						value={advancedVolumeDetail?.volumeName}
						backgroundColor="gray6"
						readOnly
					/>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large', right: 'large' }}
					>
						<Input
							label={t('label.bucket_name', 'Bucket Name')}
							backgroundColor="gray6"
							value={advancedVolumeDetail?.bucketName}
							readOnly
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large', right: 'large' }}
					>
						<Input
							label={t('label.type', 'Type')}
							backgroundColor="gray6"
							value={advancedVolumeDetail?.unusedBucketType}
							readOnly
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large' }}
					>
						<Input
							label={t('label.ID', 'ID')}
							backgroundColor="gray6"
							value={advancedVolumeDetail?.bucketId}
							readOnly
						/>
					</Container>
				</ListRow>
				<Row
					padding={{ top: 'large' }}
					width="100%"
					mainAlignment="center"
					crossAlignment="center"
					backgroundColor="gray6"
				>
					<Row width="48%">
						<Radio
							inputName="primary"
							label={t('label.primary_volume', 'This is a Primary Volume')}
							value={PRIMARY_TYPE_VALUE}
							checked={primaryRadio}
							onClick={(): void => {
								setPrimaryRadio(!primaryRadio);
								setSecondaryRadio(false);
							}}
						/>
					</Row>
					<Row width="48%">
						<Radio
							inputName="secondary"
							label={t('label.secondary_volume', 'This is a Secondary Volume')}
							value={SECONDARY_TYPE_VALUE}
							checked={secondaryRadio}
							onClick={(): void => {
								setSecondaryRadio(!secondaryRadio);
								setPrimaryRadio(false);
							}}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="prefix"
						label={t(
							'label.prefix_name',
							'Prefix - all objects will have this prefix in their name'
						)}
						value={advancedVolumeDetail?.prefix}
						backgroundColor="gray5"
						onChange={changeVolDetail}
					/>
				</Row>
				{bucketS3 && (
					<>
						<Row
							padding={{ top: 'large' }}
							mainAlignment="flex-start"
							width="100%"
							backgroundColor="gray6"
						>
							<Row width="48.5%" mainAlignment="flex-start">
								<Row mainAlignment="flex-start" width="100%">
									<Switch
										value={advancedVolumeDetail?.useInfrequentAccess}
										label={t('label.use_infraquent_access', 'Use infrequent access')}
										onClick={changeSwitchInfraquentAccess}
									/>
								</Row>
								<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
									<Link
										color="secondary"
										href={AMAZON_USERGUIDE_STORAGE_CLASS_LINK}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Trans
											i18nKey="label.use_infraquent_access_helptext"
											defaults="<underline>Amazon Storage Class Documentation</underline>"
											components={{ underline: <u /> }}
										/>
									</Link>
								</Row>
							</Row>
							<Padding horizontal="small" />
							<Row width="48.5%" mainAlignment="flex-start">
								<Input
									inputName="infrequentAccessThreshold"
									label={t('label.size_threshold', 'Size Threshold')}
									backgroundColor="gray5"
									onChange={changeVolDetail}
									disabled
								/>
							</Row>
						</Row>
						<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
							<Switch
								value={advancedVolumeDetail?.useIntelligentTiering}
								label={t('label.use_intelligent_tiering', 'Use intelligent tiering')}
								onClick={changeSwitchInfraquentTiering}
							/>
						</Row>
						<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
							<Link
								color="secondary"
								href={AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Trans
									i18nKey="label.use_intelligent_tiering_helptext"
									defaults="<underline>Amazon Tiering Documentation</underline>"
									components={{ underline: <u /> }}
								/>
							</Link>
						</Row>
					</>
				)}
				<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
					<Switch
						value={advancedVolumeDetail?.isCurrent}
						label={t('label.enable_current', 'Enable as Current')}
						onClick={changeSwitchIsCurrent}
					/>
				</Row>
				<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
					<Text color="secondary">
						{t(
							'label.enable_current_helptext',
							'Enabling this option will disable the current active volume.'
						)}
					</Text>
				</Row>
				<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
					<Switch
						value={advancedVolumeDetail?.centralized}
						label={t('label.storage_centralized', 'I want this Storage to be centralized')}
						onClick={changeSwitchCentralized}
					/>
				</Row>
				<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
					<Text color="secondary" style={{ whiteSpace: 'pre-line' }}>
						<Trans
							i18nKey="label.storage_centralized_helpertext"
							defaults="<bold>Use the CLI to manage the centralization.</bold> Centralized data becomes useful when two or more servers need access to the same data. By keeping data in one place, it’s easier to manage both the hardware and the data itself. "
							components={{ bold: <strong /> }}
						/>
					</Text>
				</Row>
			</Container>
		</>
	);
};

export default AdvancedMailstoresConfig;
