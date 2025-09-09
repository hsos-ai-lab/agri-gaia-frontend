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
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import Form from '@rjsf/material-ui/v5';
import { isValidHostname, isValidIPv4 } from '../../util';
import useKeycloak from '../../contexts/KeycloakContext';
import ISensorInfo from '../../types/edge-benchmark/ISensorInfo';
import { EDGE_BENCHMARK_SENSOR_PATH, EDGE_BENCHMARK_FORM_SENSOR_ADD_PATH } from '../../endpoints';
import { httpGet, httpPost } from '../../api';

export default function ({
    sensorInfos,
    onClose,
    onSuccess,
}: {
    sensorInfos: ISensorInfo[];
    onClose: () => void;
    onSuccess: (hostname: string) => void;
}) {
    const keycloak = useKeycloak();

    const [sensorInfo, setSensorInfo] = useState<Record<string, any> | undefined>(undefined);
    const [isAdding, setIsAdding] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const fetchSensorAddFormSchema = () => {
        httpGet(keycloak, EDGE_BENCHMARK_FORM_SENSOR_ADD_PATH)
            .then((_schema) => setSensorInfo({ schema: _schema, values: {} }))
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
        if (sensorInfos.some((sensor) => sensor.hostname === newSensor.hostname)) {
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
        if (sensorInfo) {
            setErrorMsg(undefined);
            if (validateAddSensorFormInputs()) {
                setIsAdding(true);
                httpPost(keycloak, EDGE_BENCHMARK_SENSOR_PATH, sensorInfo.values)
                    .then((sensorInfo: ISensorInfo) => {
                        console.log('Added sensor:', sensorInfo);
                        onClose();
                        onSuccess(sensorInfo.hostname);
                    })
                    .catch((error) => {
                        console.log(error);
                        setErrorMsg(error.message);
                    })
                    .finally(() => setIsAdding(false));
            }
        } else {
            setErrorMsg('Sensor information is empty.');
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
                                                loading={isAdding}
                                                loadingPosition="end"
                                                endIcon={<AddIcon />}
                                            >
                                                Add Sensor
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
