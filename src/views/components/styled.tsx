/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styled from 'styled-components';
import { Container } from '@zextras/carbonio-design-system';

export const AbsoluteContainer = styled(Container)`
	position: absolute;
	max-width: 630px;
	right: 0;
	bottom: 0;
	z-index: 1;
	box-shadow: 0 0 12px -1px #888;
	top: 43px;
	height: auto;
`;
