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
import { IconButton, Badge, Drawer } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CartDrawer from './CartDrawer';
import BenchmarkDevice from '../../types/IBenchmarkDevice';
import { LegendToggleRounded } from '@mui/icons-material';

const CartButton = ({ itemCount, onClick }: { itemCount: number; onClick: () => void }) => {
    return (
        <IconButton color="inherit" onClick={onClick}>
            <Badge badgeContent={itemCount} color="secondary">
                <ShoppingCartIcon />
            </Badge>
        </IconButton>
    );
};

export default CartButton;
