/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { SectionHeader, SectionBody, Section } from './section';
import { setup } from '../../../tests/testUtils';

test('renders title correctly', () => {
  const title = 'Test Title';
  const { user } = setup(<SectionHeader title={title} />);
  const titleElement = screen.getByText(title);
  expect(titleElement).toBeInTheDocument();
});

test('renders close button when showClose is true', () => {
  const onCloseMock = jest.fn();
  const { user } = setup(<SectionHeader showClose onClose={onCloseMock} />);
  const closeButton = screen.getByTestId('close-button');
  fireEvent.click(closeButton);
  expect(onCloseMock).toHaveBeenCalled();
});

test('renders children correctly', () => {
  const { user } = setup(<SectionBody padding={{}}><div>Test Child</div></SectionBody>);
  const childElement = screen.getByText('Test Child');
  expect(childElement).toBeInTheDocument();
});

test('renders title and footer correctly', () => {
  const title = 'Test Title';
  const footer = <div>Test Footer</div>;

  const { getByText } = setup(<Section title={title} footer={footer} />);
  
  const titleElement = getByText(title);
  const footerElement = getByText('Test Footer');

  expect(titleElement).toBeInTheDocument();
  expect(footerElement).toBeInTheDocument();
});

test('calls onClose when close button is clicked', () => {
  const onCloseMock = jest.fn();
  const { getByTestId } = setup(<Section showClose onClose={onCloseMock} />);
  const closeButton = getByTestId('close-button');
  fireEvent.click(closeButton);
  expect(onCloseMock).toHaveBeenCalled();
});