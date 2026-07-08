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
    // ISO-8601 wall-clock boundaries (manager clock). Optional: absent/null on
    // results produced before this field set was added.
    run_started_at?: string | null;
    run_finished_at?: string | null;
    first_inference_started_at?: string | null;
    first_inference_finished_at?: string | null;
    warmup_started_at?: string | null;
    warmup_finished_at?: string | null;
}

export default interface IBenchmarkInferResult {
    performance: IInferPerformance;
    results: Record<string, any>;
}
