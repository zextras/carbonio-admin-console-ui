/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';
import './ds-icon';

import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import type { IconName } from './icon-registry';

type DsBadgeColor = 'success' | 'warning';
export type DsBadgeProps = { color?: DsBadgeColor; icon?: IconName };

export class DsBadge extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.25rem 1rem;
      border-radius: 9999px;
      background: var(--color-banner-success);
    }

    :host([color='warning']) {
      background: var(--color-banner-warning);
    }

    .icon {
      flex-shrink: 0;
      width: 1em;
      height: 1em;
    }
  `;

  @property({ type: String, reflect: true })
  accessor color: DsBadgeColor = 'success';

  @property({ type: String })
  accessor icon: IconName | null = null;

  override render(): TemplateResult {
    return html`
      ${this.icon
        ? html`<ds-icon class="icon" name=${this.icon} color="currentColor" aria-hidden="true"></ds-icon>`
        : nothing}
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-badge': DsBadge;
  }
}

if (!customElements.get('ds-badge')) {
  customElements.define('ds-badge', DsBadge);
}
