/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Icon, Padding, Text } from '@zextras/carbonio-design-system';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ScrollingContainer = styled(Container)<{ isShow: boolean }>`
	position: sticky;
	bottom: ${({ isShow }): string => (isShow ? '0' : '-6rem')};
	background: ${({ theme }): string => theme.palette.gray6.regular};
	background: linear-gradient(
		to top,
		${({ theme }): string => theme.palette.gray6.regular} 0%,
		transparent 100%
	);
`;

const ScrollContainer: FC<{
	isVisible: boolean;
}> = ({ isVisible = false }) => {
	const [t] = useTranslation();
	return isVisible ? (
		<ScrollingContainer isShow={isVisible}>
			<Container orientation="horizontal" padding={{ top: 'large' }} width="100%">
				<Icon color="gray" icon="ArrowheadDown" size="large" />
				<Padding left="small">
					<Text size="large" weight="300" color="gray">
						{t('label.scroll_down_to_view_other_items', 'Scroll down to view other items')}
					</Text>
				</Padding>
			</Container>
		</ScrollingContainer>
	) : (
		<></>
	);
};

export default ScrollContainer;
