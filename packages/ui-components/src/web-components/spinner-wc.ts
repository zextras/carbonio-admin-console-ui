/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { css, html, LitElement } from 'lit';

/**
 * A simple loading spinner web component
 * @element spinner-wc
 */
class SpinnerWC extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }
    .spinner {
      width: 0.75rem;
      height: 0.75rem;
      border: 0.125rem solid var(--color-primary, #2b73d2);
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

  override render() {
    return html` <div class="spinner" role="status" aria-busy="true" aria-label="Loading"></div> `;
  }
}

customElements.define('spinner-wc', SpinnerWC);

declare global {
  interface HTMLElementTagNameMap {
    'spinner-wc': SpinnerWC;
  }
}
