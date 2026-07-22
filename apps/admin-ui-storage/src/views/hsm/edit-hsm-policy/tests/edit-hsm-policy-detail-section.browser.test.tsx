/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { HsmPolicyFromServer } from '../../../../../types';
import { HSMContext } from '../../hsm-context/hsm-context';
import type { HsmFormApi } from '../../types';
import { EditHsmPolicyDetailSection } from '../edit-hsm-policy-detail-section';
import { parseHsmQueryCriteria, parseHsmQueryVolumes, parseHsmType } from '../parse-hsm-policy';

const SERVER_NAME = 'mailstore1.test.com';

const SAMPLE_VOLUMES = [
  { id: 1, name: 'Primary Volume' },
  { id: 2, name: 'Secondary Volume' },
];

type FormStateSnapshot = {
  isAllEnabled: boolean;
  isMessageEnabled: boolean;
  isDocumentEnabled: boolean;
  isEventEnabled: boolean;
  isContactEnabled: boolean;
  policyCriteriaLength: number;
  sourceVolumeLength: number;
  destinationVolumeLength: number;
};

function TestWrapper({
  currentPolicy,
}: {
  currentPolicy?: HsmPolicyFromServer;
}): React.JSX.Element {
  const parsedTypes = parseHsmType(currentPolicy?.hsmType);
  const parsedCriteria = parseHsmQueryCriteria(currentPolicy?.hsmQuery);
  const parsedVolumes = parseHsmQueryVolumes(currentPolicy?.hsmQuery);
  const initialSourceVolume = SAMPLE_VOLUMES.filter(
    (v) => v?.id != null && parsedVolumes.sourceVolumeIds.includes(String(v.id)),
  );
  const initialDestinationVolume = SAMPLE_VOLUMES.filter(
    (v) => v?.id != null && parsedVolumes.destinationVolumeIds.includes(String(v.id)),
  );
  const form = useForm({
    defaultValues: {
      isAllEnabled: false,
      isMessageEnabled: parsedTypes.isMessageEnabled,
      isDocumentEnabled: parsedTypes.isDocumentEnabled,
      isEventEnabled: parsedTypes.isEventEnabled,
      isContactEnabled: parsedTypes.isContactEnabled,
      policyCriteria: parsedCriteria,
      sourceVolume: initialSourceVolume,
      destinationVolume: initialDestinationVolume,
    },
    onSubmit: async () => {},
  });

  const formValues = useSelector(form.store, (s) => s.values);

  return (
    <HSMContext.Provider
      value={{ form: form as unknown as HsmFormApi, allVolumes: SAMPLE_VOLUMES }}
    >
      <EditHsmPolicyDetailSection />
      <div data-testid="form-state" style={{ position: 'absolute', left: '-9999px' }}>
        {JSON.stringify({
          isAllEnabled: formValues.isAllEnabled,
          isMessageEnabled: formValues.isMessageEnabled,
          isDocumentEnabled: formValues.isDocumentEnabled,
          isEventEnabled: formValues.isEventEnabled,
          isContactEnabled: formValues.isContactEnabled,
          policyCriteriaLength: formValues.policyCriteria.length,
          sourceVolumeLength: formValues.sourceVolume.length,
          destinationVolumeLength: formValues.destinationVolume.length,
        })}
      </div>
    </HSMContext.Provider>
  );
}

function renderComponent(currentPolicy?: HsmPolicyFromServer): React.ReactElement {
  return (
    <Routes>
      <Route path="/:server/hsm-settings" element={<TestWrapper currentPolicy={currentPolicy} />} />
    </Routes>
  );
}

function getFormState(): FormStateSnapshot {
  const el = document.querySelector('[data-testid="form-state"]');
  return JSON.parse(el?.textContent ?? '{}') as FormStateSnapshot;
}

