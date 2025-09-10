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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import Form from '@rjsf/material-ui/v5';
import { isValidHostname, isValidIPv4 } from '../../util';
import useKeycloak from '../../contexts/KeycloakContext';
import ISensorInfo from '../../types/edge-benchmark/ISensorInfo';
import { EDGE_BENCHMARK_SENSOR_PATH, EDGE_BENCHMARK_FORM_SENSOR_ADD_PATH } from '../../endpoints';
import { httpGet, httpPost, httpPut } from '../../api';

export default function ({
    onAdd,
    onEdit,
    onClose,
    sensorInfoToEditHostname,
    sensorInfoToEdit,
    sensorInfos,
}: {
    sensorInfoToEditHostname: string | undefined;
    sensorInfoToEdit: ISensorInfo | undefined;
    sensorInfos: ISensorInfo[];
    onClose: () => void;
    onAdd: (hostname: string) => void;
    onEdit: (hostname: string) => void;
}) {
    const keycloak = useKeycloak();

    const [sensorInfo, setSensorInfo] = useState<Record<string, any> | undefined>(undefined);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const fetchSensorAddFormSchema = () => {
        httpGet(keycloak, EDGE_BENCHMARK_FORM_SENSOR_ADD_PATH)
            .then((_schema) => setSensorInfo({ schema: _schema, values: sensorInfoToEdit ?? {} }))
            .catch((error) => {
                console.error(error);
                setErrorMsg(`Fetching sensor add form: ${error.message}`);
            });
    };

    useEffect(() => {
        fetchSensorAddFormSchema();
    }, [keycloak]);

    const onAddSensorFormChange = (form: any) => {
        setSensorInfo({ ...sensorInfo, values: form.formData });
    };

    const validateAddSensorFormInputs = () => {
        const newSensor = sensorInfo?.values;
        const sensorExists = sensorInfos.some((sensor) => sensor.hostname === newSensor.hostname);

        if ((!sensorInfoToEdit || sensorInfoToEditHostname !== newSensor.hostname) && sensorExists) {
            setErrorMsg(`Sensor with hostname '${newSensor.hostname}' already exists.`);
            return false;
        }

        if (!isValidHostname(newSensor.hostname)) {
            setErrorMsg(`Hostname of sensor is invalid.`);
            return false;
        }

        if (!isValidIPv4(newSensor.ip)) {
            setErrorMsg(`IPv4 address of sensor is invalid.`);
            return false;
        }

        return true;
    };

    const onAddSensorFormSubmit = (form: any) => {
        setSensorInfo({ ...sensorInfo, values: form.formData });
        setErrorMsg(undefined);
        if (validateAddSensorFormInputs()) {
            setIsProcessing(true);
            if (sensorInfoToEdit) {
                httpPut(keycloak, `${EDGE_BENCHMARK_SENSOR_PATH}/${sensorInfoToEditHostname}`, sensorInfo?.values)
                    .then((sensorInfo: ISensorInfo) => {
                        console.log('Updated sensor:', sensorInfo);
                        onClose();
                        onEdit(sensorInfo.hostname);
                    })
                    .catch((error) => {
                        console.log(error);
                        setErrorMsg(error.message);
                    })
                    .finally(() => setIsProcessing(false));
            } else {
                httpPost(keycloak, EDGE_BENCHMARK_SENSOR_PATH, sensorInfo?.values)
                    .then((sensorInfo: ISensorInfo) => {
                        console.log('Added sensor:', sensorInfo);
                        onClose();
                        onAdd(sensorInfo.hostname);
                    })
                    .catch((error) => {
                        console.log(error);
                        setErrorMsg(error.message);
                    })
                    .finally(() => setIsProcessing(false));
            }
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Add a new sensor</DialogTitle>
            <DialogContent>
                {sensorInfo ? (
                    <Grid container>
                        <Grid item xs={12} mt={-2}>
                            <Form
                                schema={sensorInfo.schema}
                                formData={sensorInfo.values}
                                onChange={(form) => onAddSensorFormChange(form)}
                                onSubmit={(form) => onAddSensorFormSubmit(form)}
                                liveOmit={true}
                            >
                                <Grid container justifyContent="center" alignItems="center">
                                    <Grid item xs={12}>
                                        {errorMsg ? (
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                {errorMsg}
                                            </Alert>
                                        ) : null}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box display="flex" justifyContent="center">
                                            <LoadingButton
                                                type="submit"
                                                variant="contained"
                                                loading={isProcessing}
                                                loadingPosition="end"
                                                endIcon={sensorInfoToEdit ? <EditIcon /> : <AddIcon />}
                                            >
                                                {sensorInfoToEdit ? 'Update Sensor' : 'Add Sensor'}
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
