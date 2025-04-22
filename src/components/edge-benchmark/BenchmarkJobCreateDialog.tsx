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
import Box from '@mui/material/Box';
import { Grid, Divider } from '@mui/material';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import StartIcon from '@mui/icons-material/Start';
import LoadingButton from '@mui/lab/LoadingButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { TextField, Typography } from '@mui/material';
import Form from '@rjsf/material-ui/v5';
import IDataset from '../../types/IDataset';
import IModel from '../../types/IModel';
import useKeycloak from '../../contexts/KeycloakContext';
import IAlertMessage from '../../types/IAlertMessage';
import IDeviceHeader from '../../types/edge-benchmark/IDeviceHeader';
import IEdgeDevice from '../../types/edge-benchmark/IEdgeDevice';
import FileInput from '../common/FileInput';
import useApplicationTasks from '../../contexts/TasksContext';
import IBenchmarkConfig from '../../types/edge-benchmark/IBenchmarkConfig';
import { IInferenceClient } from '../../types/edge-benchmark/IInferenceClients';
import { DATASETS_PATH, MODELS_PATH, EDGE_BENCHMARK_START_PATH } from '../../endpoints';
import { httpGet, httpUpload } from '../../api';

interface IBenchmarkJobCreateProps {
    selectedDeviceHeaders: IDeviceHeader[];
    onClose: () => void;
}

