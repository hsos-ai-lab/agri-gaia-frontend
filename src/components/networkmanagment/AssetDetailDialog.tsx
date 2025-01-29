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
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';

import { httpPost, httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import { NETWORK_PATH } from '../../endpoints';
import IConnector from '../../types/IConnector';

interface IDatasetUploadProps {
    handleClose: () => void;
    asset: any;
    connector: IConnector | undefined;
}

export default function ({ handleClose, asset, connector }: IDatasetUploadProps) {
    const keycloak = useKeycloak();

    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const getConnectorId = () => {
        if (connector !== undefined) {
            return connector.id;
        } else return 0;
    };

    const transferAsset = async (connector_id: number, offer_id: string, asset_id: string) => {
        console.log(connector_id);
        console.log(offer_id);
        console.log(asset_id);
        setLoading(true);

        httpPost(keycloak, `${NETWORK_PATH}/contractNegotiation/${connector_id}/${offer_id}/${asset_id}`)
            .then((result: string) => {
                setMessage('Negotiate');
                console.log(result);
                const handle = setInterval((): void => {
                    httpGet(keycloak, `${NETWORK_PATH}/contractNegotiation/${result}`).then((result) => {
                        console.log(result);
                        console.log(result.contractAgreementId);
                        console.log(result.state);
                        setMessage('Negotiating: ' + result.state);
                        if (result.state === 'CONFIRMED') {
                            clearInterval(handle);
                            httpPost(
                                keycloak,
                                `${NETWORK_PATH}/transferprocess/${connector_id}/${result.contractAgreementId}/${asset_id}`,
                            ).then((result) => {
                                setMessage('Transfer');
                                const handle2 = setInterval((): void => {
                                    httpGet(keycloak, `${NETWORK_PATH}/transferprocess/${result}`).then((result) => {
                                        console.log(result);
                                        console.log(result.state);
                                        setMessage('Transfer: ' + result.state);
                                        if (result.state === 'COMPLETED') {
                                            console.log(result.dataDestination.properties.assetName);
                                            httpPost(
                                                keycloak,
                                                `${NETWORK_PATH}/import/${result.dataDestination.properties.assetName}`,
                                            ).catch((error) => console.log(error));
                                            setLoading(false);
                                            clearInterval(handle2);
                                        }
                                    });
                                }, 5000);
                            });
                        }
                    });
                }, 5000);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                console.log('Finish');
            });
    };

    return (
        <Dialog open={true} onClose={handleClose} fullWidth={true} maxWidth="md">
            <DialogTitle>Asset Information</DialogTitle>
            <DialogContent>
                <pre>{JSON.stringify(asset, null, 2)}</pre>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                {message.trim() === 'Transfer: COMPLETED' ? (
                    <LoadingButton onClick={handleClose} loading={false}>
                        Close
                    </LoadingButton>
                ) : (
                    <LoadingButton
                        color="primary"
                        aria-label="download"
                        loading={loading}
                        onClick={() => {
                            transferAsset(getConnectorId(), asset['id'], asset['asset']['properties']['asset:prop:id']);
                        }}
                    >
                        <DownloadIcon />
                    </LoadingButton>
                )}
            </DialogActions>
        </Dialog>
    );
}
