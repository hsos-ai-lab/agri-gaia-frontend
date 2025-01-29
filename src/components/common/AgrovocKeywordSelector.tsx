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

import React, { useEffect, useState } from 'react';
import { httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import AgrovocKeyword from '../../types/AgrovocKeyword';

import { AGROVOC_KEYWORDS } from '../../endpoints';

interface IAgrovocKeywordSelectorProps {
    chosenKeywords: AgrovocKeyword[];
    setChosenKeywords: (chosenKeywords: AgrovocKeyword[]) => void;
    isUploading: () => boolean;
}

export default function AgrovocKeywordSelector({
    chosenKeywords,
    setChosenKeywords,
    isUploading,
}: IAgrovocKeywordSelectorProps) {
    const [keywords, setKeywords] = useState<Array<string>>([]);
    const [currentKeyword, setCurrentKeyword] = useState<string>('');

    const keycloak = useKeycloak();

    const addKeyword = async () => {
        if (
            !currentKeyword ||
            chosenKeywords.find((chosenKeyword: AgrovocKeyword) => chosenKeyword.name === currentKeyword)
        )
            return;

        httpGet(keycloak, `${AGROVOC_KEYWORDS}/${currentKeyword}/check`).then((response) => {
            if (response['concept']) {
                chosenKeywords.push(new AgrovocKeyword(response['name'], response['concept']));
                setCurrentKeyword('');
            } else {
                setCurrentKeyword(currentKeyword + ' not found in Agrovoc.');
            }
        });
    };

    const handleKeywordDelete = (keyword: string) => {
        setChosenKeywords(chosenKeywords.filter((_keyword: AgrovocKeyword) => _keyword.name !== keyword));
    };

    const fetchKeywords = async (language: string) => {
        httpGet(keycloak, `${AGROVOC_KEYWORDS}?language=${language}`)
            .then((data) => {
                setKeywords(data);
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
        fetchKeywords('en');
    }, [keycloak]);

    return (
        <>
            <Grid container direction="row" mt={2}>
                <Grid item xs={9}>
                    <Autocomplete
                        id="add_keyword_autocomplete"
                        freeSolo
                        value={currentKeyword}
                        inputValue={currentKeyword}
                        onInputChange={(event, newInputValue) => {
                            setCurrentKeyword(newInputValue);
                        }}
                        options={keywords}
                        filterOptions={filterOptions}
                        disabled={isUploading()}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Keyword"
                                onChange={(e) => setCurrentKeyword(e.target.value)}
                                variant="standard"
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={1}></Grid>

                <Grid item xs={2}>
                    <Button variant="outlined" disabled={isUploading()} onClick={addKeyword}>
                        Add
                    </Button>
                </Grid>
            </Grid>

            <Grid container direction="row" mt={2} sx={{ height: 'auto' }}>
                <Grid item xs={12}>
                    {chosenKeywords.map((keyword, index) => {
                        return (
                            <Chip
                                key={index}
                                label={keyword.name}
                                variant="outlined"
                                onDelete={() => handleKeywordDelete(keyword.name)}
                            />
                        );
                    })}
                </Grid>
            </Grid>
        </>
    );
}
