/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Container } from '@zextras/carbonio-design-system';
import { BUCKET_LIST, SERVERS_LIST } from '../../constants';
import BucketDetailPanel from './bucket-detail-panel';
import ServersDetailPanel from './global-servers/server-detail-panel';

const DetailViewContainer = styled(Container)`
	max-width: ${({ isPrimaryBarExpanded }): number => (isPrimaryBarExpanded ? 981 : 1125)}px;
	transition: width 300ms;
`;

const BucketOperation: FC = () => {
	const { operation, domainId }: { operation: string; domainId: string } = useParams();

	return (
		<>
			{((): any => {
				switch (operation) {
					case SERVERS_LIST:
						return <ServersDetailPanel />;
					case BUCKET_LIST:
						return (
							<DetailViewContainer>
								<BucketDetailPanel />
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
