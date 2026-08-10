/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';
import './ds-icon';
import './ds-text';

import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import { stepperStyles } from './ds-stepper.styles';

export type DsStepperStep = {
  label: string;
  description?: string;
};

export type DsStepperProps = {
  steps?: Array<DsStepperStep>;
  current?: number;
};

type StepState = 'completed' | 'active' | 'upcoming';

export class DsStepper extends LitElement {
  static override readonly styles = stepperStyles;

  @property({ attribute: false })
  accessor steps: DsStepperProps['steps'] = [];

  @property({ type: Number, reflect: true })
  accessor current: DsStepperProps['current'] = 0;

  private getState(index: number): StepState {
    const current = this.current ?? 0;
    if (index < current) return 'completed';
    if (index === current) return 'active';
    return 'upcoming';
  }

  override render(): TemplateResult {
    const steps = this.steps ?? [];
    return html`
      <ol>
        ${steps.map((step, index) => {
          const state = this.getState(index);
          const isLast = index === steps.length - 1;
          const isActive = state === 'active';
          return html`
            <li class="step" data-state=${state} aria-current=${isActive ? 'step' : nothing}>
              <div class="indicator">
                <div class="circle">
                  ${state === 'completed'
                    ? html`<ds-icon icon="Checkmark" color="white" size="small"></ds-icon>`
                    : html`<span>${index + 1}</span>`}
                </div>
                ${isLast ? nothing : html`<div class="connector"></div>`}
              </div>
              <div class="body">
                <ds-text
                  as="h3"
                  size="medium"
                  overflow="break-word"
                  weight=${isActive ? 'bold' : 'regular'}
                  color=${isActive ? 'primary' : 'text'}
                >
                  ${step.label}
                </ds-text>
                ${step.description
                  ? html`<ds-text as="p" overflow="break-word" size="small" color="gray1">
                      ${step.description}
                    </ds-text>`
                  : nothing}
              </div>
            </li>
          `;
        })}
      </ol>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-stepper': DsStepper;
  }
}

if (!customElements.get('ds-stepper')) {
  customElements.define('ds-stepper', DsStepper);
}
