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

import { useEffect, useState } from 'react';

import { PROJECT_BASE_URL, httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';

import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';

import { INTEGRATED_SERVICES_PATH } from '../../endpoints';
import { Divider, ListItem, Tooltip } from '@mui/material';
import React from 'react';
import { Buffer } from 'buffer';
import { openInNewTab } from '../../util';
import SwaggerUI from './SwaggerUI';

export default function ServiceInputs(
    this: any,
    {
        serviceInfo,
        setServiceInfo,
        handleClose,
        service_name,
    }: {
        serviceInfo: object;
        setServiceInfo: (info: JSON) => void;
        handleClose: () => void;
        service_id: number;
        service_name: string;
    },
) {
    const keycloak = useKeycloak();

    const [inProgress, setInProgress] = useState(false);
    const [viewState, setViewState] = useState(0);
    const [activePath, setActivePath] = React.useState(-1);
    const [activePathOperation, setActivePathOperation] = React.useState('');

    const [serviceSpec, setServiceSpec] = useState<JSON>({} as JSON);

    const loadEndpointInfo = (event: any, index: number, operation: string) => {
        //setSelectedIndex(index);
        setActivePath(index);
        setActivePathOperation(operation);
        console.log(operation);
        httpGet(keycloak, `${INTEGRATED_SERVICES_PATH}/${service_name}/${index}/${operation}/info`)
            .then((response) => {
                setServiceInfo(response);
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        if (Object.keys(serviceSpec).length) {
            console.log(serviceSpec);
            setViewState(1);
        }
    }, [serviceSpec]);

    const loadServiceInputTemplate = (filepath: string) => {
        filepath = encodeURIComponent(filepath);
        httpGet(
            keycloak,
            `${INTEGRATED_SERVICES_PATH}/${service_name}/${activePath}/${activePathOperation}/inputs?uri=${filepath}`,
        )
            .then((response) => {
                setServiceSpec(response);
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const onClose = () => {
        if (inProgress) {
            return;
        }
        setViewState(0);
        handleClose();
    };

    const openServiceResponse = async (path: string) => {
        const servicePrefix =
            'services/' +
            service_name +
            serviceInfo['paths' as keyof typeof serviceInfo][activePath] +
            '/' +
            activePathOperation +
            '/' +
            path;
        console.log(servicePrefix);
        const base64encodedPrefix = Buffer.from(servicePrefix).toString('base64');
        const datasetUrl = `https://minio-console.${PROJECT_BASE_URL}/browser/${keycloak?.profile?.username}/${base64encodedPrefix}`;
        console.log(datasetUrl);
        openInNewTab(datasetUrl);
    };

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth maxWidth="lg" style={{ maxHeight: '90%' }}>
                <DialogTitle textAlign={'center'}>
                    {viewState == 1 ? (
                        <IconButton
                            onClick={() => {
                                setViewState(0);
                            }}
                            aria-label="back"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    ) : null}
                    {`Use ${service_name}`}
                </DialogTitle>
                <DialogContent>
                    {viewState == 0 ? (
                        <Grid container spacing={6} style={{ maxHeight: '40em', minHeight: '150px' }}>
                            <Grid item xs>
                                <h3>Endpoints:</h3>
                                <List style={{ maxHeight: '30em', overflow: 'auto' }}>
                                    {Object.keys(serviceInfo).map((key, index) =>
                                        key == 'paths'
                                            ? Object.values(serviceInfo[key as keyof typeof serviceInfo]).map(
                                                  (entry, index) => (
                                                      <ListItem key={index}>
                                                          <ListItemButton
                                                              //onClick={() =>
                                                              //    loadServiceEndpoint(String(entry))
                                                              //}
                                                              selected={activePath == index}
                                                              onClick={(event) =>
                                                                  loadEndpointInfo(
                                                                      event,
                                                                      index,
                                                                      serviceInfo[
                                                                          'operations' as keyof typeof serviceInfo
                                                                      ][index],
                                                                  )
                                                              }
                                                          >
                                                              <ListItemText>
                                                                  <Grid container spacing={6}>
                                                                      <Grid item xs={2}>
                                                                          <b>
                                                                              {String(
                                                                                  serviceInfo[
                                                                                      'operations' as keyof typeof serviceInfo
                                                                                  ][index],
                                                                              ).toUpperCase()}
                                                                          </b>
                                                                      </Grid>
                                                                      <Grid item xs>
                                                                          {String(entry)}
                                                                      </Grid>
                                                                  </Grid>
                                                              </ListItemText>
                                                          </ListItemButton>
                                                      </ListItem>
                                                  ),
                                              )
                                            : null,
                                    )}
                                </List>
                            </Grid>
                            <Divider orientation="vertical" flexItem></Divider>
                            {activePath != -1 ? (
                                <Grid item xs>
                                    <h3>Call History:</h3>
                                    <List style={{ maxHeight: '30em', overflow: 'auto' }}>
                                        <ListItem key={-1}>
                                            <ListItemButton onClick={() => loadServiceInputTemplate('new')}>
                                                <ListItemText>{'New Call'}</ListItemText>
                                            </ListItemButton>
                                        </ListItem>
                                        {Object.keys(serviceInfo).map((key, index) =>
                                            key == 'history'
                                                ? Object.values(serviceInfo[key as keyof typeof serviceInfo]).map(
                                                      (entry, index) => (
                                                          <ListItem key={index}>
                                                              <ListItemButton
                                                                  onClick={() =>
                                                                      loadServiceInputTemplate(String(entry))
                                                                  }
                                                              >
                                                                  <ListItemText>{String(entry)}</ListItemText>
                                                              </ListItemButton>
                                                              <Tooltip title="Open">
                                                                  <span>
                                                                      <IconButton
                                                                          aria-label="open"
                                                                          onClick={() =>
                                                                              openServiceResponse(String(entry))
                                                                          }
                                                                      >
                                                                          <SearchIcon />
                                                                      </IconButton>
                                                                  </span>
                                                              </Tooltip>
                                                          </ListItem>
                                                      ),
                                                  )
                                                : null,
                                        )}
                                    </List>
                                </Grid>
                            ) : null}
                            <Divider orientation="vertical" flexItem></Divider>
                            <Grid item xs style={{ maxHeight: '90%', overflow: 'auto' }}>
                                {Object.keys(serviceInfo).map((key) =>
                                    key != 'paths' && key != 'history' && key != 'operations' ? (
                                        <>
                                            <h4 style={{ textTransform: 'capitalize' }}>{key + ':'}</h4>
                                            <p>{serviceInfo[key as keyof typeof serviceInfo]}</p>
                                        </>
                                    ) : null,
                                )}
                            </Grid>
                        </Grid>
                    ) : null}
                    {viewState == 1 ? (
                        <SwaggerUI handleClose={handleClose} apiSpec={serviceSpec} service_name={service_name} />
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
