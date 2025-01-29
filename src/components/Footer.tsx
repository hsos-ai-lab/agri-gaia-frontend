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

import { useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TaskDrawer from './backgroundtasks/TaskDrawer';

const year = (): number => {
    return new Date().getFullYear();
};

export default function Footer() {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                display: 'grid',
                position: 'fixed',
                height: 30,
                bottom: 0,
                backgroundColor: 'primary.dark',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                gridTemplateColumns: 'repeat(3, 1fr)',
                textAlign: 'center',
                color: 'white',
                width: '100%',
                paddingTop: 0.5,
            }}
        >
            <Typography>
                <Link
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate('/licenses')}
                    underline="hover"
                    color="inherit"
                >
                    &copy; {year()} Hochschule Osnabrück
                </Link>
            </Typography>

            <Typography>
                <Link
                    href="https://www.hs-osnabrueck.de/personensuche/az-item/tapken-heiko/"
                    underline="hover"
                    color="inherit"
                >
                    Tapken Working Group
                </Link>
            </Typography>

            <TaskDrawer />
        </Box>
    );
}
