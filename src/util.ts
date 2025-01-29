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

import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { CVAT_KEY_LOCAL_STORAGE_NAME } from './constants';
import { engineName } from 'react-device-detect';

export const openInNewTab = (url: string, cacheBasicAuth = false): void => {
    const parsedUrl = new URL(url);
    const openArgs = ['_blank', 'noopener,noreferrer'];
    let newWindow;

    // See: https://bugs.chromium.org/p/chromium/issues/detail?id=675884
    if (parsedUrl.username && parsedUrl.password && engineName === 'Blink' && cacheBasicAuth) {
        // Open URL with basic auth and let browser cache the credentials.
        const basicAuthWindow = window.open(url, '_blank');
        if (basicAuthWindow) {
            // Automatically close the window after it has loaded
            basicAuthWindow.addEventListener('unload', basicAuthWindow.close, true);
            // Reopen the window without basic auth creds as they are now cached by the browser.
            const urlWithoutBasicAuth = parsedUrl.origin + parsedUrl.pathname + parsedUrl.search;
            newWindow = window.open(urlWithoutBasicAuth, ...openArgs);
        }
    } else newWindow = window.open(url, ...openArgs);
    if (newWindow) newWindow.opener = null;
};

export const onClickUrl = (url: string) => () => openInNewTab(url);

export const downloadBlob = (blob: Blob, fileName: string): void => {
    const downloadURL = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = downloadURL;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};

export const getEdgeInstallCommand = (edgeKey: string, portainerVersion?: string) => {
    return `docker run -d \\
    -v /var/run/docker.sock:/var/run/docker.sock \\
    -v /var/lib/docker/volumes:/var/lib/docker/volumes \\
    -v /:/host \\
    -v portainer_agent_data:/data \\
    --restart always \\
    -e EDGE=1 \\
    -e EDGE_ID=${uuidv4()} \\
    -e EDGE_KEY=${edgeKey} \\
    -e CAP_HOST_MANAGEMENT=1 \\
    -e EDGE_INSECURE_POLL=1 \\
    -e EDGE_INACTIVITY_TIMEOUT=30m \\
    --name portainer_edge_agent \\
    portainer/agent:${portainerVersion ? portainerVersion : process.env.REACT_APP_PORTAINER_VERSION}`;
};

export const getLocalDateTime = (date: string) => {
    return DateTime.fromISO(date, { zone: 'utc' }).toLocal().toLocaleString(DateTime.DATETIME_FULL);
};

export const snakeCaseToWords = (snake: string) => {
    return snake
        .split('_')
        .map((str: string) => {
            return str.charAt(0).toUpperCase() + str.slice(1);
        })
        .join(' ');
};

export const flatten = (obj: object, keySeparator = '.') => {
    const flattenRecursive = (obj: object, parentProperty?: string, propertyMap: Record<string, unknown> = {}) => {
        for (const [key, value] of Object.entries(obj)) {
            const property = parentProperty ? `${parentProperty}${keySeparator}${key}` : key;
            if (value && typeof value === 'object') {
                flattenRecursive(value, property, propertyMap);
            } else {
                propertyMap[property] = value;
            }
        }
        return propertyMap;
    };
    return flattenRecursive(obj);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNumeric = (val: any): boolean => {
    return !(val instanceof Array) && val - parseFloat(val) + 1 >= 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPrimitive = (val: any): boolean => {
    return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
};

// See: https://stackoverflow.com/a/60498111
export const useInterval = (callback: () => void, delay: number) => {
    const savedCallback = useRef<() => void>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const tick = () => {
            if (savedCallback.current) savedCallback.current();
        };
        if (delay !== null) {
            const id = setInterval(tick, delay * 1000);
            return () => clearInterval(id);
        }
    }, [delay]);
};

export const isUrl = (url: string): boolean => {
    try {
        return Boolean(new URL(url));
    } catch (e) {
        return false;
    }
};

export const inferModelFormat = (extension: string): string | undefined => {
    switch (extension) {
        case 'pt':
        case 'pth':
        case 'torchscript':
            return 'pytorch';
        case 'onnx':
            return 'onnx';
        case 'plan':
            return 'tensorrt';
        case 'graphdef':
            return 'tensorflow';
    }
};

export const getProjectBaseUrl = () => {
    const url = new URL(window.location.href);
    return { project_base_url: url.host.split('.').slice(1).join('.'), protocol: url.protocol };
};

export const createSubdomainUrl = (subdomain: string, postfix = ''): string => {
    const { project_base_url, protocol } = getProjectBaseUrl();

    const createUrl = () => {
        return `${protocol}//${subdomain}.${project_base_url}`;
    };

    let url = '#';

    switch (subdomain) {
        case 'cvat':
            url = `${createUrl()}/auth/login-with-token/${localStorage.getItem(CVAT_KEY_LOCAL_STORAGE_NAME)}`;
            break;
        default:
            url = createUrl();
            break;
    }

    return url + postfix;
};
