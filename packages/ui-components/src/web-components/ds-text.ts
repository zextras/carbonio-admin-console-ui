/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { HTMLAttributes } from 'react';

import { Theme } from '../theme/theme';
import { resolveThemeColor } from '../theme/theme-utils';
import { AnyColor } from '../types/utils';
import { dsTextVars, textStyles } from './ds-text.styles';

export type TextProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  color?: AnyColor;
  size?: 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
  weight?: 'light' | 'regular' | 'medium' | 'bold';
  overflow?: TextOverflow;
  disabled?: boolean;
  italic?: boolean;
  textAlign?: React.CSSProperties['textAlign'];
  lineHeight?: number;
  ref?: React.Ref<HTMLDivElement>;
};
export type TextSize = keyof Theme['font']['size'];
export type TextWeight = keyof Theme['font']['weight'];
export type TextOverflow = 'ellipsis' | 'break-word';
export type TextDisplay = 'block' | 'inline' | 'inline-block';
export type TextAlign = 'left' | 'center' | 'right' | 'justify' | 'initial';
export type TextTag =
  | 'span'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'strong'
  | 'em'
  | 'small';

export class DsText extends LitElement {
  static override readonly styles = textStyles;

  @property({ type: String })
  accessor color = 'text';

  @property({ type: String, reflect: true })
  accessor size: TextSize = 'medium';

  @property({ type: String, reflect: true })
  accessor weight: TextWeight = 'regular';

  @property({ type: String, reflect: true })
  accessor overflow: TextOverflow = 'ellipsis';

  @property({ type: String, reflect: true })
  accessor display: TextDisplay = 'block';

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: Boolean, reflect: true })
  accessor italic = false;
  @property({ type: String, reflect: true, attribute: 'text-align' })
  accessor textAlign: TextAlign = 'initial';
  @property({ type: Number, attribute: 'line-height' })
  accessor lineHeight: number | undefined;

  @property({ type: String })
  accessor as: TextTag = 'span';

  override render(): TemplateResult {
    const componentStyles: Record<string, string> = {
      [dsTextVars.color]: resolveThemeColor(this.color, this.disabled ? 'disabled' : 'regular'),
      ...(this.lineHeight !== undefined && { [dsTextVars.lineHeight]: String(this.lineHeight) }),
    };

    const tagStyle = styleMap({ ...componentStyles });

    switch (this.as) {
      case 'p':
        return html`<p style=${tagStyle}><slot></slot></p>`;
      case 'h1':
        return html`<h1 style=${tagStyle}><slot></slot></h1>`;
      case 'h2':
        return html`<h2 style=${tagStyle}><slot></slot></h2>`;
      case 'h3':
        return html`<h3 style=${tagStyle}><slot></slot></h3>`;
      case 'h4':
        return html`<h4 style=${tagStyle}><slot></slot></h4>`;
      case 'h5':
        return html`<h5 style=${tagStyle}><slot></slot></h5>`;
      case 'h6':
        return html`<h6 style=${tagStyle}><slot></slot></h6>`;
      case 'label':
        return html`<label style=${tagStyle}><slot></slot></label>`;
      case 'strong':
        return html`<strong style=${tagStyle}><slot></slot></strong>`;
      case 'em':
        return html`<em style=${tagStyle}><slot></slot></em>`;
      case 'small':
        return html`<small style=${tagStyle}><slot></slot></small>`;
      default:
        return html`<span style=${tagStyle}><slot></slot></span>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-text': DsText;
  }
}

if (!customElements.get('ds-text')) {
  customElements.define('ds-text', DsText);
}
