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
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import ILicense from '../../types/ILicense';
import IDependency from '../../types/IDependency';
import IDependencyCategory from '../../types/IDependencyCategory';

interface ILicensesListProps {
    dependencies: IDependencyCategory[];
}

export default function ({ dependencies }: ILicensesListProps) {
    const LicenseLink = ({ license }: { license: ILicense }) => {
        if (!license) return <>N/A</>;
        else if (!license.html_url) return <>{license.name}</>;
        else
            return (
                <Link href={license.html_url} target="_blank" underline="hover">
                    {license.name}
                </Link>
            );
    };

    const DependencyCategoryTable = ({ category, dependencies }: { category: string; dependencies: IDependency[] }) => {
        return (
            <>
                <Typography variant="h5" mt={2}>
                    {category}
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Version</TableCell>
                                <TableCell>Repository</TableCell>
                                <TableCell>License</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dependencies.map((dependency: IDependency, index: number) => (
                                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        {dependency.name}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {dependency.version.join('; ')}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={dependency.url} target="_blank" underline="hover">
                                            {dependency.url}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{<LicenseLink license={dependency.license} />}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    return (
        <>
            {dependencies.map((category, index) => {
                return (
                    <DependencyCategoryTable
                        key={index}
                        category={category.name}
                        dependencies={category.dependencies}
                    />
                );
            })}
        </>
    );
}
