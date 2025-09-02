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

import { DataGrid } from '@mui/x-data-grid';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import ISensorInfo from '../../types/edge-benchmark/ISensorInfo';

const SensorList = ({
    sensorInfos,
    onSensorSelectionChange,
}: {
    sensorInfos: ISensorInfo[];
    onSensorSelectionChange: (selectedSensorInfos: ISensorInfo[]) => void;
}) => {
    const columns = [
        { field: 'type', headerName: 'Type', flex: 1 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'manufacturer', headerName: 'Manufacturer', flex: 1 },
        { field: 'model', headerName: 'Model', flex: 1 },
        { field: 'serial', headerName: 'Serial number', flex: 1 },
        { field: 'hostname', headerName: 'Hostname', flex: 1 },
        { field: 'ip', headerName: 'Sensor IP', flex: 1 },
    ];

    return (
        <DataGrid
            rows={sensorInfos}
            columns={columns}
            getRowId={(sensorInfo: ISensorInfo) => sensorInfo.hostname}
            checkboxSelection
            disableMultipleRowSelection
            onRowSelectionModelChange={(hostnames: GridRowSelectionModel) =>
                onSensorSelectionChange(sensorInfos.filter((sensorInfo) => hostnames.includes(sensorInfo.hostname)))
            }
        />
    );
};

export default SensorList;
