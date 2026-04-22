/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';
import './ds-icon';

import { css, html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

type DsBadgeIconType = 'success' | 'warning';
export type DsBadgeIconProps = { type?: DsBadgeIconType; label: string };

export class DsBadgeIcon extends LitElement {
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

    :host([type='warning']) {
      background: var(--color-banner-warning);
    }

    .icon {
      flex-shrink: 0;
      width: 1em;
      height: 1em;
    }
  `;

  @property({ type: String, reflect: true })
  accessor type: DsBadgeIconProps['type'] = 'success';

  @property({ type: String, reflect: true })
  accessor label: DsBadgeIconProps['label'] | undefined;

  override render(): TemplateResult {
    const getIconName = (type: DsBadgeIconType | undefined) => {
      if (!type) return 'AlertTriangleOutline';
      if (type === 'warning') return 'AlertTriangle';
      return 'CheckmarkCircle';
    };
    const getIconColor = (type: DsBadgeIconType | undefined) => {
      if (!type) return 'var(--color-warning-text)';
      if (type === 'warning') return 'var(--color-warning-text)';
      return 'var(--color-success-active)';
    };

    return html`
      <ds-icon
        class="icon"
        name=${getIconName(this.type)}
        color=${getIconColor(this.type)}
        aria-hidden="true"
      ></ds-icon>
      <span style=${styleMap({ color: getIconColor(this.type) })}>${this.label}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-badge-icon': DsBadgeIcon;
  }
}

if (!customElements.get('ds-badge-icon')) {
  customElements.define('ds-badge-icon', DsBadgeIcon);
}
