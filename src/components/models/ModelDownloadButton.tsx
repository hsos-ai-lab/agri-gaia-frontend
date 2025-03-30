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

import { useState } from 'react';

import { httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';

import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';

import { MODELS_PATH } from '../../endpoints';
import { downloadBlob } from '../../util';

export default function ({ modelId }: { modelId: number }) {
    const keycloak = useKeycloak();

    const [isDownloading, setIsDownloading] = useState(false);

    const downloadModel = async () => {
        setIsDownloading(true);
        httpGet(keycloak, `${MODELS_PATH}/${modelId}/download`)
            .then(({ blob, fileName }) => {
                downloadBlob(blob, fileName);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsDownloading(false);
            });
    };

    return (
        <Tooltip title="Download">
            <LoadingButton color="primary" aria-label="download" loading={isDownloading} onClick={downloadModel}>
                <DownloadIcon />
            </LoadingButton>
        </Tooltip>
    );
}
