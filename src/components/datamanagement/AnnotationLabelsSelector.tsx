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

import { useState } from 'react';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import FileInput from '../common/FileInput';
import AlertSnackbar from '../common/AlertSnackbar';

interface IAnnotationLabelsSelectorProps {
    annotationLabels: string[];
    setAnnotationFile: (annotationFile: File) => void;
    setAnnotationLabels: (annotationLabels: string[]) => void;
    isUploading: () => boolean;
}

export default function AnnotationLabelsSelector({
    annotationLabels,
    setAnnotationFile,
    setAnnotationLabels,
    isUploading,
}: IAnnotationLabelsSelectorProps) {
    const [annotationLabel, setAnnotationLabel] = useState<string>('');
    const [importedAnnotationLabels, setImportedAnnotationLabels] = useState<string[]>([]);
    const [annotationLabelDeleteErrorOpen, setAnnotationLabelDeleteErrorOpen] = useState<boolean>(false);

    const addAnnotationLabel = (label: string) => {
        if (label && !labelExists(label)) {
            console.log('Adding ', label);
            setAnnotationLabels([...annotationLabels, label]);
        }
    };

    const handleAnnotationLabelDelete = (label: string) => {
        if (importedAnnotationLabels.includes(label)) {
            setAnnotationLabelDeleteErrorOpen(true);
            return;
        }
        setAnnotationLabels(annotationLabels.filter((_label: string) => _label !== label));
    };

    const labelExists = (label: string): boolean => {
        return annotationLabels.find((_label: string) => _label === label) !== undefined;
    };

    const importAnnotationLabelsFromFile = async (files: FileList) => {
        if (!files || files.length !== 1) return;

        const file = files[0];
        setAnnotationFile(file);

        const parser = new DOMParser();
        const xml = parser.parseFromString(await file.text(), 'text/xml');
        const results = xml.getElementsByTagName('label');

        const labels: string[] = [];
        for (let i = 0; i < results.length; ++i) {
            const label = results[i].childNodes[1].textContent;
            if (label && !labelExists(label)) labels.push(label);
        }

        setImportedAnnotationLabels(labels);
        setAnnotationLabels([...annotationLabels, ...labels]);
    };

    return (
        <>
            <Grid container direction="row" mt={2}>
                <Grid item xs={9}>
                    <TextField
                        id="annotation-label-name"
                        label="Annotation label"
                        variant="standard"
                        onChange={(e) => setAnnotationLabel(e.target.value.trim())}
                        disabled={isUploading()}
                    />
                </Grid>

                <Grid item xs={1}></Grid>

                <Grid item xs={2}>
                    <Button
                        variant="outlined"
                        disabled={isUploading()}
                        onClick={() => addAnnotationLabel(annotationLabel)}
                    >
                        Add
                    </Button>
                </Grid>
            </Grid>

            <Grid container direction="row" mt={2}>
                <Grid item xs={12}>
                    <FileInput
                        text="Import Labels From File"
                        accept="*"
                        multiple={false}
                        onChange={(files) => importAnnotationLabelsFromFile(files)}
                    />
                </Grid>
            </Grid>

            <Grid container direction="row" mt={2} sx={{ height: '20px' }}>
                <Grid item xs={12}>
                    {annotationLabels.map((annotationLabel, index) => {
                        return (
                            <Chip
                                key={index}
                                label={annotationLabel}
                                variant="outlined"
                                onDelete={() => handleAnnotationLabelDelete(annotationLabel)}
                            />
                        );
                    })}
                </Grid>
            </Grid>
            <AlertSnackbar
                message="Cannot delete labels imported from annotations file."
                severity="error"
                open={annotationLabelDeleteErrorOpen}
                onClose={() => setAnnotationLabelDeleteErrorOpen(false)}
            />
        </>
    );
}
