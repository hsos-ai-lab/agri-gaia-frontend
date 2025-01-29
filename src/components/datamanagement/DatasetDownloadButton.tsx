// SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from 'react';

import { httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useCvat from '../../contexts/CvatContext';

import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import DownloadIcon from '@mui/icons-material/Download';

import { DATASETS_PATH, DATASETS_DOWNLOAD_PATH } from '../../endpoints';
import { downloadBlob } from '../../util';

export default function ({ datasetId }: { datasetId: number }) {
    const keycloak = useKeycloak();
    const cvat = useCvat();

    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const downloadDataset = async () => {
        setIsDownloading(true);
        httpGet(keycloak, `${DATASETS_PATH}/${datasetId}${DATASETS_DOWNLOAD_PATH}`)
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
            <LoadingButton color="primary" aria-label="download" loading={isDownloading} onClick={downloadDataset}>
                <DownloadIcon />
            </LoadingButton>
        </Tooltip>
    );
}
