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

import { useEffect, useState } from 'react';

import useKeycloak from '../contexts/KeycloakContext';
import { LICENSES_PATH } from '../endpoints';
import { httpGet } from '../api';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LicensesList from '../components/licenses/List';
import SyncIcon from '@mui/icons-material/Sync';
import NoDataYet from '../components/common/NoDataYet';
import IDependencyCategory from '../types/IDependencyCategory';
import AlertSnackbar from '../components/common/AlertSnackbar';
import IAlertMessage from '../types/IAlertMessage';
import { AlertColor } from '@mui/material/Alert';

export default function Licenses() {
    const keycloak = useKeycloak();
    const [dependencies, setDependencies] = useState<IDependencyCategory[]>([]);
    const [githubToken, setGithubToken] = useState<string>('');
    const [refreshInProgress, setRefreshInProgress] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<IAlertMessage>({
        message: undefined,
        severity: undefined,
        open: false,
    });

    const fetchDependenciesWithLicenses = async (returnCached: boolean) => {
        if (!returnCached) setRefreshInProgress(true);
        httpGet(keycloak, `${LICENSES_PATH}/?return_cached=${returnCached}&github_token=${githubToken}`)
            .then((_dependencies) => {
                console.log('Dependencies with licenses:', _dependencies);
                setDependencies(_dependencies);
                if (!returnCached) {
                    setGithubToken('');
                    setSnackbarMessage({
                        message: 'Successfully refreshed dependencies and licenses.',
                        severity: 'success' as AlertColor,
                        open: true,
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                setSnackbarMessage({
                    message: 'Failed to refresh dependencies and licenses.',
                    severity: 'error' as AlertColor,
                    open: true,
                });
            })
            .finally(() => {
                setRefreshInProgress(false);
            });
    };

    useEffect(() => {
        fetchDependenciesWithLicenses(true);
    }, [keycloak]);

    return (
        <>
            <Grid container justifyContent="space-between">
                <Grid item xs={12} md={6} lg={6}>
                    <Typography variant="h4">Licenses</Typography>
                </Grid>

                <Grid item xs={12} md={6} lg={6}>
                    <Grid container spacing={2} justifyContent="right">
                        <Grid item>
                            <TextField
                                label="GitHub API Token"
                                variant="standard"
                                value={githubToken}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                    setGithubToken(event.target.value)
                                }
                            />
                        </Grid>
                        <Grid item>
                            {refreshInProgress ? (
                                <CircularProgress color="primary" />
                            ) : (
                                <Fab
                                    color="primary"
                                    aria-label="refresh"
                                    size="small"
                                    onClick={() => fetchDependenciesWithLicenses(false)}
                                >
                                    <SyncIcon />
                                </Fab>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {dependencies.length ? (
                <LicensesList dependencies={dependencies} />
            ) : (
                <NoDataYet name="Dependencies" data={dependencies} />
            )}
            <AlertSnackbar
                message={snackbarMessage.message}
                severity={snackbarMessage.severity}
                open={snackbarMessage.open}
                onClose={() => setSnackbarMessage({ ...snackbarMessage, open: false })}
            />
        </>
    );
}
