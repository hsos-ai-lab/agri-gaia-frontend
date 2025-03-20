// SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    InputLabel,
    FormControl,
    Select,
    OutlinedInput,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import BenchmarkDevice from '../../types/IBenchmarkDevice';
import { LoadingButton } from '@mui/lab';
import IDataset from '../../types/IDataset';
import { httpGet, httpPost } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import { DATASETS_PATH, EDGE_BENCHMARK_PATH, MODELS_PATH } from '../../endpoints';
import IModel from '../../types/IModel';
import useApplicationTasks from '../../contexts/TasksContext';

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

const FullScreenCart = ({
    open,
    onClose,
    cartItems,
}: {
    open: boolean;
    cartItems: BenchmarkDevice[];
    onClose: () => void;
}) => {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();
    const [step, setStep] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, isUploadSuccess] = useState(false);
    const [models, setModels] = React.useState<IModel[]>([]);
    const [datasets, setDatasets] = React.useState<IDataset[]>([]);
    const [selectedDataset, setSelectedDataset] = React.useState<number[]>([]);
    const [selectedModels, setSelectedModels] = React.useState<number[]>([]);

    useEffect(() => {
        httpGet(keycloak, MODELS_PATH)
            .then((data) => {
                setModels(data);
            })
            .catch((error) => {
                console.error(error);
            });

        httpGet(keycloak, DATASETS_PATH)
            .then((data) => {
                setDatasets(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const increaseStep = () => {
        setStep(step + 1);
    };

    const decreaseStep = () => {
        setStep(step - 1);
    };

    const getButtonText = () => {
        if (isUploading) return 'Uploading';

        if (uploadSuccess) return 'Close';

        return 'Create';
    };

    const handleChangeModel = (event: SelectChangeEvent<typeof selectedModels>) => {
        const {
            target: { value },
        } = event;
        console.log(value);
        if (typeof value != 'string') {
            setSelectedModels(value);
        }
    };

    const handleChangeDataset = (event: SelectChangeEvent<typeof selectedDataset>) => {
        const {
            target: { value },
        } = event;
        console.log(value);
        if (typeof value != 'string') {
            setSelectedDataset(value);
        }
    };

    const startBenchmark = async () => {
        httpPost(
            keycloak,
            `${EDGE_BENCHMARK_PATH}`,
            { models: selectedModels, datasets: selectedDataset, devices: cartItems },
            undefined,
            true,
        )
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => {
                        tasks?.addServerBackgroundTask(keycloak, tasks, task, (completedTask) => {
                            if (completedTask.status == 'completed') {
                                //TODO
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
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edge Device Selection</DialogTitle>
            <DialogContent>
                {step === 1 ? (
                    <List>
                        {cartItems.map((item) => (
                            <ListItem key={item.ip}>
                                <ListItemText primary={`${item.name} `} />
                            </ListItem>
                        ))}
                    </List>
                ) : null}
                {step === 2 ? (
                    <>
                        <InputLabel id="demo-simple-select-label">Models</InputLabel>
                        <div>
                            <FormControl sx={{ m: 1, width: 300 }}>
                                <Select
                                    labelId="demo-multiple-checkbox-label"
                                    id="demo-multiple-checkbox"
                                    multiple
                                    value={selectedModels}
                                    onChange={handleChangeModel}
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
                        <InputLabel id="demo-simple-select-label">Datasets</InputLabel>
                        <div>
                            <FormControl sx={{ m: 1, width: 300 }}>
                                <Select
                                    labelId="demo-multiple-checkbox-label"
                                    id="demo-multiple-checkbox"
                                    multiple
                                    value={selectedDataset}
                                    onChange={handleChangeDataset}
                                    input={<OutlinedInput label="Datasets" />}
                                    MenuProps={MenuProps}
                                >
                                    {datasets.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>
                                            {data.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </>
                ) : null}
            </DialogContent>
            <DialogActions>
                {step === 1 ? <Button onClick={increaseStep}>Set Parameters</Button> : null}
                {step === 2 ? (
                    <>
                        <Button onClick={decreaseStep}> Previous Step </Button>
                        <LoadingButton onClick={startBenchmark} loading={isUploading}>
                            {getButtonText()}
                        </LoadingButton>
                    </>
                ) : null}
            </DialogActions>
        </Dialog>
    );
};

export default FullScreenCart;
