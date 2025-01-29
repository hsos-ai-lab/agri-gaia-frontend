// SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useEffect, useState } from 'react';
import {
    AppBar,
    Backdrop,
    Button,
    FormControl,
    Grid,
    InputLabel,
    ListSubheader,
    MenuItem,
    Select,
    SelectChangeEvent,
    Toolbar,
    Typography,
} from '@mui/material';
import { httpGet } from '../api';
import { EDGE_BENCHMARK_OVERVIEW_PATH } from '../endpoints';
import useKeycloak from '../contexts/KeycloakContext';
import { useGridLogger } from '@mui/x-data-grid';

const App = () => {
    const keycloak = useKeycloak();
    const [devices, setDevices] = useState<string[]>([]);
    const [datasets, setDatasets] = useState<string[]>([]);
    const [jobs, setJobs] = useState<string[]>([]);
    const [jobData, setJobData] = useState<JSON>();

    useEffect(() => {
        fetchSelectData();
    }, [keycloak]);

    const fetchSelectData = async () => {
        httpGet(keycloak, EDGE_BENCHMARK_OVERVIEW_PATH + '/devices')
            .then((data) => {
                setDevices(data);
                console.log('Devices:', devices);
            })
            .catch((error) => {
                console.error(error);
            });

        httpGet(keycloak, EDGE_BENCHMARK_OVERVIEW_PATH + '/datasets')
            .then((data) => {
                setDatasets(data);
                console.log('Datasets:', datasets);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSelectDataset = (dataset: string) => {
        console.log(dataset);
        httpGet(keycloak, EDGE_BENCHMARK_OVERVIEW_PATH + '/jobs' + '/datasets/' + dataset)
            .then((data) => {
                setJobs(data);
                console.log('Jobs:', jobs);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSelectDevice = (device: string) => {
        console.log(device);
        httpGet(keycloak, EDGE_BENCHMARK_OVERVIEW_PATH + '/jobs' + '/devices/' + device)
            .then((data) => {
                setJobs(data);
                console.log('Jobs:', jobs);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleChange = (event: SelectChangeEvent) => {
        httpGet(keycloak, (EDGE_BENCHMARK_OVERVIEW_PATH + '/job/' + event.target.value) as string)
            .then((data) => {
                setJobData(data);
                console.log('Job:', data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <div className="app">
            <Grid container spacing={2} justifyContent="space-between">
                <Grid item xs={6}>
                    <Typography variant="h4" component="h4" style={{ marginBottom: '0.8rem' }}>
                        Edge Device Benchmarking
                    </Typography>
                </Grid>
            </Grid>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel htmlFor="grouped-select">Grouping</InputLabel>
                <Select defaultValue="" id="grouped-select" label="Grouping">
                    <ListSubheader>Tested Datasets</ListSubheader>
                    {datasets.map((dataset) => (
                        <MenuItem key={dataset} value={dataset}>
                            <Button variant="text" onClick={() => handleSelectDataset(dataset)}>
                                {dataset}
                            </Button>
                        </MenuItem>
                    ))}
                    <ListSubheader>Tested Devices</ListSubheader>
                    {devices.map((device) => (
                        <MenuItem key={device} value={device}>
                            <Button variant="text" onClick={() => handleSelectDevice(device)}>
                                {device}
                            </Button>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel htmlFor="grouped-select">Job</InputLabel>
                <Select
                    defaultValue=""
                    id="grouped-select"
                    label="Grouping"
                    disabled={jobs.length ? false : true}
                    onChange={handleChange}
                >
                    {jobs.map((job) => (
                        <MenuItem key={job} value={job}>
                            <Button variant="text">{job}</Button>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default App;
