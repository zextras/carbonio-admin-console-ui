/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type VolumeItem = {
        id: string
        name?: string
    }

export type HsmPolicyDetail = {
    isAllEnabled: boolean
    isMessageEnabled: boolean
    isEventEnabled: boolean
    isContactEnabled: boolean
    isDocumentEnabled: boolean
    policyCriteria: Array<{
        option: string
        dateScale: string
        scale: string
    }>
    sourceVolume: Array<VolumeItem>
    destinationVolume: Array<VolumeItem>
};

export type PolicyCriteriaItem = HsmPolicyDetail["policyCriteria"][number]

export function asQueryString(hsmDetail: HsmPolicyDetail):string {
    let query = '';
    const criteriaScale: string[] = [];
    if (hsmDetail.isAllEnabled) {
        query += 'document,message,contact,appointment';
    } else {
        if (hsmDetail.isDocumentEnabled) {
            criteriaScale.push('document');
        }
        if (hsmDetail.isMessageEnabled) {
            criteriaScale.push('message');
        }
        if (hsmDetail.isContactEnabled) {
            criteriaScale.push('contact');
        }
        if (hsmDetail.isEventEnabled) {
            criteriaScale.push('appointment');
        }
    }
    if (criteriaScale.length > 0) {
        query += criteriaScale.toString();
    }
    if (hsmDetail.policyCriteria.length > 0) {
        hsmDetail.policyCriteria.forEach((item: PolicyCriteriaItem) => {
            if (item.option === 'before' || item.option === 'after') {
                query += `:${item.option}:-${item.dateScale}${item.scale}`;
            } else if (item.option === 'larger' || item.option === 'smaller') {
                query += `:${item.option}:${item.dateScale}${item.scale}`;
            } 
        });
    }

    if (hsmDetail.sourceVolume.length > 0) {
        query += ` source: ${hsmDetail.sourceVolume.map((item: VolumeItem) => item.id).toString()}`;
    }

    if (hsmDetail.destinationVolume.length > 0) {
        query += ` destination: ${hsmDetail.destinationVolume
            .map((item: VolumeItem) => item.id)
            .toString()}`;
    }
    return query;
}