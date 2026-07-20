/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  advancedSupportedApiForBrowser,
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  createBrowserZextrasActionInterceptor,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { Volume } from '../../../../../types';
import { DATA_VOLUMES } from '../../../../constants';
import { ModifyVolume } from '../modify-volume';

const SERVER_NAME = 'mailstore1.test.com';
const SERVER_ID = 'server-1';
const VOLUME_ROUTE_ENTRY = `/${SERVER_NAME}/${DATA_VOLUMES}`;

type S3ConnectorEntry = {
  uuid: string;
  label: string;
  bucketName: string;
  storeType: string;
  tieringSupported?: boolean;
  'usage in external backup'?: string;
};

function setupListS3ConnectorInterceptor(connectors: Array<S3ConnectorEntry>) {
  return createBrowserZextrasActionInterceptor('listS3Connector', () =>
    HttpResponse.json({
      Body: {
        response: {
          content: JSON.stringify({
            ok: true,
            response: {
              values: connectors.map((connector) => ({
                ...connector,
                id: connector.uuid,
              })),
            },
          }),
        },
      },
    }),
  );
}

const PRIMARY_VOLUME: Volume = {
  id: 5,
  name: 'primary-local',
  path: '/opt/zextras/store',
  type: 1,
  compressBlobs: 'true',
  compressionThreshold: '4096',
  isCurrent: true,
};

const SECONDARY_VOLUME: Volume = {
  id: 6,
  name: 'secondary-local',
  path: '/opt/zextras/secondary',
  type: 2,
  compressBlobs: 'false',
  compressionThreshold: '4096',
  isCurrent: false,
};

const INDEX_VOLUME: Volume = {
  id: 7,
  name: 'index-local',
  path: '/opt/zextras/index',
  type: 10,
  compressBlobs: 'false',
  compressionThreshold: '4096',
  isCurrent: true,
};

const VOLUME_LIST = {
  primaries: [PRIMARY_VOLUME],
  secondaries: [SECONDARY_VOLUME],
  indexes: [INDEX_VOLUME],
};

function renderModifyVolume(
  volumeId: number,
  volumeList = VOLUME_LIST,
  overrides?: Partial<{
    setmodifyVolumeToggle: (v: boolean) => void;
    getAllVolumesRequest: () => void;
    setOpen: (v: boolean) => void;
  }>,
) {
  const setmodifyVolumeToggle = overrides?.setmodifyVolumeToggle ?? vi.fn();
  const getAllVolumesRequest = overrides?.getAllVolumesRequest ?? vi.fn();
  const setOpen = overrides?.setOpen ?? vi.fn();

  return (
    <Routes>
      <Route
        path={`/:server/${DATA_VOLUMES}`}
        element={
          <ModifyVolume
            volumeId={volumeId}
            setmodifyVolumeToggle={setmodifyVolumeToggle}
            getAllVolumesRequest={getAllVolumesRequest}
            selectedServerId={SERVER_ID}
            volumeList={volumeList}
            setOpen={setOpen}
          />
        }
      />
    </Routes>
  );
}

beforeEach(() => {
  setupListS3ConnectorInterceptor([]);
  createBrowserSoapAPIInterceptor('GetVolume', { volume: [] });
  createBrowserSoapAPIInterceptor('GetAllVolumes', { volume: [], _jsns: 'urn:zimbraAdmin' });
  createBrowserSoapAPIInterceptor('GetAllServers', {
    server: [
      {
        id: 'server-1',
        name: 'mailstore1.test.com',
        a: [{ n: 'zimbraServiceHostname', _content: 'mailstore1.test.com' }],
      },
    ],
  });
});

