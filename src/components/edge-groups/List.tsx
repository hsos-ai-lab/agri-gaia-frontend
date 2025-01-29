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

import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IEdgeGroup from '../../types/IEdgeGroup';
import ITag from '../../types/ITag';
import EdgeGroupDeleteButton from './EdgeGroupDeleteButton';

interface IEdgeGroupsListProps {
    edgeGroups: IEdgeGroup[];
    tags: ITag[];
    refreshCallback: () => void;
}

export default function EdgeGroupList({ edgeGroups, tags, refreshCallback }: IEdgeGroupsListProps) {
    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Tags</TableCell>
                            <TableCell>Active Devices</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {edgeGroups.map((group) => (
                            <TableRow key={group.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>{group.name}</TableCell>
                                <TableCell>
                                    {group.tagIds.map((id) => tags.find((t) => t.id === id)?.name).join(', ')}
                                </TableCell>
                                <TableCell>{group.deviceCount}</TableCell>
                                <TableCell align="right">
                                    <EdgeGroupDeleteButton
                                        edgeGroupId={group.id}
                                        edgeGroupName={group.name}
                                        onDelete={refreshCallback}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
