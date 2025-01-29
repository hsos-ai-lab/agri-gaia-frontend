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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LoadingButton from '@mui/lab/LoadingButton';
import SearchIcon from '@mui/icons-material/Search';

import ConnectorDeleteButton from './ConnectorDeleteButton';
import IConnectorListProps from '../../types/IConnectorListProps';
import IConnector from '../../types/IConnector';

export default function ({
    connectors,
    contracts,
    onDelete,
    loading,
    setChosenContract,
    handleInfoDialogOpen,
    setConnector,
}: IConnectorListProps) {
    const [open, setOpen] = useState(false);

    const toggleFolded = (row: IConnector) => {
        row.folded = !row.folded;
        setOpen(!open);
    };

    const openInfoDialog = (contractRow: any, connector: IConnector) => {
        console.log(contractRow);
        setChosenContract(contractRow);
        setConnector(connector);
        handleInfoDialogOpen();
    };

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Data Url</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {connectors.map((row) => (
                        <>
                            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <IconButton aria-label="expand row" size="small" onClick={() => toggleFolded(row)}>
                                        {!row.folded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.description}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.ids_url}
                                </TableCell>

                                <TableCell align="right">
                                    <Grid container spacing={1} justifyContent="flex-end">
                                        <Grid item>
                                            <ConnectorDeleteButton
                                                connectorName={row.name}
                                                connectorId={row.id}
                                                onDelete={onDelete}
                                            />
                                        </Grid>
                                    </Grid>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                    <Collapse in={!row.folded} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                            <Typography variant="h6" gutterBottom component="div">
                                                Assets
                                            </Typography>
                                            <Table size="small" aria-label="contracts">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Description</TableCell>
                                                        <TableCell>Contenttype</TableCell>
                                                        <TableCell align="right">Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                {!loading ? (
                                                    <TableBody>
                                                        {contracts[row.id].map((contractRow) => (
                                                            <TableRow
                                                                key={
                                                                    '' +
                                                                    contractRow.asset.createdAt +
                                                                    contractRow.asset.properties['asset:prop:name']
                                                                }
                                                            >
                                                                <TableCell component="th" scope="row">
                                                                    {contractRow.asset.properties['asset:prop:name']}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        contractRow.asset.properties[
                                                                            'asset:prop:description'
                                                                        ]
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        contractRow.asset.properties[
                                                                            'asset:prop:contenttype'
                                                                        ]
                                                                    }
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <LoadingButton
                                                                        color="primary"
                                                                        aria-label="download"
                                                                        loading={false}
                                                                        onClick={() => {
                                                                            openInfoDialog(contractRow, row);
                                                                        }}
                                                                    >
                                                                        <SearchIcon />
                                                                    </LoadingButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                ) : (
                                                    <Typography>Loading external information.</Typography>
                                                )}
                                            </Table>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
