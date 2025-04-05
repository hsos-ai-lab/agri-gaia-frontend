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

import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { EDGE_BENCHMARK_JOBS_PATH } from '../endpoints';
import useKeycloak from '../contexts/KeycloakContext';
import { useGridLogger } from '@mui/x-data-grid';
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
            .then((_benchmarkJobs) => {
                setBenchmarkJobs(_benchmarkJobs);
            })
            .catch((error) => {
                console.error('Failed to fetch benchmark jobs', error);
            });
    };

    return (
        <Grid container justifyContent="space-between">
            <Grid item xs={6}>
                <Typography variant="h4" component="h4">
                    Edge Benchmark Jobs
                </Typography>
            </Grid>
        </Grid>
    );
};

export default EdgeBenchmarkJobs;
