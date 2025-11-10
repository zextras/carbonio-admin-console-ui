
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo } from 'react';
import {
    Row,
    Container,
    Input,
    Button,
    Padding,
    Text,
    Table
} from '@zextras/carbonio-design-system';
import { useTranslation, Trans } from 'react-i18next';
import { isValidVirtualHostname } from '../../../utility/utils';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import logo from '../../../../assets/helmet_logo.svg';

interface VirtualHostsRowProps {
    items: any[];
    setItems: (items: any[]) => void;
}

const VirtualHostsRow: React.FC<VirtualHostsRowProps> = ({ items, setItems }) => {
    const [t] = useTranslation();
    const [virtualHostValue, setVirutalHostValue] = useState('');
    const [addButtonDisabled, setAddButtonDisabled] = useState(true);
    const [errVirtualHostName, setErrVirtualHostName] = useState(true);
    const [removeVirtualBtnDisabled, setRemoveVirtualBtnDisabled] = useState(true);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const headers = useMemo(
        () => [
            {
                id: 'hosts',
                label: t('label.virtual_host_name', 'Virtual Host Name'),
                width: '100%',
                bold: true
            }
        ],
        [t]
    );

    const addVirtualHost = () => {
        if (virtualHostValue && isValidVirtualHostname(virtualHostValue)) {
            const lastId = items.length > 0 ? items[items.length - 1]?.id : '0';
            const newId = parseInt(lastId, 10) + 1;
            const item = {
                id: newId?.toString(),
                columns: [virtualHostValue],
                clickable: true
            };
            setItems([...items, item]);
            setAddButtonDisabled(true);
            setVirutalHostValue('');
        }
    };

    const removeVirtualHost = () => {
        if (selectedRows && selectedRows.length > 0 && items.length > 0) {
            const filterItems = items.filter((item: any) => !selectedRows.includes(item.id));
            setItems(filterItems);
            setRemoveVirtualBtnDisabled(true);
            setSelectedRows([]);
        }
    };

    return (
        <Padding vertical="large" width="100%">
            <Row mainAlignment="flex-start" width="100%" wrap="nowrap">
                <Container width="80%">
                    <Input
                        label={t(
                            'label.new_virtual_host_name',
                            'Type a new Virtual Host Name and click on “Add +” to add it to the list'
                        )}
                        backgroundColor="gray5"
                        value={virtualHostValue}
                        onChange={(e: any): any => {
                            setVirutalHostValue(e.target.value);
                            if (e.target.value && isValidVirtualHostname(e.target.value)) {
                                setAddButtonDisabled(false);
                                setErrVirtualHostName(true);
                            } else {
                                setAddButtonDisabled(true);
                                setErrVirtualHostName(false);
                            }
                        }}
                        hasError={!errVirtualHostName}
                    />
                    {!errVirtualHostName && (
                        <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
                            <Padding top="extrasmall">
                                <Text color="error" overflow="break-word" size="extrasmall">
                                    {t(
                                        'domain.virtual_host_name_error',
                                        'Please enter valid virtual host name!'
                                    )}
                                </Text>
                            </Padding>
                        </Container>
                    )}
                </Container>
                <Container width="10%">
                    <Button
                        type="ghost"
                        label={t('label.add', 'Add')}
                        color="primary"
                        disabled={addButtonDisabled}
                        onClick={addVirtualHost}
                    />
                </Container>
                <Container width="10%">
                    <Button
                        type="ghost"
                        label={t('label.remove', 'Remove')}
                        color="error"
                        disabled={removeVirtualBtnDisabled}
                        onClick={removeVirtualHost}
                    />
                </Container>
            </Row>
            <Table
                rows={items}
                headers={headers}
                selectedRows={selectedRows}
                onSelectionChange={(selected: any): any => {
                    setSelectedRows(selected);
                    if (selected && selected.length > 0) {
                        setRemoveVirtualBtnDisabled(false);
                    } else {
                        setRemoveVirtualBtnDisabled(true);
                    }
                }}
                HeaderFactory={CustomHeaderFactory}
                RowFactory={CustomRowFactory}
            />
            {items.length === 0 && (
                <Container
                    background="gray6"
                    height="fit-content"
                    mainAlignment="center"
                    crossAlignment="center"
                >
                    <Padding value="57px 0 0 0" width="100%">
                        <Row mainAlignment="center" width="100%">
                            <img src={logo} alt="logo" />
                        </Row>
                    </Padding>
                    <Padding vertical="extralarge" width="100%">
                        <Row mainAlignment="center" crossAlignment="center" width="100%">
                            <Text
                                size="large"
                                color="secondary"
                                weight="regular"
                                style={{ textAlign: 'center' }}
                            >
                                <Trans
                                    i18nKey="label.no_virtual_host_message"
                                    defaults="There aren’t virtual hosts here.<br />Click to ADD button to enabled new one."
                                    components={{ break: <br /> }}
                                />
                            </Text>
                        </Row>
                    </Padding>
                </Container>
            )}
        </Padding>
    );
};

export default VirtualHostsRow;
