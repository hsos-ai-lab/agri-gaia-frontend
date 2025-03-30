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

import React, { useState } from 'react';

import Grid from '@mui/material/Grid';
import prettyBytes from 'pretty-bytes';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import AlertSnackbar from '../../components/common/AlertSnackbar';
import IAlertMessage from '../../types/IAlertMessage';

import useKeycloak from '../../contexts/KeycloakContext';
import IModel, { TENSOR_DATATYPES, INPUT_TENSOR_SHAPE_SEMANTICS, MODEL_FORMATS } from '../../types/IModel';
import { httpPatch } from '../../api';
import { MODELS_PATH } from '../../endpoints';
import { getLocalDateTime } from '../../util';

const reNonEmptyArray = /^\[(?:\d+,\s?)*\d+\]$/;
const validateShapeString = (shapeString: string) => {
    return reNonEmptyArray.test(shapeString);
};

const validateSemanticsMatchesShape = (semantics: string | undefined, shapeString: string | undefined) => {
    return semantics?.length == shapeString?.split(',').length;
};

const tensorShapeToString = (shape: number[] | undefined) => {
    if (!shape) {
        return shape;
    }
    return '[' + shape.join(', ') + ']';
};

const stringToTensorShape = (shapeString: string | undefined) => {
    if (!shapeString) {
        return undefined;
    }
    const valid = validateShapeString(shapeString);
    if (!valid) {
        const errorMessage = 'Not a valid shape string: ' + shapeString;
        throw new Error(errorMessage);
    }
    //eslint-disable-next-line
    const re = /[\[\]\s]/g;
    return shapeString.replace(re, '').split(',').map(Number);
};

