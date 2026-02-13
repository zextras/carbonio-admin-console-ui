/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type Attribute = {
  n: string;
  _content: any;
};

export type MtaServer = {
  id?: string;
  name?: string;
  a?: Array<Attribute>;
};

export type DropdownItem = {
  id: string;
  label: string;
  customComponent?: React.ReactNode;
};

export type MailTransferAgentOption = {
  id: string;
  name: string;
  isSelected: boolean;
};

export type ServerOption = {
  id: string;
  name: string;
  isSelected: boolean;
};