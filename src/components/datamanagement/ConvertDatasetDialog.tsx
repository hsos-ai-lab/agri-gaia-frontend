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

import { useEffect, useState } from 'react';
import useKeycloak from '../../contexts/KeycloakContext';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import IDatasetConversion from '../../types/IDatasetConversion';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import FileInput from '../common/FileInput';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { httpGet, httpUpload } from '../../api';
import { DATASETS_CONVERT_PATH, DATASETS_CONVERT_FORMATS } from '../../endpoints';
import { downloadBlob } from '../../util';

interface IDatasetConvertProps {
    handleClose: () => void;
}

export default function ({ handleClose }: IDatasetConvertProps) {
    const keycloak = useKeycloak();

    const [datasetTypes, setDatasetTypes] = useState<Array<string>>([]);
    const [selectedConversion, setSelectedConversion] = useState<IDatasetConversion>({
        from: '',
        to: '',
    });
    const [selectedLabelFile, setSelectedLabelFile] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    useEffect(() => {
        fetchDatasetTypes();
    }, [keycloak]);

    const fetchDatasetTypes = async () => {
        httpGet(keycloak, DATASETS_CONVERT_FORMATS)
            .then((datasetTypes: Array<string>) => {
                datasetTypes.sort((a, b) => a.localeCompare(b));
                setDatasetTypes(datasetTypes);
                console.log('Dataset types:', datasetTypes);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleUploadButtonClick = async () => {
        setErrorMsg(undefined);

        const { from, to } = selectedConversion;

        if (!from || !to || from === to) {
            setErrorMsg('Please select a meaningful conversion!');
            return;
        }

        if (!selectedLabelFile) {
            setErrorMsg('Please select a single label file or ZIP archive!');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('label_file', selectedLabelFile, selectedLabelFile.name);

        httpUpload(keycloak, `${DATASETS_CONVERT_PATH}/${from}/${to}`, formData)
            .then(({ blob, fileName }: { blob: Blob; fileName: string }) => {
                setErrorMsg(undefined);
                downloadBlob(blob, fileName);
                handleClose();
            })
            .catch((error) => {
                setErrorMsg(error.body.detail);
            })
            .finally(() => {
                setIsUploading(false);
            });
    };

    const onClose = () => {
        if (isUploading) return;
        handleClose();
    };

    const DatasetTypeSelect = ({ inputLabel, direction }: { inputLabel: string; direction: 'from' | 'to' }) => {
        return (
            <FormControl fullWidth variant="standard">
                <InputLabel id={`dataset-type-${direction}`}>{inputLabel}</InputLabel>
                <Select
                    labelId={`dataset-type-${direction}`}
                    id={`dataset-select-${direction}`}
                    value={selectedConversion[direction]}
                    label={inputLabel}
                    onChange={(event: SelectChangeEvent) => {
                        const dataset_type = event.target.value;
                        setSelectedConversion({ ...selectedConversion, [direction]: dataset_type });
                    }}
                >
                    {datasetTypes &&
                        datasetTypes.map((datasetType) => (
                            <MenuItem key={datasetType} value={datasetType}>
                                {datasetType}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
        );
    };

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
                <DialogTitle>Label File Conversion</DialogTitle>
                <DialogContent>
                    {errorMsg ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMsg}
                        </Alert>
                    ) : null}
                    <Typography>
                        Upload a single label file or ZIP archive and select input and output conversion formats (see{' '}
                        <Link
                            href="https://docs.voxel51.com/api/fiftyone.types.dataset_types.html"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Voxel51
                        </Link>
                        ).
                    </Typography>
                    <Grid container spacing={2} direction="row">
                        <Grid item xs={12} md={6}>
                            <DatasetTypeSelect inputLabel="Input Format" direction="from" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DatasetTypeSelect inputLabel="Output Format" direction="to" />
                        </Grid>

                        <Grid item xs={12}>
                            <FileInput
                                text="Select File"
                                multiple={false}
                                accept="*"
                                onChange={(files) => setSelectedLabelFile(files[0])}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <LoadingButton onClick={handleUploadButtonClick} loading={isUploading}>
                        Upload
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}
