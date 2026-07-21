// SPDX-FileCopyrightText: 2026 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import { useEffect, useMemo, useState } from 'react';
import {
    Grid,
    Typography,
    Divider,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Box,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import useKeycloak from '../contexts/KeycloakContext';
import useApplicationTasks from '../contexts/TasksContext';
import useDatasetGroundTruth from '../hooks/useDatasetGroundTruth';
import DeviceList from '../components/edge-benchmark/DeviceList';
import AutoSearchResultModal from '../components/edge-benchmark/AutoSearchResultModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import IDeviceHeader from '../types/edge-benchmark/IDeviceHeader';
import IDataset from '../types/IDataset';
import IModel from '../types/IModel';
import FileInput from '../components/common/FileInput';
import { IInferenceClient } from '../types/edge-benchmark/IInferenceClients';
import { IAutoSearchRun, OptimizationFactor, LatencyPercentile } from '../types/edge-benchmark/IDeviceRecommendation';
import {
    DATASETS_PATH,
    MODELS_PATH,
    EDGE_BENCHMARK_DEVICE_HEADER_PATH,
    EDGE_BENCHMARK_AUTO_SEARCH_PATH,
    EDGE_BENCHMARK_FORM_JOB_CREATE_PATH,
} from '../endpoints';
import { httpGet, httpUpload, httpDelete } from '../api';

const FACTORS: OptimizationFactor[] = ['cost', 'energy', 'latency'];
const LATENCY_METRICS: LatencyPercentile[] = ['avg', 'p95', 'p99'];
const TRITON_CLIENTS = ['TritonDenseNetClient', 'TritonYoloClient'];

const EdgeBenchmarkAutoSearch = () => {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [deviceHeaders, setDeviceHeaders] = useState<IDeviceHeader[]>([]);
    const [selectedDeviceHeaders, setSelectedDeviceHeaders] = useState<IDeviceHeader[]>([]);
    const [datasets, setDatasets] = useState<IDataset[]>([]);
    const [models, setModels] = useState<IModel[]>([]);
    const [benchmarkConfig, setBenchmarkConfig] = useState<Record<string, any> | undefined>(undefined);
    const [modelConfiguration, setModelConfiguration] = useState<File | undefined>();

    const [selectedDataset, setSelectedDataset] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [uploadChunkSize, setUploadChunkSize] = useState<string>('10');
    const [factor, setFactor] = useState<OptimizationFactor>('cost');
    const [latencyMetric, setLatencyMetric] = useState<LatencyPercentile>('p95');
    const [latencyThresholdMs, setLatencyThresholdMs] = useState<string>('50');
    const [minAccuracy, setMinAccuracy] = useState<string>('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [runs, setRuns] = useState<IAutoSearchRun[]>([]);
    const [openRun, setOpenRun] = useState<IAutoSearchRun | undefined>(undefined);
    const [runDeleteStates, setRunDeleteStates] = useState<Record<string, boolean>>({});
    const [runPendingDelete, setRunPendingDelete] = useState<IAutoSearchRun | undefined>(undefined);

    // Warn when the chosen dataset lacks CVAT ground truth: accuracy will be N/A and
    // a minimum-accuracy floor would then exclude every device.
    const { hasGroundTruth } = useDatasetGroundTruth(selectedDataset);

    // Maps edge-XX hostnames to their Jetson marketing name (IDeviceHeader.name).
    const deviceNameByHostname = useMemo(
        () => Object.fromEntries(deviceHeaders.map((h) => [h.hostname, h.name])),
        [deviceHeaders],
    );

    // "Marketing name (edge-XX)", or just the hostname when no name is known.
    const deviceLabel = (hostname: string | null): string => {
        if (!hostname) return '—';
        const name = deviceNameByHostname[hostname]?.trim();
        return name ? `${name} (${hostname})` : hostname;
    };

    const fetchRuns = () => {
        httpGet(keycloak, EDGE_BENCHMARK_AUTO_SEARCH_PATH)
            .then((_runs) => {
                const sorted = (_runs as IAutoSearchRun[]).sort((a, b) =>
                    b.created_at.localeCompare(a.created_at),
                );
                setRuns(sorted);
            })
            .catch((error) => console.error(error));
    };

    // Deletes a run and (in the backend) the benchmark jobs it created.
    const onRunDeleteConfirmed = (confirmed: boolean) => {
        const run = runPendingDelete;
        setRunPendingDelete(undefined);
        if (!confirmed || !run) return;
        setRunDeleteStates((s) => ({ ...s, [run.id]: true }));
        httpDelete(keycloak, `${EDGE_BENCHMARK_AUTO_SEARCH_PATH}/${run.id}`)
            .then(() => fetchRuns())
            .catch((error) => console.error(error))
            .finally(() => setRunDeleteStates((s) => ({ ...s, [run.id]: false })));
    };

    useEffect(() => {
        httpGet(keycloak, EDGE_BENCHMARK_DEVICE_HEADER_PATH)
            .then((headers) => {
                const sorted = (headers as IDeviceHeader[]).sort((a, b) => a.hostname.localeCompare(b.hostname));
                setDeviceHeaders(sorted);
            })
            .catch((error) => console.error(error));
        httpGet(keycloak, DATASETS_PATH)
            .then((_datasets) => setDatasets(_datasets))
            .catch((error) => console.error(error));
        httpGet(keycloak, MODELS_PATH)
            .then((_models) => setModels(_models))
            .catch((error) => console.error(error));
        httpGet(keycloak, EDGE_BENCHMARK_FORM_JOB_CREATE_PATH)
            .then((schema) => setBenchmarkConfig({ schema, values: {} }))
            .catch((error) => console.error(error));
        fetchRuns();
    }, [keycloak]);

    const buildInferenceClient = (host: string): IInferenceClient => {
        const config = benchmarkConfig?.values ?? {};
        let inferenceClient: any = {
            protocol: config.protocol,
            host,
            port: config.port,
            num_workers: config.num_workers,
            samples_per_second: config.samples_per_second,
            batch_size: config.batch_size,
            warm_up: config.warm_up,
        };
        switch (config.inference_client) {
            case 'TritonDenseNetClient':
                inferenceClient = { ...inferenceClient, num_classes: config.num_classes, scaling: config.scaling };
                break;
            case 'TritonYoloClient':
                inferenceClient = {
                    ...inferenceClient,
                    num_classes: config.num_classes,
                    scaling: config.scaling,
                    confidence_thres: config.confidence_thres,
                    iou_thres: config.iou_thres,
                    input_width: config.input_width,
                    input_height: config.input_height,
                };
                break;
            default:
                throw new Error(`Unsupported inference client type: ${config.inference_client}`);
        }
        return inferenceClient;
    };

    const validate = (): boolean => {
        if (!selectedDeviceHeaders.length) {
            setErrorMsg('Please select at least one candidate device.');
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
        if (!Number(latencyThresholdMs) || Number(latencyThresholdMs) <= 0) {
            setErrorMsg('Please provide a positive latency threshold (ms).');
            return false;
        }
        const config = benchmarkConfig?.values;
        if (!config?.protocol || !config?.port) {
            setErrorMsg('Please configure the inference client (protocol and port).');
            return false;
        }
        return true;
    };

    const onSubmit = (form: any) => {
        setErrorMsg(undefined);
        setBenchmarkConfig({ ...benchmarkConfig, values: form.formData });
        if (!validate()) return;

        setIsSubmitting(true);
        const config = benchmarkConfig?.values ?? {};
        const candidateHostnames = selectedDeviceHeaders.map((device) => device.hostname);
        // edge_device.host is a placeholder; the backend overrides it per candidate.
        const placeholderHost = candidateHostnames[0];

        const payload = {
            created_at: new Date().toISOString(),
            model_id: selectedModel,
            dataset_id: selectedDataset,
            chunk_size: Number(uploadChunkSize),
            candidate_hostnames: candidateHostnames,
            factor,
            latency_metric: latencyMetric,
            latency_threshold_ms: Number(latencyThresholdMs),
            min_accuracy: minAccuracy === '' ? null : Number(minAccuracy),
            benchmark_config: {
                edge_device: { protocol: 'http', host: placeholderHost, port: 80 },
                inference_client: buildInferenceClient(placeholderHost),
                cpu_only: config.cpu_only,
            },
        };

        const formData = new FormData();
        formData.append('payload', JSON.stringify(payload));
        if (modelConfiguration) formData.append('model_metadata', modelConfiguration, modelConfiguration.name);

        httpUpload(keycloak, EDGE_BENCHMARK_AUTO_SEARCH_PATH, formData, undefined, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) =>
                        tasks?.addServerBackgroundTask(keycloak, tasks, task, () => fetchRuns()),
                    )
                    .catch((error) => console.error(error));
            })
            .catch((error) => {
                console.error(error);
                setErrorMsg(`Failed to start auto-search: ${error.message}`);
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h4" component="h4">
                        Edge Benchmark — Auto Search
                    </Typography>
                    <Typography>
                        Pick a model, candidate devices and a latency budget; the platform benchmarks each device and
                        recommends the best one for your chosen factor.
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6">1. Select candidate devices</Typography>
                    <DeviceList deviceHeaders={deviceHeaders} onDeviceSelectionChange={setSelectedDeviceHeaders} />
                </Grid>

                <Grid item xs={12}>
                    <Divider />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                        2. Model, dataset & objective
                    </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel id="dataset">Dataset *</InputLabel>
                        <Select
                            labelId="dataset"
                            value={selectedDataset}
                            label="Dataset *"
                            onChange={(e: SelectChangeEvent) => setSelectedDataset(e.target.value)}
                        >
                            {datasets.map((dataset) => (
                                <MenuItem key={dataset.id} value={dataset.id}>
                                    {dataset.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {selectedDataset && hasGroundTruth === false && (
                    <Grid item xs={12}>
                        <Alert severity="warning">
                            This dataset has no ground-truth annotations (annotations.xml). Accuracy
                            will be N/A, and a minimum-accuracy floor would exclude every device. Add
                            annotations in the Datasets tab first.
                        </Alert>
                    </Grid>
                )}

                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel id="model">Model *</InputLabel>
                        <Select
                            labelId="model"
                            value={selectedModel}
                            label="Model *"
                            onChange={(e: SelectChangeEvent) => setSelectedModel(e.target.value)}
                        >
                            {models.map((model) => (
                                <MenuItem key={model.id} value={model.id}>
                                    {model.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Upload chunk size"
                        type="number"
                        value={uploadChunkSize}
                        onChange={(e) => setUploadChunkSize(e.target.value)}
                        inputProps={{ inputMode: 'numeric', min: 1 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel id="factor">Optimize for</InputLabel>
                        <Select
                            labelId="factor"
                            value={factor}
                            label="Optimize for"
                            onChange={(e: SelectChangeEvent) => setFactor(e.target.value as OptimizationFactor)}
                        >
                            {FACTORS.map((f) => (
                                <MenuItem key={f} value={f}>
                                    {f}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Cheapest / lowest-energy / fastest device that meets the budget.</FormHelperText>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel id="latency-metric">Latency metric</InputLabel>
                        <Select
                            labelId="latency-metric"
                            value={latencyMetric}
                            label="Latency metric"
                            onChange={(e: SelectChangeEvent) => setLatencyMetric(e.target.value as LatencyPercentile)}
                        >
                            {LATENCY_METRICS.map((m) => (
                                <MenuItem key={m} value={m}>
                                    {m}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Latency threshold (ms)"
                        type="number"
                        value={latencyThresholdMs}
                        onChange={(e) => setLatencyThresholdMs(e.target.value)}
                        inputProps={{ inputMode: 'numeric', min: 1 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Minimum accuracy (0–1, optional)"
                        type="number"
                        value={minAccuracy}
                        onChange={(e) => setMinAccuracy(e.target.value)}
                        inputProps={{ inputMode: 'decimal', min: 0, max: 1, step: 0.01 }}
                        helperText="Excludes devices below this accuracy; needs dataset ground truth."
                    />
                </Grid>

                {benchmarkConfig && TRITON_CLIENTS.includes(benchmarkConfig.values.inference_client) ? (
                    <Grid item xs={12}>
                        <FileInput
                            text="Select model configuration"
                            accept=".pbtxt"
                            multiple={false}
                            onChange={(files: FileList) => setModelConfiguration(files[0])}
                        />
                        <FormHelperText>Optional but recommended *.pbtxt config for ONNX models.</FormHelperText>
                    </Grid>
                ) : null}

                <Grid item xs={12}>
                    <Divider />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                        3. Configure the inference client
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    {benchmarkConfig ? (
                        <Form
                            schema={benchmarkConfig.schema}
                            validator={validator}
                            onChange={(form) => setBenchmarkConfig({ ...benchmarkConfig, values: form.formData })}
                            onSubmit={onSubmit}
                            formData={benchmarkConfig.values}
                            liveOmit={true}
                            omitExtraData={true}
                        >
                            {errorMsg ? (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {errorMsg}
                                </Alert>
                            ) : null}
                            <Box display="flex" justifyContent="center">
                                <LoadingButton
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                    loadingPosition="end"
                                    endIcon={<SearchIcon />}
                                >
                                    Run Auto Search
                                </LoadingButton>
                            </Box>
                        </Form>
                    ) : null}
                </Grid>

                <Grid item xs={12}>
                    <Divider />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                        Past recommendations
                    </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mb: 4 }}>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Factor</TableCell>
                                    <TableCell>Constraint</TableCell>
                                    <TableCell>Winner</TableCell>
                                    <TableCell>Candidates</TableCell>
                                    <TableCell align="right">Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {runs.map((run) => (
                                    <TableRow key={run.id}>
                                        <TableCell>{new Date(run.created_at).toLocaleString()}</TableCell>
                                        <TableCell>{run.recommendation.factor}</TableCell>
                                        <TableCell>
                                            {run.recommendation.latency_metric} &le;{' '}
                                            {run.recommendation.latency_threshold_ms} ms
                                        </TableCell>
                                        <TableCell>{deviceLabel(run.recommendation.winner_hostname)}</TableCell>
                                        <TableCell>{run.recommendation.candidates.length}</TableCell>
                                        <TableCell align="right">
                                            <Button size="small" onClick={() => setOpenRun(run)}>
                                                Open
                                            </Button>
                                            <Tooltip title="Delete run">
                                                <span>
                                                    <LoadingButton
                                                        color="error"
                                                        size="small"
                                                        loading={runDeleteStates[run.id]}
                                                        onClick={() => setRunPendingDelete(run)}
                                                    >
                                                        <DeleteIcon />
                                                    </LoadingButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            {openRun ? (
                <AutoSearchResultModal
                    recommendation={openRun.recommendation}
                    deviceNameByHostname={deviceNameByHostname}
                    onClose={() => setOpenRun(undefined)}
                />
            ) : null}

            {runPendingDelete ? (
                <ConfirmationDialog
                    title="Delete auto-search run"
                    message={`This will permanently delete this recommendation and the ${
                        runPendingDelete.recommendation.candidates.filter((c) => c.benchmark_job_id).length
                    } benchmark job(s) it created — they will also be removed from the Jobs history. This cannot be undone.`}
                    handleResult={onRunDeleteConfirmed}
                />
            ) : null}
        </>
    );
};

export default EdgeBenchmarkAutoSearch;
