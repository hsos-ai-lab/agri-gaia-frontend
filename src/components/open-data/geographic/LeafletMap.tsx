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
import { LatLngTuple, LeafletEvent, GeoJSON, geoJSON, Map } from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { SideNavWidthContext } from '../../../contexts/SideNavWidthContext';
import classNames from 'classnames';
interface IMapProps {
    location: LatLngTuple;
    onLocationSelect: (lat: number, lng: number) => void;
    onMapMove: (event: LeafletEvent, map: GeoJSON) => void;
}

export default function LeafletMap({ location, onLocationSelect, onMapMove }: IMapProps) {
    const geoJSONLayer = geoJSON();
    const [map, setMap] = useState<Map | undefined>(undefined);

    useEffect(() => {
        if (map) {
            if (!map.hasLayer(geoJSONLayer)) {
                map.addLayer(geoJSONLayer);
                console.log('GeoJSON Layer added!');
            }
            map.addEventListener('moveend', (e) => {
                onMapMove(e, geoJSONLayer);
            });
            map.addEventListener('click', ({ latlng }) => {
                onLocationSelect(latlng.lat, latlng.lng);
            });
            map.addEventListener('locationfound', (location) => {
                map.setView(location.latlng, map.getZoom());
            });

            console.log('Map loaded');
        }
    }, [map]);

    useEffect(() => {
        if (!map) return;
        const currentCenter = [Number(map.getCenter().lat), Number(map.getCenter().lng)];
        const locationNums = [Number(location[0]), Number(location[1])];
        const isCurrentPostion = locationNums[0] === currentCenter[0] && locationNums[1] === currentCenter[1];
        if (!isCurrentPostion) {
            map.setView(location, map.getZoom());
        }
    }, [location]);

    return (
        <SideNavWidthContext.Consumer>
            {({ isOpen }) => (
                <MapContainer
                    id="open-data-map"
                    className={classNames({
                        // TODO: not working properly, class does not update in DOM
                        'open-data-map-sidenav-open': isOpen,
                        'open-data-map-sidenav-closed': !isOpen,
                    })}
                    zoom={13}
                    center={location}
                    whenCreated={setMap}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={location}></Marker>
                </MapContainer>
            )}
        </SideNavWidthContext.Consumer>
    );
}
