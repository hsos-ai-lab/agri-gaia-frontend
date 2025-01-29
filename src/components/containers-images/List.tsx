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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import UploadIcon from '@mui/icons-material/Upload';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import IContainerImage from '../../types/IContainerImage';
import ContainerDeleteButton from './ContainerImageDeleteButton';
import prettyBytes from 'pretty-bytes';

interface IContainerListProps {
    containerImages: IContainerImage[];
    onDelete: () => void;
    deployContainer: (container: IContainerImage) => void;
}

export default function ({ containerImages: containerImages, onDelete, deployContainer }: IContainerListProps) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Repository name</TableCell>
                        <TableCell>Tag</TableCell>
                        <TableCell>Platform</TableCell>
                        <TableCell>Compressed image size</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {containerImages.map((c) => (
                        <TableRow
                            key={`${c.repository}-${c.tag} -${c.platform}`}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {c.repository}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {c.tag}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {c.platform}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {c.compressed_image_size ? prettyBytes(c.compressed_image_size) : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                                <Grid container spacing={1} justifyContent="flex-end">
                                    <Grid item>
                                        <Tooltip title="Deploy">
                                            <IconButton aria-label="deploy" onClick={() => deployContainer(c)}>
                                                <UploadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item>
                                        <ContainerDeleteButton containerImage={c} onDelete={onDelete} />
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
