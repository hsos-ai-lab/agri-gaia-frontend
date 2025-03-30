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
import { httpPost } from '../../api';
import { DOCKER_RUN } from '../../endpoints';
import useKeycloak from '../../contexts/KeycloakContext';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

const RunCustom = function (/*props: IProps*/) {
    const keycloak = useKeycloak();

    const runContainer = async () => {
        httpPost(keycloak, DOCKER_RUN + '/hello-world')
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <Card sx={{ maxWidth: 300 }}>
            <CardContent>
                <Typography sx={{ fontSize: 18 }} color="text.primary">
                    Run a new Container
                </Typography>
                <div>
                    <TextField id="image-textfield" label="Image" variant="standard" required />
                </div>
                <div>
                    <TextField id="name-textfield" label="Name" variant="standard" required />
                </div>
            </CardContent>
            <CardActions
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <Button size="small" onClick={runContainer}>
                    Run!
                </Button>
            </CardActions>
        </Card>
    );
};

export default RunCustom;
