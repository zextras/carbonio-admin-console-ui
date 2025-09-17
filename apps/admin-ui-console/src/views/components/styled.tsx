/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

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

export const ModalOverlayContainer = styled.div`
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.15);
	box-shadow: 0 0 12px -1px #888;
	cursor: pointer;
	z-index: 998;
`;

export const ModalSubOverlayContainer = styled.div`
	max-width: ${(props: { maxWidth?: string }): any =>
		props.maxWidth ? props.maxWidth : '39.375rem'};
	width: 100%;
	height: 100vh;
	float: right;
	position: relative;
	box-shadow: -6px 4px 5px 0px rgba(0, 0, 0, 0.1);
`;
