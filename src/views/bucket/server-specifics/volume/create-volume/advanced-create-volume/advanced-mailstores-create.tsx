/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Input } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { volumeTypeList } from '../../../../../utility/utils';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import { DISABLED, ENABLED, NO, S3, YES } from '../../../../../../constants';
import ListRow from '../../../../../list/list-row';

const AdvancedMailstoresCreate: FC<{
	externalData: string;
	setCompleteLoading: any;
}> = ({ externalData, setCompleteLoading }) => {
	const context = useContext(AdvancedVolumeContext);
	const { t } = useTranslation();
	const { advancedVolumeDetail } = context;
	const volTypeList = useMemo(() => volumeTypeList(t), [t]);
	const [volumeType, setVolumeType] = useState<any>('');
	const [bucketS3, setBucketS3] = useState(false);

	useEffect(() => {
		if (
			advancedVolumeDetail?.volumeAllocation &&
			advancedVolumeDetail?.volumeName &&
			advancedVolumeDetail?.unusedBucketType &&
			volumeType
		) {
			setCompleteLoading(true);
		} else {
			setCompleteLoading(false);
		}
	}, [advancedVolumeDetail, setCompleteLoading, volumeType]);

	useEffect(() => {
		const volumeTypeObject = volTypeList?.find(
			(item: any) => item?.value === advancedVolumeDetail?.volumeMain
		)?.label;
		setVolumeType(volumeTypeObject);
	}, [advancedVolumeDetail?.volumeMain, volTypeList]);

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
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.volume_allocation', 'Allocation')}
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
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.type_of_volume', 'Type of Volume')}
						value={volumeType}
						backgroundColor="gray6"
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t(
							'label.prefix_name',
							'Prefix - all objects will have this prefix in their name'
						)}
						value={advancedVolumeDetail?.prefix}
						backgroundColor="gray6"
						readOnly
					/>
				</Row>
				{bucketS3 && (
					<>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.infrequent_access', 'Infrequent access')}
								value={advancedVolumeDetail?.useInfrequentAccess ? ENABLED : DISABLED}
								backgroundColor="gray6"
								readOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.use_intelligent_tiering', 'Use Intelligent Tiering')}
								value={advancedVolumeDetail?.useIntelligentTiering ? ENABLED : DISABLED}
								backgroundColor="gray6"
								readOnly
							/>
						</Row>
					</>
				)}
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.volume_as_current', 'Volum as current')}
						value={advancedVolumeDetail?.isCurrent ? YES : NO}
						backgroundColor="gray6"
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.centralized', 'Centralized')}
						value={advancedVolumeDetail?.centralized ? YES : NO}
						backgroundColor="gray6"
						readOnly
					/>
				</Row>
			</Container>
		</>
	);
};

export default AdvancedMailstoresCreate;
