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

import { useState, useEffect } from 'react';
import useKeycloak from '../../contexts/KeycloakContext';
import useApplicationTasks from '../../contexts/TasksContext';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import FileInput from '../common/FileInput';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { httpUpload, httpGet } from '../../api';
import { DATASETS_AUTO_ANNOTATION_PATH, URLS_BASIC_AUTH_PATH } from '../../endpoints';
import { createSubdomainUrl, openInNewTab } from '../../util';
import IAlertMessage from '../../types/IAlertMessage';
import { AlertColor } from '@mui/material/Alert';

interface IDatasetAutoAnnotationProps {
    datasetName: string;
    annotateDataset: () => void;
    onUpload: (uploadMessage: IAlertMessage) => void;
    handleClose: () => void;
}

export default function ({ datasetName, annotateDataset, onUpload, handleClose }: IDatasetAutoAnnotationProps) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [selectedAutoAnnotationArchive, setSelectedAutoAnnotationArchive] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [nuclioBasicAuthUrl, setNuclioBasicAuthUrl] = useState<string>(createSubdomainUrl('nuclio'));

    useEffect(() => {
        fetchNuclioBasicAuthUrl();
    }, [keycloak]);

    const fetchNuclioBasicAuthUrl = async () => {
        httpGet(keycloak, `${URLS_BASIC_AUTH_PATH}/nuclio`)
            .then(({ url }) => setNuclioBasicAuthUrl(url))
            .catch((error) => console.error(error));
    };

    const handleUploadButtonClick = async () => {
        setErrorMsg(undefined);

        if (!selectedAutoAnnotationArchive) {
            setErrorMsg('Please select a ZIP archive containing a Nuclio function definition!');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('auto_annotation_archive', selectedAutoAnnotationArchive, selectedAutoAnnotationArchive.name);

        httpUpload(keycloak, `${DATASETS_AUTO_ANNOTATION_PATH}`, formData, undefined, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => {
                        onUpload({
                            message: `Deployment of Auto Annotation Model from "${selectedAutoAnnotationArchive.name}" started.`,
                            severity: 'info' as AlertColor,
                            open: true,
                        });
                        tasks?.addServerBackgroundTask(keycloak, tasks, task, (completedTask) => {
                            switch (completedTask.status) {
                                case 'completed':
                                    console.log(
                                        `Successfully deployed Auto Annotation Model from "${selectedAutoAnnotationArchive.name}".`,
                                    );
                                    setErrorMsg(undefined);
                                    handleClose();
                                    annotateDataset();
                                    break;
                                case 'failed':
                                    setTimeout(() => {
                                        onUpload({
                                            message: `Deployment of Auto Annotation Model failed. See Task Drawer for details.`,
                                            severity: 'error' as AlertColor,
                                            open: true,
                                        });
                                    }, 1500);
                                    break;
                                default:
                                    break;
                            }
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(() => {
                        setIsUploading(false);
                        handleClose();
                    });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const onClose = () => {
        if (isUploading) return;
        handleClose();
    };

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
                <DialogTitle>Dataset Annotation</DialogTitle>
                <DialogContent>
                    {errorMsg ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMsg}
                        </Alert>
                    ) : null}
                    <Typography mb={1}>
                        Would you like to upload a{' '}
                        <Link
                            href="https://nuclio.io/docs/latest/tasks/deploying-functions/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Nuclio function definition
                        </Link>{' '}
                        of an{' '}
                        <Link
                            href="https://opencv.github.io/cvat/docs/manual/advanced/serverless-tutorial"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Auto Annotation Model
                        </Link>{' '}
                        before opening the dataset "{datasetName}" in CVAT?
                    </Typography>
                    <Grid container direction="row">
                        <Grid item xs={12}>
                            <FileInput
                                text="Select ZIP Archive"
                                multiple={false}
                                accept="application/zip"
                                onChange={(files) => setSelectedAutoAnnotationArchive(files[0])}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            handleClose();
                            annotateDataset();
                        }}
                        color="secondary"
                        disabled={isUploading}
                    >
                        Annotate Now
                    </Button>
                    <Button
                        onClick={() => openInNewTab(`${nuclioBasicAuthUrl}/projects/cvat/functions`, true)}
                        color="info"
                    >
                        View Models
                    </Button>
                    <LoadingButton onClick={handleUploadButtonClick} loading={isUploading}>
                        Upload
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}
