/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '../theme/theme.css';
import './ds-icon';
import './ds-text';

import { css, html, LitElement, nothing, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

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
  static override readonly styles = css`
    :host {
      display: block;
      font-family: var(--font-family);
    }

    ol {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .step {
      display: grid;
      grid-template-columns: 2rem 1fr;
      column-gap: 0.75rem;
    }

    .indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .circle {
      width: 2rem;
      height: 2rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      flex-shrink: 0;
      border: 0.0625rem solid var(--color-primary-regular);
      background-color: var(--color-gray6-regular);
      color: var(--color-primary-regular);
      font-size: var(--font-size-small);
      font-weight: var(--font-weight-medium);
    }

    .step[data-state='active'] .circle,
    .step[data-state='completed'] .circle {
      background-color: var(--color-primary-regular);
      color: var(--color-white);
    }

    .connector {
      flex: 1 1 auto;
      width: 0.125rem;
      min-height: 1rem;
      margin: 0.25rem 0;
      background-color: var(--color-primary-regular);
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding-bottom: 1rem;
    }

    .step:last-child .body {
      padding-bottom: 0;
    }
  `;

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
