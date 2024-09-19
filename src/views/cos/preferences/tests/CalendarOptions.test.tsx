/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';

import { CosPrefAttributes } from '../../../../../types';
import { setup } from '../../../../tests/testUtils';
import { DEFAULT_COS_PREF_ATTRIBUTES } from '../../constants';
import CalendarOptions from '../CalendarOptions';

const cosPrefAttributes: CosPrefAttributes = {
	...DEFAULT_COS_PREF_ATTRIBUTES,
	zimbraPrefTimeZoneId: 'Pacific/Honolulu',
	zimbraPrefCalendarDefaultApptDuration: '30m',
	zimbraPrefCalendarApptReminderWarningTime: '60',
	zimbraPrefCalendarInitialView: 'week',
	zimbraPrefCalendarFirstDayOfWeek: '1',
	zimbraPrefCalendarApptVisibility: 'private',
	zimbraPrefCalendarShowPastDueReminders: 'TRUE',
	zimbraPrefCalendarAllowCancelEmailToSelf: 'TRUE',
	zimbraPrefCalendarAllowForwardedInvite: 'TRUE',
	zimbraPrefCalendarAllowPublishMethodInvite: 'TRUE',
	zimbraPrefCalendarAutoAddInvites: 'TRUE',
	zimbraPrefCalendarSendInviteDeniedAutoReply: 'TRUE',
	zimbraPrefCalendarNotifyDelegatedChanges: 'TRUE',
	zimbraPrefAppleIcalDelegationEnabled: 'TRUE'
};

describe('CalendarOptions Component', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	const mockHandlers = {
		onCalendarDefaultApptDurationChange: jest.fn(),
		onPrefTimeZoneChange: jest.fn(),
		onReminderWarningTimeChange: jest.fn(),
		onCalendarInitialViewChange: jest.fn(),
		onFirstDayOfWeekChange: jest.fn(),
		onAppointmentVisibilityChange: jest.fn(),
		changeSwitchOption: jest.fn()
	};

	it('should render correctly the initial state', async () => {
		setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				{...mockHandlers}
			/>
		);

		expect(screen.getByText('Calendar Options')).toBeInTheDocument();

		expect(screen.getByText('Time Zone')).toBeInTheDocument();
		expect(screen.getByText('GMT -10:00 Hawaii')).toBeInTheDocument();

		expect(screen.getByText('Appointment’s Default Duration')).toBeInTheDocument();
		expect(screen.getByText('30 minutes')).toBeInTheDocument();

		expect(screen.getByText('Appointment Reminder (minutes before)')).toBeInTheDocument();
		expect(screen.getByText('60')).toBeInTheDocument();

		expect(screen.getByText('Default Calendar View')).toBeInTheDocument();
		expect(screen.getByText('Week View')).toBeInTheDocument();

		expect(screen.getByText('The Week starts on')).toBeInTheDocument();
		expect(screen.getByText('Monday')).toBeInTheDocument();

		expect(screen.getByText('Default appointment visibility')).toBeInTheDocument();
		expect(screen.getByText('Private')).toBeInTheDocument();
		// TODO: How to test switches? also on ds they seems not tested
	});

	it('should handle time zone change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				{...mockHandlers}
			/>
		);
		await user.click(screen.getByText('GMT -10:00 Hawaii'));
		await user.click(screen.getByText('GMT -11:00 Samoa'));

		expect(mockHandlers.onPrefTimeZoneChange).toHaveBeenCalledWith('Pacific/Midway');
	});

	it('should handle default appointment duration change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				{...mockHandlers}
			/>
		);
		await user.click(screen.getByText('30 minutes'));
		await user.click(screen.getByText('120 minutes'));

		expect(mockHandlers.onCalendarDefaultApptDurationChange).toHaveBeenCalledWith('120m');
	});

	it('should handle appointment reminder change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				{...mockHandlers}
			/>
		);
		await user.click(screen.getByText('60'));
		await user.click(screen.getByText('30'));

		expect(mockHandlers.onReminderWarningTimeChange).toHaveBeenCalledWith('30');
	});

	it('should handle Default Calendar View change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				{...mockHandlers}
			/>
		);
		await user.click(screen.getByText('Week View'));
		await user.click(screen.getByText('Month View'));

		expect(mockHandlers.onCalendarInitialViewChange).toHaveBeenCalledWith('month');
	});

	it('should handle Week start change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				{...mockHandlers}
			/>
		);
		await user.click(screen.getByText('Monday'));
		await user.click(screen.getByText('Tuesday'));

		expect(mockHandlers.onFirstDayOfWeekChange).toHaveBeenCalledWith('2');
	});

	it('should handle default appointment visibility change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				{...mockHandlers}
			/>
		);
		await user.click(screen.getByText('Private'));
		await user.click(screen.getByText('Public'));

		expect(mockHandlers.onAppointmentVisibilityChange).toHaveBeenCalledWith('public');
	});
	// disabled status is hard to test on ds components
	test.todo('should disable inputs when isReadonlyCOSEntry is true');
	test.todo('should render switches and handles switch toggling');
});
