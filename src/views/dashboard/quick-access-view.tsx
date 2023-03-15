/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Container, Text, Icon, Divider } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListRow from '../list/list-row';

export const ActionContainer = styled(Container)`
	background: ${({ theme, bgColor }): string => theme.avatarColors[bgColor]};
`;

export const OperationContainer = styled(Container)`
	cursor: pointer;
`;

const QuickAccess: FC<{
	quickAccessItems: Array<any>;
	openOperationView: (operation: string) => void;
	domainName: string;
}> = ({ quickAccessItems, openOperationView, domainName }) => {
	const [t] = useTranslation();
	return (
		<Container
			background="gray6"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			padding={{ top: 'extralarge', right: 'extralarge', bottom: 'extralarge' }}
			style={{ borderRadius: '0.5rem' }}
		>
			<Container
				padding={{ bottom: 'large', right: 'large', left: 'extralarge', top: 'large' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
			>
				<ListRow>
					<Container mainAlignment="flex-start" crossAlignment="flex-start" width="2rem">
						<Icon size="large" icon="FlashOutline" />
					</Container>
					<Container mainAlignment="flex-start" crossAlignment="flex-start">
						<Text color="gray0" overflow="break-word" weight="bold" size="medium">
							{t('dashboard.quick_access_to', 'Quick Access to')} {domainName}
						</Text>
					</Container>
				</ListRow>
			</Container>
			<Container
				orientation="horizontal"
				mainAlignment="space-between"
				crossAlignment="flex-start"
				padding={{ bottom: 'large', right: 'medium', left: 'medium', top: 'large' }}
			>
				{quickAccessItems.map((item) => (
					<>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ left: 'extralarge' }}
							key={item?.bgColor}
						>
							<ActionContainer
								height={'8.75rem'}
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								width={'21.75rem'}
								bgColor={item?.bgColor}
								style={{ borderRadius: '0.5rem' }}
							>
								<ListRow>
									<Container padding={{ all: 'large' }}>
										<Container mainAlignment="flex-start" crossAlignment="flex-start">
											<Text color="gray6" overflow="break-word" weight="light" size="medium">
												{item?.upperText}
											</Text>
										</Container>
										<Container
											mainAlignment="flex-start"
											crossAlignment="flex-start"
											padding={{ top: 'extrasmall' }}
										>
											<Text color="gray6" overflow="break-word" weight="bold" size="large">
												{item?.operationText}
											</Text>
										</Container>
									</Container>
									<Container crossAlignment="flex-end" padding={{ right: 'large' }}>
										<Icon color="gray6" icon={item?.operationIcon} height="2rem" width="2rem" />
									</Container>
								</ListRow>
								<ListRow>
									<Container padding={{ left: 'large', right: 'large' }}>
										<Divider />
									</Container>
								</ListRow>
								<ListRow>
									<OperationContainer
										mainAlignment="flex-start"
										crossAlignment="flex-start"
										padding={{ all: 'large' }}
										onClick={(): void => {
											openOperationView(item?.operation);
										}}
									>
										<Text color="gray6" overflow="break-word" weight="light" size="medium">
											{item?.bottomText}
										</Text>
									</OperationContainer>
									<OperationContainer
										mainAlignment="flex-end"
										crossAlignment="flex-end"
										padding={{ all: 'large' }}
										onClick={(): void => {
											openOperationView(item?.operation);
										}}
									>
										<Icon icon={item?.bottomIcon} size="medium" color="gray6" />
									</OperationContainer>
								</ListRow>
							</ActionContainer>
						</Container>
					</>
				))}
			</Container>
		</Container>
	);
};

export default QuickAccess;
