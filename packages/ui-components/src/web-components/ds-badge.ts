/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';
import './ds-icon';

import { css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

export type DsBadgeProps = { color?: string };

export class DsBadge extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.25rem 1rem;
      border-radius: 9999px;
      background: var(--ds-badge-color);
    }
  `;

  @property({ type: String, reflect: true })
  accessor color: string = 'transparent';

  override updated(): void {
    if (this.color) {
      this.style.setProperty('--ds-badge-color', this.color);
    } else {
      this.style.removeProperty('--ds-badge-color');
    }
  }

  override render(): TemplateResult {
    return html` <slot></slot> `;
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
