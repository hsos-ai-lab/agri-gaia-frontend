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

import ITrainContainersListProps from '../../types/ITrainContainersListProps';

import TrainContainerGetModelButton from './TrainContainerGetModelButton';
import TrainContainerDeleteButton from './TrainContainerDeleteButton';
import TrainContainerRunButton from './TrainContainerRunButton';
import TrainContainerLogsButton from './TrainContainerLogsButton';
import TrainContainerEditButton from './TrainContainerEditButton';

export default function ({
    trainContainers,
    onDelete,
    onRun,
    onStop,
    onModelTransfer,
    onEdit,
}: ITrainContainersListProps) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Provider</TableCell>
                        <TableCell>Architecture</TableCell>
                        <TableCell>Dataset</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Repository</TableCell>
                        <TableCell>Tag</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {trainContainers.map((row) => (
                        <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.provider}</TableCell>
                            <TableCell>{row.architecture}</TableCell>
                            <TableCell>{row.dataset.name}</TableCell>
                            <TableCell>{row.score == null ? 'N/A' : `${row.score} ${row.score_name}`}</TableCell>
                            <TableCell>{row.repository}</TableCell>
                            <TableCell>{row.tag}</TableCell>
                            <TableCell>{row.owner}</TableCell>
                            <TableCell>{row.status.toUpperCase()}</TableCell>
                            <TableCell align="right">
                                <Grid container spacing={1} justifyContent="flex-end">
                                    <Grid item>
                                        <TrainContainerRunButton
                                            trainContainerId={row.id}
                                            onRun={onRun}
                                            onStop={onStop}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TrainContainerEditButton
                                            trainContainerId={row.id}
                                            disabled={!row.container_id}
                                            onEdit={onEdit}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TrainContainerLogsButton
                                            trainContainerId={row.id}
                                            repository={row.repository}
                                            tag={row.tag}
                                            disabled={!row.container_id}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TrainContainerGetModelButton
                                            trainContainerId={row.id}
                                            disabled={!row.container_id}
                                            onModelTransfer={onModelTransfer}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TrainContainerDeleteButton
                                            trainContainerId={row.id}
                                            repository={row.repository}
                                            tag={row.tag}
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
