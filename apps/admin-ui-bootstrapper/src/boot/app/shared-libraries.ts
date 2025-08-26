/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable import/no-duplicates */
/* eslint-disable import/no-named-default */

import React from 'react';

import * as ReduxJSToolkit from '@reduxjs/toolkit';
import * as ZappUI from '@zextras/carbonio-design-system';
import * as Lodash from 'lodash';
import * as Moment from 'moment';
import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';
import * as ReactI18n from 'react-i18next';
import * as ReactRedux from 'react-redux';
import * as ReactRouterDom from 'react-router-dom';
// import * as Msw from 'msw';
// import * as Faker from 'faker';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as StyledComponents from 'styled-components';

import { IShellWindow } from '../../../types';

export function injectSharedLibraries(): void {
	// eslint-disable-next-line max-len
	const wnd: IShellWindow = window as unknown as IShellWindow;
	if (wnd.__ZAPP_SHARED_LIBRARIES__) {
		return;
	}
	wnd.__ZAPP_SHARED_LIBRARIES__ = {
		'prop-types': PropTypes,
		react: React,
		'react-dom': ReactDOM,
		'react-i18next': ReactI18n,
		'react-redux': ReactRedux,
		lodash: Lodash,
		'react-router-dom': ReactRouterDom,
		moment: Moment,
		'styled-components': StyledComponents,
		'@reduxjs/toolkit': {
			...ReduxJSToolkit,
			configureStore: (): void => {
				throw new Error('Apps must use the store given by the Shell.');
			},
			createStore: (): void => {
				throw new Error('Apps must use the store given by the Shell.');
			}
		},
		// DO NOT RENAME THIS
		'@zextras/carbonio-shell-ui': {},
		'@zextras/carbonio-design-system': ZappUI
	};
	wnd.__ZAPP_HMR_EXPORT__ = {};
}
