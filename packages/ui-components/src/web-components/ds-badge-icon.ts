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

type DsBadgeIconType = 'success' | 'warning' | 'info';
export type DsBadgeIconProps = { type?: DsBadgeIconType; label: string };

export class DsBadgeIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      border-radius: 2px;
      background: var(--color-banner-success);
    }

    :host([type='warning']) {
      background: var(--color-banner-warning);
    }

    :host([type='info']) {
      background: var(--color-banner-info);
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
      if (type === 'info') return 'ActivityOutline';
      return 'AlertTriangleOutline';
    };
    const getIconColor = (type: DsBadgeIconType | undefined) => {
      if (!type) return 'var(--color-warning-text)';
      if (type === 'warning') return 'var(--color-badge-warning)';
      if (type === 'info') return 'var(--color-badge-info)';
      return 'var(--color-badge-warning)';
    };

    return html`
      <ds-icon
        class="icon"
        icon=${getIconName(this.type)}
        color=${getIconColor(this.type)}
        aria-hidden="true"
      ></ds-icon>
      <span
        style=${styleMap({
          color: getIconColor(this.type),
          fontSize: '0.75rem',
          fontWeight: '500',
        })}
        >${this.label}</span
      >
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
