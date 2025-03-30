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
import { Card, CardContent, List, ListItem, Typography } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import classNames from 'classnames';
import { SideNavWidthContext } from '../../../contexts/SideNavWidthContext';

const brightskyURL = 'https://api.brightsky.dev/weather';

interface IWeatherCardProps {
    lat: number;
    lon: number;
}

interface IWeather {
    timestamp: string;
    source_id: number;
    precipitation?: number;
    pressure_msl?: number;
    sunshine?: number;
    temperature?: number;
    wind_direction?: number;
    wind_speed?: number;
    cloud_cover?: number;
    dew_point?: number;
    relative_humidity?: number;
    visibility?: number;
    wind_gust_direction?: number;
    wind_gust_speed?: number;
    condition?: string;
    icon?: number;
}

export default function WeatherCard({ lat, lon }: IWeatherCardProps) {
    const [weather, setWeather] = useState<Array<IWeather>>([]);
    const [currentWeather, setCurrentWeather] = useState<IWeather>();

    const searchWeather = async () => {
        const today = new Date().toISOString().slice(0, 10);

        const url = `${brightskyURL}?lat=${lat}&lon=${lon}&date=${today}`;
        try {
            const response = await fetch(url);
            const results = await response.json();
            //console.log(results);
            if (results.weather) {
                setWeather(results.weather);
                setCurrentWeather(results.weather[10]);
            } else {
                setWeather([]);
                setCurrentWeather(undefined);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        searchWeather();
    }, [lat, lon]);

    const renderCurrentWeather = () => {
        if (!currentWeather) {
            return <span>No Data</span>;
        }
        return (
            <>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Current Weather
                </Typography>
                <List dense>
                    <ListItem>Temperature: {currentWeather.temperature} °C</ListItem>
                    <ListItem>Humidity: {currentWeather.relative_humidity}</ListItem>
                    <ListItem>Condition: {currentWeather.condition}</ListItem>
                    <ListItem>Cloud Cover: {currentWeather.cloud_cover} %</ListItem>
                    <ListItem>Wind Direction: {currentWeather.wind_direction}°</ListItem>
                </List>
            </>
        );
    };

    const renderLineChart = () => (
        <LineChart width={300} height={200} data={weather} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
            <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" strokeDasharray={1} />
            <XAxis
                dataKey="timestamp"
                tickFormatter={(value: unknown) => (typeof value === 'string' ? value.slice(11, 16) : '')}
                angle={-45}
                tickMargin={10}
                height={40}
            />
            <YAxis />
            <Tooltip />
        </LineChart>
    );
    return (
        <SideNavWidthContext.Consumer>
            {({ isOpen }) => (
                <Card
                    id="weather-card"
                    className={classNames({
                        'map-overlay-card': true,
                        'map-overlay-left-sidenav-open': isOpen,
                        'map-overlay-left-sidenav-closed': !isOpen,
                    })}
                >
                    <CardContent id="weather-card-content">
                        {renderCurrentWeather()}
                        {renderLineChart()}
                    </CardContent>
                </Card>
            )}
        </SideNavWidthContext.Consumer>
    );
}
