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

export interface Latency {
    average: number;
    percentiles: Record<number, number>;
}

export interface PerformanceResult {
    total_time: number;
    sample_count: number;
    samples_per_second: number;
    latency: Latency;
}

export interface InferPerformance {
    preprocess: PerformanceResult;
    inference: PerformanceResult;
    postprocess: PerformanceResult;
    warmup?: number | null;
}

export default interface BenchmarkInferResult {
    performance: InferPerformance;
    results: Record<string, any>;
}
