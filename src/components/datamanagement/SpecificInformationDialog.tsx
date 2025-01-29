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

import Grid from '@mui/material/Grid';
import Form from '@rjsf/material-ui/v5';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

interface IDatasetSpecificUploadProps {
    datasetTypes: string[];
    datasetMetadata: object;
    setDatasetMetadata: (datasetMetadata: object) => void;
    datasetMetadataSchema: object;
    setErrorMsg: (errorMsg: string | undefined) => void;
}

export default function ({
    datasetTypes,
    datasetMetadata,
    setDatasetMetadata,
    datasetMetadataSchema,
    setErrorMsg,
}: IDatasetSpecificUploadProps) {
    return (
        <Grid item xs={6}>
            <Box>
                <Divider textAlign="left">Semantic Information (Optional)</Divider>
            </Box>
            {datasetTypes.length === 0 && <CircularProgress color="primary" />}
            {Object.keys(datasetMetadataSchema).length !== 0 && (
                <>
                    <Form
                        schema={datasetMetadataSchema}
                        onChange={(form) => {
                            setDatasetMetadata(form.formData);
                        }}
                        onError={(error) => {
                            setErrorMsg(error);
                        }}
                        formData={datasetMetadata}
                        liveValidate={true}
                    >
                        <div />
                    </Form>
                </>
            )}
        </Grid>
    );
}
