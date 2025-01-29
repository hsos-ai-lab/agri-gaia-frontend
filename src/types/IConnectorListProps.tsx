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

import IConnector from './IConnector';

export default interface IConnectorListProps {
    connectors: IConnector[];
    contracts: Record<number, Array<any>>;
    loading: boolean;
    onDelete: () => void;
    setChosenContract: (contract: any) => void;
    setConnector: (connector: IConnector) => void;
    handleInfoDialogOpen: () => void;
}
