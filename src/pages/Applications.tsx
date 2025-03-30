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

import { useEffect, useState } from 'react';
import { httpGet } from '../api';
import useKeycloak from '../contexts/KeycloakContext';

import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';

import IApplication from '../types/IApplication';
import { APPLICATIONS_PATH, EDGE_GROUPS_PATH } from '../endpoints';
import ApplicationList from '../components/applications/List';
import NoDataYet from '../components/common/NoDataYet';
import NewApplicationDialog from '../components/applications/NewApplicationDialog';
import UpdateApplicationDialog from '../components/applications/UpdateApplicationDialog';
import IEdgeGroup from '../types/IEdgeGroup';
import Loading from '../components/common/Loading';

export default function Applications() {
    const keycloak = useKeycloak();

    const [edgeGroups, setEdgeGroups] = useState<Array<IEdgeGroup>>([]);
    const [applications, setApplications] = useState<Array<IApplication>>([]);
    const [applicationsAreLoading, setApplicationsAreLoading] = useState(false);

    const [newAppDialogOpen, setNewAppDialogOpen] = useState(false);

    const [applicationToUpdate, setApplicationToUpdate] = useState<IApplication | undefined>(undefined);

    const fetchApplications = async () => {
        setApplicationsAreLoading(true);
        httpGet(keycloak, APPLICATIONS_PATH)
            .then((data) => {
                setApplications(data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => setApplicationsAreLoading(false));
    };

    const fetchEdgeGroups = async () => {
        httpGet(keycloak, EDGE_GROUPS_PATH)
            .then((g) => {
                setEdgeGroups(g);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleNewApplicationDialogOpen = () => {
        setNewAppDialogOpen(true);
    };

    const handleNewApplicationDialogClose = () => {
        setNewAppDialogOpen(false);
        fetchApplications();
        fetchEdgeGroups();
    };

    const handleUpdateApplicationDialogOpen = (app: IApplication) => {
        setApplicationToUpdate(app);
    };

    const handleUpdateApplicationDialogClose = () => {
        setApplicationToUpdate(undefined);
        fetchApplications();
        fetchEdgeGroups();
    };

    useEffect(() => {
        fetchApplications();
        fetchEdgeGroups();
        // create an interval to fetch edge device updates every x seconds
        const applicationFetchInterval = setInterval(fetchApplications, 5000);
        console.log('Starting Application Fetch Interval');

        return () => {
            clearInterval(applicationFetchInterval);
            console.log('Stopping Application Fetch Interval');
        };
    }, [keycloak]);

    return (
        <>
            {newAppDialogOpen ? (
                <NewApplicationDialog edgeGroups={edgeGroups} handleClose={handleNewApplicationDialogClose} />
            ) : null}
            {applicationToUpdate ? (
                <UpdateApplicationDialog
                    application={applicationToUpdate}
                    edgeGroups={edgeGroups}
                    handleClose={handleUpdateApplicationDialogClose}
                />
            ) : null}
            <Grid container spacing={2} justifyContent="space-between">
                <Grid item xs={6}>
                    <Typography variant="h4" component="h4">
                        Applications
                    </Typography>
                </Grid>
                <Grid item xs={1}>
                    <Fab
                        color="primary"
                        aria-label="add"
                        size="small"
                        sx={{ float: 'right' }}
                        onClick={handleNewApplicationDialogOpen}
                    >
                        <AddIcon />
                    </Fab>
                </Grid>
            </Grid>

            <ApplicationList
                applications={applications}
                onDelete={fetchApplications}
                onUpdateClick={handleUpdateApplicationDialogOpen}
            />
            <NoDataYet data={applications} name="Applications" />
            <Loading isLoading={applicationsAreLoading} />
        </>
    );
}
