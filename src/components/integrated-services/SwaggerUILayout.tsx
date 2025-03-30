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

import React from 'react';

// Create the layout component
class AugmentingLayout extends React.Component<any, any> {
    render() {
        const { getComponent } = this.props;

        const BaseLayout = getComponent('BaseLayout', true);

        return (
            <div>
                <BaseLayout />
            </div>
        );
    }
}

// Create the plugin that provides our layout component
export const AugmentingLayoutPlugin = () => {
    return {
        components: {
            AugmentingLayout: AugmentingLayout,
        },
    };
};
