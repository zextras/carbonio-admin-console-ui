/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen } from '@testing-library/react';
import React from 'react';
import { expect, it, test, vi } from 'vitest';

import { setup } from '../../../tests/testUtils';

import { SectionHeader, SectionBody, Section } from './section';

it('renders title correctly', () => {
  const title = 'Test Title';
  setup(<SectionHeader title={title} />);
  const titleElement = screen.getByText(title);
  expect(titleElement).toBeTruthy();
  expect(titleElement).toBeInstanceOf(HTMLElement);
});

test('renders close button when showClose is true', async () => {
  const onCloseMock = vi.fn();
  const { user } = setup(<SectionHeader showClose onClose={onCloseMock} />);
  const closeButton = screen.getByTestId('close-button');
  await user.click(closeButton);
  expect(onCloseMock).toHaveBeenCalled();
});

test('renders children correctly', () => {
  setup(<SectionBody padding={{}}><div>Test Child</div></SectionBody>);
  const childElement = screen.getByText('Test Child');
  expect(childElement).toBeTruthy();
  expect(childElement).toBeInstanceOf(HTMLElement);
});

test('renders title and footer correctly', () => {
  const title = 'Test Title';
  const footer = <div>Test Footer</div>;

  const { getByText } = setup(<Section title={title} footer={footer} />);
  
  const titleElement = getByText(title);
  const footerElement = getByText('Test Footer');

  expect(titleElement).toBeTruthy();
  expect(titleElement).toBeInstanceOf(HTMLElement);
  expect(footerElement).toBeTruthy();
  expect(footerElement).toBeInstanceOf(HTMLElement);
});

test('calls onClose when close button is clicked', async () => {
  const onCloseMock = vi.fn();
  const { user, getByTestId } = setup(<Section showClose onClose={onCloseMock} />);
  const closeButton = getByTestId('close-button');
  await user.click(closeButton);
  expect(onCloseMock).toHaveBeenCalled();
});