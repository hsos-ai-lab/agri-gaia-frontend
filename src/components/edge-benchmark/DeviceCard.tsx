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

import React from 'react';
import BenchmarkDevice from '../../types/edge-benchmark/IDeviceHeader';
import { Button } from '@mui/material';

const Card = {
    padding: '10px',
    fontFamily: 'Arial',
    border: '5px solid #707070 ',
    borderRadius: '8px',
    width: '25%',
};

const Title = {
    fontFamily: 'Arial',
    color: 'white',
    border: '1px solid #707070',
    borderRadius: '4px',
    backgroundColor: '#0f5432',
    marginTop: '0',
    padding: '3px',
};

const DeviceCard = ({
    device,
    onClick,
    addToCart,
    buttonOption,
}: {
    device: BenchmarkDevice;
    onClick: (device: BenchmarkDevice) => void;
    addToCart: (device: BenchmarkDevice) => void;
    buttonOption: boolean;
}) => (
    <div className="device-card" style={Card}>
        <div onClick={() => onClick(device)}>
            <h3 style={Title}>{device.name}</h3>
            <p>Hostname: {device.hostname}</p>
            <p>Timestamp: {device.timestamp}</p>
            <p>Online: {device.online}</p>
        </div>
        {buttonOption ? (
            <Button onClick={() => addToCart(device)}>{'Delete from Cart'}</Button>
        ) : (
            <Button onClick={() => addToCart(device)}>{'Add to Cart'}</Button>
        )}
    </div>
);

export default DeviceCard;
