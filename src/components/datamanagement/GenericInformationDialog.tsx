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

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FileInput from '../common/FileInput';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { ChangeEvent } from 'react';

import AgrovocKeyword from '../../types/AgrovocKeyword';
import AgrovocKeywordSelector from '../../components/common/AgrovocKeywordSelector';
import AnnotationLabelsSelector from '../../components/datamanagement/AnnotationLabelsSelector';
import useKeycloak from '../../contexts/KeycloakContext';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { httpGet } from '../../api';

import { ONTOLOGY_PATH } from '../../endpoints';

import GeonamesLocationSelector from '../common/GeonamesLocationSelector';
import GeonamesLocation from '../../types/GeonamesLocation';

interface IDatasetGenericUploadProps {
    datasetTypes: string[];
    setDatasetMetadataSchema: (datasetMetadataSchema: object) => void;
    datasetType: string;
    setDatasetType: (datasetType: string) => void;
    datasetTitle: string;
    setDatasetTitle: (datasetTitle: string) => void;
    datasetDescription: string;
    setDatasetDescription: (datasetDescription: string) => void;
    setSelectedDatasetFiles: (selectedDatasetFiles: FileList) => void;
    isClassificationDataset: boolean;
    setIsClassificationDataset: (isClassificationDataset: boolean) => void;
    chosenKeywords: Array<AgrovocKeyword>;
    setChosenKeywords: (chosenKeywords: Array<AgrovocKeyword>) => void;
    chosenLocations: Array<GeonamesLocation>;
    setChosenLocations: (chosenLocations: Array<GeonamesLocation>) => void;
    setAnnotationFile: (annotationFile: File | undefined) => void;
    annotationLabels: string[];
    setAnnotationLabels: (annotationLabels: string[]) => void;
    createInProgress: boolean;
    createSuccess: boolean | undefined;
}

export default function ({
    datasetTypes,
    setDatasetMetadataSchema,
    datasetType,
    setDatasetType,
    datasetTitle,
    setDatasetTitle,
    datasetDescription,
    setDatasetDescription,
    setSelectedDatasetFiles,
    isClassificationDataset,
    setIsClassificationDataset,
    chosenKeywords,
    setChosenKeywords,
    chosenLocations,
    setChosenLocations,
    setAnnotationFile,
    annotationLabels,
    setAnnotationLabels,
    createInProgress,
    createSuccess,
}: IDatasetGenericUploadProps) {
    const keycloak = useKeycloak();

    const isUploading = () => {
        return createInProgress;
    };

    const fetchAttributes = async (s: string) => {
        httpGet(keycloak, ONTOLOGY_PATH + '/agri-gaia-asset:' + s)
            .then((data) => {
                setDatasetMetadataSchema(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleChangeClassificationDataset = (event: ChangeEvent<HTMLInputElement>) => {
        setIsClassificationDataset(event.target.checked);
    };

    const setDatasetTypeChecked = async (s: string) => {
        setDatasetType(s);
        fetchAttributes(s);
    };

    return (
        <Grid item xs={8}>
            <Box>
                <Divider textAlign="left">General Information</Divider>
            </Box>
            <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                <Grid item xs={10}>
                    <TextField
                        id="title-textfield"
                        label="Title"
                        variant="standard"
                        onChange={(e) => setDatasetTitle(e.target.value)}
                        value={datasetTitle}
                        required
                        disabled={isUploading()}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={2}>
                    {createInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                    {createSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                </Grid>
            </Grid>
            <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                <Grid item xs={10}>
                    <TextField
                        id="desciption-textfield"
                        label="Description"
                        variant="standard"
                        multiline
                        maxRows={4}
                        onChange={(e) => setDatasetDescription(e.target.value)}
                        value={datasetDescription}
                        required
                        disabled={isUploading()}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={2}>
                    {createInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                    {createSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                </Grid>
            </Grid>
            <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                <Grid item xs={8}>
                    <FormControl fullWidth variant="standard">
                        <InputLabel id="demo-simple-select-helper-label">Dataset Type *</InputLabel>
                        <Select
                            labelId="dataset-type-select"
                            id="dataset-type-select"
                            value={datasetType}
                            label="DatasetType"
                            onChange={(e) => setDatasetTypeChecked(e.target.value)}
                        >
                            {datasetTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Box mt={2}>
                <Divider textAlign="left">File Upload</Divider>
            </Box>
            <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                <Grid item xs={10}>
                    <FileInput
                        text="Select Files"
                        accept="*"
                        multiple={true}
                        onChange={(files) => setSelectedDatasetFiles(files)}
                    />
                </Grid>
                <Grid item xs={2}>
                    {createInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                    {createSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                </Grid>
            </Grid>
            <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                <Grid item xs={10}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isClassificationDataset}
                                    onChange={handleChangeClassificationDataset}
                                />
                            }
                            label="Classification Dataset"
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={2}>
                    {createInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                    {createSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                </Grid>
            </Grid>
            <Box mt={2}>
                <Divider textAlign="left">Additional Information</Divider>
            </Box>
            <AgrovocKeywordSelector
                chosenKeywords={chosenKeywords}
                setChosenKeywords={setChosenKeywords}
                isUploading={isUploading}
            />
            <GeonamesLocationSelector
                chosenLocations={chosenLocations}
                setChosenLocations={setChosenLocations}
                isUploading={isUploading}
            />
            <AnnotationLabelsSelector
                annotationLabels={annotationLabels}
                setAnnotationFile={setAnnotationFile}
                setAnnotationLabels={setAnnotationLabels}
                isUploading={isUploading}
            />
        </Grid>
    );
}
