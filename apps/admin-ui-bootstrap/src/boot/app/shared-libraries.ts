/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable import/no-duplicates */
/* eslint-disable import/no-named-default */

import React from 'react';

import * as ZappUI from '@zextras/carbonio-design-system';
import * as Lodash from 'lodash';
import * as Moment from 'moment';
import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';
import * as ReactI18n from 'react-i18next';
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
import * as BootstrapExports from '../../../exports';

export function injectSharedLibraries(): void {
	// eslint-disable-next-line max-len
	const wnd: IShellWindow = window as unknown as IShellWindow;
	if (wnd.__ZAPP_SHARED_LIBRARIES__) {
		// Ensure bootstrap exports are preserved
		Object.assign(wnd.__ZAPP_SHARED_LIBRARIES__['@zextras/admin-ui-bootstrap'], BootstrapExports);
		return;
	}
	wnd.__ZAPP_SHARED_LIBRARIES__ = {
		'prop-types': PropTypes,
		react: React,
		'react-dom': ReactDOM,
		'react-i18next': ReactI18n,
		lodash: Lodash,
		'react-router-dom': ReactRouterDom,
		moment: Moment,
		'styled-components': StyledComponents,
		// DO NOT RENAME THIS
		'@zextras/admin-ui-bootstrap': { ...BootstrapExports },
		'@zextras/carbonio-design-system': ZappUI
	};
	wnd.__ZAPP_HMR_EXPORT__ = {};
}
