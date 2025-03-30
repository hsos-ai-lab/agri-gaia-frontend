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

import React, { useEffect, useState } from 'react';
import { httpGet } from '../api';
import useKeycloak from '../contexts/KeycloakContext';

import IDockerContainer from '../types/IDockerContainer';

import DockerContainerList from '../components/docker/List';
//import RunCustom from '../components/docker/RunCustom';
import RunJupyterScipy from '../components/docker/RunJupyterScipy';

import { DOCKER_LIST } from '../endpoints';

export default function Docker() {
    const [containers, setContainers] = useState<Array<IDockerContainer>>([]);

    const keycloak = useKeycloak();

    const fetchDockerContainers = async () => {
        httpGet(keycloak, DOCKER_LIST)
            .then((data) => {
                console.log(data);
                setContainers(data.containers);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        fetchDockerContainers();
    }, [keycloak]);

    return (
        <>
            {/*<RunCustom />*/}
            <RunJupyterScipy onRun={fetchDockerContainers} />
            <DockerContainerList containers={containers} />
        </>
    );
}
