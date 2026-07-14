/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Volume } from '../../../../../../types';
import {
  ALIBABA,
  CEPH,
  CLOUDIAN,
  CUSTOM_S3,
  EMC,
  FILEBLOB,
  MINIO,
  OPENIO,
  S3,
  SCALITYS3,
  SWIFT,
  ZIMBRA_ADMIN_URN,
} from '../../../../../constants';

export type AdvancedUpdateVolumePayload = {
  [key: string]: string | boolean | number | undefined;
};

export type AdvancedUpdateVolumeFormState = {
  name: string;
  typeValue: number | undefined;
  id: string;
  isCurrent: boolean;
  storeType: string | undefined;
  externalVolDetail: Volume;
  rootpath: string;
  compressBlobs: boolean;
  compressionThreshold: string;
  volumePrefix: string | undefined;
  bucketConfigurationId: string | undefined;
  useInfrequentAccess: boolean | undefined;
  infrequentAccessThreshold: number | string | undefined;
  useIntelligentTiering: boolean | undefined;
};

const PREFIX_CONNECTOR_STORE_TYPES = new Set(
  [ALIBABA, CEPH, CLOUDIAN, EMC, SCALITYS3, MINIO, CUSTOM_S3].map((storeType) =>
    storeType.toUpperCase(),
  ),
);

export function isS3StoreType(storeTypeValue: string | undefined): boolean {
  return storeTypeValue?.toUpperCase() === S3.toUpperCase();
}

function isPrefixConnectorStoreType(storeType: string | undefined): boolean {
  return PREFIX_CONNECTOR_STORE_TYPES.has(storeType?.toUpperCase() ?? '');
}

function isStoreType(storeType: string | undefined, expected: string): boolean {
  return storeType?.toUpperCase() === expected.toUpperCase();
}

function isLocalVolume(form: AdvancedUpdateVolumeFormState): boolean {
  return Object.keys(form.externalVolDetail).length === 0;
}

function applyLocalVolumeFields(
  obj: AdvancedUpdateVolumePayload,
  form: AdvancedUpdateVolumeFormState,
): void {
  obj.volumePath = form.rootpath;
  obj.volumeCompressed = form.compressBlobs;
  obj.volumeThreshold = form.compressionThreshold || 0;
}

function applyPrefixConnectorFields(
  obj: AdvancedUpdateVolumePayload,
  form: AdvancedUpdateVolumeFormState,
): void {
  obj.volumePrefix = form.volumePrefix;
  obj.bucketConfigurationId = form.bucketConfigurationId;
}

function applyS3VolumeFields(
  obj: AdvancedUpdateVolumePayload,
  form: AdvancedUpdateVolumeFormState,
): void {
  applyPrefixConnectorFields(obj, form);
  obj.useInfrequentAccess = form.useInfrequentAccess;
  obj.infrequentAccessThreshold = form.infrequentAccessThreshold;
  obj.useIntelligentTiering = form.useIntelligentTiering;
}

function applyFileblobFields(
  obj: AdvancedUpdateVolumePayload,
  form: AdvancedUpdateVolumeFormState,
): void {
  applyLocalVolumeFields(obj, form);
}

function applyOpenioFields(obj: AdvancedUpdateVolumePayload): void {
  obj.url = '';
  obj.account = '';
  obj.namespace = '';
  obj.proxyPort = 1;
  obj.accountPort = 1;
}

function applySwiftFields(obj: AdvancedUpdateVolumePayload): void {
  obj.url = '';
  obj.username = '';
  obj.password = '';
  obj.authenticationMethod = '';
  obj.authenticationMethodScope = '';
  obj.tenantId = '';
  obj.tenantName = '';
  obj.domain = '';
  obj.proxyHost = '';
  obj.proxyPort = 10;
  obj.proxyUsername = '';
  obj.proxyPassword = '';
  obj.publicHost = '';
  obj.privateHost = '';
  obj.region = '';
  obj.maxDeleteObjectsCount = 10;
}

function applyExternalStoreTypeFields(
  obj: AdvancedUpdateVolumePayload,
  storeType: string | undefined,
  form: AdvancedUpdateVolumeFormState,
): void {
  if (isPrefixConnectorStoreType(storeType)) {
    applyPrefixConnectorFields(obj, form);
    return;
  }
  if (isS3StoreType(storeType)) {
    applyS3VolumeFields(obj, form);
    return;
  }
  if (isStoreType(storeType, FILEBLOB)) {
    applyFileblobFields(obj, form);
    return;
  }
  if (isStoreType(storeType, OPENIO)) {
    applyOpenioFields(obj);
    return;
  }
  if (isStoreType(storeType, SWIFT)) {
    applySwiftFields(obj);
  }
}

export function buildAdvancedUpdatePayload(
  selectedServerName: string,
  currentVolumeName: string | undefined,
  labelMap: Record<number | string, string>,
  form: AdvancedUpdateVolumeFormState,
): AdvancedUpdateVolumePayload {
  const currentStoreType = form.storeType ?? form.externalVolDetail?.storeType;
  const obj: AdvancedUpdateVolumePayload = {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxPowerstore',
    action: 'doUpdateVolume',
    targetServers: selectedServerName,
    currentVolumeName,
    volumeName: form.name,
    volumeType: form.typeValue ? labelMap[form.typeValue]?.toLowerCase() : '',
    volumeCurrent: form.isCurrent,
    storeType: currentStoreType,
    volumeId: form.id,
  };

  if (isLocalVolume(form)) {
    applyLocalVolumeFields(obj, form);
    return obj;
  }

  applyExternalStoreTypeFields(obj, currentStoreType, form);
  return obj;
}
