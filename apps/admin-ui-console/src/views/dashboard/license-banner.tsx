/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo } from 'react';

import ListRow from '../list/list-row';
import { Button, Container, Icon, Row, Text } from '@zextras/carbonio-design-system';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

type licenseBannerProps = {
    maintenanceEndDate: number;
    maintenanceStatus: string;
    setLicenseBannerOpen: React.Dispatch<React.SetStateAction<boolean>>
    redirectButtonHasToAppear?: boolean;
};

const LicenseBanner: FC<licenseBannerProps> = ({ maintenanceEndDate, maintenanceStatus, setLicenseBannerOpen, redirectButtonHasToAppear }) => {
    const [t] = useTranslation();
    const maintenanceEndDateFormatted = moment(maintenanceEndDate).format('DD MMM YYYY');
    const bannerExpiringLabel = t(
        '',
        `Your maintenance period will expire on ${maintenanceEndDateFormatted}. Renew your subscription to be eligible to receive update.`,
        { maintenanceEndDate: maintenanceEndDateFormatted }
    );
    const bannerExpiredLabel = t(
        '',
        `Your maintenance expired on ${maintenanceEndDateFormatted}. Do not upgrade Carbonio to newer versions to avoid service disruption. Your current version will continue to function normally. Renew maintenance if you want to upgrade. `,
        { maintenanceEndDate: maintenanceEndDateFormatted }
    );

    const bannerLabelToShow = useMemo(() => {
        return maintenanceStatus === 'expiring' ? bannerExpiringLabel : bannerExpiredLabel;
    }, [bannerExpiringLabel, bannerExpiredLabel, maintenanceStatus]); return (
        <ListRow padding={redirectButtonHasToAppear ? "1.5rem" : { top: '1.5rem' }}>
            <Container
                width={"fill"}
                background={"warning"}
                height={"fit-content"}
                crossAlignment='flex-end'
                padding={{ vertical: '0.5rem', horizontal: '1rem' }}
                gap='0.5rem'
            >
                <Container
                    width={"fill"}
                    height={"fit-content"}
                    orientation='horizontal'
                    style={{ borderRadius: '0.5rem' }}
                    mainAlignment='flex-start'
                    crossAlignment='flex-start'
                    gap='0.5rem'
                >
                    <Row padding={{ right: "0.5rem" }}>
                        <Icon size="large" icon="AlertTriangleOutline" color="gray6" />
                    </Row>
                    <Row takeAvailableSpace>
                        <Text color="gray6" overflow='break-word'>{bannerLabelToShow}</Text>
                    </Row>
                    <Row>
                        <Button type='ghost' icon="CloseOutline" color="gray6" onClick={() => setLicenseBannerOpen(false)} />
                    </Row>
                </Container>
                {redirectButtonHasToAppear &&
                    <Button
                        type='outlined'
                        backgroundColor='transparent'
                        color="gray6"
                        label='View Subscription Details'
                        onClick={() => { }}
                    />
                }
            </Container>
        </ListRow>
    )

}

export default LicenseBanner;