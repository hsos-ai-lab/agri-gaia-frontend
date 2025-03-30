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

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import React, { useEffect, useState } from 'react';

interface TokenAuthenticationFormProps {
    data: {
        gitUsername: string;
        gitAccessToken: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValidate: (errors: string[]) => void;
    disabled: boolean;
}

export default function ({ data, handleChange, onValidate, disabled }: TokenAuthenticationFormProps) {
    const [useAuthentication, setUseAuthentication] = useState<boolean>(false);

    useEffect(() => {
        const validationErrors: string[] = [];

        if (useAuthentication) {
            if (!data.gitAccessToken) {
                validationErrors.push('Access Token is required when authentication is enabled.');
            }
        }
        onValidate(validationErrors);
    }, [data, useAuthentication, onValidate]);

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useAuthentication}
                            onChange={(e) => setUseAuthentication(e.target.checked)}
                            color="primary"
                            disabled={disabled}
                        />
                    }
                    label="Use Access-Token Authentication"
                />
            </Grid>

            <Grid item>
                <TextField
                    id="username-textfield"
                    label="Username (optional)"
                    name="gitUsername"
                    variant="outlined"
                    value={data.gitUsername}
                    onChange={handleChange}
                    disabled={!useAuthentication || disabled} // Disable when checkbox is unchecked
                    fullWidth
                />
            </Grid>

            <Grid item>
                <TextField
                    id="access-token-textfield"
                    label="Access Token"
                    name="gitAccessToken"
                    variant="outlined"
                    value={data.gitAccessToken}
                    onChange={handleChange}
                    disabled={!useAuthentication || disabled} // Disable when checkbox is unchecked
                    helperText="The access token is only used for a single request and won't be stored"
                    fullWidth
                />
            </Grid>
        </Grid>
    );
}
