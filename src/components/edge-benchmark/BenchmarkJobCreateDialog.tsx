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
import CameraIcon from '@mui/icons-material/Camera';
import LoadingButton from '@mui/lab/LoadingButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { TextField, Typography } from '@mui/material';
import Form from '@rjsf/material-ui/v5';
import IDataset from '../../types/IDataset';
import IModel from '../../types/IModel';
import ISensorInfo from '../../types/ISensorInfo';
import IAlertMessage from '../../types/IAlertMessage';
import useKeycloak from '../../contexts/KeycloakContext';
import IDeviceHeader from '../../types/edge-benchmark/IDeviceHeader';
import IEdgeDevice from '../../types/edge-benchmark/IEdgeDevice';
import FileInput from '../common/FileInput';
import useApplicationTasks from '../../contexts/TasksContext';
import IBenchmarkConfig from '../../types/edge-benchmark/IBenchmarkConfig';
import AlertSnackbar from '../../components/common/AlertSnackbar';
import { IInferenceClient } from '../../types/edge-benchmark/IInferenceClients';
import {
    DATASETS_PATH,
    MODELS_PATH,
    EDGE_BENCHMARK_FORM_PATH,
    EDGE_BENCHMARK_START_PATH,
    EDGE_BENCHMARK_SENSOR_PATH,
} from '../../endpoints';
import { httpGet, httpUpload, httpPost } from '../../api';
import { downloadBlob } from '../../util';

interface IBenchmarkJobCreateProps {
    selectedDeviceHeaders: IDeviceHeader[];
    onClose: () => void;
}

