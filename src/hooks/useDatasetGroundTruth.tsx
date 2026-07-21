// SPDX-FileCopyrightText: 2026 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';
import useKeycloak from '../contexts/KeycloakContext';
import { httpGet } from '../api';
import { EDGE_BENCHMARK_DATASETS_PATH } from '../endpoints';

// Whether a dataset carries CVAT ground truth (annotations.xml) — the file the
// Edge Farm API needs to compute benchmark accuracy. `undefined` means unknown
// (still loading, no dataset selected, or the request failed); callers should
// treat `undefined` as "don't assert a cause", only `false` as "definitely missing".
export default function useDatasetGroundTruth(datasetId: number | string | undefined): {
    hasGroundTruth: boolean | undefined;
    loading: boolean;
} {
    const keycloak = useKeycloak();
    const [hasGroundTruth, setHasGroundTruth] = useState<boolean | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (datasetId === undefined || datasetId === null || datasetId === '') {
            setHasGroundTruth(undefined);
            setLoading(false);
            return undefined;
        }

        let cancelled = false;
        setLoading(true);
        setHasGroundTruth(undefined);

        httpGet(keycloak, `${EDGE_BENCHMARK_DATASETS_PATH}/${datasetId}/ground-truth`)
            .then((response: any) => {
                if (!cancelled) setHasGroundTruth(Boolean(response?.has_ground_truth));
            })
            .catch(() => {
                if (!cancelled) setHasGroundTruth(undefined);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [keycloak, datasetId]);

    return { hasGroundTruth, loading };
}
