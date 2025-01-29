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
import LoadingButton from '@mui/lab/LoadingButton';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';

import { AGROVOC_KEYWORDS } from '../../endpoints';

interface IAgrovocSearchBarProps {
    searchRoute: string;
    handleResponse: (result: []) => void;
    resetResult: () => void;
}

export default function AgrovocSearchbar({ searchRoute, handleResponse, resetResult }: IAgrovocSearchBarProps) {
    const keycloak = useKeycloak();

    const [broader, setBroader] = useState<Array<string>>([]);
    const [broaderSelect, setBroaderSelect] = useState<string>('');
    const [narrower, setNarrower] = useState<Array<string>>([]);
    const [narrowerSelect, setNarrowerSelect] = useState<string>('');
    const [languages, setLanguages] = useState<Array<string>>([]);
    const [comboboxKey, setComboboxKey] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [chosenLanguage, setChosenLanguage] = useState<string>('');
    const [search_keyword, setSearchKeyword] = useState<string>('');
    const [keywords, setKeywords] = useState<Array<string>>([]);

    function handleLanguageSelect(newValue: string | null) {
        if (newValue != null) {
            setChosenLanguage(newValue);
            fetchKeywords(newValue);
            if (search_keyword != '') {
                fetchAdditionalDataForKeyword(newValue);
            }
        }
    }

    const fetchDataForKeyword = async (uri_of_keyword: string) => {
        setLoading(true);
        const encodedUri = encodeURIComponent(uri_of_keyword);
        httpGet(keycloak, `${searchRoute}/keyword?uri=${encodedUri}`)
            .then((response) => {
                handleResponse(response);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchAdditionalDataForKeyword = async (language: string) => {
        console.log(chosenLanguage);
        if (language == '') {
            return;
        }
        httpGet(keycloak, `${AGROVOC_KEYWORDS}/${search_keyword}/languages/${language}/additional`)
            .then((response) => {
                setBroader(response['broader']);
                setNarrower(response['narrower']);
                console.log('Broader / Narrower ready');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchLanguagesForKeyword = (): Promise<Array<string>> => {
        return new Promise((resolve) => {
            httpGet(keycloak, `${AGROVOC_KEYWORDS}/${search_keyword}/languages`).then((response) => {
                if (chosenLanguage == '') {
                    setChosenLanguage(response[0]);
                }
                setLanguages(response);
                resolve(response);
            });
        });
    };

    const fetchKeywords = async (language: string) => {
        httpGet(keycloak, `${AGROVOC_KEYWORDS}?language=${language}`)
            .then((data) => {
                setKeywords(data);
                //console.log(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    function setSearchKeywordChecked(newKeyword: string) {
        if (newKeyword == '') {
            reset();
            resetResult();
        }
        setSearchKeyword(newKeyword);
    }

    const filterOptions = createFilterOptions({
        limit: 20,
    });

    function handleSearchButtonClick() {
        if (search_keyword.trim() != '') {
            console.log(search_keyword);
            httpGet(keycloak, `${AGROVOC_KEYWORDS}/${search_keyword}/check`).then((response) => {
                console.log(response);
                if (response['concept']) {
                    fetchLanguagesForKeyword().then((languages) => fetchAdditionalDataForKeyword(languages[0]));
                    fetchDataForKeyword(response['concept']);
                } else {
                    setSearchKeyword(search_keyword + ' not found in Agrovoc.');
                }
            });
        }
    }

    function reset() {
        setBroader([]);
        setBroaderSelect('');
        setNarrower([]);
        setNarrowerSelect('');
        setLanguages([]);
        setChosenLanguage('');
    }

    function changeInput(change: unknown) {
        if (change == null) {
            resetResult();
            reset();
        }
    }

    useEffect(() => {
        fetchKeywords('en');
    }, [keycloak]);

    return (
        <Grid container direction="row" mt={2} sx={{ height: '50px' }} alignItems={'center'} justifyContent={'center'}>
            <Grid item xs={4}>
                <Autocomplete
                    id="search_keyword_autocomplete"
                    freeSolo
                    value={search_keyword}
                    inputValue={search_keyword}
                    onInputChange={(event, newInputValue) => setSearchKeyword(newInputValue)}
                    onChange={(event, newInputValue) => changeInput(newInputValue)}
                    options={keywords}
                    filterOptions={filterOptions}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search"
                            variant="standard"
                            onChange={(e) => {
                                setSearchKeywordChecked(e.target.value);
                                reset();
                            }}
                        />
                    )}
                />
            </Grid>
            <Grid item xs={1}>
                <LoadingButton
                    color="primary"
                    aria-label="search"
                    component="span"
                    onClick={handleSearchButtonClick}
                    loading={loading}
                >
                    <SearchIcon />
                </LoadingButton>
            </Grid>
            <Grid item xs={1}>
                <Autocomplete
                    disablePortal
                    key={'' + comboboxKey}
                    id="combo-box-language"
                    options={languages}
                    value={chosenLanguage}
                    onChange={(event: unknown, newValue: string | null) => handleLanguageSelect(newValue)}
                    onInputChange={(event, newInputValue) => {
                        if (newInputValue.trim() != '') {
                            setChosenLanguage(newInputValue);
                        }
                    }}
                    renderInput={(params) => <TextField {...params} label="Lang." variant="standard" />}
                />
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={2}>
                <Autocomplete
                    key={'' + comboboxKey}
                    disablePortal
                    id="combo-box-broader"
                    options={broader}
                    value={broaderSelect}
                    onInputChange={(event, newInputValue) => {
                        if (newInputValue.trim() != '') {
                            setSearchKeyword(newInputValue);
                            setComboboxKey(!comboboxKey);
                        }
                    }}
                    renderInput={(params) => <TextField {...params} label="Broader" variant="standard" />}
                />
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={2}>
                <Autocomplete
                    key={'' + comboboxKey}
                    disablePortal
                    id="combo-box-narrower"
                    options={narrower}
                    value={narrowerSelect}
                    onInputChange={(event, newInputValue) => {
                        if (newInputValue.trim() != '') {
                            setSearchKeyword(newInputValue);
                            setComboboxKey(!comboboxKey);
                        }
                    }}
                    renderInput={(params) => <TextField {...params} label="Narrower" variant="standard" />}
                />
            </Grid>
        </Grid>
    );
}
