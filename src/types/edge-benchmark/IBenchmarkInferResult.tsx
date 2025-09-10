// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

export interface ILatency {
    average: number;
    percentiles: Record<number, number>;
}

export interface IPerformanceResult {
    total_time: number;
    sample_count: number;
    samples_per_second: number;
    latency: ILatency;
}

export interface IInferPerformance {
    preprocess: IPerformanceResult;
    inference: IPerformanceResult;
    postprocess: IPerformanceResult;
    warmup?: number | null;
}

export default interface IBenchmarkInferResult {
    performance: IInferPerformance;
    results: Record<string, any>;
}
