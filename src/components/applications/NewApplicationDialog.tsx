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
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { httpPost } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import Alert from '@mui/material/Alert';

import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { yaml as yamlLang } from '@codemirror/legacy-modes/mode/yaml';

import { APPLICATIONS_PATH } from '../../endpoints';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import IEdgeGroup from '../../types/IEdgeGroup';

const defaultYaml = `version: '3'

services:
  my-service:
    # enter your application details...

volumes:
`;

export default function NewApplicationDialog({
    edgeGroups,
    handleClose,
}: {
    edgeGroups: Array<IEdgeGroup>;
    handleClose: () => void;
}) {
    const keycloak = useKeycloak();

    const [appName, setAppName] = useState('');
    const [selectedEdgeGroupIds, setSelectedEdgeGroupIds] = useState<Array<number>>([]);
    const [yaml, setYaml] = useState(defaultYaml);

    const [inProgress, setInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<boolean | undefined>(undefined);

    const handleCreateButtonClick = async () => {
        if (success) {
            handleClose();
            return;
        }

        if (appName.trim() === '') {
            setErrorMsg('Please specify an application name!');
            return;
        }

        if (selectedEdgeGroupIds.length === 0) {
            setErrorMsg('Please select at least one Edge Group!');
            return;
        }

        if (yaml.trim() === '') {
            setErrorMsg('Please specify the application details!');
            return;
        }

        setErrorMsg(undefined);
        setSuccess(false);
        setInProgresss(true);

        const name = appName.trim().replaceAll(' ', '-');
        httpPost(keycloak, APPLICATIONS_PATH, { name, yaml, group_ids: selectedEdgeGroupIds })
            .then(() => {
                setSuccess(true);
            })
            .catch((error) => {
                setErrorMsg(error.message);
                console.error(error);
            })
            .finally(() => {
                setInProgresss(false);
            });
    };

    const getButtonText = () => {
        if (inProgress) return 'Creating';
        if (success) return 'Close';
        return 'Create';
    };

    const onClose = () => {
        if (inProgress) {
            return;
        }
        handleClose();
    };
    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>Create a new Application</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                <Grid direction="column" container spacing={3}>
                    <Grid item>
                        <TextField
                            id="name-textfield"
                            label="Name"
                            variant="standard"
                            onChange={(e) => setAppName(e.target.value)}
                            value={appName}
                            required
                            fullWidth
                            disabled={inProgress || success}
                            style={{ marginBottom: '10px' }}
                        />
                    </Grid>
                    <Grid item>
                        <Autocomplete
                            multiple
                            id="tags-autocomplete"
                            disabled={inProgress || success}
                            options={edgeGroups.map((e) => e.id)}
                            renderInput={(params) => <TextField {...params} variant="standard" label="Edge Groups" />}
                            onChange={(event, newValue) => {
                                setSelectedEdgeGroupIds([...newValue]);
                            }}
                            value={selectedEdgeGroupIds}
                            getOptionLabel={(option) => {
                                return edgeGroups.find((g) => g.id === option)?.name || '?';
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <CodeMirror
                            value={yaml}
                            placeholder="Enter your docker-compose file here..."
                            height="400px"
                            extensions={[StreamLanguage.define(yamlLang)]}
                            onChange={(value) => setYaml(value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleCreateButtonClick} loading={inProgress}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
