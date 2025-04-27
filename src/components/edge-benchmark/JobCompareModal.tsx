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
    const [comparisonRows, setComparisonRows] = useState<Record<string, any>>();

    useEffect(() => {
        createComparisonRows();
    }, [comparisonBasis]);

    const createTableHeads = (jobs: IBenchmarkJob[]) => {
        return [null, ...jobs.map((job) => `Job #${job.id}`)];
    };

    const onComparisonBasisChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComparisonBasis(event.target.value);
    };

    const round = (num: number, prec: number) => {
        const factor = Math.pow(10, prec);
        return (Math.round(num * factor) / factor).toFixed(prec);
    };

    const createComparisonRows = () => {
        const rows: Record<string, any> = {
            'Comparison basis': {
                vals: [],
                render: (val: any) => {
                    return val;
                },
            },
            'Device identifier': {
                vals: [],
                render: (val: string) => {
                    return val;
                },
            },
            Dataset: {
                vals: [],
                render: (val: string) => {
                    return val;
                },
            },
            Model: {
                vals: [],
                render: (val: string) => {
                    return val;
                },
            },
            'Model format': {
                vals: [],
                render: (val: string) => {
                    return val;
                },
            },
            'Model warmup': {
                vals: [],
                render: (val: boolean) => {
                    return val ? 'yes' : 'no';
                },
            },
            'Model input shape': {
                vals: [],
                compare: (val: number[], basis: number[]): number => {
                    const val_prod = val.reduce((acc, num) => acc * num, 1);
                    const basis_prod = basis.reduce((acc, num) => acc * num, 1);
                    return val_prod > basis_prod ? -1 : val_prod < basis_prod ? 1 : 0;
                },
                render: (val: number[]) => {
                    return `(${val.join(', ')})`;
                },
            },
            'Model output shape': {
                vals: [],
                compare: (val: number[], basis: number[]): number => {
                    const val_prod = val.reduce((acc, num) => acc * num, 1);
                    const basis_prod = basis.reduce((acc, num) => acc * num, 1);
                    return val_prod > basis_prod ? -1 : val_prod < basis_prod ? 1 : 0;
                },
                render: (val: number[]) => {
                    return `(${val.join(', ')})`;
                },
            },
            'Model input data type': {
                vals: [],
                render: (val: string) => {
                    return val;
                },
            },
            'Model output data type': {
                vals: [],
                render: (val: string) => {
                    return val;
                },
            },
            'Inference client': {
                vals: [],
                render: (val: string) => {
                    return val;
                },
            },
            'Number of samples': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? 1 : val < basis ? -1 : 0),
                render: (val: number) => {
                    return val;
                },
            },
            'Preprocess duration': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? -1 : val < basis ? 1 : 0),
                render: (val: number) => {
                    return `${round(val, 2)} sec.`;
                },
            },
            'Inference duration': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? -1 : val < basis ? 1 : 0),
                render: (val: number) => {
                    return `${round(val, 2)} sec.`;
                },
            },
            'Postprocess duration': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? -1 : val < basis ? 1 : 0),
                render: (val: number) => {
                    return `${round(val, 2)} sec.`;
                },
            },
            'Preprocess throughput': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? 1 : val < basis ? -1 : 0),
                render: (val: number) => {
                    return `${round(val, 2)} samples/sec.`;
                },
            },
            'Inference throughput': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? 1 : val < basis ? -1 : 0),
                render: (val: number) => {
                    return `${round(val, 2)} samples/sec.`;
                },
            },
            'Postprocess throughput': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? 1 : val < basis ? -1 : 0),
                render: (val: number) => {
                    return `${round(val, 2)} samples/sec.`;
                },
            },
            'Avg. preprocess latency': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? -1 : val < basis ? 1 : 0),
                render: (val: number) => {
                    return `${round(val, 3)} sec.`;
                },
            },
            'Avg. inference latency': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? -1 : val < basis ? 1 : 0),
                render: (val: number) => {
                    return `${round(val, 3)} sec.`;
                },
            },
            'Avg. postprocess latency': {
                vals: [],
                compare: (val: number, basis: number): number => (val > basis ? -1 : val < basis ? 1 : 0),
                render: (val: number) => {
                    return `${round(val, 3)} sec.`;
                },
            },
        };

        benchmarkJobs.forEach((job, index) => {
            const performance = benchmarkJobResults[index].benchmark_job.inference_results.performance;
            for (const [name, value] of Object.entries({
                'Comparison basis': (
                    <Radio
                        checked={comparisonBasis === String(job.id)}
                        onChange={onComparisonBasisChange}
                        value={job.id}
                        name="comparison-basis"
                        color="primary"
                    />
                ),
                'Device identifier': job.edge_device,
                Dataset: job.dataset.name,
                Model: job.model.name,
                'Model format': job.model.format,
                'Model input shape': job.model.input_shape,
                'Model output shape': job.model.output_shape,
                'Model input data type': job.model.input_datatype,
                'Model output data type': job.model.output_datatype,
                'Model warmup': performance.warmup,
                'Inference client': job.inference_client,
                'Number of samples': performance.inference.sample_count,
                'Preprocess duration': performance.preprocess.total_time,
                'Inference duration': performance.inference.total_time,
                'Postprocess duration': performance.postprocess.total_time,
                'Preprocess throughput': performance.preprocess.samples_per_second,
                'Inference throughput': performance.inference.samples_per_second,
                'Postprocess throughput': performance.postprocess.samples_per_second,
                'Avg. preprocess latency': performance.preprocess.latency.average,
                'Avg. inference latency': performance.inference.latency.average,
                'Avg. postprocess latency': performance.postprocess.latency.average,
            }))
                rows[name].vals.push(value);
        });

        setComparisonRows(rows);
    };

    return (
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="xl">
                <DialogTitle>Benchmark comparison</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {createTableHeads(benchmarkJobs).map((head, index) => (
                                        <TableCell align="center">{head}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {comparisonRows
                                    ? Object.keys(comparisonRows).map((name: string, index: number) => (
                                          <TableRow key={index}>
                                              <TableCell variant="head" align="right">
                                                  {name}
                                              </TableCell>
                                              {comparisonRows[name].vals.map((val: any, index: number) => (
                                                  <TableCell
                                                      sx={{
                                                          backgroundColor:
                                                              index ==
                                                                  benchmarkJobs.findIndex(
                                                                      (job) => String(job.id) === comparisonBasis,
                                                                  ) && name !== 'Comparison basis'
                                                                  ? 'lightblue'
                                                                  : comparisonBasis === undefined ||
                                                                    !('compare' in comparisonRows[name])
                                                                  ? null
                                                                  : comparisonRows[name].compare(
                                                                        val,
                                                                        comparisonRows[name].vals[
                                                                            benchmarkJobs.findIndex(
                                                                                (job) =>
                                                                                    String(job.id) === comparisonBasis,
                                                                            )
                                                                        ],
                                                                    ) == 1
                                                                  ? 'lightgreen'
                                                                  : comparisonRows[name].compare(
                                                                        val,
                                                                        comparisonRows[name].vals[
                                                                            benchmarkJobs.findIndex(
                                                                                (job) =>
                                                                                    String(job.id) === comparisonBasis,
                                                                            )
                                                                        ],
                                                                    ) == -1
                                                                  ? 'lightcoral'
                                                                  : 'lightgrey',
                                                      }}
                                                      align="center"
                                                  >
                                                      {comparisonRows[name].render(val)}
                                                  </TableCell>
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
