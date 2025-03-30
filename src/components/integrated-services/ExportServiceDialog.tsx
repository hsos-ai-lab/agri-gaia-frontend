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
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { httpUpload, httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import Alert from '@mui/material/Alert';

import AgrovocKeyword from '../../types/AgrovocKeyword';
import GenericInformationDialog from './GenericInformationDialog';
import SpecificInformationDialog from '../datamanagement/SpecificInformationDialog';

import { DATASETS_PATH, INTEGRATED_SERVICES_PATH, ONTOLOGY_PATH } from '../../endpoints';
import GeonamesLocation from '../../types/GeonamesLocation';

interface IDatasetUploadProps {
    handleClose: () => void;
}

export default function ({ handleClose }: IDatasetUploadProps) {
    const keycloak = useKeycloak();

    const [step, setStep] = useState(1);

    const [datasetType, setDatasetType] = useState('');
    const [datasetTypes, setDatasetTypes] = useState<string[]>([]);

    const [datasetMetadata, setDatasetMetadata] = useState<object>({});
    const [datasetMetadataSchema, setDatasetMetadataSchema] = useState<object>({});

    const [datasetTitle, setDatasetTitle] = useState<string>('');
    const [datasetDescription, setDatasetDescription] = useState<string>('');

    const [selectedDatasetFiles, setSelectedDatasetFiles] = useState<string[]>();
    const [isClassificationDataset, setIsClassificationDataset] = useState<boolean>(false);

    const [chosenKeywords, setChosenKeywords] = useState<Array<AgrovocKeyword>>([]);
    const [chosenLocations, setChosenLocations] = useState<Array<GeonamesLocation>>([]);

    const [annotationFile, setAnnotationFile] = useState<File | undefined>(undefined);
    const [annotationLabels, setAnnotationLabels] = useState<string[]>([]);

    const [createInProgress, setCreateInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [createSuccess, setCreateSuccess] = useState<boolean | undefined>(undefined);

    const increaseStep = () => {
        setStep(step + 1);
    };

    const decreaseStep = () => {
        setStep(step - 1);
    };

    useEffect(() => {
        fetchClasses();
    }, [keycloak]);

    const fetchClasses = async () => {
        httpGet(keycloak, ONTOLOGY_PATH)
            .then((data) => {
                console.log(data);
                setDatasetTypes(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleUploadButtonClick = async () => {
        if (uploadSuccessful()) {
            handleClose();
            return;
        }

        if (datasetTitle.trim() === '') {
            setErrorMsg('Please specify a dataset name!');
            setStep(1);
            return;
        }

        if (datasetDescription.trim() === '') {
            setErrorMsg('Please specify a dataset description!');
            setStep(1);
            return;
        }

        if (!selectedDatasetFiles || !selectedDatasetFiles.length) {
            setErrorMsg('Please select a dataset file!');
            setStep(1);
            return;
        }

        if (datasetType.trim() === '') {
            setErrorMsg('Please specify a dataset type!');
            setStep(2);
            return;
        }

        // clear status
        setErrorMsg(undefined);
        setCreateSuccess(false);

        setCreateInProgresss(true);

        const formData = new FormData();

        formData.append('metadata', JSON.stringify(datasetMetadata));
        formData.append('dataresource_type', datasetType);
        console.log(selectedDatasetFiles);

        for (const file of Array.from(selectedDatasetFiles)) formData.append('filenames', file);

        for (const chosenKeyword of chosenKeywords) formData.append('semantic_labels', chosenKeyword.uri);
        for (const chosenLocation of chosenLocations) formData.append('locations', chosenLocation.uri);

        if (annotationFile) formData.append('files', annotationFile, annotationFile.name);
        formData.append('includes_annotation_file', annotationFile ? 'true' : 'false');
        formData.append('is_classification_dataset', isClassificationDataset ? 'true' : 'false');

        for (const annotationLabel of annotationLabels) formData.append('annotation_labels', annotationLabel);

        formData.append('description', datasetDescription);
        formData.append('name', datasetTitle.trim());

        httpUpload(keycloak, DATASETS_PATH, formData)
            .then(() => {
                setErrorMsg(undefined);
                setCreateSuccess(true);
            })
            .catch((error) => {
                setErrorMsg(error.body['detail']);
                setCreateSuccess(false);
            })
            .finally(() => {
                setCreateInProgresss(false);
            });
    };

    const isUploading = () => {
        return createInProgress;
    };

    const uploadSuccessful = () => {
        return createSuccess;
    };

    const getButtonText = () => {
        if (isUploading()) return 'Uploading';

        if (uploadSuccessful()) return 'Close';

        return 'Create';
    };

    const onClose = () => {
        if (isUploading()) {
            return;
        }
        handleClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth="xs">
            <DialogTitle>Create new Dataset</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                {step === 1 ? (
                    <GenericInformationDialog
                        datasetType={datasetType}
                        setDatasetType={setDatasetType}
                        datasetTypes={datasetTypes}
                        setDatasetMetadataSchema={setDatasetMetadataSchema}
                        datasetTitle={datasetTitle}
                        setDatasetTitle={setDatasetTitle}
                        datasetDescription={datasetDescription}
                        setDatasetDescription={setDatasetDescription}
                        setSelectedDatasetFiles={setSelectedDatasetFiles}
                        isClassificationDataset={isClassificationDataset}
                        setIsClassificationDataset={setIsClassificationDataset}
                        chosenKeywords={chosenKeywords}
                        setChosenKeywords={setChosenKeywords}
                        chosenLocations={chosenLocations}
                        setChosenLocations={setChosenLocations}
                        setAnnotationFile={setAnnotationFile}
                        annotationLabels={annotationLabels}
                        setAnnotationLabels={setAnnotationLabels}
                        createInProgress={createInProgress}
                        createSuccess={createSuccess}
                    />
                ) : (
                    <SpecificInformationDialog
                        datasetTypes={datasetTypes}
                        datasetMetadata={datasetMetadata}
                        setDatasetMetadata={setDatasetMetadata}
                        datasetMetadataSchema={datasetMetadataSchema}
                        setErrorMsg={setErrorMsg}
                    />
                )}
            </DialogContent>
            <DialogActions>
                {step === 1 && datasetType.trim() != '' ? (
                    <LoadingButton onClick={increaseStep} loading={false}>
                        Add Metadata (Optional)
                    </LoadingButton>
                ) : null}
                {step === 2 ? (
                    <LoadingButton onClick={decreaseStep} loading={false}>
                        Previous Step
                    </LoadingButton>
                ) : null}
                <LoadingButton onClick={handleUploadButtonClick} loading={isUploading()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
