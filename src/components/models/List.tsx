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
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import SpeedIcon from '@mui/icons-material/Speed';

import { useNavigate } from 'react-router-dom';
import { getLocalDateTime } from '../../util';

import IModel from '../../types/IModel';
import ModelDeleteButton from './ModelDeleteButton';
import ModelDownloadButton from './ModelDownloadButton';
import prettyBytes from 'pretty-bytes';
import ModelInferenceButton from './ModelInferenceButton';
import { Checkbox, Tooltip } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { LoadingButton } from '@mui/lab';

interface IModelListProps {
    models: IModel[];
    connectorAvailable: boolean;
    onDelete: () => void;
    onTogglePublic: (model_id: number) => void;
    selected: readonly number[];
    setSelected: Dispatch<SetStateAction<readonly number[]>>;
}

export default function ({
    models,
    connectorAvailable,
    onDelete,
    onTogglePublic,
    selected,
    setSelected,
}: IModelListProps) {
    const navigate = useNavigate();

    const [selectedRow, setSelectedRow] = useState(-1);
    const [inferenceDialogOpen, setInferenceDialogOpen] = useState(false);

    const isSelected = (id: number) => selected.indexOf(id) !== -1;

    const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        setSelected(newSelected);
        console.log(newSelected);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = models.map((n) => n.id);
            setSelected(newSelected);
            console.log(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleInferenceDialogClose = () => {
        setInferenceDialogOpen(false);
    };

    return (
        <>
            {inferenceDialogOpen ? (
                <ModelInferenceButton modelIds={[selectedRow]} handleClose={handleInferenceDialogClose} />
            ) : null}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={selected.length > 0 && selected.length < models.length}
                                    checked={models.length > 0 && selected.length === models.length}
                                    onChange={handleSelectAllClick}
                                    inputProps={{
                                        'aria-label': 'select all models',
                                    }}
                                />
                            </TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Format</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Modified</TableCell>
                            {connectorAvailable ? <TableCell>Public</TableCell> : null}
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {models.map((row, index) => {
                            const isItemSelected = isSelected(row.id);
                            const labelId = `enhanced-table-checkbox-${index}`;
                            return (
                                <TableRow key={`${row.id}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={isItemSelected}
                                            inputProps={{
                                                'aria-labelledby': labelId,
                                            }}
                                            onClick={(event) => handleClick(event, row.id)}
                                        />
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.format || 'unknown'}
                                    </TableCell>
                                    <TableCell>{row.owner}</TableCell>
                                    <TableCell>{row?.file_size ? prettyBytes(row.file_size) : 'N/A'}</TableCell>
                                    <TableCell>{getLocalDateTime(row.last_modified)}</TableCell>
                                    {connectorAvailable ? (
                                        <TableCell>
                                            <Switch
                                                checked={row.public}
                                                onChange={() => onTogglePublic(row.id)}
                                            ></Switch>
                                        </TableCell>
                                    ) : null}
                                    <TableCell align="right">
                                        <Grid container spacing={1} justifyContent="flex-end">
                                            <Grid item>
                                                <Button variant="outlined" onClick={() => navigate(`${row.id}`)}>
                                                    Details
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Tooltip title="Inference">
                                                    <LoadingButton
                                                        aria-label="delete"
                                                        onClick={() => {
                                                            setSelectedRow(row.id);
                                                            setInferenceDialogOpen(true);
                                                        }}
                                                    >
                                                        <SpeedIcon />
                                                    </LoadingButton>
                                                </Tooltip>
                                            </Grid>
                                            <Grid item>
                                                <ModelDownloadButton modelId={row.id} />
                                            </Grid>
                                            <Grid item>
                                                <ModelDeleteButton
                                                    modelId={row.id}
                                                    modelName={row.name}
                                                    onDelete={onDelete}
                                                />
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
