/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Type definitions for ESM module exports
 */

import type { FC } from 'react';

/**
 * The main App component exported by this module
 */
declare const App: FC;

export default App;

/**
 * Module metadata interface
 */
export interface ComponentMetadata {
	/** Module name */
	name: string;
	/** JavaScript entry point URL */
	js_entrypoint: string;
	/** CSS entry point URL (optional) */
	css_entrypoint?: string;
	/** Module description */
	description: string;
	/** Module version */
	version: string;
	/** Git commit hash */
	commit: string;
	/** Loading priority */
	priority: number;
	/** Module type */
	type: string;
	/** Attribute key (optional) */
	attrKey?: string;
	/** Icon name */
	icon: string;
	/** Display name */
	display: string;
	/** Sentry DSN (optional) */
	sentryDsn?: string;
	/** Module format - 'esm' for ES modules */
	format: 'esm' | 'iife';
}
