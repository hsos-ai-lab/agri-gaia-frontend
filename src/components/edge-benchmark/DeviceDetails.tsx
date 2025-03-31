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
import BenchmarkDevice from '../../types/edge-benchmark/IDeviceHeader';
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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const DeviceDetails = ({
    device,
    deviceInfo,
    cartItems,
    onClose,
    addToCart,
}: {
    device: BenchmarkDevice;
    deviceInfo: JSON;
    cartItems: BenchmarkDevice[];
    onClose: () => void;
    addToCart: (device: BenchmarkDevice) => void;
}) => {
    const [openItems, setOpenItems] = useState({});

    const onClick = () => {
        addToCart(device);
    };

    const handleToggle = (id: string) => {
        setOpenItems((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
    };

    const renderData = (data: any, parentId = '') => {
        return Object.keys(data).map((key) => {
            const id = `${parentId}-${key}`;
            if (typeof data[key as keyof typeof data] === 'object' && data[key as keyof typeof data] !== null) {
                return (
                    <React.Fragment key={id}>
                        <ListItem button onClick={() => handleToggle(id)}>
                            <ListItemText primary={key} />
                            {openItems[id as keyof typeof openItems] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
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
        <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth="sm">
            <DialogTitle>{device.name}</DialogTitle>
            <DialogContent dividers>
                <List>{renderData(deviceInfo)}</List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClick}>{'Add to Cart'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeviceDetails;