describe('ModifyVolume - getVolumeDetailData (advanced mode)', () => {
  describe('advanced mode: loads volume data from volumeList without API call', () => {
    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedSupported();
    });

    it('should display primary volume name when volumeId matches a primary volume', async () => {
      await setupBrowserTest(renderModifyVolume(PRIMARY_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect
        .element(page.getByText(`${PRIMARY_VOLUME.name} Details`, { exact: true }))
        .toBeVisible();
    });

    it('should display secondary volume name when volumeId matches a secondary volume', async () => {
      await setupBrowserTest(renderModifyVolume(SECONDARY_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect
        .element(page.getByText(`${SECONDARY_VOLUME.name} Details`, { exact: true }))
        .toBeVisible();
    });

    it('should display index volume name when volumeId matches an index volume', async () => {
      await setupBrowserTest(renderModifyVolume(INDEX_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect
        .element(page.getByText(`${INDEX_VOLUME.name} Details`, { exact: true }))
        .toBeVisible();
    });

    it('should display the volume path for a matched primary volume', async () => {
      await setupBrowserTest(renderModifyVolume(PRIMARY_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect
        .element(page.getByRole('textbox', { name: /path/i }))
        .toHaveValue(PRIMARY_VOLUME.path as string);
    });

    it('should not call setmodifyVolumeToggle when volumeId does not match any volume', async () => {
      const setmodifyVolumeToggle = vi.fn();
      await setupBrowserTest(renderModifyVolume(9999, VOLUME_LIST, { setmodifyVolumeToggle }), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      // No match: toggle should not have been called with true
      expect(setmodifyVolumeToggle).not.toHaveBeenCalledWith(true);
    });

    it('should render the Volume Name input with the correct value for secondary volume', async () => {
      await setupBrowserTest(renderModifyVolume(SECONDARY_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect
        .element(page.getByRole('textbox', { name: /volume name/i }))
        .toHaveValue(SECONDARY_VOLUME.name as string);
    });

    it('should render the Volume Name input with the correct value for index volume', async () => {
      await setupBrowserTest(renderModifyVolume(INDEX_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect
        .element(page.getByRole('textbox', { name: /volume name/i }))
        .toHaveValue(INDEX_VOLUME.name as string);
    });
  });

  describe('external S3 volume tiering', () => {
    const EXTERNAL_S3_VOLUME: Volume = {
      id: 9,
      name: 's3primary',
      compressed: true,
      uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
      tieringSupported: true,
      useInfrequentAccess: false,
      infrequentAccessThreshold: 65536,
      useIntelligentTiering: false,
      volumePrefix: '',
      centralized: false,
      storeType: 'S3',
      isCurrent: false,
      volumeType: 'primary',
    };

    const EXTERNAL_VOLUME_LIST = {
      primaries: [EXTERNAL_S3_VOLUME],
      secondaries: [SECONDARY_VOLUME],
      indexes: [INDEX_VOLUME],
    };

    let listS3ConnectorInterceptor: ReturnType<typeof setupListS3ConnectorInterceptor>;

    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedSupported();
      listS3ConnectorInterceptor = setupListS3ConnectorInterceptor([
        {
          uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
          label: 'Tiering S3 connector',
          bucketName: 'tiering-bucket',
          storeType: 'S3',
          tieringSupported: true,
          'usage in external backup': 'unused',
        },
      ]);
    });

    it('should display tiering controls for external S3 volume with tiering support', async () => {
      await setupBrowserTest(
        renderModifyVolume(EXTERNAL_S3_VOLUME.id as number, EXTERNAL_VOLUME_LIST),
        { initialRouterEntry: VOLUME_ROUTE_ENTRY },
      );
      await vi.waitFor(() => {
        expect(listS3ConnectorInterceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
      });
      await expect.element(page.getByText('Use infrequent access', { exact: true })).toBeVisible();
      await expect
        .element(page.getByText('Use intelligent tiering', { exact: true }))
        .toBeVisible();
    });
  });
});

describe('GetVolume failure (non-advanced mode)', () => {
  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedNotSupported();
  });

  it('should show error snackbar and refresh volume list when GetVolume fails', async () => {
    await createBrowserAPIInterceptor('post', '/service/admin/soap/GetVolumeRequest', () =>
      HttpResponse.json({ Body: { Fault: { Code: 'Error', Reason: { Text: 'fail' } } } }),
    );

    const setmodifyVolumeToggle = vi.fn();
    const getAllVolumesRequest = vi.fn();

    await setupBrowserTest(
      renderModifyVolume(
        42,
        { primaries: [], secondaries: [], indexes: [] },
        {
          setmodifyVolumeToggle,
          getAllVolumesRequest,
        },
      ),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    // soapFetch retries 3 times (~7s of backoff) before the error propagates
    await vi.waitFor(
      () => {
        expect(getAllVolumesRequest).toHaveBeenCalled();
      },
      { timeout: 15_000 },
    );

    await expect.element(page.getByText('Something went wrong, please try again')).toBeVisible();
    expect(setmodifyVolumeToggle).not.toHaveBeenCalledWith(true);
  }, 25_000);
});

describe('external volume - disabled radios', () => {
  const EXTERNAL_S3_VOLUME: Volume = {
    id: 9,
    name: 's3primary',
    uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
    tieringSupported: true,
    useInfrequentAccess: false,
    infrequentAccessThreshold: 65536,
    useIntelligentTiering: false,
    volumePrefix: '',
    storeType: 'S3',
    isCurrent: false,
    volumeType: 'primary',
  };

  const EXTERNAL_VOLUME_LIST = {
    primaries: [EXTERNAL_S3_VOLUME],
    secondaries: [],
    indexes: [],
  };

  let listS3ConnectorInterceptor: ReturnType<typeof setupListS3ConnectorInterceptor>;

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    listS3ConnectorInterceptor = setupListS3ConnectorInterceptor([
      {
        uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
        label: 'Tiering S3 connector',
        bucketName: 'tiering-bucket',
        storeType: 'S3',
        tieringSupported: true,
        'usage in external backup': 'unused',
      },
    ]);
  });

  it('should disable primary and secondary volume type radios for external volumes', async () => {
    await setupBrowserTest(
      renderModifyVolume(EXTERNAL_S3_VOLUME.id as number, EXTERNAL_VOLUME_LIST),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await vi.waitFor(() => {
      expect(listS3ConnectorInterceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
    });

    await expect
      .element(page.getByRole('radio', { name: /this is a primary volume/i }))
      .toBeDisabled();
    await expect
      .element(page.getByRole('radio', { name: /this is a secondary volume/i }))
      .toBeDisabled();
  });
});

describe('tiering switches not rendered', () => {
  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
  });

  it('should not render tiering switches when volume tieringSupported is false', async () => {
    const NON_TIERING_VOLUME: Volume = {
      id: 6,
      name: 'cephprimary',
      uuid: '09dd7b71-23f0-47f2-b580-5593f3aaabe8',
      tieringSupported: false,
      useInfrequentAccess: false,
      infrequentAccessThreshold: 65536,
      useIntelligentTiering: false,
      volumePrefix: '',
      storeType: 'S3',
      isCurrent: false,
      volumeType: 'primary',
    };

    const listS3ConnectorInterceptor = setupListS3ConnectorInterceptor([
      {
        uuid: '09dd7b71-23f0-47f2-b580-5593f3aaabe8',
        label: 'S3 connector',
        bucketName: 's3-bucket',
        storeType: 'S3',
        tieringSupported: false,
        'usage in external backup': 'unused',
      },
    ]);

    await setupBrowserTest(
      renderModifyVolume(NON_TIERING_VOLUME.id as number, {
        primaries: [NON_TIERING_VOLUME],
        secondaries: [],
        indexes: [],
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await vi.waitFor(() => {
      expect(listS3ConnectorInterceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
    });

    expect(page.getByText('Use infrequent access', { exact: true }).elements()).toHaveLength(0);
    expect(page.getByText('Use intelligent tiering', { exact: true }).elements()).toHaveLength(0);
  });

  it('should not render tiering switches when connector does not support tiering', async () => {
    const TIERING_VOLUME: Volume = {
      id: 9,
      name: 's3primary',
      uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
      tieringSupported: true,
      useInfrequentAccess: false,
      infrequentAccessThreshold: 65536,
      useIntelligentTiering: false,
      volumePrefix: '',
      storeType: 'S3',
      isCurrent: false,
      volumeType: 'primary',
    };

    const listS3ConnectorInterceptor = setupListS3ConnectorInterceptor([
      {
        uuid: '0d2224db-66c2-4995-8a91-de04f06d7ac1',
        label: 'S3 connector',
        bucketName: 's3-bucket',
        storeType: 'S3',
        tieringSupported: false,
        'usage in external backup': 'unused',
      },
    ]);

    await setupBrowserTest(
      renderModifyVolume(TIERING_VOLUME.id as number, {
        primaries: [TIERING_VOLUME],
        secondaries: [],
        indexes: [],
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await vi.waitFor(() => {
      expect(listS3ConnectorInterceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
    });

    expect(page.getByText('Use infrequent access', { exact: true }).elements()).toHaveLength(0);
    expect(page.getByText('Use intelligent tiering', { exact: true }).elements()).toHaveLength(0);
  });
});

describe('tiering hidden on bucket change', () => {
  const TIERING_VOLUME: Volume = {
    id: 100,
    name: 'external-volume',
    uuid: 'bucket-tiering',
    tieringSupported: true,
    useInfrequentAccess: false,
    infrequentAccessThreshold: 65536,
    useIntelligentTiering: false,
    volumePrefix: '',
    storeType: 'S3',
    isCurrent: false,
    volumeType: 'primary',
  };

  let listS3ConnectorInterceptor: ReturnType<typeof setupListS3ConnectorInterceptor>;

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    listS3ConnectorInterceptor = setupListS3ConnectorInterceptor([
      {
        uuid: 'bucket-tiering',
        label: 'Tiering connector',
        bucketName: 'tiering-bucket',
        storeType: 'S3',
        tieringSupported: true,
        'usage in external backup': 'unused',
      },
      {
        uuid: 'bucket-no-tiering',
        label: 'Non-tiering connector',
        bucketName: 'non-tiering-bucket',
        storeType: 'Ceph',
        tieringSupported: false,
        'usage in external backup': 'unused',
      },
    ]);
  });

  it('should hide tiering switches when bucket changes to non-tiering connector', async () => {
    await setupBrowserTest(
      renderModifyVolume(TIERING_VOLUME.id as number, {
        primaries: [TIERING_VOLUME],
        secondaries: [],
        indexes: [],
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await vi.waitFor(() => {
      expect(listS3ConnectorInterceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
    });

    // Verify tiering switches are initially visible
    await expect.element(page.getByText('Use infrequent access', { exact: true })).toBeVisible();

    // Open the bucket select dropdown via DOM (custom web-component select)
    const selectTrigger = Array.from(document.querySelectorAll('div[tabindex="0"]')).find((el) =>
      el.textContent?.includes('Available Buckets List'),
    ) as HTMLElement | undefined;
    expect(selectTrigger).toBeTruthy();
    selectTrigger?.click();

    // Wait for the dropdown item to appear, then click the non-tiering option
    await vi.waitFor(() => {
      const items = document.querySelectorAll('[data-testid="dropdown-item"]');
      expect(items.length).toBeGreaterThan(0);
    });
    const dropdownItems = Array.from(document.querySelectorAll('[data-testid="dropdown-item"]'));
    const nonTieringItem = dropdownItems.find((el) =>
      el.textContent?.includes('Non-tiering connector'),
    ) as HTMLElement | undefined;
    nonTieringItem?.click();

    // Verify tiering switches are no longer visible
    await vi.waitFor(() => {
      expect(page.getByText('Use infrequent access', { exact: true }).elements()).toHaveLength(0);
    });
    expect(page.getByText('Use intelligent tiering', { exact: true }).elements()).toHaveLength(0);
  });
});

describe('advanced save', () => {
  const ADVANCED_LOCAL_VOLUME: Volume = {
    id: 5,
    name: 'primary-local',
    path: '/opt/zextras/store',
    type: 1,
    compressBlobs: 'true',
    compressionThreshold: '4096',
    isCurrent: true,
    volumeType: 'primary',
  };

  const ADVANCED_VOLUME_LIST = {
    primaries: [ADVANCED_LOCAL_VOLUME],
    secondaries: [],
    indexes: [],
  };

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
  });

  it('should call doUpdateVolume and show success snackbar on successful save', async () => {
    const doUpdateVolumeInterceptor = createBrowserZextrasActionInterceptor('doUpdateVolume', () =>
      HttpResponse.json({
        Body: {
          response: {
            content: JSON.stringify({
              ok: true,
              response: { [SERVER_NAME]: { ok: true } },
            }),
          },
        },
      }),
    );

    const setmodifyVolumeToggle = vi.fn();
    const getAllVolumesRequest = vi.fn();

    await setupBrowserTest(
      renderModifyVolume(ADVANCED_LOCAL_VOLUME.id as number, ADVANCED_VOLUME_LIST, {
        setmodifyVolumeToggle,
        getAllVolumesRequest,
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    // Make the form dirty by changing the volume name
    await page.getByRole('textbox', { name: /volume name/i }).fill('primary-local-updated');

    // Click Save
    await page.getByRole('button', { name: /^save$/i }).click();

    await vi.waitFor(() => {
      expect(doUpdateVolumeInterceptor.getCalledTimes()).toBeGreaterThanOrEqual(1);
    });

    await expect.element(page.getByText('All changes have been saved successfully')).toBeVisible();
    expect(getAllVolumesRequest).toHaveBeenCalled();
    expect(setmodifyVolumeToggle).toHaveBeenCalledWith(false);
  });

  it('should show error snackbar when advanced update response is not ok', async () => {
    createBrowserZextrasActionInterceptor('doUpdateVolume', () =>
      HttpResponse.json({
        Body: {
          response: {
            content: JSON.stringify({
              ok: true,
              response: { [SERVER_NAME]: { ok: false } },
            }),
          },
        },
      }),
    );

    const setmodifyVolumeToggle = vi.fn();

    await setupBrowserTest(
      renderModifyVolume(ADVANCED_LOCAL_VOLUME.id as number, ADVANCED_VOLUME_LIST, {
        setmodifyVolumeToggle,
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await page.getByRole('textbox', { name: /volume name/i }).fill('primary-local-updated');
    await page.getByRole('button', { name: /^save$/i }).click();

    await expect.element(page.getByText('Something went wrong, please try again')).toBeVisible();
    expect(setmodifyVolumeToggle).toHaveBeenCalledWith(false);
  });

  it('should show error snackbar when fetchSoap throws during advanced save', async () => {
    createBrowserZextrasActionInterceptor('doUpdateVolume', () =>
      HttpResponse.json({
        Body: {
          Fault: { Code: 'Error', Reason: { Text: 'network error' } },
        },
      }),
    );

    const setmodifyVolumeToggle = vi.fn();

    await setupBrowserTest(
      renderModifyVolume(ADVANCED_LOCAL_VOLUME.id as number, ADVANCED_VOLUME_LIST, {
        setmodifyVolumeToggle,
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await page.getByRole('textbox', { name: /volume name/i }).fill('primary-local-updated');
    await page.getByRole('button', { name: /^save$/i }).click();

    // fetchSoap retries 3 times (~7s of backoff) before the error propagates
    await vi.waitFor(
      () => {
        expect(setmodifyVolumeToggle).toHaveBeenCalledWith(false);
      },
      { timeout: 15_000 },
    );
    await expect.element(page.getByText('Something went wrong, please try again')).toBeVisible();
  }, 25_000);
});
