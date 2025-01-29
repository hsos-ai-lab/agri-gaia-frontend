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

import React from 'react';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import IPortBinding, { IPortBindingKeys } from '../../types/IPortBinding';

export default function ContainerDeployPortBinding({
    index,
    portBinding,
    updatePortBinding,
    isDeploying,
}: {
    index: number;
    portBinding: IPortBinding;
    updatePortBinding: (index: number, key: IPortBindingKeys, value: string) => void;
    isDeploying: () => boolean;
}) {
    return (
        <Grid container direction="row" mt={2} spacing={1}>
            <Grid item xs={3}>
                <TextField
                    type="number"
                    InputProps={{
                        inputProps: {
                            min: 0,
                            max: 2 ** 16 - 1,
                        },
                    }}
                    id="host-port-textfield-number"
                    label="host"
                    variant="standard"
                    onChange={(e) => updatePortBinding(index, 'host_port', e.target.value)}
                    value={portBinding.host_port}
                    required
                    disabled={isDeploying()}
                />
            </Grid>
            <Grid item xs={3}>
                <TextField
                    type="number"
                    InputProps={{
                        inputProps: {
                            min: 0,
                            max: 2 ** 16 - 1,
                        },
                    }}
                    id="container-port-textfield-number"
                    label="container"
                    variant="standard"
                    onChange={(e) => updatePortBinding(index, 'container_port', e.target.value)}
                    value={portBinding.container_port}
                    required
                    disabled={isDeploying()}
                />
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <ToggleButtonGroup
                        color="primary"
                        value={portBinding.protocol}
                        exclusive
                        onChange={(e: React.MouseEvent<HTMLElement>, newProtocol: string) =>
                            updatePortBinding(index, 'protocol', newProtocol)
                        }
                    >
                        <ToggleButton value="tcp">TCP</ToggleButton>
                        <ToggleButton value="udp">UDP</ToggleButton>
                    </ToggleButtonGroup>
                </FormControl>
            </Grid>
        </Grid>
    );
}
