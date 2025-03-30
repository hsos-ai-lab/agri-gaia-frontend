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

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Alert from '@mui/material/Alert';

import { httpPost } from '../../api';
import { onClickUrl } from '../../util';
import { DOCKER_RUN } from '../../endpoints';
import useKeycloak from '../../contexts/KeycloakContext';
import IDockerContainer from '../../types/IDockerContainer';

const RunJupyterScipy = function ({ onRun }: { onRun: () => void }) {
    const keycloak = useKeycloak();

    const [containerName, setContainerName] = useState('');
    const [waitingForResponse, setWaitingForResponse] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [launchedContainer, setLaunchedContainer] = useState<IDockerContainer | null>(null);
    const [jupyterToken, setJupyterToken] = useState<string | null>(null);

    const runContainer = async () => {
        setWaitingForResponse(true);

        httpPost(keycloak, DOCKER_RUN + '/jupyter/scipy', { name: containerName })
            .then(({ container, error, token }) => {
                console.log(container, error, token);
                setError(error);
                setLaunchedContainer(container);
                setJupyterToken(token);
                onRun();
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setWaitingForResponse(false);
            });
    };

    const handleContainerNameChange = (name: string) => {
        setContainerName(name);
        setLaunchedContainer(null);
    };

    const containerURL = launchedContainer ? `https://${launchedContainer.url}/lab?token=${jupyterToken}` : '';

    return (
        <Card sx={{ maxWidth: 400, my: 4 }}>
            <CardContent>
                <Typography sx={{ fontSize: 18 }} color="text.primary">
                    Launch a new Jupyter Notebook
                </Typography>
                <div>
                    <TextField
                        id="name-textfield"
                        label="Name"
                        variant="standard"
                        onChange={(e) => handleContainerNameChange(e.target.value)}
                        value={containerName}
                        required
                        disabled={waitingForResponse}
                    />
                </div>

                {launchedContainer ? <Alert severity="success">{containerURL}</Alert> : null}
                {error ? <Alert severity="error">{error}</Alert> : null}
            </CardContent>
            <CardActions>
                {launchedContainer?.url && jupyterToken ? (
                    <Button variant="contained" onClick={onClickUrl(containerURL)}>
                        Open Notebook
                    </Button>
                ) : (
                    <LoadingButton
                        onClick={runContainer}
                        endIcon={<RocketLaunchIcon />}
                        loading={waitingForResponse}
                        loadingPosition="end"
                        variant="contained"
                    >
                        Launch Jupyter Notebook
                    </LoadingButton>
                )}
            </CardActions>
        </Card>
    );
};

export default RunJupyterScipy;
