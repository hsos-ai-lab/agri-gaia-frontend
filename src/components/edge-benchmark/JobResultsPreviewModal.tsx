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

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CodeEditor from '@uiw/react-textarea-code-editor';
import IBenchmarkJob from '../../types/edge-benchmark/IBenchmarkJob';

export default function ({
    benchmarkJob,
    benchmarkJobResult,
    onClose,
}: {
    benchmarkJob: IBenchmarkJob;
    benchmarkJobResult: Record<string, any>;
    onClose: () => void;
}) {
    return (
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    Results preview for {benchmarkJob.model.name} with {benchmarkJob.dataset.name} on{' '}
                    {benchmarkJob.edge_device}
                </DialogTitle>
                <DialogContent>
                    <Grid container justifyContent="space-between">
                        <Grid item xs={12}>
                            {benchmarkJobResult && (
                                <CodeEditor
                                    value={JSON.stringify(benchmarkJobResult, null, 4)}
                                    language="json"
                                    placeholder={`Loading benchmark results...`}
                                    disabled
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
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
