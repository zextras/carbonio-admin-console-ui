/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './theme.css';

import { css, html, LitElement } from 'lit';

/**
 * A simple loading spinner web component
 * @element spinner-wc
 */
export class SpinnerWC extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    .spinner {
      width: 0.75rem;
      height: 0.75rem;
      border: 0.125rem solid;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spinner-rotate 0.75s linear infinite;
    }
    @keyframes spinner-rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;

  static override properties = {
    color: { type: String, reflect: true },
  };

  color = 'primary';

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-testid', 'spinner');
  }

  override render() {
    return html`
      <div
        class="spinner"
        style="border-color: var(--color-${this.color}); border-right-color: transparent;"
        role="status"
        aria-busy="true"
        aria-label="Loading"
      ></div>
    `;
  }
}

if (!customElements.get('spinner-wc')) {
  customElements.define('spinner-wc', SpinnerWC);
}

declare global {
  interface HTMLElementTagNameMap {
    'spinner-wc': SpinnerWC;
  }
}
