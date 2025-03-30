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

import { EDGE_GROUPS_PATH } from '../../endpoints';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import ITag from '../../types/ITag';

export default function AddEdgeGroupDialog({ tags, handleClose }: { tags: Array<ITag>; handleClose: () => void }) {
    const keycloak = useKeycloak();

    const [groupName, setGroupName] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<Array<number>>([]);

    const [inProgress, setInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<boolean | undefined>(undefined);

    const handleCreateButtonClick = async () => {
        if (success) {
            handleClose();
            return;
        }

        if (groupName.trim() === '') {
            setErrorMsg('Please specify an application name!');
            return;
        }

        setErrorMsg(undefined);
        setSuccess(false);
        setInProgresss(true);

        const name = groupName.trim().replaceAll(' ', '-');
        httpPost(keycloak, EDGE_GROUPS_PATH, { name, tag_ids: selectedTagIds })
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
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Create a new Edge Group</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                <Grid direction="column" container spacing={3}>
                    <Grid item>
                        <TextField
                            id="name-textfield"
                            label="Name"
                            variant="standard"
                            onChange={(e) => setGroupName(e.target.value)}
                            value={groupName}
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
                            options={tags.map((t) => t.id)}
                            renderInput={(params) => <TextField {...params} variant="standard" label="Tags" />}
                            onChange={(event, newValue) => {
                                setSelectedTagIds([...newValue]);
                            }}
                            value={selectedTagIds}
                            getOptionLabel={(option) => {
                                return tags.find((t) => t.id === option)?.name || '?';
                            }}
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
