/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, useSnackbar } from '@zextras/carbonio-design-system';
import { Section } from '../../../app/component/section';
import { ResourceContext } from './resource-context';
import { HorizontalWizard } from '../../../app/component/hwizard';
import ResourceDetailSection from './resource-detail-section';
import ResourceSharingSection from './resource-sharing-section';
import ResourceCreateSection from './resource-create-section';

interface ResourceDetailObj {
	name: string;
	changeNameBool: boolean;
	domain: string;
	description: string;
	password: string;
	repeatPassword: string;
	displayName: string;
	zimbraCOSId: any;
	zimbraAccountStatus: any;
	zimbraCalResType: any;
	zimbraCalResAutoDeclineRecurring: any;
	zimbraCalResMaxNumConflictsAllowed: string;
	zimbraCalResMaxPercentConflictsAllowed: string;
	zimbraPrefCalendarAutoAcceptSignatureId: any;
	zimbraPrefCalendarAutoDeclineSignatureId: any;
	zimbraPrefCalendarAutoDenySignatureId: any;
	sendInviteList: any[];
	signaturelist: any[];
	schedulePolicyType: any;
	signatureItems: any[];
	zimbraNotes: string;
}

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('label.create_resource', 'Create Resource')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

// eslint-disable-next-line no-empty-pattern
const CreateResource: FC<{
	setShowCreateResourceView: any;
	createResourceReq: any;
}> = ({ setShowCreateResourceView, createResourceReq }) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const [resourceDetail, setResourceDetail] = useState<ResourceDetailObj>({
		name: '',
		changeNameBool: false,
		domain: '',
		description: '',
		password: '',
		repeatPassword: '',
		displayName: '',
		zimbraCOSId: {},
		zimbraAccountStatus: {},
		zimbraCalResType: {},
		zimbraCalResAutoDeclineRecurring: {},
		zimbraCalResMaxNumConflictsAllowed: '',
		zimbraCalResMaxPercentConflictsAllowed: '',
		zimbraPrefCalendarAutoAcceptSignatureId: {},
		zimbraPrefCalendarAutoDeclineSignatureId: {},
		zimbraPrefCalendarAutoDenySignatureId: {},
		sendInviteList: [],
		signaturelist: [],
		schedulePolicyType: {},
		signatureItems: [],
		zimbraNotes: ''
	});

	const [wizardData, setWizardData] = useState();

	const wizardSteps = useMemo(
		() => [
			{
				name: 'details',
				label: t('label.details', 'DETAILS'),
				icon: 'InfoOutline',
				view: ResourceDetailSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => setShowCreateResourceView(false)}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
						disabled
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'sharing',
				label: t('label.sharing', 'SHARING'),
				icon: 'SignatureOutline',
				view: ResourceSharingSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => setShowCreateResourceView(false)}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'create',
				label: t('label.create', 'CREATE'),
				icon: 'PowerOutline',
				view: ResourceCreateSection,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => setShowCreateResourceView(false)}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.create', 'CREATE')}
						icon="PowerOutline"
						iconPlacement="right"
						disabled={!resourceDetail?.displayName}
						onClick={(): void => {
							if (resourceDetail?.password !== '' && resourceDetail?.password?.length < 6) {
								createSnackbar({
									key: 'error',
									type: 'error',
									label: t('label.password_lenght_msg', 'Password should be more then 5 character'),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							} else if (resourceDetail?.password !== resourceDetail?.repeatPassword) {
								createSnackbar({
									key: 'error',
									type: 'error',
									label: t(
										'label.password_and repeat_password_not_match',
										'Password and repeat password not match'
									),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							} else {
								const name = `${resourceDetail?.name}@${resourceDetail.domain}`;
								const attr: any = {
									displayName: resourceDetail?.displayName,
									zimbraNotes: resourceDetail?.zimbraNotes,
									zimbraCalResMaxNumConflictsAllowed:
										resourceDetail?.zimbraCalResMaxNumConflictsAllowed,
									zimbraCalResMaxPercentConflictsAllowed:
										resourceDetail?.zimbraCalResMaxPercentConflictsAllowed,
									zimbraCOSId: resourceDetail?.zimbraCOSId?.value,
									zimbraCalResType: resourceDetail?.zimbraCalResType?.value,
									zimbraAccountStatus: resourceDetail?.zimbraAccountStatus?.value,
									zimbraCalResAutoDeclineRecurring:
										resourceDetail?.zimbraCalResAutoDeclineRecurring?.value,
									zimbraCalResAutoAcceptDecline:
										resourceDetail?.schedulePolicyType?.value === (1 || 3) ? 'TRUE' : 'FALSE',
									zimbraCalResAutoDeclineIfBusy:
										resourceDetail?.schedulePolicyType?.value === (1 || 2) ? 'TRUE' : 'FALSE'
								};
								const attrList: { n: string; _content: string }[] = [];
								Object.keys(attr).map((ele: any) => attrList.push({ n: ele, _content: attr[ele] }));
								resourceDetail?.sendInviteList.forEach((item: any) => {
									attrList.push({
										n: 'zimbraPrefCalendarForwardInvitesTo',
										_content: item?._content
									});
								});
								createResourceReq(
									name,
									resourceDetail?.password,
									attrList,
									resourceDetail?.displayName,
									resourceDetail?.signaturelist,
									resourceDetail?.zimbraPrefCalendarAutoAcceptSignatureId,
									resourceDetail?.zimbraPrefCalendarAutoDeclineSignatureId,
									resourceDetail?.zimbraPrefCalendarAutoDenySignatureId
								);
							}
						}}
					/>
				)
			}
		],
		[
			t,
			setShowCreateResourceView,
			resourceDetail?.displayName,
			resourceDetail?.password,
			resourceDetail?.repeatPassword,
			resourceDetail?.name,
			resourceDetail.domain,
			resourceDetail?.zimbraNotes,
			resourceDetail?.zimbraCalResMaxNumConflictsAllowed,
			resourceDetail?.zimbraCalResMaxPercentConflictsAllowed,
			resourceDetail?.zimbraCOSId?.value,
			resourceDetail?.zimbraCalResType?.value,
			resourceDetail?.zimbraAccountStatus?.value,
			resourceDetail?.zimbraCalResAutoDeclineRecurring?.value,
			resourceDetail?.schedulePolicyType?.value,
			resourceDetail?.sendInviteList,
			resourceDetail?.signaturelist,
			resourceDetail?.zimbraPrefCalendarAutoAcceptSignatureId,
			resourceDetail?.zimbraPrefCalendarAutoDeclineSignatureId,
			resourceDetail?.zimbraPrefCalendarAutoDenySignatureId,
			createSnackbar,
			createResourceReq
		]
	);

	const onComplete = useCallback(() => {
		setShowCreateResourceView(false);
	}, [setShowCreateResourceView]);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				top: '43px',
				right: '0px',
				bottom: '0px',
				left: `${'max(calc(100% - 680px), 12px)'}`,
				transition: 'left 0.2s ease-in-out',
				height: 'auto',
				width: 'auto',
				maxHeight: '100%',
				overflow: 'hidden',
				boxShadow: '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)'
			}}
		>
			<ResourceContext.Provider value={{ resourceDetail, setResourceDetail }}>
				<HorizontalWizard
					steps={wizardSteps}
					Wrapper={WizardInSection}
					onChange={setWizardData}
					onComplete={onComplete}
					setToggleWizardSection={setShowCreateResourceView}
				/>
			</ResourceContext.Provider>
		</Container>
	);
};

export default CreateResource;
