/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import './theme.css';

import { css, html, LitElement, TemplateResult } from 'lit';

import { type IconName, iconRegistry } from './icon-registry';

type IconSize = 'small' | 'medium' | 'large';

export class IconWC extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
    }

    .icon {
      display: block;
      fill: currentColor;
      color: var(--icon-color, var(--color-text, #333333));
      width: var(--icon-size, var(--icon-size-medium, 1rem));
      height: var(--icon-size, var(--icon-size-medium, 1rem));
      transition: color 0.2s ease;
    }

    :host([disabled]) .icon {
      color: var(--icon-color-disabled, var(--color-text-disabled, #cccccc));
      opacity: 1;
    }
  `;

  static override properties = {
    iconName: { type: String, reflect: true },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  iconName: IconName = 'AlertTriangleOutline';
  color = 'text';
  size: IconSize = 'medium';
  disabled = false;

  private getColorVariable(color: string): string {
    return `var(--color-${color}, var(--color-text, #333333))`;
  }

  private getSizeVariable(size: IconSize): string {
    return `var(--icon-size-${size}, var(--icon-size-medium, 1rem))`;
  }

  private getIconSvg(iconName: IconName): TemplateResult {
    const svgContent = iconRegistry[iconName] || iconRegistry.AlertTriangleOutline;
    return html`<div class="icon" data-testid="icon: ${iconName}">${svgContent}</div>`;
  }

  override render(): TemplateResult {
    return html` ${this.getIconSvg(this.iconName)} `;
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    const iconElement = this.shadowRoot?.querySelector('.icon') as HTMLElement;

    if (iconElement) {
      iconElement.style.setProperty('--icon-color', this.getColorVariable(this.color));
      iconElement.style.setProperty('--icon-size', this.getSizeVariable(this.size));
    }
  }
}

if (!customElements.get('icon-wc')) {
  customElements.define('icon-wc', IconWC);
}

declare global {
  interface HTMLElementTagNameMap {
    'icon-wc': IconWC;
  }
}
