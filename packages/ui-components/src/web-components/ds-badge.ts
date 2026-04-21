/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';

import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import { resolveThemeColor } from '../theme/theme-utils';

export class DsBadge extends LitElement {
  static override styles = css`
    :host {
      border-radius: 1rem;
      background: var(--badge-color, var(--color-primary-regular));
      display: flex;
      padding: 4px 16px;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
  `;

  @property({ type: String, reflect: true })
  accessor color = 'text';

  override render(): TemplateResult | typeof nothing {
    const styles = styleMap({
      '--badge-color': resolveThemeColor(this.color, 'regular'),
    });

    return html` <span style=${styles}><slot></slot></span> `;
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
