/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../theme/theme.css';

import { css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

export type DsPageShimmerProps = { rows?: number };

export class DsPageShimmer extends LitElement {
  static override readonly styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .page-shimmer {
      width: 100%;
      height: 100%;
      padding: 1.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .row {
      background: linear-gradient(90deg, #e8eaed 25%, #f3f4f6 50%, #e8eaed 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 0.25rem;
      height: 1rem;
    }

    .row:nth-child(1) {
      width: 30%;
      height: 1.5rem;
    }

    .row:nth-child(2) {
      width: 100%;
      height: 2rem;
      margin-top: 0.75rem;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `;

  @property({ type: Number, reflect: true })
  accessor rows: DsPageShimmerProps['rows'] = 8;

  override render(): TemplateResult {
    return html`
      <div class="page-shimmer" role="status" aria-label="Loading">
        ${repeat(
          Array.from({ length: this.rows ?? 8 }),
          (_, idx) => idx,
          (_, idx) => html`<div class="row" style="width: ${80 + Math.sin(idx) * 15}%"></div>`,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-page-shimmer': DsPageShimmer;
  }
}

if (!customElements.get('ds-page-shimmer')) {
  customElements.define('ds-page-shimmer', DsPageShimmer);
}
