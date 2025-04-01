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
import useKeycloak from '../../contexts/KeycloakContext';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import IAlertMessage from '../../types/IAlertMessage';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Form from '@rjsf/material-ui/v5';
import IDataset from '../../types/IDataset';
import IModel from '../../types/IModel';
import StartIcon from '@mui/icons-material/Start';
import IDeviceHeader from '../../types/edge-benchmark/IDeviceHeader';

import { DATASETS_PATH, MODELS_PATH } from '../../endpoints';
import { httpGet, httpPost } from '../../api';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Typography } from '@mui/material';

interface IBenchmarkJobCreateProps {
    selectedDeviceHeaders: IDeviceHeader[];
    onCreate: (jobCreateMessage: IAlertMessage) => void;
    onClose: () => void;
}

export default function ({ selectedDeviceHeaders, onCreate, onClose }: IBenchmarkJobCreateProps) {
    const keycloak = useKeycloak();

    const [benchmarkConfig, setBenchmarkConfig] = useState<Record<string, any>>({
        schema: {
            type: 'object',
            properties: {
                inference_client: {
                    title: 'Edge Inference Client',
                    type: 'string',
                    default: 'TritonDenseNetClient',
                    enum: ['TritonDenseNetClient', 'TritonYoloClient'],
                    description: 'The type of Edge Inference Client to use.',
                },
                protocol: {
                    title: 'Inference Server Protocol',
                    type: 'string',
                    default: 'http',
                    enum: ['http'],
                    description: 'Network protocol used by the Inference Server.',
                },
                port: {
                    title: 'Inference Server Port',
                    type: 'integer',
                    description: 'Network port used by the Inference Server.',
                    minimum: 1,
                    maximum: 65535,
                },
                num_workers: {
                    title: 'Worker Threads',
                    type: 'integer',
                    description: 'Number of worker threads used for pre- and postprocessing inference data.',
                    default: 1,
                    minimum: 1,
                },
                samples_per_second: {
                    title: 'Samples per Second',
                    type: 'number',
                    description: 'Limit inference speed to this many samples per second.',
                    minimum: 0,
                },
                batch_size: {
                    title: 'Batch size',
                    type: 'integer',
                    description: 'Batch size to use for inference requests.',
                    minimum: 1,
                },
                warm_up: {
                    title: 'Apply model warmup',
                    type: 'boolean',
                    default: false,
                    description: 'Apply model warmup at the beginning of inference',
                },
                num_classes: {
                    title: 'Class count',
                    type: 'integer',
                    description: 'Number of classes present in the inference dataset.',
                    minimum: 1,
                },
                scaling: {
                    title: 'Image scaling',
                    type: 'string',
                    default: 'inception',
                    enum: ['inception', 'vgg'],
                    description: 'Type of image scaling applied to the inference dataset.',
                },
            },
            allOf: [
                {
                    if: {
                        properties: {
                            inference_client: {
                                const: 'TritonDenseNetClient',
                            },
                        },
                    },
                    then: {
                        properties: {},
                    },
                },
                {
                    if: {
                        properties: {
                            inference_client: {
                                const: 'TritonYoloClient',
                            },
                        },
                    },
                    then: {
                        properties: {
                            confidence_thres: {
                                title: 'Confidence threshold',
                                type: 'number',
                                default: 0.25,
                                description: 'Minimum confidence score used to filter out low-confidence detections.',
                                minimum: 0,
                                maximum: 1,
                            },
                            iou_thres: {
                                title: 'IoU threshold',
                                type: 'number',
                                default: 0.45,
                                description:
                                    'Parameter used for Non-Maximum Suppression (NMS) to filter out overlapping bounding boxes.',
                                minimum: 0,
                                maximum: 1,
                            },
                            input_width: {
                                title: 'Input width',
                                type: 'integer',
                                default: 640,
                                description: 'Input image rescale width in pixel.',
                                minimum: 1,
                            },
                            input_height: {
                                title: 'Input height',
                                type: 'integer',
                                default: 640,
                                description: 'Input image rescale height in pixel.',
                                minimum: 1,
                            },
                        },
                    },
                },
                {
                    required: ['inference_client', 'protocol'],
                },
            ],
        },
        values: {},
    });

    const [datasets, setDatasets] = useState<Array<IDataset> | undefined>(undefined);
    const [selectedDataset, setSelectedDataset] = useState<string>('');
    const [models, setModels] = useState<Array<IModel> | undefined>(undefined);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const fetchDatasets = async () => {
        await httpGet(keycloak, DATASETS_PATH)
            .then((_datasets) => {
                console.log('Datasets:', _datasets);
                setDatasets(_datasets);
            })
            .catch((error) => {
                console.log(error);
                setErrorMsg(`Fetching datasets: ${error.message}`);
            });
    };

    const fetchModels = async () => {
        await httpGet(keycloak, MODELS_PATH)
            .then((_models) => {
                console.log('Models:', _models);
                setModels(_models);
            })
            .catch((error) => {
                console.log(error);
                setErrorMsg(`Fetching models: ${error.message}`);
            });
    };

    useEffect(() => {
        fetchDatasets();
        fetchModels();
    }, [keycloak]);

    const onDialogClose = () => {
        if (isCreating) return;
        onClose();
    };

    const onFormChange = (form: any) => {
        setBenchmarkConfig({ ...benchmarkConfig, values: form.formData });
    };

    const onFormSubmit = (form: any) => {
        setErrorMsg(undefined);
        setBenchmarkConfig({ ...benchmarkConfig, values: form.formData });

        console.log('Selected device headers:', selectedDeviceHeaders);
        console.log('Selected dataset:', selectedDataset);
        console.log('Selected model:', selectedModel);
        console.log('Benchmark config:', benchmarkConfig.values);

        if (!selectedDeviceHeaders.length) {
            setErrorMsg('Please select at least one device.');
            return;
        }

        if (!selectedDataset) {
            setErrorMsg('Please select a dataset.');
            return;
        }

        if (!selectedModel) {
            setErrorMsg('Please select a model.');
            return;
        }

        setIsCreating(true);
    };

    const onDatasetSelectChange = (event: SelectChangeEvent) => {
        setSelectedDataset(event.target.value);
    };

    const onModelSelectChange = (event: SelectChangeEvent) => {
        setSelectedModel(event.target.value);
    };

    return (
        <Dialog open={true} onClose={onDialogClose} fullWidth maxWidth="xs">
            <DialogTitle>Create Benchmark Job</DialogTitle>
            <DialogContent>
                <Grid container justifyContent="space-between" spacing={2}>
                    <Grid item xs={12}>
                        {errorMsg ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorMsg}
                            </Alert>
                        ) : null}
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>1. Select your dataset and model:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="dataset">Dataset</InputLabel>
                            <Select
                                labelId="dataset"
                                id="dataset-select"
                                value={selectedDataset}
                                label="Dataset"
                                onChange={onDatasetSelectChange}
                            >
                                {datasets &&
                                    datasets.map((dataset: IDataset) => (
                                        <MenuItem key={dataset.id} value={dataset.id}>
                                            {dataset.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="model">Model</InputLabel>
                            <Select
                                labelId="model"
                                id="model-select"
                                value={selectedModel}
                                label="Dataset"
                                onChange={onModelSelectChange}
                            >
                                {models &&
                                    models.map((model: IModel) => (
                                        <MenuItem key={model.id} value={model.id}>
                                            {model.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>2. Configure your Benchmark Job:</Typography>
                    </Grid>
                    <Grid item xs={12} mt={-2}>
                        <Form
                            schema={benchmarkConfig.schema}
                            onChange={(form) => onFormChange(form)}
                            onSubmit={(form) => onFormSubmit(form)}
                            formData={benchmarkConfig.values}
                            liveOmit={true}
                            omitExtraData={true}
                            liveValidate={true}
                        >
                            <Box display="flex" justifyContent="center" mt={1}>
                                <Button type="submit" variant="contained" endIcon={<StartIcon />}>
                                    Start Benchmark Job
                                </Button>
                            </Box>
                        </Form>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onDialogClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
