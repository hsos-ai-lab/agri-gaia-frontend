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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';

import IconButton from '@mui/material/IconButton';
import BuildIcon from '@mui/icons-material/Build';
import SyncIcon from '@mui/icons-material/Sync';
import Tooltip from '@mui/material/Tooltip';

import IInferenceContainerTemplate from '../../types/IInferenceContainerTemplate';
import InferenceContainerTemplateDeleteButton from './InferenceContainerTemplateDeleteButton';

interface IInferenceContainerTemplateListProps {
    containerTemplates: IInferenceContainerTemplate[];
    onDelete: () => void;
    onBuildContainer: (containerTemplate: IInferenceContainerTemplate) => void;
    onUpdateTemplate: (containerTemplate: IInferenceContainerTemplate) => void;
}

export default function ({
    containerTemplates: containerTemplates,
    onDelete,
    onBuildContainer,
    onUpdateTemplate,
}: IInferenceContainerTemplateListProps) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Template name</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Git Url</TableCell>
                        <TableCell>Git Reference</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {containerTemplates.map((c: IInferenceContainerTemplate) => (
                        <TableRow key={c.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                                {c.name}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {c.source}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {c.git_url === null ? 'No Git Url' : <a href={c.git_url}>{c.git_url}</a>}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {c.git_ref === null ? 'No Git Reference' : c.git_ref}
                            </TableCell>
                            <TableCell align="right">
                                <Grid container spacing={1} justifyContent="flex-end">
                                    {c.source == 'git' ? (
                                        <Grid item>
                                            <Tooltip title="Update git repo">
                                                <IconButton color="primary" onClick={() => onUpdateTemplate(c)}>
                                                    <SyncIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                    ) : null}
                                    <Grid item>
                                        <Tooltip title="Build from Template">
                                            <IconButton color="primary" onClick={() => onBuildContainer(c)}>
                                                <BuildIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item>
                                        <InferenceContainerTemplateDeleteButton
                                            containerTemplate={c}
                                            onDelete={onDelete}
                                        />
                                    </Grid>
                                </Grid>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
