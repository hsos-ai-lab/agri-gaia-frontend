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
    // Image-fetch (data-load) stage. Optional/additive: absent on results
    // produced before this stage was instrumented.
    load?: IPerformanceResult;
    preprocess: IPerformanceResult;
    inference: IPerformanceResult;
    postprocess: IPerformanceResult;
    warmup?: number | null;
    // Where the benchmark loop ran: 'manager' (on the Edge-Farm manager) or
    // 'device' (in a runner container on the edge device). Optional/additive:
    // absent or null on results produced before the mode existed, which means
    // 'manager'.
    //
    // The two are NOT like-for-like and must not be compared without saying so.
    // In manager mode preprocess/postprocess are measured on the manager's x86
    // CPU and inference includes a LAN round trip; in device mode everything is
    // on the device's ARM CPU and the Triton call is container-local. Measured
    // on an AGX Orin: preprocess 1.87x, load 3.87x, inference 0.86x.
    execution_mode?: string | null;
    // ISO-8601 wall-clock boundaries. Whose clock depends on execution_mode --
    // the manager's, or the device's. All six come from one machine either way.
    // Optional: absent/null on results produced before this field set was added.
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
