/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../theme/theme.css';

import { css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

export type DsDividerProps = { color?: string };

export class DividerElement extends LitElement {
  static override readonly styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .divider {
      box-sizing: border-box;
      height: 0.0625rem;
      max-height: 0.0625rem;
      min-height: 0.0625rem;
      width: 100%;
      border: none;
      margin: 0;
      padding: 0;
    }
  `;

  @property({ type: String, reflect: true })
  accessor color: DsDividerProps['color'] = 'gray2';

  override render(): TemplateResult {
    const styles = styleMap({
      backgroundColor: `var(--color-${this.color}-regular)`,
    });

    return html`<hr
      role="separator"
      style=${styles}
      class="divider"
      aria-orientation="horizontal"
    ></hr>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-divider': DividerElement;
  }
}

if (!customElements.get('ds-divider')) {
  customElements.define('ds-divider', DividerElement);
}
