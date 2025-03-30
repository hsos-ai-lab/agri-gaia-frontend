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
import MoveDownIcon from '@mui/icons-material/MoveDown';

import { AlertColor } from '@mui/material/Alert';
import AlertSnackbar from '../common/AlertSnackbar';
import { TRAIN_CONTAINERS_PATH } from '../../endpoints';
import IModel from '../../types/IModel';

export default function ({
    trainContainerId,
    disabled,
    onModelTransfer,
}: {
    trainContainerId: number;
    disabled: boolean;
    onModelTransfer: () => void;
}) {
    const [isTransferring, setIsTransferring] = useState<boolean>(false);
    const [alertProps, setAlertProps] = useState<{ message: string; severity: AlertColor | undefined; open: boolean }>({
        message: '',
        severity: undefined,
        open: false,
    });

    const keycloak = useKeycloak();

    const transferTrainContainerModel = async () => {
        setIsTransferring(true);
        httpGet(keycloak, `${TRAIN_CONTAINERS_PATH}/${trainContainerId}/model`)
            .then((model: IModel) => {
                setAlertProps({
                    ...alertProps,
                    message: `Transferred trained model as "${model.name}" to Models.`,
                    severity: 'success',
                    open: true,
                });
                console.log(`Transferred model out of Train Container ${trainContainerId} into platform:`, model);
                onModelTransfer();
            })
            .catch((error) => {
                const errorMsg = error?.body?.detail ?? 'Transfer of trained model failed.';
                setAlertProps({
                    ...alertProps,
                    message: errorMsg,
                    severity: 'error',
                    open: true,
                });
                console.error(error);
            })
            .finally(() => {
                setIsTransferring(false);
            });
    };

    return (
        <>
            <AlertSnackbar {...alertProps} onClose={() => setAlertProps({ ...alertProps, open: false })} />
            <Tooltip title="Transfer Model">
                <span>
                    <LoadingButton
                        aria-label="delete"
                        disabled={disabled}
                        loading={isTransferring}
                        onClick={() => transferTrainContainerModel()}
                    >
                        <MoveDownIcon />
                    </LoadingButton>
                </span>
            </Tooltip>
        </>
    );
}
