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

import { useState } from 'react';
import { DataGrid, GridRowSelectionModel } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import IBenchmarkJob from '../../types/edge-benchmark/IBenchmarkJob';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import useKeycloak from '../../contexts/KeycloakContext';
import { httpGet, httpDelete } from '../../api';
import { EDGE_BENCHMARK_JOBS_PATH, EDGE_BENCHMARK_RESULTS_PATH } from '../../endpoints';
import { downloadBlob } from '../../util';
import JobResultsPreviewModal from './JobResultsPreviewModal';

const JobList = ({
    jobs,
    onDelete,
    onJobSelectionChange,
}: {
    jobs: IBenchmarkJob[];
    onDelete: () => void;
    onJobSelectionChange: (selectedJobs: IBenchmarkJob[]) => void;
}) => {
    const keycloak = useKeycloak();
    document.documentElement.setAttribute('data-color-mode', 'light');

    const [jobResultsDownloadStates, setJobResultsDownloadStates] = useState<Record<string, boolean>>({});
    const [jobDeleteStates, setJobDeleteStates] = useState<Record<string, boolean>>({});
    const [jobResultsPreviewStates, setJobResultsPreviewStates] = useState<Record<string, boolean>>({});

    const [jobResultsPreviewModalOpen, setJobResultsPreviewModalOpen] = useState(false);
    const [selectedBenchmarkJobResult, setSelectedBenchmarkJobResult] = useState<Record<string, any>>();
    const [selectedBenchmarkJob, setSelectedBenchmarkJob] = useState<IBenchmarkJob>();

    const onJobResultsDownloadClick = async (job: IBenchmarkJob) => {
        setJobResultsDownloadStates({ ...jobResultsDownloadStates, [job.id]: true });
        httpGet(keycloak, `${EDGE_BENCHMARK_RESULTS_PATH}/${job.id}/download`)
            .then(({ blob, fileName }) => downloadBlob(blob, fileName))
            .catch((error) => console.error(error))
            .finally(() => setJobResultsDownloadStates({ ...jobResultsDownloadStates, [job.id]: false }));
    };

    const onJobResultsPreviewClick = async (job: IBenchmarkJob) => {
        setJobResultsPreviewStates({ ...jobResultsPreviewStates, [job.id]: true });
        httpGet(keycloak, `${EDGE_BENCHMARK_RESULTS_PATH}/${job.id}`)
            .then((results) => {
                delete results.benchmark_job.inference_results.results;
                setSelectedBenchmarkJob(job);
                setSelectedBenchmarkJobResult(results);
                setJobResultsPreviewModalOpen(true);
            })
            .catch((error) => console.error(error))
            .finally(() => setJobResultsPreviewStates({ ...jobResultsPreviewStates, [job.id]: false }));
    };

    const onJobDeleteClick = async (job: IBenchmarkJob) => {
        setJobDeleteStates({ ...jobDeleteStates, [job.id]: true });
        httpDelete(keycloak, `${EDGE_BENCHMARK_JOBS_PATH}/${job.id}`)
            .then(onDelete)
            .catch((error) => console.error(error))
            .finally(() => setJobDeleteStates({ ...jobDeleteStates, [job.id]: false }));
    };

    const onJobResultsPreviewModalClose = () => {
        setJobResultsPreviewModalOpen(false);
    };

    const columns: any[] = [
        { field: 'edge_device', headerName: 'Device identifier', flex: 1 },
        {
            field: 'dataset',
            headerName: 'Dataset',
            flex: 1,
            renderCell: (params: any) => {
                return params.value.name;
            },
        },
        {
            field: 'model_name',
            headerName: 'Model',
            flex: 1,
            renderCell: (params: any) => params.row.model.name,
        },
        {
            field: 'model_format',
            headerName: 'Model format',
            flex: 1,
            renderCell: (params: any) => params.row.model.format,
        },
        {
            field: 'model_input_shape',
            headerName: 'Input shape',
            flex: 1,
            renderCell: (params: any) => `(${params.row.model.input_shape.join(', ')})`,
        },
        {
            field: 'model_output_shape',
            headerName: 'Output shape',
            flex: 1,
            renderCell: (params: any) => `(${params.row.model.output_shape.join(', ')})`,
        },
        {
            field: 'inference_client',
            headerName: 'Inference client',
            width: 175,
        },
        {
            field: 'cpu_only',
            headerName: 'Ran on',
            width: 75,
            renderCell: (params: any) => {
                return params.value ? 'CPU' : 'GPU';
            },
        },
        {
            field: 'owner',
            headerName: 'Created by',
            width: 100,
        },
        {
            field: 'timestamp',
            headerName: 'Created on',
            width: 175,
            renderCell: (params: any) => {
                const date = new Date(params.value);

                return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                });
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 220,
            renderCell: (params: any) => {
                const job = params.row;
                const job_id = job.id;
                return (
                    <>
                        <Tooltip title="Preview results">
                            <span>
                                <LoadingButton
                                    color="info"
                                    loading={jobResultsPreviewStates[job_id]}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJobResultsPreviewClick(job);
                                    }}
                                >
                                    <VisibilityIcon />
                                </LoadingButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Download results">
                            <span>
                                <LoadingButton
                                    color="primary"
                                    loading={jobResultsDownloadStates[job_id]}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJobResultsDownloadClick(job);
                                    }}
                                >
                                    <DownloadIcon />
                                </LoadingButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Delete job">
                            <span>
                                <LoadingButton
                                    color="error"
                                    loading={jobDeleteStates[job_id]}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJobDeleteClick(job);
                                    }}
                                >
                                    <DeleteIcon />
                                </LoadingButton>
                            </span>
                        </Tooltip>
                    </>
                );
            },
        },
    ];

    return (
        <>
            <DataGrid
                rows={jobs}
                columns={columns}
                getRowId={(job: IBenchmarkJob) => job.id}
                checkboxSelection
                onRowSelectionModelChange={(jobIds: GridRowSelectionModel) =>
                    onJobSelectionChange(jobs.filter((job) => jobIds.includes(job.id)))
                }
            />
            {jobResultsPreviewModalOpen && selectedBenchmarkJobResult && selectedBenchmarkJob ? (
                <JobResultsPreviewModal
                    onClose={onJobResultsPreviewModalClose}
                    benchmarkJob={selectedBenchmarkJob}
                    benchmarkJobResult={selectedBenchmarkJobResult}
                />
            ) : null}
        </>
    );
};

export default JobList;
