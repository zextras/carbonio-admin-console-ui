/* eslint-disable sonarjs/no-duplicate-string */
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

	const mockOnCosAttributeChanged = jest.fn();
	const mockChangeSwitchOption = jest.fn();

	it('should render correctly the initial state', async () => {
		setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
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

		// SWITCHES - CANNOT CHECK DEFAULT STATE, JUST CORRECT RENDER
		expect(screen.getByText('Enable reminders of appointments in the past')).toBeInTheDocument();
		expect(screen.getByText('Allow sending cancellation mail')).toBeInTheDocument();
		expect(
			screen.getByText('Automatically add forwarded appointments to the calendar')
		).toBeInTheDocument();
		expect(screen.getByText('Add invites with PUBLISH method')).toBeInTheDocument();
		expect(
			screen.getByText('Automatically add appointments when the user is invited')
		).toBeInTheDocument();
		expect(screen.getByText('Auto-decline if the sender is blacklisted')).toBeInTheDocument();
		expect(screen.getByText('Notify changes made by delegated accounts')).toBeInTheDocument();
		expect(screen.getByText('Use iCal delegation model for shared calendars')).toBeInTheDocument();
	});

	it('should handle time zone change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('GMT -10:00 Hawaii'));
		await user.click(screen.getByText('GMT -11:00 Samoa'));

		expect(mockOnCosAttributeChanged).toHaveBeenCalledWith(
			'zimbraPrefTimeZoneId',
			'Pacific/Midway'
		);
	});

	it('should handle default appointment duration change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('30 minutes'));
		await user.click(screen.getByText('120 minutes'));

		expect(mockOnCosAttributeChanged).toHaveBeenCalledWith(
			'zimbraPrefCalendarDefaultApptDuration',
			'120m'
		);
	});

	it('should handle appointment reminder change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('60'));
		await user.click(screen.getByText('30'));

		expect(mockOnCosAttributeChanged).toHaveBeenCalledWith(
			'zimbraPrefCalendarApptReminderWarningTime',
			'30'
		);
	});

	it('should handle Default Calendar View change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('Week View'));
		await user.click(screen.getByText('Month View'));

		expect(mockOnCosAttributeChanged).toHaveBeenCalledWith(
			'zimbraPrefCalendarInitialView',
			'month'
		);
	});

	it('should handle Week start change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('Monday'));
		await user.click(screen.getByText('Tuesday'));

		expect(mockOnCosAttributeChanged).toHaveBeenCalledWith('zimbraPrefCalendarFirstDayOfWeek', '2');
	});

	it('should handle default appointment visibility change', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
			/>
		);
		await user.click(screen.getByText('Private'));
		await user.click(screen.getByText('Public'));

		expect(mockOnCosAttributeChanged).toHaveBeenCalledWith(
			'zimbraPrefCalendarApptVisibility',
			'public'
		);
	});
	it('should render switches and handles switch toggling', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry={false}
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
			/>
		);

		/**
		 * Function to test the toggling of a switch element and ensure that the correct preference
		 * change handler is called with the appropriate preference key.
		 *
		 * @async
		 * @function testSwitchToggle
		 * @param {string} params.label - The text label used to identify the switch in the DOM via `getByText`.
		 * @param {keyof CosPrefAttributes} params.pref - The preference key (from `CosPrefAttributes`) that should be passed to the change handler.
		 */
		const testSwitchToggle = async ({
			label,
			pref
		}: {
			label: string;
			pref: keyof CosPrefAttributes;
		}): Promise<void> => {
			const switchElement = screen.getByText(label);
			await user.click(switchElement);
			expect(mockChangeSwitchOption).toHaveBeenCalledWith(pref);
		};

		await testSwitchToggle({
			label: 'Allow sending cancellation mail',
			pref: 'zimbraPrefCalendarAllowCancelEmailToSelf'
		});

		await testSwitchToggle({
			label: 'Enable reminders of appointments in the past',
			pref: 'zimbraPrefCalendarShowPastDueReminders'
		});

		await testSwitchToggle({
			label: 'Allow sending cancellation mail',
			pref: 'zimbraPrefCalendarAllowCancelEmailToSelf'
		});

		await testSwitchToggle({
			label: 'Automatically add forwarded appointments to the calendar',
			pref: 'zimbraPrefCalendarAllowForwardedInvite'
		});

		await testSwitchToggle({
			label: 'Add invites with PUBLISH method',
			pref: 'zimbraPrefCalendarAllowPublishMethodInvite'
		});

		await testSwitchToggle({
			label: 'Automatically add appointments when the user is invited',
			pref: 'zimbraPrefCalendarAutoAddInvites'
		});

		await testSwitchToggle({
			label: 'Auto-decline if the sender is blacklisted',
			pref: 'zimbraPrefCalendarSendInviteDeniedAutoReply'
		});

		await testSwitchToggle({
			label: 'Notify changes made by delegated accounts',
			pref: 'zimbraPrefCalendarNotifyDelegatedChanges'
		});

		await testSwitchToggle({
			label: 'Use iCal delegation model for shared calendars',
			pref: 'zimbraPrefAppleIcalDelegationEnabled'
		});
	});

	it('should disable inputs when isReadonlyCOSEntry is true', async () => {
		const { user } = setup(
			<CalendarOptions
				cosPrefAttributes={cosPrefAttributes}
				isReadonlyCOSEntry
				onCosAttributeChanged={mockOnCosAttributeChanged}
				onSwitchOptionChanged={mockChangeSwitchOption}
			/>
		);

		/**
		 * Function to test the toggling of a switch element and ensure that the
		 * change handler is NOT called.
		 *
		 * @async
		 * @function testDisabledSwitch
		 * @param {string} params.label - The text label used to identify the switch in the DOM via `getByText`.
		 */
		const testDisabledSwitch = async ({ label }: { label: string }): Promise<void> => {
			const switchElement = screen.getByText(label);
			await user.click(switchElement);
			expect(mockChangeSwitchOption).not.toHaveBeenCalled();
		};

		await testDisabledSwitch({
			label: 'Allow sending cancellation mail'
		});

		await testDisabledSwitch({
			label: 'Enable reminders of appointments in the past'
		});

		await testDisabledSwitch({
			label: 'Allow sending cancellation mail'
		});

		await testDisabledSwitch({
			label: 'Automatically add forwarded appointments to the calendar'
		});

		await testDisabledSwitch({
			label: 'Add invites with PUBLISH method'
		});

		await testDisabledSwitch({
			label: 'Automatically add appointments when the user is invited'
		});

		await testDisabledSwitch({
			label: 'Auto-decline if the sender is blacklisted'
		});

		await testDisabledSwitch({
			label: 'Notify changes made by delegated accounts'
		});

		await testDisabledSwitch({
			label: 'Use iCal delegation model for shared calendars'
		});
	});
});
