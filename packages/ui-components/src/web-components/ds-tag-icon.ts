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

import { resolveThemeColor } from '../theme/theme-utils';
import { type IconName } from './icon-registry';

export type DsTagIconProps = {
  label?: string;
  icon?: IconName;
  color?: string;
  background?: string;
};

export class DsTagIcon extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      border-radius: 2px;
      background: var(--ds-tag-icon-bg);
    }

    .icon {
      flex-shrink: 0;
      width: 1em;
      height: 1em;
    }
  `;

  @property({ type: String, reflect: true })
  accessor label: DsTagIconProps['label'] | undefined;

  @property({ type: String, reflect: true })
  accessor icon: DsTagIconProps['icon'] | undefined;

  @property({ type: String, reflect: true })
  accessor color: DsTagIconProps['color'] | undefined;

  @property({ type: String, reflect: true })
  accessor background: DsTagIconProps['background'] | undefined;

  override updated(): void {
    if (this.background) {
      this.style.setProperty('--ds-tag-icon-bg', resolveThemeColor(this.background, 'regular'));
    } else {
      this.style.removeProperty('--ds-tag-icon-bg');
    }
  }

  override render(): TemplateResult {
    return html`
      <ds-icon class="icon" icon=${this.icon} color=${this.color} aria-hidden="true"></ds-icon>
      <span
        style=${styleMap({
          color: this.color,
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
    'ds-tag-icon': DsTagIcon;
  }
}

if (!customElements.get('ds-tag-icon')) {
  customElements.define('ds-tag-icon', DsTagIcon);
}
