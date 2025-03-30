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

import { PROJECT_BASE_URL } from '../../api';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import { Buffer } from 'buffer';

import IDataset from '../../types/IDataset';
import { openInNewTab } from '../../util';

export default function ({ dataset }: { dataset: IDataset }) {
    const openDataset = async () => {
        const datasetPrefix = `datasets/${dataset.id}`;
        const base64encodedPrefix = Buffer.from(datasetPrefix).toString('base64');
        const datasetUrl = `https://minio-console.${PROJECT_BASE_URL}/browser/${dataset.bucket_name}/${base64encodedPrefix}`;
        openInNewTab(datasetUrl);
    };

    return (
        <Tooltip title="Open">
            <span>
                <IconButton aria-label="open" onClick={() => openDataset()}>
                    <SearchIcon />
                </IconButton>
            </span>
        </Tooltip>
    );
}
