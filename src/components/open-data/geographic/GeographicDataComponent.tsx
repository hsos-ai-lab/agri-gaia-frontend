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

import { useState } from 'react';
import LeafletMap from './LeafletMap';
import { LatLngTuple, LeafletEvent, LatLng, GeoJSON } from 'leaflet';
import SearchLocationTextFieldCard from './SearchLocationTextFieldCard';
import WeatherCard from './WeatherCard';
import { OPEN_DATA_FIELDBORDERS_PATH } from '../../../endpoints';
import { httpGet } from '../../../api';
import useKeycloak from '../../../contexts/KeycloakContext';

const nominatimURL = 'https://nominatim.openstreetmap.org/search';

export default function GeographicDataComponent() {
    const keycloak = useKeycloak();
    const [searchQuery, setSearchQuery] = useState('');
    //
    const [selectedLocation, setSelectedLocation] = useState<LatLngTuple>([52.28385925292969, 8.023248672485352]);

    const searchAddress = async () => {
        const url = `${nominatimURL}?q=${searchQuery}&polygon_geojson=1&format=jsonv2&limit=1`;
        try {
            const response = await fetch(url);
            const results = await response.json();
            if (results.length !== 1) {
                return;
            }
            const result = results[0];
            console.log(result);
            setSelectedLocation([result['lat'], result['lon']]);
        } catch (e) {
            console.error(e);
        }
    };

    const requestFieldBorders = async (
        northWestLatLng: LatLng,
        southEastLatLng: LatLng,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        successCallback: (data: any) => void,
    ) => {
        const nwlat = northWestLatLng.lat;
        const nwlng = northWestLatLng.lng;
        const selat = southEastLatLng.lat;
        const selng = southEastLatLng.lng;

        const url = `${OPEN_DATA_FIELDBORDERS_PATH}?nwlat=${nwlat}&nwlng=${nwlng}&selat=${selat}&selng=${selng}`;

        httpGet(keycloak, url)
            .then((data) => {
                successCallback(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSearchFieldKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            searchAddress();
        }
    };

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedLocation([lat, lng]);
    };

    const handleMapMove = (event: LeafletEvent, geoJSONLayer: GeoJSON) => {
        const mapBounds = event.target.getBounds();

        requestFieldBorders(mapBounds.getNorthWest(), mapBounds.getSouthEast(), (data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fieldborders = data.map((f: { polygon: { coordinates: any[] } }) => ({
                type: 'MultiPolygon',
                coordinates: f.polygon.coordinates,
            }));
            geoJSONLayer.clearLayers();
            geoJSONLayer.addData(fieldborders);
        });
    };

    return (
        <>
            <LeafletMap location={selectedLocation} onLocationSelect={handleMapClick} onMapMove={handleMapMove} />
            <SearchLocationTextFieldCard
                onChange={setSearchQuery}
                onKeyDown={handleSearchFieldKeyDown}
                value={searchQuery}
            />
            <WeatherCard lat={selectedLocation[0]} lon={selectedLocation[1]} />
        </>
    );
}
