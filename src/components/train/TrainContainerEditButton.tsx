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

import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import LoadingButton from '@mui/lab/LoadingButton';

import { TRAIN_CONTAINERS_PATH } from '../../endpoints';

export default function ({
    trainContainerId,
    onEdit,
    disabled,
}: {
    trainContainerId: number;
    onEdit: (config: any) => void;
    disabled: boolean;
}) {
    const keycloak = useKeycloak();

    const [configLoading, setConfigLoading] = useState<boolean>(false);

    const fetchTrainContainerConfig = async () => {
        setConfigLoading(true);
        httpGet(keycloak, `${TRAIN_CONTAINERS_PATH}/${trainContainerId}/config`, undefined, undefined)
            .then((config) => {
                onEdit(config);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setConfigLoading(false);
            });
    };

    return (
        <>
            <Tooltip title="Edit Configuration">
                <span>
                    <LoadingButton onClick={fetchTrainContainerConfig} loading={configLoading} disabled={disabled}>
                        <EditIcon />
                    </LoadingButton>
                </span>
            </Tooltip>
        </>
    );
}
