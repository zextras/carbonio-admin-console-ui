/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type OperationParameters = {
  requesterAddress?: string;
  additionalNotificationAddresses?: Array<string>;
  createFakeBlob?: boolean;
  isDeep?: boolean;
};

export type Operation = {
  id: string;
  name?: string;
  host?: string;
  serverName?: string;
  serverId?: string;
  module?: string;
  state: string;
  type?: string;
  startTime?: number;
  queuedTime?: number;
  humanStartTime?: string;
  parameters?: OperationParameters;
};

export type ManageOption = {
  id: string;
  name: string;
  isSelected: boolean;
};

export type ZextrasRequestBody = {
  Body?: {
    zextras?: {
      action?: string;
    };
  };
};

export type SoapContentResponse = {
  Body?: { response?: { content?: string } };
};

export type OperationServerError = {
  message?: string;
};

export type OperationServerResult = {
  ok?: boolean;
  response?: { operationList?: Array<Operation> };
  error?: OperationServerError;
};

export type OperationsContent = {
  response?: Record<string, OperationServerResult>;
};

export type DoneOperationsContent = {
  ok?: boolean;
  response?: { operationList?: Array<Operation> };
};
