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
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IBenchmarkJob from '../../types/edge-benchmark/IBenchmarkJob';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import useKeycloak from '../../contexts/KeycloakContext';

const JobList = ({ jobs }: { jobs: IBenchmarkJob[] }) => {
    const keycloak = useKeycloak();

    const [jobResultsLoadingStates, setJobResultsLoadingStates] = useState<Record<string, boolean>>({});

    // TODO: Download results as JSON file
    const onJobResultsDownloadClick = (job: IBenchmarkJob) => {
        console.log('Download', job);
    };

    // TODO: Open minio location in new tab
    const onJobResultsOpenClick = (job: IBenchmarkJob) => {
        console.log('Open', job);
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
            headerName: 'Accel.',
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
            width: 150,
            renderCell: (params: any) => {
                const job = params.row;
                const job_id = job.id;
                return (
                    <>
                        <Tooltip title="Open in MinIO">
                            <span>
                                <Button
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJobResultsOpenClick(job);
                                    }}
                                >
                                    <OpenInNewIcon />
                                </Button>
                            </span>
                        </Tooltip>
                        <Tooltip title="Download results">
                            <span>
                                <LoadingButton
                                    color="primary"
                                    loading={jobResultsLoadingStates[job_id]}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onJobResultsDownloadClick(job);
                                    }}
                                >
                                    <DownloadIcon />
                                </LoadingButton>
                            </span>
                        </Tooltip>
                    </>
                );
            },
        },
    ];

    return <DataGrid rows={jobs} columns={columns} getRowId={(job: IBenchmarkJob) => job.id} />;
};

export default JobList;
