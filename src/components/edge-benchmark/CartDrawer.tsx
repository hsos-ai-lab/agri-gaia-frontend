// SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import BenchmarkDevice from '../../types/IBenchmarkDevice';

const CartDrawer = ({
    open,
    onClose,
    cartItems,
    onViewCartClick,
}: {
    open: boolean;
    onClose: () => void;
    cartItems: BenchmarkDevice[];
    onViewCartClick: () => void;
}) => {
    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <List style={{ width: '250px' }} sx={{ zIndex: (theme) => theme.zIndex.appBar - 1 }}>
                <ListItem key={0}>
                    <ListItemText primary={'-----'} secondary={'-----'} />
                </ListItem>
                {cartItems.map((item) => (
                    <ListItem key={item.ip}>
                        <ListItemText primary={`${item.name}`} secondary={'-----'} />
                    </ListItem>
                ))}
                <ListItem>
                    <Button variant="contained" color="primary" onClick={onViewCartClick}>
                        View Full Selection
                    </Button>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default CartDrawer;
