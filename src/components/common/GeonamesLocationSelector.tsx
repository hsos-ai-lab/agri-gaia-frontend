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
import { httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import { GEONAMES_LOCATIONS } from '../../endpoints';
import GeonamesLocation from '../../types/GeonamesLocation';

interface IGeonamesLocationSelectorProps {
    chosenLocations: GeonamesLocation[];
    setChosenLocations: (chosenLocations: GeonamesLocation[]) => void;
    isUploading: () => boolean;
}

export default function GeonamesLocationSelector({
    chosenLocations: chosenLocations,
    setChosenLocations: setChosenLocations,
    isUploading,
}: IGeonamesLocationSelectorProps) {
    const [locations, setLocations] = useState<Array<string>>([]);
    const [currentLocation, setCurrentLocation] = useState<string>('');

    const keycloak = useKeycloak();

    const addLocation = async () => {
        if (
            !currentLocation ||
            chosenLocations.find((chosenLocation: GeonamesLocation) => chosenLocation.name === currentLocation)
        )
            return;

        httpGet(keycloak, `${GEONAMES_LOCATIONS}/${currentLocation}/check`).then((response) => {
            if (response['concept']) {
                chosenLocations.push(new GeonamesLocation(response['name'], response['concept']));
                setCurrentLocation('');
            } else {
                setCurrentLocation(currentLocation + ' not found in Geonames.');
            }
        });
    };

    const handleLocationDelete = (location: string) => {
        setChosenLocations(chosenLocations.filter((_location: GeonamesLocation) => _location.name !== location));
    };

    const fetchLocations = async () => {
        httpGet(keycloak, `${GEONAMES_LOCATIONS}`)
            .then((data) => {
                setLocations(data);
                console.log(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const filterOptions = createFilterOptions({
        limit: 20,
    });

    useEffect(() => {
        fetchLocations();
    }, [keycloak]);

    return (
        <>
            <Grid container direction="row" mt={2}>
                <Grid item xs={9}>
                    <Autocomplete
                        id="add_location_autocomplete"
                        freeSolo
                        value={currentLocation}
                        inputValue={currentLocation}
                        onInputChange={(event, newInputValue) => {
                            setCurrentLocation(newInputValue);
                        }}
                        options={locations}
                        filterOptions={filterOptions}
                        disabled={isUploading()}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Location"
                                onChange={(e) => setCurrentLocation(e.target.value)}
                                variant="standard"
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={1}></Grid>

                <Grid item xs={2}>
                    <Button variant="outlined" disabled={isUploading()} onClick={addLocation}>
                        Add
                    </Button>
                </Grid>
            </Grid>

            <Grid container direction="row" mt={2} sx={{ height: 'auto' }}>
                <Grid item xs={12}>
                    {chosenLocations.map((keyword, index) => {
                        return (
                            <Chip
                                key={index}
                                label={keyword.name}
                                variant="outlined"
                                onDelete={() => handleLocationDelete(keyword.name)}
                            />
                        );
                    })}
                </Grid>
            </Grid>
        </>
    );
}
