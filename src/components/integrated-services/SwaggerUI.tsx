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

import React, { useState } from 'react';
import { Button, Dialog, Snackbar, ToggleButton, ToggleButtonGroup } from '@mui/material';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { PROJECT_BASE_URL, httpUpload } from '../../api';
import { INTEGRATED_SERVICES_PATH } from '../../endpoints';
import useKeycloak from '../../contexts/KeycloakContext';
import { FileSelectorPlugin } from './SwaggerUIFileInput';
import { openInNewTab } from '../../util';
import { Buffer } from 'buffer';
import { AugmentingLayoutPlugin } from './SwaggerUILayout';

export default function ServiceUI({
    handleClose,
    apiSpec,
    service_name,
}: {
    handleClose: () => void;
    apiSpec: object;
    service_name: string;
}) {
    let requestType = '';
    const [fileData, setFileData] = useState<FormData | null>();
    const [open, setOpen] = React.useState(false);
    const [toastMsg, setToastMsg] = React.useState('');

    const keycloak = useKeycloak();

    const closeToast = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const uploadServiceResponse = async (url: string, contentType: string, data: string) => {
        let formData = new FormData();
        if (fileData) {
            formData = fileData;
        }

        formData.append('requestURL', url);
        formData.append('body', data);
        formData.append('contentType', contentType);

        console.log(requestType);

        httpUpload(keycloak, `${INTEGRATED_SERVICES_PATH}/${service_name}/${requestType}/response`, formData)
            .then((response) => {
                console.log(response);
                setToastMsg(response);
                setOpen(true);
            })
            .catch((error) => {
                if (error.body == undefined || error.body == null) {
                    console.log(error.message);
                } else {
                    console.log(error.message + ': ' + error.body.detail);
                }
            });
    };

    const openServiceResponse = async (path: string) => {
        const datasetPrefix = path;
        const base64encodedPrefix = Buffer.from(datasetPrefix).toString('base64');
        const datasetUrl = `https://minio-console.${PROJECT_BASE_URL}/browser/${keycloak?.profile?.username}/${base64encodedPrefix}`;
        console.log(datasetUrl);
        openInNewTab(datasetUrl);
    };

    return (
        <>
            <Dialog open={true} onClose={handleClose} fullWidth maxWidth="lg">
                <SwaggerUI
                    spec={apiSpec}
                    responseInterceptor={(response) => {
                        if (response.status === 200) {
                            console.log(response);
                            if (response.data) {
                                uploadServiceResponse(response.url, response.headers['content-type'], response.data);
                            } else if (response.text) {
                                uploadServiceResponse(response.url, response.headers['content-type'], response.text);
                            }
                        }
                        return response;
                    }}
                    requestInterceptor={(request) => {
                        requestType = request.method.toLowerCase();
                        if (request.body) {
                            setFileData(request.body);
                        }
                        return request;
                    }}
                    plugins={[FileSelectorPlugin, AugmentingLayoutPlugin]}
                    layout={'AugmentingLayout'}
                    tryItOutEnabled={true}
                    docExpansion={'full'}
                />
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={closeToast}
                    message="Response saved under"
                    action={
                        <Button color="success" size="small" onClick={() => openServiceResponse(toastMsg)}>
                            {toastMsg}
                        </Button>
                    }
                    key={'bottom' + 'right'}
                />
            </Dialog>
        </>
    );
}
