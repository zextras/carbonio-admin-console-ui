/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

const OverlayContainer = styled(Container)`
	position: fixed;
	width: 100%;
	top: 0;
	left: 0;
	background: rgba(0, 0, 0, 0.15);
`;
const BackDropOverlay: FC = () => <OverlayContainer></OverlayContainer>;

export default BackDropOverlay;
