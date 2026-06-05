/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '../theme/theme.css';

import { css, html, LitElement, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
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

    .progress-bar-track {
      width: 100%;
      height: 0.5rem;
      border-radius: 0.25rem;
      background: var(--color-gray3-regular, #e0e0e0);
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 0.25rem;
      background: linear-gradient(90deg, #d1d5db, #9ca3af);
      transition: width 200ms ease-out;
    }

    .divider {
      padding: 1rem;
    }

    .row {
      background: linear-gradient(90deg, #e8eaed 25%, #f3f4f6 50%, #e8eaed 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 0.25rem;
      height: 1rem;
    }

    .row:nth-child(2) {
      width: 30%;
      height: 1.5rem;
    }

    .row:nth-child(3) {
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

  @state()
  accessor progress = 0;

  #intervalId: ReturnType<typeof setInterval> | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.progress = 0;
    let current = 0;
    this.#intervalId = setInterval(() => {
      current += 1;
      this.progress = current;
      if (current >= 90 && this.#intervalId) {
        clearInterval(this.#intervalId);
        this.#intervalId = null;
      }
    }, 30);
  }

  override disconnectedCallback(): void {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
    super.disconnectedCallback();
  }

  override render(): TemplateResult {
    return html`
      <div class="page-shimmer" role="status" aria-label="Loading">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width: ${this.progress}%"></div>
        </div>
        <div class="divider"></div>
        ${repeat(
          Array.from({ length: this.rows ?? 8 }),
          (_, idx) => idx,
          (_, idx) => html`<div class="row" style="width: ${80 + Math.sin(idx) * 15}%"></div>`,
        )}
        <div class="divider"></div>
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
