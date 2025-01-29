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

import { useEffect, useState, Fragment } from 'react';
import { httpGet } from '../api';
import useKeycloak from '../contexts/KeycloakContext';

import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';

import { NETWORK_PATH } from '../endpoints';

import ConnectorList from '../components/networkmanagment/List';
import NoDataYet from '../components/common/NoDataYet';
import IConnector from '../types/IConnector';
import AddConnectorDialog from '../components/networkmanagment/AddConnectorDialog';
import AssetDetailDialog from '../components/networkmanagment/AssetDetailDialog';
import ConnectorDetailDialog from '../components/networkmanagment/ConnectorDetailDialog';

export default function Network() {
    const keycloak = useKeycloak();

    const [connectors, setConnectors] = useState<Array<IConnector>>([]);
    const [ownInformation, setOwnInformation] = useState<any>();
    const [contracts] = useState<Record<number, Array<Record<any, any>>>>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState<boolean>(false);
    const [connectorDetailDialogOpen, setConnectorDetailDialogOpen] = useState<boolean>(false);
    const [chosenContract, setChosenContract] = useState<any>();
    const [connector, setConnector] = useState<IConnector>();
    const [trigger, setTrigger] = useState<boolean>(false);
    const [connectorAvailable, setConnectorAvailable] = useState<boolean>(false);

    useEffect(() => {
        httpGet(keycloak, NETWORK_PATH + '/info')
            .then((result) => {
                setConnectorAvailable(result['available']);
                const record = { 'X-Api-Key': result['password'] };
                httpGet(keycloak, result['connector_data_url'] + '/assets', record)
                    .then(() => {
                        setOwnInformation(result);
                        setLoading(true);
                        fetchConnectors(result);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    }, [keycloak, trigger]);

    const fetchConnectors = (own_info: any) => {
        setLoading(true);
        httpGet(keycloak, NETWORK_PATH)
            .then((connectors: IConnector[]) => {
                connectors.forEach(function (connector) {
                    contracts[connector.id] = [];
                    connector.folded = true;
                    fetchAssets(connector, own_info);
                });
                connectors.sort((a, b) => a.name.localeCompare(b.name));
                setConnectors(connectors);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchAssets = (connector: IConnector, own_info: any) => {
        const record = { 'X-Api-Key': own_info['password'] };
        httpGet(keycloak, own_info['connector_data_url'] + '/catalog?providerUrl=' + connector.ids_url, record)
            .then((result) => {
                contracts[connector.id] = result['contractOffers'];
            })
            .catch((error) => {
                console.log('Not available');
            });
    };

    const forceRerender = () => {
        setTrigger(!trigger);
    };

    const handleAddDialogOpen = () => {
        setAddDialogOpen(true);
    };

    const handleAddDialogClose = () => {
        setAddDialogOpen(false);
        fetchConnectors(ownInformation);
    };

    const handleInfoDialogOpen = () => {
        setInfoDialogOpen(true);
    };

    const handleInfoDialogClose = () => {
        setInfoDialogOpen(false);
    };

    const handleConnectorDetailDialogOpen = () => {
        setConnectorDetailDialogOpen(true);
    };

    const handleConnectorDetailDialogClose = () => {
        setConnectorDetailDialogOpen(false);
    };

    const isLoading = () => {
        return loading;
    };

    return (
        <>
            {addDialogOpen ? (
                <AddConnectorDialog handleClose={handleAddDialogClose} ownInformation={ownInformation} />
            ) : null}
            {infoDialogOpen ? (
                <AssetDetailDialog handleClose={handleInfoDialogClose} asset={chosenContract} connector={connector} />
            ) : null}
            {connectorDetailDialogOpen ? (
                <ConnectorDetailDialog handleClose={handleConnectorDetailDialogClose} ownInformation={ownInformation} />
            ) : null}
            {connectorAvailable ? (
                <div>
                    <Grid container justifyContent="space-between">
                        <Grid item md={12} lg={6}>
                            <Typography variant="h4" component="h4">
                                Connected Participants
                            </Typography>
                        </Grid>

                        <Grid item md={12} lg={6}>
                            <Grid container spacing={1} justifyContent="right">
                                <Grid item>
                                    <Fab
                                        color="primary"
                                        aria-label="add"
                                        size="small"
                                        sx={{ float: 'right' }}
                                        onClick={handleConnectorDetailDialogOpen}
                                    >
                                        <InfoIcon />
                                    </Fab>
                                </Grid>
                                <Grid item>
                                    <Fab
                                        color="primary"
                                        aria-label="add"
                                        size="small"
                                        sx={{ float: 'right' }}
                                        onClick={handleAddDialogOpen}
                                    >
                                        <AddIcon />
                                    </Fab>
                                </Grid>
                                <Grid item>
                                    <Fab
                                        color="primary"
                                        aria-label="add"
                                        size="small"
                                        sx={{ float: 'right' }}
                                        onClick={fetchConnectors}
                                    >
                                        <SyncIcon />
                                    </Fab>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <ConnectorList
                        connectors={connectors}
                        contracts={contracts}
                        loading={isLoading()}
                        onDelete={forceRerender}
                        setChosenContract={setChosenContract}
                        handleInfoDialogOpen={handleInfoDialogOpen}
                        setConnector={setConnector}
                    />

                    <NoDataYet data={connectors} name="Connected Participants" />
                </div>
            ) : (
                <Fragment>
                    It seems, the EDC was not started correctly.
                    <br />
                    Please contact your platform administrator for detailed information.
                    <br />
                    More detailed information on the configuration can be found here:
                    https://github.com/agri-gaia/dev-docs-platform-lmis-bosch/blob/main/docs/edc-deployment.md
                </Fragment>
            )}
        </>
    );
}