export default function ({ selectedDeviceHeaders, onClose }: IBenchmarkJobCreateProps) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const tritonInferenceClients = ['TritonDenseNetClient', 'TritonYoloClient'];

    const [benchmarkConfig, setBenchmarkConfig] = useState<Record<string, any>>({
        schema: {
            type: 'object',
            properties: {
                inference_client: {
                    title: 'Edge inference client',
                    type: 'string',
                    default: 'TritonDenseNetClient',
                    enum: tritonInferenceClients,
                    description: 'The type of Edge Inference Client to use.',
                },
                protocol: {
                    title: 'Inference server protocol',
                    type: 'string',
                    default: 'http',
                    enum: ['http', 'https'],
                    description: 'Network protocol used by the Inference Server.',
                },
                port: {
                    title: 'Inference server port',
                    type: 'integer',
                    description: 'Network port used by the Inference Server.',
                    default: 8000,
                    minimum: 1,
                    maximum: 65535,
                },
                num_workers: {
                    title: 'Worker threads',
                    type: 'integer',
                    description: 'Number of worker threads used for pre- and postprocessing inference data.',
                    default: 1,
                    minimum: 1,
                },
                samples_per_second: {
                    title: 'Samples per second',
                    type: 'number',
                    description: 'Limit inference speed to this many samples per second.',
                    minimum: 0,
                },
                batch_size: {
                    title: 'Batch size',
                    type: 'integer',
                    description: 'Batch size to use for inference requests.',
                    default: 1,
                    minimum: 1,
                },
                warm_up: {
                    title: 'Apply model warmup',
                    type: 'boolean',
                    default: false,
                    description: 'Apply model warmup at the beginning of inference.',
                },
                cpu_only: {
                    title: 'Benchmark on CPU only',
                    type: 'boolean',
                    default: false,
                    description: 'Run inference only on CPU during benchmarking.',
                },
                num_classes: {
                    title: 'Class count',
                    type: 'integer',
                    description: 'Number of classes present in the inference dataset.',
                    default: 1000,
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
            required: ['protocol', 'port'],
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
                        required: ['input_width', 'input_height'],
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
    const [modelConfiguration, setModelConfiguration] = useState<File | undefined>();
    const [uploadChunkSize, setUploadChunksize] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const fetchDatasets = async () => {
        httpGet(keycloak, DATASETS_PATH)
            .then((_datasets) => {
                setDatasets(_datasets);
            })
            .catch((error) => {
                console.error(error);
                setErrorMsg(`Fetching datasets: ${error.message}`);
            });
    };

    const fetchModels = async () => {
        httpGet(keycloak, MODELS_PATH)
            .then((_models) => {
                setModels(_models);
            })
            .catch((error) => {
                console.error(error);
                setErrorMsg(`Fetching models: ${error.message}`);
            });
    };

    useEffect(() => {
        fetchDatasets();
        fetchModels();
    }, [keycloak]);

    const onFormChange = (form: any) => {
        setBenchmarkConfig({ ...benchmarkConfig, values: form.formData });
    };

    const validateFormInputs = () => {
        if (!selectedDeviceHeaders.length) {
            setErrorMsg('Please select at least one device.');
            return false;
        }

        if (!selectedDataset) {
            setErrorMsg('Please select a dataset.');
            return false;
        }

        if (!selectedModel) {
            setErrorMsg('Please select a model.');
            return false;
        }

        const config = benchmarkConfig.values;

        if (!config.protocol) {
            setErrorMsg('Please select a protocol for the inference client.');
            return false;
        }

        if (!config.port) {
            setErrorMsg('Please select a port for the inference client.');
            return false;
        }

        switch (config.inference_client) {
            case 'TritonYoloClient':
                if (!config.input_width) {
                    setErrorMsg('Please provide an input width.');
                    return false;
                }
                if (!config.input_height) {
                    setErrorMsg('Please provide an input height.');
                    return false;
                }
                break;
        }

        return true;
    };

    const createEdgeBenchmarkStartPayload = (edgeDevice: IEdgeDevice, createdAt: string) => {
        const config = benchmarkConfig.values;

        let inferenceClient: IInferenceClient = {
            protocol: config.protocol,
            host: edgeDevice.host,
            port: config.port,
            num_workers: config.num_workers,
            samples_per_second: config.samples_per_second,
        };

        inferenceClient = {
            ...{
                batch_size: config.batch_size,
                warm_up: config.warm_up,
            },
            ...inferenceClient,
        };

        switch (config.inference_client) {
            case 'TritonDenseNetClient':
                inferenceClient = {
                    ...inferenceClient,
                    ...{ num_classes: config.num_classes, scaling: config.scaling },
                };
                break;
            case 'TritonYoloClient':
                inferenceClient = {
                    ...inferenceClient,
                    ...{
                        num_classes: config.num_classes,
                        scaling: config.scaling,
                        confidence_thres: config.confidence_thres,
                        iou_thres: config.iou_thresh,
                        input_width: config.input_width,
                        input_height: config.input_height,
                    },
                };
                break;
            default:
                throw new Error(`Unsupported inference client type: ${config.inference_client}`);
        }

        const benchmarkConfigDto: IBenchmarkConfig = {
            edge_device: edgeDevice,
            inference_client: inferenceClient,
            cpu_only: config.cpu_only,
        };

        return {
            created_at: createdAt,
            dataset_id: selectedDataset,
            model_id: selectedModel,
            chunk_size: Number(uploadChunkSize),
            benchmark_config: benchmarkConfigDto,
        };
    };

    const startBenchmarkJob = (formData: FormData, edgeDevice: IEdgeDevice) => {
        setErrorMsg(undefined);
        return httpUpload(keycloak, `${EDGE_BENCHMARK_START_PATH}`, formData, undefined, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => tasks?.addServerBackgroundTask(keycloak, tasks, task))
                    .catch((error) => console.error(error));
            })
            .catch((error) => {
                console.error(error);
                setErrorMsg(`Failed to start Benchmark Job: ${error.message}`);
            });
    };

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const onFormSubmit = async (form: any) => {
        setErrorMsg(undefined);
        setBenchmarkConfig({ ...benchmarkConfig, values: form.formData });

        if (!validateFormInputs()) return;

        setIsCreating(true);
        const startPromises = [];
        const createdAt = new Date().toISOString();
        for (const selectedDeviceHeader of selectedDeviceHeaders) {
            // TODO: Send full connection information as part of the device header
            const edgeDevice: IEdgeDevice = {
                protocol: 'http',
                host: selectedDeviceHeader.hostname,
                port: 80,
            };
            const edgeBenchmarkStartPayload = createEdgeBenchmarkStartPayload(edgeDevice, createdAt);

            const formData = new FormData();
            formData.append('payload', JSON.stringify(edgeBenchmarkStartPayload));
            if (modelConfiguration) formData.append('model_metadata', modelConfiguration, modelConfiguration.name);

            const startPromise = startBenchmarkJob(formData, edgeDevice);
            startPromises.push(startPromise);
        }

        Promise.all(startPromises)
            .then(onClose)
            .catch((error) => console.error(error))
            .finally(() => setIsCreating(false));
    };

    const onDatasetSelectChange = (event: SelectChangeEvent) => {
        setSelectedDataset(event.target.value);
    };

    const onModelSelectChange = (event: SelectChangeEvent) => {
        setSelectedModel(event.target.value);
    };

    const onModelConfigurationFileSelectChange = (files: FileList) => {
        setModelConfiguration(files[0]);
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Create a new benchmark job</DialogTitle>
            <DialogContent>
                <Grid container justifyContent="space-between" spacing={2}>
                    <Grid item xs={12}>
                        <Typography>1. Select your dataset and model:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="dataset">Dataset *</InputLabel>
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
                            <FormHelperText>Dataset to use for model inference.</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <TextField
                                label="Upload chunk size"
                                variant="outlined"
                                value={uploadChunkSize}
                                onChange={(e) => setUploadChunksize(e.target.value)}
                                type="number"
                                inputProps={{ inputMode: 'numeric', min: 0 }}
                            />
                            <FormHelperText>Number of dataset samples to upload at once.</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="model">Model *</InputLabel>
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
                            <FormHelperText>Model to benchmark on selected dataset.</FormHelperText>
                        </FormControl>
                    </Grid>
                    {tritonInferenceClients.includes(benchmarkConfig.values.inference_client) ? (
                        <>
                            <Grid item xs={12}>
                                <FileInput
                                    text="Select model configuration"
                                    accept="text/plain"
                                    multiple={false}
                                    onChange={onModelConfigurationFileSelectChange}
                                />
                                <FormHelperText>
                                    Optional but recommended *.pbtxt config for ONNX models.
                                </FormHelperText>
                            </Grid>
                        </>
                    ) : null}
                    <Grid item xs={12}>
                        <Divider />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>2. Configure your benchmark job:</Typography>
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
                            <Grid container justifyContent="center" alignItems="center">
                                <Grid item xs={12}>
                                    {errorMsg ? (
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            {errorMsg}
                                        </Alert>
                                    ) : null}
                                </Grid>
                                <Grid item xs={12}>
                                    <Box display="flex" justifyContent="center">
                                        <LoadingButton
                                            type="submit"
                                            variant="contained"
                                            loading={isCreating}
                                            loadingPosition="end"
                                            endIcon={<StartIcon />}
                                        >
                                            Start Benchmark Job
                                        </LoadingButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Form>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
