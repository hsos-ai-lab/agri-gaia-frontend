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

import React, { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { httpPut } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import Alert from '@mui/material/Alert';

import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { yaml as yamlLang } from '@codemirror/legacy-modes/mode/yaml';

import { APPLICATIONS_PATH } from '../../endpoints';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import IEdgeGroup from '../../types/IEdgeGroup';
import IApplication from '../../types/IApplication';

export default function UpdateApplicationDialog({
    application,
    edgeGroups,
    handleClose,
}: {
    application: IApplication;
    edgeGroups: Array<IEdgeGroup>;
    handleClose: () => void;
}) {
    const keycloak = useKeycloak();

    const [selectedEdgeGroupIds, setSelectedEdgeGroupIds] = useState<Array<number>>(
        application.portainer_edge_group_ids,
    );
    const [yaml, setYaml] = useState(application.yaml);

    const [inProgress, setInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<boolean | undefined>(undefined);

    const handleCreateButtonClick = async () => {
        if (success) {
            handleClose();
            return;
        }

        if (yaml.trim() === '') {
            setErrorMsg('Please specify the application details!');
            return;
        }

        if (selectedEdgeGroupIds.length === 0) {
            setErrorMsg('Please specify at least one edge group!');
            return;
        }

        setErrorMsg(undefined);
        setSuccess(false);
        setInProgresss(true);

        httpPut(keycloak, `${APPLICATIONS_PATH}/${application.id}`, { yaml, group_ids: selectedEdgeGroupIds })
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
        if (inProgress) return 'Updating';
        if (success) return 'Close';
        return 'Update';
    };

    const onClose = () => {
        if (inProgress) {
            return;
        }
        handleClose();
    };
    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>Update Application {application.name}</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                <Grid direction="column" container spacing={3}>
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
