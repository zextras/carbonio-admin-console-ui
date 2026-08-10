/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { css } from 'lit';

export const stepperStyles = css`
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
