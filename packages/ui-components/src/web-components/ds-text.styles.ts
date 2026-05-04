/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css, unsafeCSS } from 'lit';

import { theme } from '../theme/theme';

export const dsTextVars = {
  color: '--ds-text-color',
} as const;

export const textStyles = css`
  :host {
    display: block;
    font-family: var(--font-family);
  }

  :host > * {
    display: block;
    margin: 0;
    max-width: 100%;
    color: var(${unsafeCSS(dsTextVars.color)}, ${unsafeCSS(theme.color.text.regular)});
    font-size: var(
      --ds-text-font-size,
      var(--ds-text-theme-size, ${unsafeCSS(theme.font.size.medium)})
    );
    font-weight: var(
      --ds-text-font-weight,
      var(--ds-text-theme-weight, ${unsafeCSS(theme.font.weight.regular)})
    );
  }

  :host([size='extrasmall']) > * {
    --ds-text-theme-size: ${unsafeCSS(theme.font.size.extrasmall)};
  }

  :host([size='small']) > * {
    --ds-text-theme-size: ${unsafeCSS(theme.font.size.small)};
  }

  :host([size='large']) > * {
    --ds-text-theme-size: ${unsafeCSS(theme.font.size.large)};
  }

  :host([size='extralarge']) > * {
    --ds-text-theme-size: ${unsafeCSS(theme.font.size.extralarge)};
  }

  :host([weight='light']) > * {
    --ds-text-theme-weight: ${unsafeCSS(theme.font.weight.light)};
  }

  :host([weight='regular']) > * {
    --ds-text-theme-weight: ${unsafeCSS(theme.font.weight.regular)};
  }

  :host([weight='medium']) > * {
    --ds-text-theme-weight: ${unsafeCSS(theme.font.weight.medium)};
  }

  :host([weight='bold']) > * {
    --ds-text-theme-weight: ${unsafeCSS(theme.font.weight.bold)};
  }

  :host([overflow='ellipsis']) > * {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :host([overflow='break-word']) > * {
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
`;
