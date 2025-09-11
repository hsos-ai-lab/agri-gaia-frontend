// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CameraIcon from '@mui/icons-material/Camera';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import Form from '@rjsf/material-ui/v5';
import ISensorInfo from '../../types/edge-benchmark/ISensorInfo';
import useKeycloak from '../../contexts/KeycloakContext';
import { httpGet, httpPost } from '../../api';
import { downloadBlob } from '../../util';
import { EDGE_BENCHMARK_SENSOR_PATH, EDGE_BENCHMARK_FORM_SENSOR_CONFIG_PATH } from '../../endpoints';

interface ISensorConfigProps {
    selectedSensorInfo: ISensorInfo;
    onClose: () => void;
    onSubmit: () => void;
    onSuccess: () => void;
}

export default function ({ selectedSensorInfo, onClose, onSubmit, onSuccess }: ISensorConfigProps) {
    const keycloak = useKeycloak();

    const [sensorConfig, setSensorConfig] = useState<Record<string, any> | undefined>(undefined);
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureErrorMsg, setCaptureErrorMsg] = useState<string | undefined>(undefined);

    const fetchSensorConfigFormSchema = async () => {
        httpGet(keycloak, EDGE_BENCHMARK_FORM_SENSOR_CONFIG_PATH)
            .then((_schema) => setSensorConfig({ schema: _schema, values: {} }))
            .catch((error) => {
                console.error(error);
                setCaptureErrorMsg(`Fetching sensor configuration form: ${error.message}`);
            });
    };

    useEffect(() => {
        fetchSensorConfigFormSchema();
    }, [keycloak]);

    const onSensorConfigFormSubmit = async (form: any) => {
        setSensorConfig({ ...sensorConfig, values: form.formData });
        if (sensorConfig) {
            setCaptureErrorMsg(undefined);
            setIsCapturing(true);
            onSubmit();

            const { max_sample_size, ...client_config } = sensorConfig.values;

            await httpPost(keycloak, `${EDGE_BENCHMARK_SENSOR_PATH}/${selectedSensorInfo.hostname}/capture`, {
                client_config: client_config,
                max_sample_size,
            })
                .then(({ blob, fileName }) => {
                    downloadBlob(blob, fileName);
                    onClose();
                    onSuccess();
                })
                .catch((error) => {
                    console.error(error);
                    setCaptureErrorMsg(error.message);
                })
                .finally(() => setIsCapturing(false));
        }
    };

    const onSensorConfigFormChange = async (form: any) => {
        setSensorConfig({ ...sensorConfig, values: form.formData });
    };

    return (
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="xs">
                <DialogTitle>Capture Dataset</DialogTitle>
                <DialogContent>
                    <>
                        {sensorConfig ? (
                            <Grid container>
                                <Grid item xs={12} mt={-2}>
                                    <Form
                                        schema={sensorConfig.schema}
                                        formData={sensorConfig.values}
                                        onChange={(form) => onSensorConfigFormChange(form)}
                                        onSubmit={(form) => onSensorConfigFormSubmit(form)}
                                        liveOmit={true}
                                    >
                                        <Grid container justifyContent="center" alignItems="center">
                                            <Grid item xs={12}>
                                                {captureErrorMsg ? (
                                                    <Alert severity="error" sx={{ mb: 2 }}>
                                                        {captureErrorMsg}
                                                    </Alert>
                                                ) : null}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box display="flex" justifyContent="center">
                                                    <LoadingButton
                                                        type="submit"
                                                        variant="contained"
                                                        loading={isCapturing}
                                                        loadingPosition="end"
                                                        endIcon={<CameraIcon />}
                                                    >
                                                        Capture Dataset
                                                    </LoadingButton>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Form>
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid item container justifyContent="center">
                                <CircularProgress color="primary" />
                            </Grid>
                        )}
                    </>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
