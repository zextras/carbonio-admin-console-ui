/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';

import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import { type IconName, iconRegistry } from './icon-registry';

const ICON_SIZES = ['small', 'medium', 'large'] as const;
export type IconSize = (typeof ICON_SIZES)[number];

type IconSizeValue = IconSize | string;

const DEFAULT_ICON = 'AlertTriangleOutline';

export class IconWC extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    :host([clickable]) {
      cursor: pointer;
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

  @property({ type: String, reflect: true })
  accessor icon: IconName = DEFAULT_ICON;

  @property({ type: String, reflect: true })
  accessor color = 'text';

  @property({ type: String, reflect: true })
  accessor size: IconSizeValue = 'medium';

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ attribute: false })
  accessor clickHandler: ((event: Event) => void) | undefined = undefined;

  private getColorVariable(color: string): string {
    const trimmed = color.trim();

    if (trimmed === 'currentColor') {
      return trimmed;
    }

    // Check if it's a hex color (3, 4, 6, or 8 digit formats)
    const hexPattern = /^#([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
    if (hexPattern.test(trimmed)) {
      return trimmed;
    }
    // For named colors, sanitize and return as CSS variable
    const sanitized = trimmed.replace(/[^a-zA-Z0-9-]/g, '');
    return `var(--color-${sanitized}-regular, var(--color-text-regular))`;
  }

  private getSizeValue(size: IconSizeValue): string {
    if (/^[\d.]+(rem|px|em|vh|vw|%)$/.test(size)) {
      return size;
    }
    const validSize = ICON_SIZES.includes(size as IconSize) ? (size as IconSize) : 'medium';
    return `var(--icon-size-${validSize}, var(--icon-size-medium, 1rem))`;
  }

  private getSvgContent(): string {
    return iconRegistry[this.icon] ?? iconRegistry[DEFAULT_ICON] ?? '';
  }

  private handleClick(event: Event): void {
    if (this.disabled) {
      event.stopPropagation();
      return;
    }
    this.clickHandler?.(event);
  }

  override render(): TemplateResult | typeof nothing {
    const svgContent = this.getSvgContent();

    if (this.clickHandler) {
      this.setAttribute('clickable', '');
    } else {
      this.removeAttribute('clickable');
    }

    const styles = styleMap({
      '--icon-color': this.getColorVariable(this.color),
      '--icon-size': this.getSizeValue(this.size),
    });

    return html`
      <svg
        style=${styles}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        role="img"
        data-testid="icon: ${this.icon}"
        @click=${this.handleClick}
      >
        ${unsafeSVG(svgContent)}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'icon-wc': IconWC;
  }
}

if (!customElements.get('icon-wc')) {
  customElements.define('icon-wc', IconWC);
}
