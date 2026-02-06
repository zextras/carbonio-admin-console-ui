/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import './theme.css';

import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { type IconName, iconRegistry } from './icon-registry';

const ICON_SIZES = ['small', 'medium', 'large'] as const;
type IconSize = (typeof ICON_SIZES)[number];

const DEFAULT_ICON: IconName = 'AlertTriangleOutline';

export class IconWC extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      display: block;
      fill: currentColor;
      color: var(--icon-color, var(--color-text, #333333));
      width: var(--icon-size, var(--icon-size-medium, 1rem));
      height: var(--icon-size, var(--icon-size-medium, 1rem));
      transition: color 0.2s ease;
    }

    :host([disabled]) svg {
      color: var(--icon-color-disabled, var(--color-text-disabled, #cccccc));
    }
  `;

  static override properties = {
    iconName: { type: String, reflect: true, attribute: 'icon-name' },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  iconName: IconName = DEFAULT_ICON;
  color = 'text';
  size: IconSize = 'medium';
  disabled = false;

  private getColorVariable(color: string): string {
    const trimmed = color.trim();

    // Check if it's a hex color (3, 4, 6, or 8 digit formats)
    const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
    if (hexPattern.test(trimmed)) {
      return trimmed;
    }

    // For named colors, sanitize and return as CSS variable
    const sanitized = trimmed.replace(/[^a-zA-Z0-9-]/g, '');
    return `var(--color-${sanitized}-regular, var(--color-text-regular))`;
  }

  private getSizeVariable(size: IconSize): string {
    // Validate size is one of allowed values
    const validSize = ICON_SIZES.includes(size) ? size : 'medium';
    return `var(--icon-size-${validSize}, var(--icon-size-medium, 1rem))`;
  }

  private getSvgContent(): string {
    return iconRegistry[this.iconName] ?? iconRegistry[DEFAULT_ICON] ?? '';
  }

  protected override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has('color') || changedProperties.has('size')) {
      this.updateStyles();
    }
  }

  private updateStyles(): void {
    this.style.setProperty('--icon-color', this.getColorVariable(this.color));
    this.style.setProperty('--icon-size', this.getSizeVariable(this.size));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateStyles();
  }

  override render(): TemplateResult | typeof nothing {
    const svgContent = this.getSvgContent();

    if (!svgContent) {
      return nothing;
    }

    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
        role="img"
        data-testid="icon:${this.iconName}"
      >
        ${unsafeSVG(svgContent)}
      </svg>
    `;
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
