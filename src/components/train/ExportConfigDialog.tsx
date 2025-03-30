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

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';

import Grid from '@mui/material/Grid';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import IAlertMessage from '../../types/IAlertMessage';
import Link from '@mui/material/Link';
import Form from '@rjsf/material-ui/v5';
import Alert from '@mui/material/Alert';
import CodeEditor from '@uiw/react-textarea-code-editor';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { AlertColor } from '@mui/material/Alert';
import Switch from '@mui/material/Switch';

interface IExportConfigProps {
    exportConfig: Record<string, any> | undefined;
    isConfigUpdate: boolean;
    exportEnabled: boolean;
    setExportEnabled: (exportEnabled: boolean) => void;
    setExportConfig: (exportConfigValues: any) => void;
    onSubmit: (exportConfigSaveMessage: IAlertMessage) => void;
    handleClose: () => void;
}

export default function ({
    exportConfig,
    isConfigUpdate,
    exportEnabled,
    setExportConfig,
    setExportEnabled,
    onSubmit,
    handleClose,
}: IExportConfigProps) {
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const CustomDescription = (props: any) => {
        const docsKeyword = 'Documentation:';
        if (props.description) {
            let description = props.description;
            let docUrl = undefined;

            if (props.description.includes(docsKeyword)) [description, docUrl] = props.description.split(docsKeyword);

            return (
                <Typography id={props.id} variant="subtitle2" style={{ marginTop: '5px' }}>
                    {description}
                    {docUrl && (
                        <>
                            {docsKeyword}{' '}
                            <Link href={docUrl} target="_blank" rel="noreferrer">
                                {docUrl}
                            </Link>
                        </>
                    )}
                </Typography>
            );
        }
        return null;
    };

    return (
        <>
            <Dialog open={true} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                    ONNX Export Configuration
                    <Switch checked={exportEnabled} onChange={() => setExportEnabled(!exportEnabled)} />
                </DialogTitle>
                <DialogContent>
                    <Grid container justifyContent="space-between" spacing={2}>
                        <Grid item md={12} lg={6}>
                            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
                            {exportConfig && (
                                <Form
                                    disabled={!exportEnabled}
                                    schema={exportConfig.schema}
                                    fields={{ DescriptionField: CustomDescription }}
                                    onChange={(form) => {
                                        setExportConfig({ ...exportConfig, values: form.formData });
                                    }}
                                    onSubmit={(form) => {
                                        setExportConfig({ ...exportConfig, values: form.formData });
                                        handleClose();
                                        const submitMessage = {
                                            message: `ONNX Export Configuration saved.`,
                                            severity: 'success' as AlertColor,
                                            open: true,
                                        };
                                        onSubmit(submitMessage);
                                    }}
                                    formData={exportConfig.values}
                                    liveOmit={true}
                                    omitExtraData={true}
                                    liveValidate={true}
                                >
                                    {exportConfig && (
                                        <Grid container spacing={1}>
                                            <Grid item xs={12} md={12}>
                                                <Button
                                                    disabled={!exportEnabled}
                                                    type="submit"
                                                    variant="contained"
                                                    endIcon={<SaveIcon />}
                                                >
                                                    {isConfigUpdate ? 'Edit Config' : 'Save Config'}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    )}
                                </Form>
                            )}
                        </Grid>
                        <Grid item md={12} lg={6}>
                            {exportConfig && (
                                <CodeEditor
                                    value={JSON.stringify(exportConfig.values, null, 4)}
                                    language="json"
                                    placeholder={`Loading export configuration...`}
                                    disabled={!exportEnabled}
                                    onChange={(event) => {
                                        try {
                                            const config = JSON.parse(event.target.value);
                                            setExportConfig({ ...exportConfig, values: config });
                                            setErrorMsg(undefined);
                                        } catch (error: any) {
                                            console.error(error);
                                            setErrorMsg(`${error.message}`);
                                        }
                                    }}
                                    padding={15}
                                    style={{
                                        fontSize: 12,
                                        fontFamily:
                                            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                                    }}
                                />
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
