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
import React from 'react';

import useKeycloak from '../../contexts/KeycloakContext';

import FileInput from '../common/FileInput';

import { Divider, ListItem, MenuItem, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import MinIOFileSelector from './MinIOFileSelector';
import { httpGet } from '../../api';
import { INTEGRATED_SERVICES_PATH } from '../../endpoints';

const JsonSchema_string_binary = (props: any) => {
    const keycloak = useKeycloak();

    const [alignment, setAlignment] = React.useState('minio');

    const selectedFile = props.value || '';
    let errors = props.errors;
    errors = errors.toJS ? errors.toJS() : [];

    const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
        setAlignment(newAlignment);
    };

    const handleMinIOSelection = (v: string) => {
        const filepath = encodeURIComponent(v);
        const filename_split = v.split('/');
        const filename = filename_split[filename_split.length - 1];

        httpGet(keycloak, `${INTEGRATED_SERVICES_PATH}/file/` + encodeURIComponent(filepath))
            .then((response) => {
                console.log(response);
                const file = new File([response], filename);
                props.onChange(file, props.keyName);
            })
            .catch((error) => {
                if (error.body == undefined || error.body == null) {
                    console.log(error.message);
                } else {
                    console.log(error.message + ': ' + error.body.detail);
                }
            });
    };

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ToggleButtonGroup
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                    aria-label="Platform"
                    size="small"
                    sx={{ height: 25 }}
                >
                    <ToggleButton value="minio">MinIO</ToggleButton>
                    <ToggleButton value="local">Local</ToggleButton>
                </ToggleButtonGroup>
                &nbsp; &nbsp;
                {alignment == 'local' ? (
                    <FileInput
                        text="Select File"
                        accept="*"
                        multiple={false}
                        onChange={(file) => props.onChange(file[0], props.keyName)}
                    />
                ) : (
                    <MinIOFileSelector
                        onClose={(selectedFiles: string[]) => handleMinIOSelection(selectedFiles.toString())}
                        multiSelect={undefined}
                    />
                )}
            </div>
        </>
    );
};

export const FileSelectorPlugin = {
    components: {
        JsonSchema_string_binary: JsonSchema_string_binary,
    },
};
