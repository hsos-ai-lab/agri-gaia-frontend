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

import useCvat from '../../contexts/CvatContext';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import SpeedIcon from '@mui/icons-material/Speed';

import { DatasetType } from '../../types/IDataset';
import IDatasetListProps from '../../types/IDatasetListProps';
import { getLocalDateTime } from '../../util';

import DatasetDeleteButton from './DatasetDeleteButton';
import DatasetDownloadButton from './DatasetDownloadButton';
import DatasetAnnotateButton from './DatasetAnnotateButton';
import DatasetBrowseButton from './DatasetBrowseButton';
import prettyBytes from 'pretty-bytes';
import { LoadingButton } from '@mui/lab';
import { Checkbox, Tooltip } from '@mui/material';
import { useState } from 'react';
import useKeycloak from '../../contexts/KeycloakContext';
import DatasetInferenceDialog from './DatasetInferenceDialog';

export default function ({
    datasets,
    username,
    connectorAvailable,
    onDelete,
    onTogglePublic,
    selected,
    setSelected,
}: IDatasetListProps) {
    const cvat = useCvat();
    const keycloak = useKeycloak();

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
            const newSelected = datasets.map((n) => n.id);
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
                <DatasetInferenceDialog datasetIds={[selectedRow]} handleClose={handleInferenceDialogClose} />
            ) : null}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={selected.length > 0 && selected.length < datasets.length}
                                    checked={datasets.length > 0 && selected.length === datasets.length}
                                    onChange={handleSelectAllClick}
                                    inputProps={{
                                        'aria-label': 'select all models',
                                    }}
                                />
                            </TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Owner</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Modified</TableCell>
                            {connectorAvailable ? <TableCell>Public</TableCell> : null}
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {datasets.map((row, index) => {
                            const isItemSelected = isSelected(row.id);
                            const labelId = `enhanced-table-checkbox-${index}`;
                            return (
                                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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
                                    <TableCell>{row.owner}</TableCell>
                                    <TableCell component="th" scope="row">
                                        {prettyBytes(row.total_filesize)}
                                    </TableCell>
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
                                                <DatasetDownloadButton datasetId={row.id} />
                                            </Grid>
                                            <Grid item>
                                                {row.dataset_type === DatasetType.IMAGE ? (
                                                    <DatasetAnnotateButton
                                                        datasetName={row.name}
                                                        datasetId={row.id}
                                                        disabled={
                                                            row.dataset_type !== DatasetType.IMAGE ||
                                                            !cvat?.authed ||
                                                            row.owner !== username
                                                        }
                                                    />
                                                ) : (
                                                    <Button disabled={true}></Button>
                                                )}
                                            </Grid>
                                            <Grid item>
                                                <DatasetBrowseButton dataset={row} />
                                            </Grid>
                                            <Grid item>
                                                <DatasetDeleteButton
                                                    datasetName={row.name}
                                                    datasetId={row.id}
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
