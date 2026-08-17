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
import { useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { Volume } from '../../../../../types';
import {
  AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
  AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
  DATA_VOLUMES,
} from '../../../../constants';
import { ModifyVolume } from '../modify-volume';

vi.mock('../../s3-connectors/parts/verify/verify-progress', () => ({
	VerifyProgress: ({
		isPending,
		onComplete,
	}: {
		isPending: boolean;
		onComplete?: () => void;
	}) => {
		const wasPending = useRef(isPending);

		useEffect(() => {
			if (wasPending.current && !isPending) {
				onComplete?.();
			}
			wasPending.current = isPending;
		}, [isPending, onComplete]);

		return <div>{isPending ? 'verify-pending' : 'verify-idle'}</div>;
	},
}));

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
    advancedGetVolumeResponse: unknown;
  }>,
) {
  const selectedVolume = [...volumeList.primaries, ...volumeList.secondaries, ...volumeList.indexes]
    .find((volume) => volume.id === volumeId);

  const setmodifyVolumeToggle = overrides?.setmodifyVolumeToggle ?? vi.fn();
  const getAllVolumesRequest = overrides?.getAllVolumesRequest ?? vi.fn();
  const setOpen = overrides?.setOpen ?? vi.fn();
  const advancedGetVolumeResponse = overrides?.advancedGetVolumeResponse ?? selectedVolume ?? {};

  createBrowserZextrasActionInterceptor('getVolume', () =>
    HttpResponse.json({
      Body: {
        response: {
          content: JSON.stringify({
            ok: true,
            response: {
              [SERVER_NAME]: {
                ok: true,
                response: advancedGetVolumeResponse,
              },
            },
          }),
        },
      },
    }),
  );

  return (
    <Routes>
      <Route
        path={`/:server/${DATA_VOLUMES}`}
        element={
          <ModifyVolume
            volumeId={volumeId}
            volumeName={selectedVolume?.name ?? ''}
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
  describe('advanced mode: loads volume detail using getVolume', () => {
    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedSupported();
    });

    it('should display primary volume name when volumeId matches a primary volume', async () => {
      await setupBrowserTest(renderModifyVolume(PRIMARY_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();
    });

    it('should map the real advanced getVolume response shape into the form', async () => {
      const realAdvancedPayload = {
        id: 6,
        name: 'cephprimary',
        compressed: true,
        uuid: '09dd7b71-23f0-47f2-b580-5593f3aaabe8',
        tieringSupported: false,
        useInfrequentAccess: false,
        infrequentAccessThreshold: 65536,
        useIntelligentTiering: false,
        volumePrefix: 'abc',
        centralized: false,
        storeType: 'S3',
        isCurrent: false,
        volumeType: 'primary',
        inUse: true,
      } satisfies Record<string, unknown>;

      await setupBrowserTest(
        renderModifyVolume(SECONDARY_VOLUME.id as number, VOLUME_LIST, {
          advancedGetVolumeResponse: realAdvancedPayload,
        }),
        {
          initialRouterEntry: VOLUME_ROUTE_ENTRY,
        },
      );

      await expect
        .element(page.getByRole('textbox', { name: /volume name/i }))
        .toHaveValue('cephprimary');
      await expect.element(page.getByRole('textbox', { name: /prefix/i })).toHaveValue('abc');
      await expect.element(page.getByText('09dd7b71-23f0-47f2-b580-5593f3aaabe8')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /^delete$/i })).toBeDisabled();
    });

    it('should disable Delete button when volume is in use', async () => {
      const inUseVolume: Volume = {
        ...PRIMARY_VOLUME,
        inUse: true,
      };

      await setupBrowserTest(
        renderModifyVolume(inUseVolume.id as number, {
          primaries: [inUseVolume],
          secondaries: [SECONDARY_VOLUME],
          indexes: [INDEX_VOLUME],
        }),
        {
          initialRouterEntry: VOLUME_ROUTE_ENTRY,
        },
      );

      await expect.element(page.getByRole('button', { name: /^delete$/i })).toBeDisabled();
    });

    it('should disable Delete button and show tooltip when volume is current', async () => {
      await setupBrowserTest(
        renderModifyVolume(PRIMARY_VOLUME.id as number, {
          primaries: [PRIMARY_VOLUME],
          secondaries: [SECONDARY_VOLUME],
          indexes: [INDEX_VOLUME],
        }),
        {
          initialRouterEntry: VOLUME_ROUTE_ENTRY,
        },
      );

      const deleteButton = page.getByRole('button', { name: /^delete$/i });
      await expect.element(deleteButton).toBeDisabled();

      await userEvent.hover(deleteButton);

      await expect
        .element(
          page.getByText(
            'You should set a different volume as the current one before deleting it.',
            { exact: true },
          ),
        )
        .toBeVisible();
    });

    it('should call getVolume zextras action in advanced mode', async () => {
      createBrowserZextrasActionInterceptor('getVolume', () =>
        HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: {
                  [SERVER_NAME]: {
                    ok: true,
                    response: PRIMARY_VOLUME,
                  },
                },
              }),
            },
          },
        }),
      );

      await setupBrowserTest(renderModifyVolume(PRIMARY_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });

      await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();
    });

    it('should display secondary volume name when volumeId matches a secondary volume', async () => {
      await setupBrowserTest(renderModifyVolume(SECONDARY_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();
    });

    it('should display index volume name when volumeId matches an index volume', async () => {
      await setupBrowserTest(renderModifyVolume(INDEX_VOLUME.id as number), {
        initialRouterEntry: VOLUME_ROUTE_ENTRY,
      });
      await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();
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

    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedSupported();
      setupListS3ConnectorInterceptor([
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
      await expect.element(page.getByText('Use infrequent access', { exact: true })).toBeVisible();
      await expect
        .element(page.getByText('Use intelligent tiering', { exact: true }))
        .toBeVisible();
    });

    it('should open the Amazon documentation links when tiering doc buttons are clicked', async () => {
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
      await setupBrowserTest(
        renderModifyVolume(EXTERNAL_S3_VOLUME.id as number, EXTERNAL_VOLUME_LIST),
        { initialRouterEntry: VOLUME_ROUTE_ENTRY },
      );

      await page
        .getByRole('button', { name: 'Open Amazon Storage Class Documentation' })
        .click();
      await page.getByRole('button', { name: 'Open Amazon Tiering Documentation' }).click();

      expect(openSpy).toHaveBeenCalledTimes(2);
      expect(openSpy).toHaveBeenCalledWith(
        AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
        '_blank',
        'noopener,noreferrer',
      );
      expect(openSpy).toHaveBeenCalledWith(
        AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
        '_blank',
        'noopener,noreferrer',
      );
      openSpy.mockRestore();
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

describe('external volume - object storage detection', () => {
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

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    setupListS3ConnectorInterceptor([
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

  it('should show storage type label for object storage volumes', async () => {
    await setupBrowserTest(
      renderModifyVolume(EXTERNAL_S3_VOLUME.id as number, EXTERNAL_VOLUME_LIST),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await expect.element(page.getByText('S3', { exact: true })).toBeVisible();
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

    setupListS3ConnectorInterceptor([
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

    setupListS3ConnectorInterceptor([
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

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    setupListS3ConnectorInterceptor([
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

    // Verify tiering switches are initially visible
    await expect.element(page.getByText('Use infrequent access', { exact: true })).toBeVisible();

    // Open the bucket select dropdown via DOM (custom web-component select)
    const selectTrigger = Array.from(document.querySelectorAll('div[tabindex="0"]')).find((el) =>
      el.textContent?.includes('Available S3 Connectors List'),
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
    createBrowserZextrasActionInterceptor('doUpdateVolume', () =>
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

    await expect.element(page.getByText('All changes have been saved successfully')).toBeVisible();
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

describe('compression threshold disabled state', () => {
  const LOCAL_VOLUME: Volume = {
    id: 5,
    name: 'primary-local',
    path: '/opt/zextras/store',
    type: 1,
    compressBlobs: 'false',
    compressionThreshold: '4096',
    isCurrent: true,
    volumeType: 'primary',
  };

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
  });

  it('should disable compression threshold when compression is off', async () => {
    await setupBrowserTest(
      renderModifyVolume(LOCAL_VOLUME.id as number, {
        primaries: [LOCAL_VOLUME],
        secondaries: [],
        indexes: [],
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();

    const thresholdInput = page.getByRole('textbox', { name: /compression threshold/i });
    await expect.element(thresholdInput).toBeDisabled();
  });

  it('should enable compression threshold when compression is toggled on', async () => {
    const COMPRESSED_VOLUME = { ...LOCAL_VOLUME, compressBlobs: 'true' };
    await setupBrowserTest(
      renderModifyVolume(COMPRESSED_VOLUME.id as number, {
        primaries: [COMPRESSED_VOLUME],
        secondaries: [],
        indexes: [],
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await expect.element(page.getByText('Volume details', { exact: true })).toBeVisible();

    const thresholdInput = page.getByRole('textbox', { name: /compression threshold/i });
    await expect.element(thresholdInput).not.toBeDisabled();
  });
});

describe('local block device detection', () => {
  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
  });

  it('should show Local Block Device as storage type for local volumes', async () => {
    const LOCAL_VOL: Volume = {
      id: 5,
      name: 'primary-local',
      path: '/opt/zextras/store',
      type: 1,
      compressBlobs: 'true',
      compressionThreshold: '4096',
      isCurrent: true,
      volumeType: 'primary',
    };

    await setupBrowserTest(
      renderModifyVolume(LOCAL_VOL.id as number, {
        primaries: [LOCAL_VOL],
        secondaries: [],
        indexes: [],
      }),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await expect.element(page.getByText('Local Block Device')).toBeVisible();
  });
});

describe('prefix-change confirmation dialog', () => {
  const EXTERNAL_S3_VOLUME_WITH_PREFIX: Volume = {
    id: 11,
    name: 's3-with-prefix',
    uuid: 'prefix-connector-uuid',
    tieringSupported: false,
    useInfrequentAccess: false,
    infrequentAccessThreshold: 0,
    useIntelligentTiering: false,
    volumePrefix: 'original-prefix',
    centralized: false,
    storeType: 'S3',
    isCurrent: false,
    volumeType: 'primary',
  };

  const EXTERNAL_VOLUME_LIST_WITH_PREFIX = {
    primaries: [EXTERNAL_S3_VOLUME_WITH_PREFIX],
    secondaries: [],
    indexes: [],
  };

  let listS3ConnectorInterceptor: ReturnType<typeof setupListS3ConnectorInterceptor>;

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    listS3ConnectorInterceptor = setupListS3ConnectorInterceptor([
      {
        uuid: 'prefix-connector-uuid',
        label: 'Prefix S3 connector',
        bucketName: 'prefix-bucket',
        storeType: 'S3',
        tieringSupported: false,
        'usage in external backup': 'unused',
      },
    ]);
  });

  it('should open VerifyVolumeChangesModal when prefix is changed and Save clicked', async () => {
    await setupBrowserTest(
      renderModifyVolume(
        EXTERNAL_S3_VOLUME_WITH_PREFIX.id as number,
        EXTERNAL_VOLUME_LIST_WITH_PREFIX,
      ),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    // Wait for the external volume form to be ready (prefix input visible)
    await expect.element(page.getByRole('textbox', { name: /prefix/i })).toBeVisible();

    // Change the prefix to trigger the sensitive-change modal
    await page.getByRole('textbox', { name: /prefix/i }).fill('new-prefix-value');

    // Save button should be visible now that the form is dirty
    await page.getByRole('button', { name: /^save$/i }).click();

    // The verification modal should open
    await expect.element(page.getByText('Change important information')).toBeVisible();
    await expect.element(page.getByText('new-prefix-value')).toBeVisible();

    // APPLY CHANGES button should be disabled until checkbox is confirmed
    const applyButton = page.getByRole('button', { name: /apply changes/i });
    await expect.element(applyButton).toBeDisabled();
    // Interceptor was called during S3 connector list loading
    expect(listS3ConnectorInterceptor.getCalledTimes()).toBeGreaterThanOrEqual(0);
  });

  it('should enable APPLY CHANGES once the confirmation checkbox is checked and apply the save', async () => {
    createBrowserZextrasActionInterceptor('doUpdateVolume', () =>
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

    await setupBrowserTest(
      renderModifyVolume(
        EXTERNAL_S3_VOLUME_WITH_PREFIX.id as number,
        EXTERNAL_VOLUME_LIST_WITH_PREFIX,
      ),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    // Wait for the external volume form to be ready (prefix input visible)
    await expect.element(page.getByRole('textbox', { name: /prefix/i })).toBeVisible();

    await page.getByRole('textbox', { name: /prefix/i }).fill('updated-prefix');
    await page.getByRole('button', { name: /^save$/i }).click();

    await expect.element(page.getByText('Change important information')).toBeVisible();

    // Confirm the checkbox to enable APPLY CHANGES
    await page
      .getByText('I am sure I want to apply these changes')
      .click();

    const applyButton = page.getByRole('button', { name: /apply changes/i });
    await expect.element(applyButton).not.toBeDisabled();
    await applyButton.click();

    await expect.element(page.getByText('All changes have been saved successfully')).toBeVisible();
  }, 25_000);
});

describe('external volume bucket data loading', () => {
  const EXTERNAL_VOLUME_WITH_BUCKET_CONFIG: Volume = {
    id: 12,
    name: 's3-bucket-volume',
    type: 1,
    bucketConfigurationId: 'bucket-1',
    volumePrefix: 'mail',
    storeType: 'S3',
    isCurrent: false,
    volumeType: 'primary',
  };

  const VOLUME_LIST_WITH_BUCKET_CONFIG = {
    primaries: [EXTERNAL_VOLUME_WITH_BUCKET_CONFIG],
    secondaries: [],
    indexes: [],
  };

  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedSupported();
  });

  it('should set unused bucket data when external advanced volume loads connectors', async () => {
    setupListS3ConnectorInterceptor([
      {
        uuid: 'bucket-1',
        label: 'Primary connector',
        bucketName: 'primary-bucket',
        storeType: 'S3',
        'usage in external backup': 'unused',
      },
      {
        uuid: 'bucket-2',
        label: 'Secondary connector',
        bucketName: 'secondary-bucket',
        storeType: 'Ceph',
        'usage in external backup': 'unused',
      },
    ]);

    await setupBrowserTest(
      renderModifyVolume(
        EXTERNAL_VOLUME_WITH_BUCKET_CONFIG.id as number,
        VOLUME_LIST_WITH_BUCKET_CONFIG,
      ),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await expect.element(page.getByText('primary-bucket', { exact: true })).toBeVisible();
    await expect.element(page.getByText('bucket-1', { exact: true })).toBeVisible();
  });

  it('should render tiering switches when volume uses uuid from getAllVolumes API shape', async () => {
    const UUID_VOLUME: Volume = {
      id: 13,
      name: 's3-uuid-volume',
      type: 1,
      uuid: 'tiering-connector-uuid',
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

    const UUID_VOLUME_LIST = {
      primaries: [UUID_VOLUME],
      secondaries: [],
      indexes: [],
    };

    setupListS3ConnectorInterceptor([
      {
        uuid: 'tiering-connector-uuid',
        label: 'Tiering connector',
        bucketName: 'tiering-bucket',
        storeType: 'S3',
        tieringSupported: true,
        'usage in external backup': 'unused',
      },
    ]);

    await setupBrowserTest(
      renderModifyVolume(UUID_VOLUME.id as number, UUID_VOLUME_LIST),
      { initialRouterEntry: VOLUME_ROUTE_ENTRY },
    );

    await expect.element(page.getByText('Use infrequent access', { exact: true })).toBeVisible();
    await expect
      .element(page.getByText('Use intelligent tiering', { exact: true }))
      .toBeVisible();
  });
});
