// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CodeEditor from '@uiw/react-textarea-code-editor';
import IBenchmarkJob from '../../types/edge-benchmark/IBenchmarkJob';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export default function ({
    benchmarkJob,
    benchmarkJobResult,
    onClose,
}: {
    benchmarkJob: IBenchmarkJob;
    benchmarkJobResult: Record<string, any>;
    onClose: () => void;
}) {
    const CHARTJS_LINE_TENSION = 0.3;

    const isNumber = (value: any) => {
        return typeof value === 'number' && !isNaN(value);
    };

    const postprocess = (series: any[]): any[] => {
        const mean = meanX(series, true);
        series = series.map((value: any) => {
            if (isNumber(value)) if (value < 0) return mean;
            return value;
        });
        return series;
    };

    const getBenchmarkResults = () => {
        return benchmarkJobResult.benchmark_job.benchmark_results;
    };

    const getSeries = (name: string): any[] => {
        const results = getBenchmarkResults();
        if (name in results) return postprocess(results[name]);
        return [];
    };

    const meanX = (series: number[], ignoreNegative: boolean): number => {
        let sum_x = 0,
            counter = 0;
        for (let x = 0; x < series.length; ++x) {
            if (ignoreNegative && series[x] < 0) continue;
            sum_x += series[x];
            counter++;
        }
        if (!counter) return 0;
        return sum_x / counter;
    };

    const meanY = (series: number[][]): number[] => {
        const means: number[] = [];
        for (let x = 0; x < series[0].length; ++x) {
            let sum_y = 0;
            for (let y = 0; y < series.length; ++y) sum_y += series[y][x];
            const mean_y = sum_y / series.length;
            means.push(mean_y);
        }
        return means;
    };
    const benchmark_performance = benchmarkJobResult.benchmark_job.inference_results.performance
    const floating_precision = 4
    
    function getByPath(obj: any, path: string) { 
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    const processingStep = [
        "preprocess",
        "inference",
        "postprocess",
    ]
    
    function createRowWithNameAndValues(name: string, value: string): string[] { 
        const list: string[] = [name]
        processingStep.map(step => {
            list.push(getByPath(benchmark_performance, step + value).toFixed(floating_precision).toString());
        })
        return list
    }

    const rows = [
        createRowWithNameAndValues("Total Time", ".total_time"),
        createRowWithNameAndValues("Samples Per Second", ".samples_per_second"),
        createRowWithNameAndValues("Average Latency", ".latency.average"),

    ];
    return (
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="xl">
                <DialogTitle>
                    Job #{benchmarkJob.id} — Model "{benchmarkJob.model.name}" with Dataset "{benchmarkJob.dataset.name}
                    " on Device "{benchmarkJob.edge_device}"
                </DialogTitle>
                <DialogContent>
                    <Grid container justifyContent="space-around">
                        <Grid item xs={8}>
                                <Typography 
                                sx={{ mb: 2 }}
                                gutterBottom>
                                    Key Performance Indicators on {benchmark_performance.preprocess.sample_count.toFixed(0)} Samples {(benchmark_performance.warmup === null) ?  "without Warmup" : "with Warmup"}
                                </Typography>
                            <TableContainer component={Paper}>
                                <Table aria-label="hot overview">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Value</TableCell>
                                            {processingStep.map(function(object, i){
                                                return <TableCell align="right">{String(object).charAt(0).toUpperCase() + String(object).slice(1)}</TableCell>;
                                            })}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {rows.map((row) => (
                                        <TableRow
                                        key={row[0]}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                        <TableCell component="th" scope="row">
                                            {row[0]}
                                        </TableCell>
                                        {row.map(function(object, i){
                                            if(i >= 1) {
                                                return <TableCell align="right">{object}</TableCell>;
                                            }
                                        })}
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Line
                                data={{
                                    labels: getSeries('time').map((datetime: string) => {
                                        const date = new Date(datetime);
                                        return date.toLocaleTimeString('en-US', {
                                            hour12: false,
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        });
                                    }),
                                    datasets: [
                                        ...[
                                            {
                                                label: 'CPU',
                                                data: meanY(
                                                    Object.keys(getBenchmarkResults())
                                                        .filter((key) => key.startsWith('CPU'))
                                                        .map(getSeries),
                                                ),
                                            },
                                            { label: 'GPU', data: getSeries('GPU') },
                                            {
                                                label: 'RAM',
                                                data: getSeries('RAM').map((value) => value * 100),
                                            },
                                            {
                                                label: 'SWAP',
                                                data: getSeries('SWAP').map((value) => value * 100),
                                            },
                                            {
                                                label: 'EMC',
                                                data: getSeries('EMC').map((value) => value * 100),
                                            },
                                        ],
                                        ...Object.keys(getBenchmarkResults())
                                            .filter((key) => key.startsWith('Fan'))
                                            .map((key) => ({
                                                label: key,
                                                data: getSeries(key),
                                            })),
                                    ]
                                        .filter((dataset) =>
                                            dataset.data.reduce((acc: number, curr: number) => acc + curr, 0),
                                        )
                                        .map((dataset) => {
                                            return { ...dataset, tension: CHARTJS_LINE_TENSION };
                                        }),
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Utilization',
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Time',
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Load (%)',
                                            },
                                        },
                                    },
                                }}
                            />
                            <Line
                                data={{
                                    labels: getSeries('time').map((datetime: string) => {
                                        const date = new Date(datetime);
                                        return date.toLocaleTimeString('en-US', {
                                            hour12: false,
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        });
                                    }),
                                    datasets: Object.keys(getBenchmarkResults())
                                        .filter((key) => key.startsWith('Temp'))
                                        .map((key) => ({
                                            label: key,
                                            data: getSeries(key),
                                        }))
                                        .filter((dataset) => dataset.data.reduce((acc, curr) => acc + curr, 0))
                                        .map((dataset) => {
                                            return { ...dataset, tension: CHARTJS_LINE_TENSION };
                                        }),
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Temperatures',
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Time',
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Temperature (°C)',
                                            },
                                        },
                                    },
                                }}
                            />
                            <Line
                                data={{
                                    labels: getSeries('time').map((datetime: string) => {
                                        const date = new Date(datetime);
                                        return date.toLocaleTimeString('en-US', {
                                            hour12: false,
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        });
                                    }),
                                    datasets: Object.keys(getBenchmarkResults())
                                        .filter((key) => key.startsWith('Power'))
                                        .map((key) => ({
                                            label: key,
                                            data: getSeries(key).map((value) => value / 1000),
                                        }))
                                        .filter((dataset) => dataset.data.reduce((acc, curr) => acc + curr, 0))
                                        .map((dataset) => {
                                            return { ...dataset, tension: CHARTJS_LINE_TENSION };
                                        }),
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Power consumption',
                                        },
                                    },
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Time',
                                            },
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Power (W)',
                                            },
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            {benchmarkJobResult && (
                                <CodeEditor
                                    value={JSON.stringify(benchmarkJobResult, null, 4)}
                                    language="json"
                                    placeholder={`Loading benchmark results...`}
                                    disabled
                                    padding={15}
                                    style={{
                                        fontSize: 12,
                                        fontFamily:
                                            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                                    }}
                                />
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
