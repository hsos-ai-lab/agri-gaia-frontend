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

    return (
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="xl">
                <DialogTitle>
                    Benchmark results for model {benchmarkJob.model.name} with dataset {benchmarkJob.dataset.name} on
                    device {benchmarkJob.edge_device}
                </DialogTitle>
                <DialogContent>
                    <Grid container justifyContent="space-between">
                        <Grid item xs={8}>
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
