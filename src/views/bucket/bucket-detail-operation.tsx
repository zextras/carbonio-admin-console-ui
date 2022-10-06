/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Container } from '@zextras/carbonio-design-system';
import { BUCKET_LIST, DATA_VOLUMES, SERVERS_LIST } from '../../constants';
import BucketDetailPanel from './bucket-detail-panel';
import ServersDetailPanel from './global-servers/server-detail-panel';
import VolumesDetailPanel from './server-specifics/volume/volumes-list';
import { VolumeContext } from './server-specifics/volume/create-volume/volume-context';

const DetailViewContainer = styled(Container)`
	max-width: ${({ isPrimaryBarExpanded }): number => (isPrimaryBarExpanded ? 981 : 1125)}px;
	transition: width 300ms;
`;

interface VolumeDetailObj {
	id: string;
	volumeName: string;
	volumeMain: number;
	path: string;
	isCurrent: boolean;
	isCompression: boolean;
	compressionThreshold: number;
	volumeAllocation: number;
}

const BucketOperation: FC = () => {
	const { operation, server }: { operation: string; server: string } = useParams();
	const [volumeDetail, setVolumeDetail] = useState<VolumeDetailObj>({
		id: '',
		volumeName: '',
		volumeMain: 0,
		path: '',
		isCurrent: false,
		isCompression: false,
		compressionThreshold: 0,
		volumeAllocation: 0
	});

	return (
		<>
			{((): any => {
				switch (operation) {
					case SERVERS_LIST:
						return (
							<DetailViewContainer>
								<ServersDetailPanel />
							</DetailViewContainer>
						);
					case BUCKET_LIST:
						return (
							<DetailViewContainer>
								<BucketDetailPanel />
							</DetailViewContainer>
						);
					case DATA_VOLUMES:
						return (
							<DetailViewContainer>
								<VolumeContext.Provider value={{ volumeDetail, setVolumeDetail }}>
									<VolumesDetailPanel />
								</VolumeContext.Provider>
							</DetailViewContainer>
						);
					default:
						return null;
				}
			})()}
		</>
	);
};
export default BucketOperation;
