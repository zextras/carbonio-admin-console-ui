/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { html, LitElement, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Theme } from '../theme/theme';
import { dsTextVars, textStyles } from './ds-text.styles';
import { resolveThemeColor } from '../theme/theme-utils';

export type TextSize = keyof Theme['font']['size'];
export type TextWeight = keyof Theme['font']['weight'];
export type TextOverflow = 'ellipsis' | 'break-word';
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

const TAG_TEMPLATES: Record<TextTag, TemplateResult> = {
  span: html`<span><slot></slot></span>`,
  p: html`<p><slot></slot></p>`,
  h1: html`<h1><slot></slot></h1>`,
  h2: html`<h2><slot></slot></h2>`,
  h3: html`<h3><slot></slot></h3>`,
  h4: html`<h4><slot></slot></h4>`,
  h5: html`<h5><slot></slot></h5>`,
  h6: html`<h6><slot></slot></h6>`,
  label: html`<label><slot></slot></label>`,
  strong: html`<strong><slot></slot></strong>`,
  em: html`<em><slot></slot></em>`,
  small: html`<small><slot></slot></small>`,
};

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

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  @property({ type: Boolean, reflect: true })
  accessor italic = false;

  @property({ type: String, reflect: true })
  accessor textAlign: string = 'initial';

  @property({ type: Number, attribute: 'line-height' })
  accessor lineHeight: number | undefined;

  @property({ type: String })
  accessor as: TextTag = 'span';

  override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has('color') || changedProperties.has('disabled')) {
      this.style.setProperty(
        dsTextVars.color,
        resolveThemeColor(this.color, this.disabled ? 'disabled' : 'regular'),
      );
    }

    if (changedProperties.has('textAlign')) {
      this.style.setProperty('--ds-text-align', this.textAlign);
    }
  }

  override render(): TemplateResult {
    return TAG_TEMPLATES[this.as];
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