describe('EditHsmPolicyDetailSection (browser)', () => {
  describe('Rendering', () => {
    it('should render the Items section header', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Items', { exact: true })).toBeVisible();
    });

    it('should render the Criteria section header', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Criteria', { exact: true })).toBeVisible();
    });

    it('should render the Server label', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Server', { exact: true })).toBeVisible();
    });

    it('should render the server name value from route params', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText(SERVER_NAME, { exact: true })).toBeVisible();
    });
  });

  describe('Item type checkboxes', () => {
    it('should render the All checkbox label', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('All', { exact: true })).toBeVisible();
    });

    it('should render the Message checkbox label', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Message', { exact: true })).toBeVisible();
    });

    it('should render the Document checkbox label', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Document', { exact: true })).toBeVisible();
    });

    it('should render the Event checkbox label', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Event', { exact: true })).toBeVisible();
    });

    it('should render the Contact checkbox label', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Contact', { exact: true })).toBeVisible();
    });
  });

  describe('Criteria section', () => {
    it('should render the Option select label', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Option', { exact: true })).toBeVisible();
    });

    it('should render the Add button', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByRole('button', { name: /add/i })).toBeVisible();
    });

    it('should render the Policy Criteria table header', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await expect.element(page.getByText('Policy Criteria', { exact: true })).toBeVisible();
    });

    it('should show zero criteria items initially', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await vi.waitFor(() => {
        expect(getFormState().policyCriteriaLength).toBe(0);
      });
    });
  });

  describe('Interactions', () => {
    it('should enable all item types when All checkbox is clicked', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });

      await expect.element(page.getByText('Items', { exact: true })).toBeVisible();
      expect(getFormState().isAllEnabled).toBe(false);

      await page.getByText('All', { exact: true }).click();

      await vi.waitFor(() => {
        const state = getFormState();
        expect(state.isAllEnabled).toBe(true);
        expect(state.isMessageEnabled).toBe(true);
        expect(state.isDocumentEnabled).toBe(true);
        expect(state.isEventEnabled).toBe(true);
        expect(state.isContactEnabled).toBe(true);
      });
    });

    it('should toggle Message type when Message checkbox is clicked', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });

      await expect.element(page.getByText('Message', { exact: true })).toBeVisible();
      expect(getFormState().isMessageEnabled).toBe(false);

      await page.getByText('Message', { exact: true }).click();

      await vi.waitFor(() => {
        expect(getFormState().isMessageEnabled).toBe(true);
        expect(getFormState().isAllEnabled).toBe(false);
      });
    });
  });

  describe('Policy parsing from currentPolicy', () => {
    it('should parse hsmType=[5] and set isMessageEnabled', async () => {
      await setupBrowserTest(renderComponent({ hsmType: [5], hsmQuery: '' }), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });

      await vi.waitFor(() => {
        const state = getFormState();
        expect(state.isMessageEnabled).toBe(true);
        expect(state.isDocumentEnabled).toBe(false);
        expect(state.isEventEnabled).toBe(false);
        expect(state.isContactEnabled).toBe(false);
      });
    });

    it('should parse hsmType=[8] and set isDocumentEnabled', async () => {
      await setupBrowserTest(renderComponent({ hsmType: [8], hsmQuery: '' }), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });

      await vi.waitFor(() => {
        const state = getFormState();
        expect(state.isDocumentEnabled).toBe(true);
        expect(state.isMessageEnabled).toBe(false);
      });
    });

    it('should parse hsmType with all four types and enable each', async () => {
      await setupBrowserTest(renderComponent({ hsmType: [5, 8, 11, 6], hsmQuery: '' }), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });

      await vi.waitFor(() => {
        const state = getFormState();
        expect(state.isMessageEnabled).toBe(true);
        expect(state.isDocumentEnabled).toBe(true);
        expect(state.isEventEnabled).toBe(true);
        expect(state.isContactEnabled).toBe(true);
      });
    });

    it('should parse hsmQuery criteria into policyCriteria', async () => {
      await setupBrowserTest(
        renderComponent({
          hsmType: [5],
          hsmQuery: 'before:-30days after:-60months',
        }),
        { initialRouterEntry: `/${SERVER_NAME}/hsm-settings` },
      );

      await vi.waitFor(() => {
        expect(getFormState().policyCriteriaLength).toBe(2);
      });
    });
  });

  describe('Criteria add/delete interactions', () => {
    it('adds a criteria when the Add button is clicked', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await vi.waitFor(() => {
        expect(getFormState().policyCriteriaLength).toBe(0);
      });
      await page.getByRole('button', { name: /^add$/i }).click();
      await vi.waitFor(() => {
        expect(getFormState().policyCriteriaLength).toBe(1);
      });
    });

    it('parses source and destination volumes from hsmQuery', async () => {
      await setupBrowserTest(
        renderComponent({
          hsmType: [5],
          hsmQuery: 'before:-30d source:1 destination:2',
        }),
        { initialRouterEntry: `/${SERVER_NAME}/hsm-settings` },
      );
      await vi.waitFor(() => {
        const state = getFormState();
        expect(state.sourceVolumeLength).toBe(1);
        expect(state.destinationVolumeLength).toBe(1);
      });
    });
  });

  describe('Individual item type toggles', () => {
    it('toggles Document type on via checkbox click', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await page.getByText('Document', { exact: true }).click();
      await vi.waitFor(() => {
        expect(getFormState().isDocumentEnabled).toBe(true);
      });
    });

    it('toggles Contact type on via checkbox click', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await page.getByText('Contact', { exact: true }).click();
      await vi.waitFor(() => {
        expect(getFormState().isContactEnabled).toBe(true);
      });
    });

    it('toggles Event type on via checkbox click', async () => {
      await setupBrowserTest(renderComponent(), {
        initialRouterEntry: `/${SERVER_NAME}/hsm-settings`,
      });
      await page.getByText('Event', { exact: true }).click();
      await vi.waitFor(() => {
        expect(getFormState().isEventEnabled).toBe(true);
      });
    });
  });
});