export default function ({ selectedDeviceHeaders, onClose }: IBenchmarkJobCreateProps) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [benchmarkConfig, setBenchmarkConfig] = useState<Record<string, any> | undefined>(undefined);
    const [sensorConfig, setSensorConfig] = useState<Record<string, any> | undefined>(undefined);
    const [datasets, setDatasets] = useState<Array<IDataset> | undefined>(undefined);
    const [selectedDataset, setSelectedDataset] = useState<string>('');
    const [models, setModels] = useState<Array<IModel> | undefined>(undefined);
    const [sensors, setSensors] = useState<Array<ISensorInfo> | undefined>(undefined);
    const [modelConfiguration, setModelConfiguration] = useState<File | undefined>();
    const [uploadChunkSize, setUploadChunksize] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedSensor, setSelectedSensor] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [createErrorMsg, setCreateErrorMsg] = useState<string | undefined>(undefined);
    const [captureErrorMsg, setCaptureErrorMsg] = useState<string | undefined>(undefined);
    const [snackbarMessage, setSnackbarMessage] = useState<IAlertMessage>({
        message: undefined,
        severity: undefined,
        open: false,
    });

    const tritonInferenceClients = ['TritonDenseNetClient', 'TritonYoloClient'];

    const fetchBenchmarkConfigFormSchema = async () => {
        httpGet(keycloak, `${EDGE_BENCHMARK_FORM_PATH}/create`)
            .then((_schema) => setBenchmarkConfig({ schema: _schema, values: {} }))
            .catch((error) => {
                console.error(error);
                setCreateErrorMsg(`Fetching job create form: ${error.message}`);
            });
    };

    // TODO: Cleanup
    const fetchSensorConfigFormSchema = async () => {
        httpGet(keycloak, `${EDGE_BENCHMARK_FORM_PATH}/sensors`)
            .then((_schema) => {
                setSensorConfig({ schema: _schema, values: {} });
                console.log('Sensor configuration schema:', _schema);
            })
            .catch((error) => {
                console.error(error);
                setCreateErrorMsg(`Fetching sensor configuration form: ${error.message}`);
            });
    };

    const fetchDatasets = async () => {
        httpGet(keycloak, DATASETS_PATH)
            .then((_datasets) => setDatasets(_datasets))
            .catch((error) => {
                console.error(error);
                setCreateErrorMsg(`Fetching datasets: ${error.message}`);
            });
    };

    const fetchModels = async () => {
        httpGet(keycloak, MODELS_PATH)
            .then((_models) => setModels(_models))
            .catch((error) => {
                console.error(error);
                setCreateErrorMsg(`Fetching models: ${error.message}`);
            });
    };

    // TODO: Cleanup
    const fetchSensors = async () => {
        httpGet(keycloak, EDGE_BENCHMARK_SENSOR_PATH)
            .then((_sensors) => {
                setSensors(_sensors);
                console.log('Sensors:', _sensors);
            })
            .catch((error) => {
                console.error(error);
                setCreateErrorMsg(`Fetching sensors: ${error.message}`);
            });
    };

    useEffect(() => {
        fetchBenchmarkConfigFormSchema();
        fetchSensorConfigFormSchema();
        fetchDatasets();
        fetchModels();
        fetchSensors();
    }, [keycloak]);

    const onCreateJobFormChange = (form: any) => {
        setBenchmarkConfig({ ...benchmarkConfig, values: form.formData });
    };

    const validateCreateJobFormInputs = () => {
        if (!selectedDeviceHeaders.length) {
            setCreateErrorMsg('Please select at least one device.');
            return false;
        }

        if (!selectedDataset) {
            setCreateErrorMsg('Please select a dataset.');
            return false;
        }

        if (!selectedModel) {
            setCreateErrorMsg('Please select a model.');
            return false;
        }

        const config = benchmarkConfig?.values;

        if (!config.protocol) {
            setCreateErrorMsg('Please select a protocol for the inference client.');
            return false;
        }

        if (!config.port) {
            setCreateErrorMsg('Please select a port for the inference client.');
            return false;
        }

        switch (config.inference_client) {
            case 'TritonYoloClient':
                if (!config.input_width) {
                    setCreateErrorMsg('Please provide an input width.');
                    return false;
                }
                if (!config.input_height) {
                    setCreateErrorMsg('Please provide an input height.');
                    return false;
                }
                break;
        }

        return true;
    };

    const createEdgeBenchmarkStartPayload = (edgeDevice: IEdgeDevice, createdAt: string) => {
        const config = benchmarkConfig?.values;

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
        setCreateErrorMsg(undefined);
        return httpUpload(keycloak, `${EDGE_BENCHMARK_START_PATH}`, formData, undefined, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => tasks?.addServerBackgroundTask(keycloak, tasks, task))
                    .catch((error) => console.error(error));
            })
            .catch((error) => {
                console.error(error);
                setCreateErrorMsg(`Failed to start Benchmark Job: ${error.message}`);
            });
    };

    const onSensorConfigFormSubmit = async (form: any) => {
        setCaptureErrorMsg(undefined);
        setSensorConfig({ ...sensorConfig, values: form.formData });
        if (!sensorConfig) return;
        setIsCapturing(true);

        const { max_sample_size, ...client_config } = sensorConfig.values;
        await httpPost(keycloak, `${EDGE_BENCHMARK_SENSOR_PATH}/${selectedSensor}/capture`, {
            client_config: client_config,
            max_sample_size,
        })
            .then(({ blob, fileName }) => downloadBlob(blob, fileName))
            .catch((error) => {
                console.error(error);
                setCaptureErrorMsg(error.message);
            })
            .finally(() => setIsCapturing(false));
    };

    const onSensorConfigFormChange = async (form: any) => {
        setSensorConfig({ ...sensorConfig, values: form.formData });
    };

    const onCreateJobFormSubmit = async (form: any) => {
        setCreateErrorMsg(undefined);
        setBenchmarkConfig({ ...benchmarkConfig, values: form.formData });

        if (!validateCreateJobFormInputs()) return;

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

    const onSensorSelectChange = (event: SelectChangeEvent) => {
        setSelectedSensor(event.target.value);
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
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="xs">
                <DialogTitle>Create a new benchmark job</DialogTitle>
                <DialogContent>
                    <>
                        {sensors && sensorConfig ? (
                            <Grid container justifyContent="space-between" spacing={2}>
                                <Grid item xs={12}>
                                    <Typography>
                                        <b>Optional:</b> Capture a new dataset using a sensor first.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel id="sensor">Sensor</InputLabel>
                                        <Select
                                            labelId="sensor"
                                            id="sensor-select"
                                            value={selectedSensor}
                                            label="Sensor"
                                            onChange={onSensorSelectChange}
                                        >
                                            <MenuItem value="">
                                                <em>Please select a sensor...</em>
                                            </MenuItem>
                                            {sensors.map((sensor: ISensorInfo) => (
                                                <MenuItem key={sensor.hostname} value={sensor.hostname}>
                                                    {sensor.hostname}: {sensor.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <FormHelperText>
                                            Use this sensor to capture a new benchmark dataset.
                                        </FormHelperText>
                                    </FormControl>
                                </Grid>
                                {selectedSensor ? (
                                    <Grid item xs={12} mt={-2}>
                                        <Form
                                            schema={sensorConfig.schema}
                                            onChange={(form) => onSensorConfigFormChange(form)}
                                            onSubmit={(form) => onSensorConfigFormSubmit(form)}
                                            formData={sensorConfig.values}
                                            liveOmit={true}
                                            omitExtraData={true}
                                            liveValidate={true}
                                        >
                                            <Grid container justifyContent="center" alignItems="center">
                                                <Grid item xs={12}>
                                                    {captureErrorMsg ? (
                                                        <Alert severity="error" sx={{ mb: 2 }}>
                                                            {captureErrorMsg}
                                                        </Alert>
                                                    ) : null}
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Box display="flex" justifyContent="center">
                                                        <LoadingButton
                                                            type="submit"
                                                            variant="contained"
                                                            loading={isCapturing}
                                                            loadingPosition="end"
                                                            endIcon={<CameraIcon />}
                                                        >
                                                            Capture Dataset
                                                        </LoadingButton>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Form>
                                    </Grid>
                                ) : null}
                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid item container justifyContent="center">
                                <CircularProgress color="primary" />
                            </Grid>
                        )}

                        {benchmarkConfig ? (
                            <Grid container justifyContent="space-between" spacing={2}>
                                <Grid item xs={12} mt={2}>
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
                                        <FormHelperText>Use this dataset for model inference.</FormHelperText>
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
                                        onChange={(form) => onCreateJobFormChange(form)}
                                        onSubmit={(form) => onCreateJobFormSubmit(form)}
                                        formData={benchmarkConfig.values}
                                        liveOmit={true}
                                        omitExtraData={true}
                                        liveValidate={true}
                                    >
                                        <Grid container justifyContent="center" alignItems="center">
                                            <Grid item xs={12}>
                                                {createErrorMsg ? (
                                                    <Alert severity="error" sx={{ mb: 2 }}>
                                                        {createErrorMsg}
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
                        ) : (
                            <Grid item container justifyContent="center">
                                <CircularProgress color="primary" />
                            </Grid>
                        )}
                    </>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <AlertSnackbar
                message={snackbarMessage.message}
                severity={snackbarMessage.severity}
                open={snackbarMessage.open}
                onClose={() => setSnackbarMessage({ ...snackbarMessage, open: false })}
            />
        </>
    );
}
