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
import { getInlineStyles, resolveThemeColor } from '../theme/theme-utils';
import { AnyColor } from '../types/utils';
import { dsTextVars, textStyles } from './ds-text.styles';

export type TextProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  color?: AnyColor;
  size?: 'extrasmall' | 'small' | 'medium' | 'large' | 'extralarge';
  weight?: 'light' | 'regular' | 'medium' | 'bold';
  overflow?: TextOverflow;
  disabled?: boolean;
};
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

type StyleMap = ReturnType<typeof styleMap>;
type TagRenderer = (style: StyleMap) => TemplateResult;

const tagRenderers: Record<TextTag, TagRenderer> = {
  span: (s) => html`<span style=${s}><slot></slot></span>`,
  p: (s) => html`<p style=${s}><slot></slot></p>`,
  h1: (s) => html`<h1 style=${s}><slot></slot></h1>`,
  h2: (s) => html`<h2 style=${s}><slot></slot></h2>`,
  h3: (s) => html`<h3 style=${s}><slot></slot></h3>`,
  h4: (s) => html`<h4 style=${s}><slot></slot></h4>`,
  h5: (s) => html`<h5 style=${s}><slot></slot></h5>`,
  h6: (s) => html`<h6 style=${s}><slot></slot></h6>`,
  label: (s) => html`<label style=${s}><slot></slot></label>`,
  strong: (s) => html`<strong style=${s}><slot></slot></strong>`,
  em: (s) => html`<em style=${s}><slot></slot></em>`,
  small: (s) => html`<small style=${s}><slot></slot></small>`,
};

export class DsText extends LitElement {
  static override readonly styles = textStyles;

  #styleObserver?: MutationObserver;

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

  @property({ type: String })
  accessor as: TextTag = 'span';

  override connectedCallback(): void {
    super.connectedCallback();
    this.#styleObserver = new MutationObserver(() => this.requestUpdate());
    this.#styleObserver.observe(this, { attributes: true, attributeFilter: ['style'] });
  }

  override disconnectedCallback(): void {
    this.#styleObserver?.disconnect();
    super.disconnectedCallback();
  }

  override render(): TemplateResult {
    const hostStyles = getInlineStyles(this);
    const componentStyles: Record<string, string> = {
      [dsTextVars.color]: resolveThemeColor(this.color, this.disabled ? 'disabled' : 'regular'),
      ...hostStyles,
    };

    const tagStyle = styleMap({ ...componentStyles });
    const renderTag = tagRenderers[this.as] ?? tagRenderers.span;
    return renderTag(tagStyle);
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
