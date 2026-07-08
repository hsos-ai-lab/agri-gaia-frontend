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
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { capitalizeFirstChar } from '../../util';

// Small circled-i hover hint. Tooltip content uses `\n` for paragraph breaks
// (whiteSpace: pre-line). InfoOutlined forwards its ref, so Tooltip wraps it directly.
function InfoHint({ title }: { title: string }) {
    return (
        <Tooltip
            title={title}
            arrow
            enterTouchDelay={0}
            slotProps={{ tooltip: { sx: { maxWidth: 360, whiteSpace: 'pre-line' } } }}
        >
            <InfoOutlinedIcon
                sx={{
                    ml: 0.5,
                    fontSize: '1rem',
                    color: 'text.secondary',
                    verticalAlign: 'middle',
                    cursor: 'help',
                }}
            />
        </Tooltip>
    );
}

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
    const benchmark_performance = benchmarkJobResult.benchmark_job.inference_results.performance;
    const floating_precision = 4;

    // Quality metrics (e.g. accuracy, AUC, F1, ...) are an open-ended map the
    // Edge Farm API may or may not populate, depending on whether the dataset
    // carried ground-truth annotations. Render whatever keys are present.
    const benchmark_metrics: Record<string, any> =
        benchmarkJobResult.benchmark_job.inference_results.metrics ?? {};
    const benchmark_metric_entries = Object.entries(benchmark_metrics);

    const humanizeMetricName = (name: string): string => {
        return name
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatMetricValue = (value: any): string => {
        return isNumber(value) ? value.toFixed(floating_precision) : String(value);
    };

    const getByPath = (obj: any, path: string): number => {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    };

    const processingSteps = ['preprocess', 'inference', 'postprocess'];

    const createRowWithNameAndValues = (name: string, value: string): string[] => {
        const rowValues: string[] = [];
        processingSteps.map((step) => {
            rowValues.push(
                getByPath(benchmark_performance, step + value)
                    .toFixed(floating_precision)
                    .toString(),
            );
        });
        return [name, ...rowValues];
    };

    const rows = [
        createRowWithNameAndValues('Total Time', '.total_time'),
        createRowWithNameAndValues('Samples Per Second', '.samples_per_second'),
        createRowWithNameAndValues('Average Latency', '.latency.average'),
    ];

    // Wall-clock event boundaries (manager clock — see IInferPerformance).
    const formatTimestamp = (value?: string | null): string => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3,
        } as Intl.DateTimeFormatOptions);
    };

    const durationSeconds = (start?: string | null, end?: string | null): string => {
        if (!start || !end) return 'N/A';
        const seconds = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
        return `${seconds.toFixed(3)} s`;
    };

    const hasTimingData = benchmark_performance.run_started_at != null;
    const warmupUsed =
        benchmark_performance.warmup !== null && benchmark_performance.warmup !== undefined;

    const WARMUP_HINT =
        'Warm-up runs one extra inference before measuring and discards its result, so the one-time GPU cold ' +
        'start (CUDA context init + cuDNN convolution-algorithm autotuning) is absorbed up front.\n\n' +
        'With warm-up OFF, that cold start is counted inside the first measured inference and inflates the ' +
        'Inference column above.\n\nWith warm-up ON, every measured inference is warm — these numbers reflect ' +
        'steady-state performance — and the cold-start time is shown separately in the Warm-Up row below.';

    const inflationHint = warmupUsed
        ? 'Warm-up absorbed the GPU cold start (see the Warm-Up row), so this average reflects the ' +
          'steady-state per-image latency.'
        : 'On the first request, ONNX Runtime benchmarks every cuDNN convolution algorithm (EXHAUSTIVE ' +
          'autotuning) — a one-time cost of tens of seconds. With warm-up OFF it is billed to the first ' +
          'inference, so this average is dragged far above the typical per-image latency (mean ≫ median) and ' +
          'Samples/second is understated.\n\nEnable warm-up to exclude it; these numbers would then reflect ' +
          'the steady-state per-image latency.';

    const firstInferenceHint = warmupUsed
        ? 'The cold start was absorbed by warm-up (see the Warm-Up row), so this first measured inference is ' +
          'already warm and runs at steady-state speed.'
        : 'This first inference includes the GPU cold start: on the very first request ONNX Runtime’s CUDA ' +
          'backend runs EXHAUSTIVE cuDNN autotuning (benchmarking every convolution algorithm per layer) plus ' +
          'CUDA context init and driver JIT — so this single call takes tens of seconds while later ' +
          'inferences run in milliseconds.\n\nBecause warm-up is off, this cost is included in the Inference ' +
          'total above. Enable warm-up to move it into a separate Warm-Up row.';

    const WARMUP_ROW_HINT =
        'The warm-up pass: one extra inference, run before measurement and discarded. Its purpose is to ' +
        'trigger the GPU cold start here (CUDA context init + cuDNN EXHAUSTIVE autotuning) so the measured ' +
        'inferences that follow are warm. This duration is reported separately and is NOT part of the ' +
        'Inference total above.';

    const timingRows: {
        label: string;
        started?: string | null;
        finished?: string | null;
        duration: string;
        hint?: string;
    }[] = [
        {
            label: 'Run (loop)',
            started: benchmark_performance.run_started_at,
            finished: benchmark_performance.run_finished_at,
            duration: durationSeconds(benchmark_performance.run_started_at, benchmark_performance.run_finished_at),
        },
        {
            label: 'Startup gap (Triton-ready → first inference)',
            started: benchmark_performance.run_started_at,
            finished: benchmark_performance.first_inference_started_at,
            duration: durationSeconds(
                benchmark_performance.run_started_at,
                benchmark_performance.first_inference_started_at,
            ),
        },
        ...(benchmark_performance.warmup !== null && benchmark_performance.warmup !== undefined
            ? [
                  {
                      label: 'Warm-Up',
                      started: benchmark_performance.warmup_started_at,
                      finished: benchmark_performance.warmup_finished_at,
                      duration: durationSeconds(
                          benchmark_performance.warmup_started_at,
                          benchmark_performance.warmup_finished_at,
                      ),
                      hint: WARMUP_ROW_HINT,
                  },
              ]
            : []),
        {
            label: 'First Inference',
            started: benchmark_performance.first_inference_started_at,
            finished: benchmark_performance.first_inference_finished_at,
            duration: durationSeconds(
                benchmark_performance.first_inference_started_at,
                benchmark_performance.first_inference_finished_at,
            ),
            hint: firstInferenceHint,
        },
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
                        <Grid item xs={10}>
                            <Typography sx={{ mb: 2 }} gutterBottom>
                                Key Performance Indicators on {benchmark_performance.preprocess.sample_count.toFixed(0)}{' '}
                                Samples {benchmark_performance.warmup === null ? 'without Warmup' : 'with Warmup'}
                                <InfoHint title={WARMUP_HINT} />
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table aria-label="hot overview">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Value</TableCell>
                                            {processingSteps.map((step) => {
                                                return <TableCell align="right">{capitalizeFirstChar(step)}</TableCell>;
                                            })}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map(([label, ...rowValues]) => (
                                            <TableRow
                                                key={label}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {label}
                                                    {label === 'Average Latency' ? (
                                                        <InfoHint title={inflationHint} />
                                                    ) : null}
                                                </TableCell>
                                                {rowValues.map((cellValue) => {
                                                    return <TableCell align="right">{cellValue}</TableCell>;
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {hasTimingData ? (
                                <>
                                    <Typography sx={{ mt: 3, mb: 2 }} gutterBottom>
                                        Timing (manager clock)
                                    </Typography>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="timing overview">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Event</TableCell>
                                                    <TableCell align="right">Started</TableCell>
                                                    <TableCell align="right">Finished</TableCell>
                                                    <TableCell align="right">Duration</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {timingRows.map((row) => (
                                                    <TableRow
                                                        key={row.label}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        <TableCell component="th" scope="row">
                                                            {row.label}
                                                            {row.hint ? <InfoHint title={row.hint} /> : null}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatTimestamp(row.started)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatTimestamp(row.finished)}
                                                        </TableCell>
                                                        <TableCell align="right">{row.duration}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            ) : null}
                            {benchmark_metric_entries.length > 0 ? (
                                <>
                                    <Typography sx={{ mt: 3, mb: 2 }} gutterBottom>
                                        Quality Metrics
                                    </Typography>
                                    <TableContainer component={Paper}>
                                        <Table aria-label="quality metrics overview">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Metric</TableCell>
                                                    <TableCell align="right">Value</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {benchmark_metric_entries.map(([name, value]) => (
                                                    <TableRow
                                                        key={name}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        <TableCell component="th" scope="row">
                                                            {humanizeMetricName(name)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatMetricValue(value)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            ) : null}
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
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
