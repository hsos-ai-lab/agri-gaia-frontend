// SPDX-FileCopyrightText: 2024 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import {
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import IDeviceHeader from '../../types/edge-benchmark/IDeviceHeader';

const BenchmarkDeviceDetailsModal = ({
    deviceHeader,
    deviceInfo,
    onClose,
}: {
    deviceHeader: IDeviceHeader;
    deviceInfo: Record<string, any>;
    onClose: () => void;
}) => {
    const [openItems, setOpenItems] = useState({});

    const handleToggle = (id: string) => {
        setOpenItems((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
    };

    const renderData = (data: any, parentId = '') => {
        return Object.keys(data).map((key) => {
            const id = `${parentId}-${key}`;
            if (typeof data[key as keyof typeof data] === 'object' && data[key as keyof typeof data] !== null) {
                return (
                    <React.Fragment key={id}>
                        <ListItemButton onClick={() => handleToggle(id)}>
                            <ListItemText primary={key} />
                            {openItems[id as keyof typeof openItems] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={openItems[id as keyof typeof openItems]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {renderData(data[key as keyof typeof data], id)}
                            </List>
                        </Collapse>
                    </React.Fragment>
                );
            }
            return (
                <ListItem key={id} sx={{ pl: 4 }}>
                    <ListItemText primary={`${key}: ${data[key]}`} />
                </ListItem>
            );
        });
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Information for {deviceHeader.name}</DialogTitle>
            <DialogContent dividers>
                <List>{renderData(deviceInfo)}</List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BenchmarkDeviceDetailsModal;
