// SPDX-FileCopyrightText: 2026 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

// Mirrors edge_benchmarking_types.edge_farm.models.DeviceCandidateResult /
// DeviceRecommendation and the platform AutoSearchRun schema.

export type OptimizationFactor = 'cost' | 'energy' | 'latency';
export type LatencyPercentile = 'avg' | 'p95' | 'p99';

export interface IDeviceCandidateResult {
    hostname: string;
    benchmark_job_id: string | null;
    latency_ms: number | null;
    energy_joules: number | null;
    accuracy: number | null;
    cost_eur: number | null;
    tier_rank: number | null;
    meets_constraint: boolean;
    excluded_reason: string | null;
}

export interface IDeviceRecommendation {
    factor: OptimizationFactor;
    latency_metric: LatencyPercentile;
    latency_threshold_ms: number;
    min_accuracy: number | null;
    accuracy_metric: string;
    winner_hostname: string | null;
    candidates: IDeviceCandidateResult[];
}

export interface IAutoSearchRun {
    id: string;
    model_id: number;
    dataset_id: number;
    recommendation: IDeviceRecommendation;
    created_at: string;
    request: {
        factor: OptimizationFactor;
        latency_metric: LatencyPercentile;
        latency_threshold_ms: number;
        candidate_hostnames: string[];
    };
}
