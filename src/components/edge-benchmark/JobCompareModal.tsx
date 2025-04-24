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
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IBenchmarkJob from '../../types/edge-benchmark/IBenchmarkJob';
import { Typography } from '@mui/material';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function ({
    benchmarkJobs,
    benchmarkJobResults,
    onClose,
}: {
    benchmarkJobs: IBenchmarkJob[];
    benchmarkJobResults: Record<string, any>[];
    onClose: () => void;
}) {
    const createTableHeads = (jobs: IBenchmarkJob[]) => {
        return ['Attribute', ...jobs.map((job) => `Job #${job.id}`)];
    };

    const createTableRows = (jobs: IBenchmarkJob[], results: Record<string, any>[]): Record<string, any[]> => {
        const rows: Record<string, any[]> = { Model: [], Dataset: [], 'Device identifier': [] };
        for (let i = 0; i < jobs.length; ++i) {
            const job = jobs[i];
            const result = results[i];

            rows['Model'].push(job.model.name);
            rows['Dataset'].push(job.dataset.name);
            rows['Device identifier'].push(job.edge_device);
        }
        return rows;
    };

    const rows = createTableRows(benchmarkJobs, benchmarkJobResults);

    return (
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="xl">
                <DialogTitle>Comparison of benchmark results</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {createTableHeads(benchmarkJobs).map((head, index) => (
                                        <TableCell>{head}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(rows).map((name, index) => (
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            {name}
                                        </TableCell>
                                        {rows[name].map((col) => (
                                            <TableCell>{col}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
