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
import { Grid, Typography } from '@mui/material';
import useKeycloak from '../contexts/KeycloakContext';
import { EDGE_BENCHMARK_JOBS_PATH } from '../endpoints';
import JobList from '../components/edge-benchmark/JobList';
import IBenchmarkJob from '../types/edge-benchmark/IBenchmarkJob';
import { httpGet } from '../api';

const EdgeBenchmarkJobs = () => {
    const keycloak = useKeycloak();
    const [benchmarkJobs, setBenchmarkJobs] = useState<IBenchmarkJob[]>([]);

    useEffect(() => {
        fetchBenchmarkJobs();
    }, [keycloak]);

    const fetchBenchmarkJobs = async () => {
        httpGet(keycloak, EDGE_BENCHMARK_JOBS_PATH)
            .then((_benchmarkJobs: IBenchmarkJob[]) => {
                setBenchmarkJobs(_benchmarkJobs);
                console.log(_benchmarkJobs);
            })
            .catch((error) => {
                console.error('Failed to fetch benchmark jobs', error);
            });
    };

    return (
        <>
            <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item xs={12}>
                    <Typography variant="h4" component="h4">
                        Edge Benchmark Jobs
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography>Download and compare historic benchmark results listed below.</Typography>
                </Grid>
            </Grid>
            <JobList jobs={benchmarkJobs} />
        </>
    );
};

export default EdgeBenchmarkJobs;
