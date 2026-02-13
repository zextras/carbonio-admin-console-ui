/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './theme.css';

import { css, html, LitElement } from 'lit';

export class DividerElement extends LitElement {
  static override styles = css`
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

  static override properties = {
    color: { type: String, reflect: true },
  };
  color = 'gray2';

  override render() {
    return html`<hr
      data-testid="divider"
      role="separator"
      style="background-color: var(--color-${this.color});"
      class="divider"
      aria-orientation='horizontal'
    ></hr>`;
  }
}

if (!customElements.get('divider-wc')) {
  customElements.define('divider-wc', DividerElement);
}

declare global {
  interface HTMLElementTagNameMap {
    'divider-wc': DividerElement;
  }
}
