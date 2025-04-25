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

import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IBenchmarkJob from '../../types/edge-benchmark/IBenchmarkJob';

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
    const [comparisonBasis, setComparisonBasis] = useState<string>();
    const [comparisonRows, setComparisonRows] = useState<Record<string, any[]>>();

    useEffect(() => {
        createComparisonRows();
    }, [comparisonBasis]);

    const createTableHeads = (jobs: IBenchmarkJob[]) => {
        return [null, ...jobs.map((job) => `Job #${job.id}`)];
    };

    const onComparisonBasisChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComparisonBasis(event.target.value);
    };

    const createComparisonRows = () => {
        const rows: Record<string, any[]> = {
            'Comparison basis': [],
            'Device identifier': [],
            Dataset: [],
            Model: [],
        };
        for (let i = 0; i < benchmarkJobs.length; ++i) {
            const job = benchmarkJobs[i];
            const result = benchmarkJobResults[i];

            rows['Comparison basis'].push(
                <Radio
                    checked={comparisonBasis === String(job.id)}
                    onChange={onComparisonBasisChange}
                    value={job.id}
                    name="comparison-basis"
                    color="primary"
                />,
            );
            rows['Device identifier'].push(job.edge_device);
            rows['Dataset'].push(job.dataset.name);
            rows['Model'].push(job.model.name);
        }
        setComparisonRows(rows);
    };

    return (
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="xl">
                <DialogTitle>Benchmark comparison</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {createTableHeads(benchmarkJobs).map((head, index) => (
                                        <TableCell align="center">{head}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {comparisonRows
                                    ? Object.keys(comparisonRows).map((name, index) => (
                                          <TableRow key={index}>
                                              <TableCell variant="head">{name}</TableCell>
                                              {comparisonRows[name].map((col) => (
                                                  <TableCell align="center">{col}</TableCell>
                                              ))}
                                          </TableRow>
                                      ))
                                    : null}
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