const GridRow = ({
    label,
    val,
    onTextFieldChange,
    editing,
    selectionOptions,
    errorState = false,
    errorMessage,
}: {
    label: string;
    val: string | undefined;
    selectionOptions?: { value: string; label: string }[];
    onTextFieldChange?: (value: string) => void;
    editing?: boolean;
    errorState?: boolean;
    errorMessage?: string;
}) => {
    const textFieldConfig: {
        helperText: string | undefined;
        error: boolean;
        select: boolean;
    } = {
        helperText: undefined,
        error: false,
        select: false,
    };
    if (errorState) {
        textFieldConfig.helperText = errorMessage; //'Eingabe in JSON-Array Syntax, z.B. [32, 32, 3].';
        textFieldConfig.error = true;
    }
    if (selectionOptions) {
        textFieldConfig.select = true;
    }
    return (
        <>
            <Grid item xs={2}>
                <b>{label}</b>
            </Grid>
            <Grid item xs={10}>
                {onTextFieldChange && editing ? (
                    <TextField
                        label={label.replace(':', '')}
                        sx={{ minWidth: 300 }}
                        value={val}
                        variant="filled"
                        size="small"
                        onChange={(e) => onTextFieldChange(e.target.value)}
                        {...textFieldConfig}
                    >
                        {selectionOptions?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                ) : (
                    val || '-'
                )}
            </Grid>
        </>
    );
};

export default function ModelDetailsGrid(props: {
    model: IModel | undefined;
    onEditSuccessful: (model: IModel) => void;
}) {
    if (!props.model) {
        return (
            <>
                <Grid container spacing={1} justifyContent="space-between">
                    <Grid item xs={12}>
                        Error: Could not fetch Model
                    </Grid>
                </Grid>
            </>
        );
    }
    const { model, onEditSuccessful } = props;

    const keycloak = useKeycloak();
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [modelName, setModelName] = useState<string>(model.name);
    const [modelFormat, setModelFormat] = useState<string>(model.format);
    const [inputName, setInputName] = useState<string | undefined>(model.input_name);
    const [inputDatatype, setInputDatatype] = useState<string | undefined>(model.input_datatype);
    const [inputShape, setInputShape] = useState<string | undefined>(tensorShapeToString(model.input_shape));
    const [inputSemantics, setInputSemantics] = useState<string | undefined>(model.input_semantics);
    const [outputName, setOutputName] = useState<string | undefined>(model.output_name);
    const [outputDatatype, setOutputDatatype] = useState<string | undefined>(model.output_datatype);
    const [outputShape, setOutputShape] = useState<string | undefined>(tensorShapeToString(model.output_shape));
    const [outputLabels, setOutputLabels] = useState<string | undefined>(model.output_labels?.join(', '));

    const [inputShapeErrorState, setInputShapeErrorState] = useState(false);
    const [outputShapeErrorState, setOutputShapeErrorState] = useState(false);
    const [inputSemanticsErrorState, setInputSemanticsErrorState] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState<IAlertMessage>({
        message: undefined,
        severity: undefined,
        open: false,
    });

    const cancelEditing = () => {
        setModelName(model.name);
        setModelFormat(model.format);
        setInputName(model.input_name);
        setInputDatatype(model.input_datatype);
        setInputShape(tensorShapeToString(model.input_shape));
        setInputSemantics(model.input_semantics);
        setOutputName(model.output_name);
        setOutputDatatype(model.output_datatype);
        setOutputShape(tensorShapeToString(model.output_shape));
        setOutputLabels(model.output_labels?.join(', '));
        setEditing(false);
    };

    const save = () => {
        const errorStates = [inputShapeErrorState, outputShapeErrorState, inputSemanticsErrorState];
        if (errorStates.some((state) => state === true)) {
            setSnackbarMessage({
                message: 'Some inputs contain errors',
                severity: 'error',
                open: true,
            });
            return;
        }

        const modelPatch = {
            name: modelName,
            format: modelFormat,
            input_name: inputName,
            input_datatype: inputDatatype,
            input_shape: stringToTensorShape(inputShape),
            input_semantics: inputSemantics,
            output_name: outputName,
            output_datatype: outputDatatype,
            output_shape: stringToTensorShape(outputShape),
            output_labels: outputLabels?.split(',').map((label: string) => label.trim()),
        };

        setSubmitting(true);
        httpPatch(keycloak, `${MODELS_PATH}/${model.id}`, modelPatch)
            .then(() => {
                setEditing(false);
                setSubmitting(false);
                onEditSuccessful({ ...model, ...modelPatch });
            })
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
            });
    };

    return (
        <>
            <AlertSnackbar
                message={snackbarMessage.message}
                severity={snackbarMessage.severity}
                open={snackbarMessage.open}
                onClose={() => setSnackbarMessage({ ...snackbarMessage, open: false })}
            />
            <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
                <Grid item xs={11}>
                    <Typography variant="h5" component="h5" sx={{ color: 'primary.dark', mb: 2 }}>
                        Model Info
                    </Typography>
                </Grid>
                {!editing ? (
                    <Grid item xs={1}>
                        <Button variant="outlined" onClick={() => setEditing(true)}>
                            Edit
                        </Button>
                    </Grid>
                ) : null}
            </Grid>
            <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
                <GridRow label="Name:" val={modelName} onTextFieldChange={setModelName} editing={editing} />
                <GridRow
                    label="Format:"
                    val={modelFormat}
                    onTextFieldChange={setModelFormat}
                    editing={editing}
                    selectionOptions={MODEL_FORMATS}
                />
                <GridRow label="Dateiname:" val={model.file_name} />
                <GridRow label="Besitzer:" val={model.owner} />
                <GridRow label="Bucket:" val={model.bucket_name} />
                <GridRow label="Dateigröße:" val={prettyBytes(model.file_size)} />
                <GridRow label="Zuletzt geändert:" val={getLocalDateTime(model.last_modified)} />
            </Grid>
            <Typography variant="h5" component="h5" sx={{ color: 'primary.dark', mb: 2, mt: 4 }}>
                Input Tensor Info
            </Typography>
            <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
                <GridRow label="Name:" val={inputName} onTextFieldChange={setInputName} editing={editing} />
                <GridRow
                    label="Datentyp:"
                    val={inputDatatype}
                    onTextFieldChange={setInputDatatype}
                    editing={editing}
                    selectionOptions={TENSOR_DATATYPES}
                />
                <GridRow
                    label="Shape:"
                    val={inputShape}
                    onTextFieldChange={(shape) => {
                        setInputShapeErrorState(!validateShapeString(shape));
                        setInputSemanticsErrorState(!validateSemanticsMatchesShape(inputSemantics, shape));
                        setInputShape(shape);
                    }}
                    editing={editing}
                    errorState={inputShapeErrorState}
                    errorMessage={'Input in JSON-Array syntax, e.g. [32, 32, 3].'}
                />
                <GridRow
                    label="Shape semantics:"
                    val={inputSemantics}
                    onTextFieldChange={(semantics) => {
                        setInputSemanticsErrorState(!validateSemanticsMatchesShape(semantics, inputShape));
                        setInputSemantics(semantics);
                    }}
                    editing={editing}
                    selectionOptions={INPUT_TENSOR_SHAPE_SEMANTICS}
                    errorState={inputSemanticsErrorState}
                    errorMessage={'Shape semantics channel number must match the shape channel number.'}
                />
            </Grid>
            <Typography variant="h5" component="h5" sx={{ color: 'primary.dark', mb: 2, mt: 4 }}>
                Output Tensor Info
            </Typography>
            <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
                <GridRow label="Name:" val={outputName} onTextFieldChange={setOutputName} editing={editing} />
                <GridRow
                    label="Datentyp:"
                    val={outputDatatype}
                    onTextFieldChange={setOutputDatatype}
                    editing={editing}
                    selectionOptions={TENSOR_DATATYPES}
                />
                <GridRow
                    label="Shape:"
                    val={outputShape}
                    onTextFieldChange={(shape) => {
                        setOutputShapeErrorState(!validateShapeString(shape));
                        setOutputShape(shape);
                    }}
                    editing={editing}
                    errorState={outputShapeErrorState}
                />
                <GridRow label="Labels:" val={outputLabels} onTextFieldChange={setOutputLabels} editing={editing} />
                {editing ? (
                    <>
                        <Grid item xs={10} />
                        <Grid item xs={1}>
                            <LoadingButton variant="outlined" onClick={save} loading={submitting}>
                                Save
                            </LoadingButton>
                        </Grid>
                        <Grid item xs={1}>
                            <Button variant="outlined" color="error" onClick={cancelEditing}>
                                Cancel
                            </Button>
                        </Grid>
                    </>
                ) : null}
            </Grid>
        </>
    );
}
