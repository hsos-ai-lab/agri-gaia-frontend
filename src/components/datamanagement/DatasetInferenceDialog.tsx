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

import { useEffect, useState } from 'react';

import { PROJECT_BASE_URL, httpDelete, httpGet, httpPost } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';

import AlertSnackbar from '../common/AlertSnackbar';

import { TRITON_PATH, MODELS_PATH } from '../../endpoints';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    SelectChangeEvent,
    Snackbar,
    TextField,
    Typography,
    makeStyles,
} from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import IDataset from '../../types/IDataset';
import useApplicationTasks from '../../contexts/TasksContext';
import React from 'react';
import { openInNewTab } from '../../util';
import { Buffer } from 'buffer';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export default function ({ datasetIds, handleClose }: { datasetIds: readonly number[]; handleClose: () => void }) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();
    const [models, setModels] = React.useState<IDataset[]>([]);
    const [inferenceModelErrorOpen, setInferenceModelErrorOpen] = useState<boolean>(false);
    const [selectedModels, setSelectedModels] = React.useState<number[]>([]);
    const [external, setExternal] = React.useState(false);
    const [externalAdress, setExternalAdress] = React.useState('');

    const onClose = () => {
        handleClose();
    };

    useEffect(() => {
        httpGet(keycloak, MODELS_PATH)
            .then((data) => {
                setModels(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const openServiceResponse = async (path: string) => {
        const datasetPrefix = path;
        const base64encodedPrefix = Buffer.from(datasetPrefix).toString('base64');
        const datasetUrl = `https://minio-console.${PROJECT_BASE_URL}/browser/${keycloak?.profile?.username}/${base64encodedPrefix}`;
        console.log(datasetUrl);
        openInNewTab(datasetUrl);
    };

    const inference = async () => {
        let url = null;
        console.log(external);
        console.log(externalAdress);
        if (external) {
            url = [externalAdress];
        }
        console.log(url);

        httpPost(
            keycloak,
            `${TRITON_PATH}`,
            { models: selectedModels, datasets: datasetIds, url: url },
            undefined,
            true,
        )
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => {
                        tasks?.addServerBackgroundTask(keycloak, tasks, task, (completedTask) => {
                            if (completedTask.status == 'completed') {
                                openServiceResponse('inference/' + completedTask.id + '/inference.json');
                            }
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleConfirmationResult = (result: boolean) => {
        if (result) inference();
        setSelectedModels([]);
        handleClose();
    };

    const handleChange = (event: SelectChangeEvent<typeof selectedModels>) => {
        const {
            target: { value },
        } = event;
        console.log(value);
        if (typeof value != 'string') {
            setSelectedModels(value);
        }
    };

    const handleChangeExternal = (event: React.ChangeEvent<HTMLInputElement>) => {
        setExternal(event.target.checked);
    };

    function checkIpAddress(ip: string) {
        const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        return ipv4Pattern.test(ip) || ipv6Pattern.test(ip) || urlPattern.test(ip);
    }

    return (
        <>
            <Dialog open={true} maxWidth="sm" fullWidth>
                <DialogTitle>{'Run Inference'}</DialogTitle>
                <DialogContent>
                    <FormControlLabel
                        control={
                            <Checkbox
                                icon={<RadioButtonUncheckedIcon />}
                                checkedIcon={<RadioButtonCheckedIcon />}
                                onChange={handleChangeExternal}
                            />
                        }
                        label="External Processing"
                    />
                    <div>
                        <TextField
                            id="filled-basic"
                            label="Triton-Adress"
                            variant="outlined"
                            disabled={!external}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setExternalAdress(event.target.value);
                            }}
                            error={external && !checkIpAddress(externalAdress)}
                            helperText={
                                !checkIpAddress(externalAdress) ? 'Please enter a valid URL or IP Adress' : null
                            }
                        />
                    </div>
                    <br />
                    <Typography>{'Select one or multiple models to test the dataset:'}</Typography>
                    <InputLabel id="demo-simple-select-label">Models</InputLabel>
                    <div>
                        <FormControl sx={{ m: 1, width: 300 }}>
                            <InputLabel id="demo-multiple-checkbox-label">Model</InputLabel>
                            <Select
                                labelId="demo-multiple-checkbox-label"
                                id="demo-multiple-checkbox"
                                multiple
                                value={selectedModels}
                                onChange={handleChange}
                                input={<OutlinedInput label="Models" />}
                                MenuProps={MenuProps}
                            >
                                {models.map((data) => (
                                    <MenuItem key={data.id} value={data.id}>
                                        {data.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleConfirmationResult(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleConfirmationResult(true)}
                        color="primary"
                        disabled={(external && !checkIpAddress(externalAdress)) || selectedModels.length == 0}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <AlertSnackbar
                message="Cannot run a Model that is used by a Container Image."
                severity="error"
                open={inferenceModelErrorOpen}
                onClose={() => setInferenceModelErrorOpen(false)}
            />
        </>
    );
}
