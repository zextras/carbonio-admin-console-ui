/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useRef } from 'react';
import { Modal, Row, Button, Text, Container } from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';

const DisableDelegateAdminModel: FC<{
	open: boolean;
	closeHandler: () => void;
	saveHandler: () => void;
	removeAllACLs: () => void;
	modelDetail: any;
}> = ({ open, closeHandler, removeAllACLs, saveHandler, modelDetail }) => {
	const buttonRef = useRef();
	const [t] = useTranslation();
	return (
		<>
			<Modal
				size="medium"
				title={t(
					'label.disable_delegated_administration',
					'Disable delegated administration for {{name}}?',
					{
						name: modelDetail
					}
				)}
				open={open}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end" cros>
						<Row style={{ gap: '8px' }}>
							<Button
								style={{ fontWeight: '900' }}
								label={
									<Trans
										i18nKey="label.remove_all_acl"
										defaults="<bold>REMOVE</bold> ALL ACLs"
										components={{ bold: <strong /> }}
										t={t}
									/>
								}
								type="outlined"
								color="primary"
								onClick={removeAllACLs}
							/>
							<Button
								label={
									<Trans
										i18nKey="label.keep_acls_&_disbale_rigths"
										defaults="<bold>KEEP</bold> ACLs, DISABLE RIGHTS"
										components={{ bold: <strong /> }}
										t={t}
									/>
								}
								type="outlined"
								color="primary"
								onClick={(): void => {
									saveHandler();
								}}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={closeHandler}
			>
				<Text
					size={'extralarge'}
					overflow="break-word"
					style={{ whiteSpace: 'pre-line', textAlign: 'left', padding: '32px 0' }}
				>
					<Trans
						i18nKey="label.delegated_administration_helper_text"
						defaults="Delegated administration for {{domainName}} will be disabled. <br /> You have two options: <br /><br /> 1. Remove all ACLs (Access Control Lists) from the domain. <br /> 2.Keep the ACLs (Access Control Lists) in the domain, but disable the associated rights. <br /><br /> How would you like to proceed?"
						components={{ break: <br /> }}
						t={t}
						values={{
							domainName: modelDetail
						}}
					/>
				</Text>
			</Modal>
		</>
	);
};

export default DisableDelegateAdminModel;
