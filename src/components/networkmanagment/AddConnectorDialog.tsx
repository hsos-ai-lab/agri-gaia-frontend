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

import { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { httpUpload, httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import { NETWORK_PATH } from '../../endpoints';

interface IConnectorAddProps {
    handleClose: () => void;
    ownInformation: any;
}

export default function ({ handleClose, ownInformation }: IConnectorAddProps) {
    const keycloak = useKeycloak();

    const [connectorName, setConnectorName] = useState<string>('');
    const [connectorDescription, setConnectorDescription] = useState<string>('');
    const [connectorIdsURL, setConnectorIdsURL] = useState<string>('');

    const [addingInProgress, setAddingInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [addSuccess, setaddSuccess] = useState<boolean | undefined>(undefined);

    const handleUploadButtonClick = async () => {
        if (addSuccessful()) {
            handleClose();
            return;
        }

        if (connectorName.trim() === '') {
            setErrorMsg('Please specify a connector name!');
            return;
        }

        if (connectorDescription.trim() === '') {
            setErrorMsg('Please specify a connector description!');
            return;
        }

        if (connectorIdsURL.trim() === '') {
            setErrorMsg('Please specify a connector IDS URL!');
            return;
        }

        try {
            const record = { 'X-Api-Key': ownInformation['password'] };
            httpGet(
                keycloak,
                ownInformation['connector_data_url'] + '/catalog?providerUrl=' + connectorIdsURL,
                record,
            ).then((result) => {
                console.log(result);
            });
        } catch (exception) {
            setErrorMsg('URL is not accessible.');
            return;
        }

        // clear status
        setErrorMsg(undefined);
        setaddSuccess(false);

        setAddingInProgresss(true);

        const formData = new FormData();

        formData.append('description', connectorDescription);
        formData.append('name', connectorName.trim());
        formData.append('ids_url', connectorIdsURL.trim());

        httpUpload(keycloak, NETWORK_PATH, formData)
            .then(() => {
                setErrorMsg(undefined);
                setaddSuccess(true);
            })
            .catch((error) => {
                setErrorMsg(error.body['detail']);
                setaddSuccess(false);
            })
            .finally(() => {
                setAddingInProgresss(false);
            });
    };

    const isAdding = () => {
        return addingInProgress;
    };

    const addSuccessful = () => {
        return addSuccess;
    };

    const getButtonText = () => {
        if (isAdding()) return 'Adding';

        if (addSuccessful()) return 'Close';

        return 'Add';
    };

    const onClose = () => {
        if (isAdding()) {
            return;
        }
        handleClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth="xs">
            <DialogTitle>Add new Connector</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                <Grid item xs={8}>
                    <Box>
                        <Divider textAlign="left">General Information</Divider>
                    </Box>
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={10}>
                            <TextField
                                id="title-textfield"
                                label="Name"
                                variant="standard"
                                onChange={(e) => setConnectorName(e.target.value)}
                                value={connectorName}
                                required
                                disabled={isAdding()}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            {addingInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                            {addSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                        </Grid>
                    </Grid>
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={10}>
                            <TextField
                                id="desciption-textfield"
                                label="Description"
                                variant="standard"
                                multiline
                                maxRows={4}
                                onChange={(e) => setConnectorDescription(e.target.value)}
                                value={connectorDescription}
                                required
                                disabled={isAdding()}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            {addingInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                            {addSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                        </Grid>
                    </Grid>
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={10}>
                            <TextField
                                id="ids-url-textfield"
                                label="Connector IDS URL"
                                variant="standard"
                                onChange={(e) => setConnectorIdsURL(e.target.value)}
                                value={connectorIdsURL}
                                required
                                disabled={isAdding()}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            {addingInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                            {addSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleUploadButtonClick} loading={isAdding()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
