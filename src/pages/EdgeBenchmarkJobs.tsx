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
import Fab from '@mui/material/Fab';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareIcon from '@mui/icons-material/Compare';
import { Grid, Typography } from '@mui/material';
import useKeycloak from '../contexts/KeycloakContext';
import { EDGE_BENCHMARK_JOBS_PATH, EDGE_BENCHMARK_RESULTS_PATH } from '../endpoints';
import JobList from '../components/edge-benchmark/JobList';
import IBenchmarkJob from '../types/edge-benchmark/IBenchmarkJob';
import { httpGet, httpPost, httpDelete } from '../api';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { downloadBlob } from '../util';
import JobCompareModal from '../components/edge-benchmark/JobCompareModal';

const EdgeBenchmarkJobs = () => {
    const keycloak = useKeycloak();
    const [benchmarkJobs, setBenchmarkJobs] = useState<IBenchmarkJob[]>([]);
    const [selectedBenchmarkJobs, setSelectedBenchmarkJobs] = useState<IBenchmarkJob[]>([]);
    const [selectedBenchmarkJobResults, setSelectedBenchmarkJobResults] = useState<Record<string, any>[]>([]);
    const [areBenchmarkJobsDeleting, setAreBenchmarkJobsDeleting] = useState(false);
    const [areBenchmarkResultsDownloading, setAreBenchmarkResultsDownloading] = useState(false);
    const [isBenchmarkJobComparisonLoading, setIsBenchmarkJobComparisonLoading] = useState(false);
    const [jobCompareModalOpen, setJobCompareModalOpen] = useState(false);

    useEffect(() => {
        fetchBenchmarkJobs();
    }, [keycloak]);

    const fetchBenchmarkJobs = async () => {
        httpGet(keycloak, EDGE_BENCHMARK_JOBS_PATH)
            .then((_benchmarkJobs: IBenchmarkJob[]) => setBenchmarkJobs(_benchmarkJobs))
            .catch((error) => console.error('Failed to fetch benchmark jobs', error));
    };

    const onJobSelectionChange = (selectedJobs: IBenchmarkJob[]) => {
        setSelectedBenchmarkJobs(selectedJobs);
    };

    const onBenchmarkJobsDownloadIconClick = () => {
        setAreBenchmarkResultsDownloading(true);
        const job_ids = selectedBenchmarkJobs.map((job) => job.id);
        httpPost(keycloak, `${EDGE_BENCHMARK_RESULTS_PATH}/download`, job_ids)
            .then(({ blob, fileName }) => downloadBlob(blob, fileName))
            .catch((error) => console.error(error))
            .finally(() => setAreBenchmarkResultsDownloading(false));
    };

    const onBenchmarkJobsDeleteIconClick = () => {
        setAreBenchmarkJobsDeleting(true);

        const deletePromises = [];
        for (const job of selectedBenchmarkJobs) {
            const deletePromise = httpDelete(keycloak, `${EDGE_BENCHMARK_JOBS_PATH}/${job.id}`);
            deletePromises.push(deletePromise);
        }

        Promise.all(deletePromises)
            .then(fetchBenchmarkJobs)
            .catch((error) => console.error(error))
            .finally(() => setAreBenchmarkJobsDeleting(false));
    };

    const onBenchmarkJobsCompareIconClick = () => {
        setIsBenchmarkJobComparisonLoading(true);

        const resultPromises = [];
        for (const job of selectedBenchmarkJobs) {
            const resultPromise = httpGet(keycloak, `${EDGE_BENCHMARK_RESULTS_PATH}/${job.id}`);
            resultPromises.push(resultPromise);
        }

        Promise.all(resultPromises)
            .then((results) => {
                setSelectedBenchmarkJobResults(results);
                setJobCompareModalOpen(true);
            })
            .catch((error) => console.error(error))
            .finally(() => setIsBenchmarkJobComparisonLoading(false));
    };

    const onJobCompareModalClose = () => {
        setJobCompareModalOpen(false);
    };

    return (
        <>
            <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Typography variant="h4" component="h4">
                        Edge Benchmark Jobs
                    </Typography>
                </Grid>
                {selectedBenchmarkJobs.length >= 2 ? (
                    <Grid item xs={6}>
                        <Fab
                            color="error"
                            aria-label="delete"
                            size="small"
                            sx={{ float: 'right', mr: 2 }}
                            onClick={onBenchmarkJobsDeleteIconClick}
                            disabled={areBenchmarkJobsDeleting}
                        >
                            <Tooltip title="Delete selected">
                                {areBenchmarkJobsDeleting ? <CircularProgress color="error" /> : <DeleteIcon />}
                            </Tooltip>
                        </Fab>
                        <Fab
                            color="primary"
                            aria-label="download"
                            size="small"
                            sx={{ float: 'right', mr: 2 }}
                            onClick={onBenchmarkJobsDownloadIconClick}
                            disabled={areBenchmarkResultsDownloading}
                        >
                            <Tooltip title="Download selected">
                                {areBenchmarkResultsDownloading ? (
                                    <CircularProgress color="primary" />
                                ) : (
                                    <DownloadIcon />
                                )}
                            </Tooltip>
                        </Fab>
                        <Fab
                            color="info"
                            aria-label="compare"
                            size="small"
                            sx={{ float: 'right', mr: 2 }}
                            onClick={onBenchmarkJobsCompareIconClick}
                            disabled={isBenchmarkJobComparisonLoading}
                        >
                            <Tooltip title="Compare selected">
                                {isBenchmarkJobComparisonLoading ? (
                                    <CircularProgress color="primary" />
                                ) : (
                                    <CompareIcon />
                                )}
                            </Tooltip>
                        </Fab>
                    </Grid>
                ) : null}
                <Grid item xs={12}>
                    <Typography>Download and compare the results of historic benchmark jobs listed below.</Typography>
                </Grid>
            </Grid>
            <JobList onDelete={fetchBenchmarkJobs} onJobSelectionChange={onJobSelectionChange} jobs={benchmarkJobs} />
            {jobCompareModalOpen &&
            selectedBenchmarkJobs.length >= 2 &&
            selectedBenchmarkJobResults.length >= 2 &&
            selectedBenchmarkJobs.length === selectedBenchmarkJobResults.length ? (
                <JobCompareModal
                    benchmarkJobs={selectedBenchmarkJobs}
                    benchmarkJobResults={selectedBenchmarkJobResults}
                    onClose={onJobCompareModalClose}
                />
            ) : null}
        </>
    );
};

export default EdgeBenchmarkJobs;
