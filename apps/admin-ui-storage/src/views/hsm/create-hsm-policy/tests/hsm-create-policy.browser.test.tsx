/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { Volume } from '../../../../../types';
import { HSMContext } from '../../hsm-context/hsm-context';
import { HSMcreatePolicy } from '../hsm-create-policy';

const SAMPLE_VOLUMES: Array<Volume> = [
  { id: 1, name: 'Primary Volume', type: 1, isCurrent: true },
  { id: 2, name: 'Secondary Volume', type: 2, isCurrent: false },
];

type FormValues = {
  isAllEnabled: boolean;
  isMessageEnabled: boolean;
  isEventEnabled: boolean;
  isContactEnabled: boolean;
  isDocumentEnabled: boolean;
  policyCriteria: Array<{
    option: string;
    dateScale: string;
    scale: string;
  }>;
  sourceVolume: Array<Volume>;
  destinationVolume: Array<Volume>;
};

type TestHarnessProps = {
  initialFormValues?: Partial<FormValues>;
  allVolumes?: Array<Volume>;
};

function TestHarness({ initialFormValues, allVolumes = SAMPLE_VOLUMES }: TestHarnessProps) {
  const form = useForm({
    defaultValues: {
      isAllEnabled: false,
      isMessageEnabled: false,
      isEventEnabled: false,
      isContactEnabled: false,
      isDocumentEnabled: false,
      policyCriteria: [],
      sourceVolume: [],
      destinationVolume: [],
      ...initialFormValues,
    },
    onSubmit: async () => {},
  });

  return (
    <HSMContext.Provider value={{ form, allVolumes }}>
      <HSMcreatePolicy />
    </HSMContext.Provider>
  );
}

describe('HSMcreatePolicy (browser)', () => {
  describe('Rendering', () => {
    it('renders the New Policy Summary heading', async () => {
      await setupBrowserTest(<TestHarness />);
      await expect.element(page.getByText('New Policy Summary', { exact: true })).toBeVisible();
    });

    it('renders the Parameters label', async () => {
      await setupBrowserTest(<TestHarness />);
      await expect.element(page.getByText('Parameters', { exact: true })).toBeVisible();
    });

    it('renders the Source Volume label', async () => {
      await setupBrowserTest(<TestHarness />);
      await expect.element(page.getByText('Source Volume', { exact: true })).toBeVisible();
    });

    it('renders the Destination Volume label', async () => {
      await setupBrowserTest(<TestHarness />);
      await expect.element(page.getByText('Destination Volume', { exact: true })).toBeVisible();
    });
  });

  describe('Query string rendering', () => {
    it('renders all-types query string when isAllEnabled is true', async () => {
      await setupBrowserTest(
        <TestHarness
          initialFormValues={{
            isAllEnabled: true,
            isDocumentEnabled: true,
            isMessageEnabled: true,
            isContactEnabled: true,
            isEventEnabled: true,
          }}
        />,
      );
      await expect
        .element(page.getByText('document,message,contact,appointment', { exact: true }))
        .toBeVisible();
    });

    it('renders selected individual types when isAllEnabled is false', async () => {
      await setupBrowserTest(
        <TestHarness
          initialFormValues={{
            isMessageEnabled: true,
            isContactEnabled: true,
          }}
        />,
      );
      await expect.element(page.getByText('message,contact', { exact: true })).toBeVisible();
    });

    it('renders criteria appended to the query string', async () => {
      await setupBrowserTest(
        <TestHarness
          initialFormValues={{
            isMessageEnabled: true,
            policyCriteria: [{ option: 'before', dateScale: '30', scale: 'days' }],
          }}
        />,
      );
      await expect.element(page.getByText('message:before:-30days', { exact: true })).toBeVisible();
    });

    it('renders source and destination volume ids in the query string', async () => {
      await setupBrowserTest(
        <TestHarness
          initialFormValues={{
            isAllEnabled: true,
            sourceVolume: [{ id: 1, name: 'Primary Volume' }],
            destinationVolume: [{ id: 2, name: 'Secondary Volume' }],
          }}
        />,
      );
      await expect
        .element(
          page.getByText('document,message,contact,appointment source: 1 destination: 2', {
            exact: true,
          }),
        )
        .toBeVisible();
    });
  });

  describe('Volume name rendering', () => {
    it('renders source volume names joined together', async () => {
      await setupBrowserTest(
        <TestHarness
          initialFormValues={{
            sourceVolume: [
              { id: 1, name: 'Primary Volume' },
              { id: 2, name: 'Secondary Volume' },
            ],
          }}
        />,
      );
      await expect
        .element(page.getByText('Primary Volume,Secondary Volume', { exact: true }))
        .toBeVisible();
    });

    it('renders destination volume names joined together', async () => {
      await setupBrowserTest(
        <TestHarness
          initialFormValues={{
            destinationVolume: [{ id: 2, name: 'Secondary Volume' }],
          }}
        />,
      );
      await expect.element(page.getByText('Secondary Volume', { exact: true })).toBeVisible();
    });

    it('renders empty values when no volumes are selected', async () => {
      await setupBrowserTest(<TestHarness />);
      const labeledValues = page.getByText('', { exact: true }).elements();
      expect(labeledValues.length).toBeGreaterThan(0);
    });
  });
});
