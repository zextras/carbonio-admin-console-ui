/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Container, Text } from '@zextras/carbonio-design-system';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';

const rotateKeyframes = keyframes`
from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
    }
`;
const KeyFrameContainer = styled(Container)`
	width: 3rem;
	height: 3rem;
	border-radius: 50%;
	display: inline-block;
	border-top: 0.188rem solid #fff;
	border-right: 0.188rem solid transparent;
	box-sizing: border-box;
	animation: ${rotateKeyframes} 1s linear infinite;
`;

const OverlayDivision: FC<{ ovelayWidth: string }> = ({ ovelayWidth }) => {
	const [t] = useTranslation();
	const OverlayContainer = styled(Container)`
		position: fixed;
		width: ${ovelayWidth};
		top: 6.438rem;
		right: 0;
		bottom: 0;
		height: auto;
		max-height: 100%;
		overflow: hidden;
		background: #0d0d0d;
		opacity: 0.4;
		z-index: 11;
		padding-top: 2rem;
	`;
	return (
		<OverlayContainer>
			<KeyFrameContainer></KeyFrameContainer>
			<Container height="auto" padding={{ top: 'small' }}>
				<Text color="gray5" size="medium" weight="bold">
					{t('label.please_wait', 'Please wait')}
				</Text>
			</Container>
		</OverlayContainer>
	);
};

export default OverlayDivision;
