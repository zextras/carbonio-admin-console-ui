/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Text } from '@zextras/carbonio-design-system';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';

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

const OverlayDivision: FC<{ ovelayStyle: any }> = ({ ovelayStyle }) => {
	const [t] = useTranslation();
	const OverlayContainer = ovelayStyle;
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
