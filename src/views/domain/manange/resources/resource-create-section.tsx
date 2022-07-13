/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect } from 'react';
import { Container, Input, Row, Select, Text, Icon } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { ResourceContext } from './resource-context';
import ListRow from '../../../list/list-row';

const ResourceCreateSection: FC = () => {
	const context = useContext(ResourceContext);
	const { t } = useTranslation();
	const { resourceDetail, setResourceDetail } = context;
	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 300px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.details', 'Details')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Input
							label={t('label.resource_name', 'ResourceName')}
							backgroundColor="gray6"
							value={resourceDetail?.displayName}
							size="medium"
							readOnly
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="space-beetween"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Row width="45%">
							<Input
								label={t('label.name', 'Name')}
								backgroundColor="gray6"
								value={resourceDetail?.name}
								size="medium"
								readOnly
							/>
						</Row>
						<Row width="10%" style={{ padding: '12px' }}>
							<Icon icon="AtOutline" color="gray0" size="large" />
						</Row>
						<Row width="45%">
							<Input
								label={t('label.domain', 'Domain')}
								backgroundColor="gray6"
								value=""
								size="medium"
								readOnly
							/>
						</Row>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default ResourceCreateSection;
