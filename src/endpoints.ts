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

const MODELS_PATH = '/models';

const DATASETS_PATH = '/datasets';
const DATASETS_UPLOAD_DATA_PATH = '/upload/data';
const DATASETS_UPLOAD_ANNOTATION_PATH = '/upload/annotation';
const DATASETS_DOWNLOAD_PATH = '/download';
const DATASETS_CONVERT_PATH = `${DATASETS_PATH}/convert`;
const DATASETS_CONVERT_FORMATS = `${DATASETS_PATH}/convert/formats`;
const DATASETS_AUTO_ANNOTATION_PATH = `${DATASETS_PATH}/auto-annotation`;

const NETWORK_PATH = '/network';

const TASKS_PATH = '/tasks';
const TAGS_PATH = '/tags';

const AGROVOC_KEYWORD = '/agrovoc/keyword';
const AGROVOC_KEYWORDS = '/agrovoc/keywords';
const ONTOLOGY_PATH = '/agrovoc/classes';
const GEONAMES_LOCATION = '/geonames/location';
const GEONAMES_LOCATIONS = '/geonames/locations';

const CVAT_PATH = '/cvat';
const CVAT_LOGIN_PATH = `${CVAT_PATH}/auth/login`;
const CVAT_LOGOUT_PATH = `${CVAT_PATH}/auth/logout`;
const CVAT_USER_CREATE_PATH = `${CVAT_PATH}/user/create`;
const CVAT_USER_EXISTS_PATH = `${CVAT_PATH}/user/exists`;

const EDGE_GROUPS_PATH = '/edge-groups';
const EDGE_DEVICES_PATH = '/edge-devices';

const APPLICATIONS_PATH = '/applications';

const DOCKER_LIST = '/docker/list';
const DOCKER_RUN = '/docker/run';

const USERS_ME = '/users/me';
const USERS_PING = '/users/ping';

const CONTAINER_IMAGES_PATH = '/container-images';
const INFERENCE_CONTAINER_TEMPLATES_PATH = '/inference-container-templates';
const CONTAINER_DEPLOYMENTS_PATH = '/container-deployments';

const TRAIN_PATH = '/train';
const TRAIN_PROVIDERS_PATH = `${TRAIN_PATH}/providers`;
const TRAIN_ARCHITECTURES_PATH = `${TRAIN_PATH}/architectures`;
const TRAIN_CONFIG_PATH = `${TRAIN_PATH}/config`;
const TRAIN_CONTAINERS_PATH = `${TRAIN_PATH}/containers`;

const TRAIN_CONFIG_DOWNLOAD_PATH = `${TRAIN_CONFIG_PATH}/download`;
const TRAIN_CONFIG_UPLOAD_PATH = `${TRAIN_CONFIG_PATH}/upload`;
const TRAIN_CONFIG_EXPORT_PATH = `${TRAIN_CONFIG_PATH}/export`;

const TRAIN_TEMPLATE_PATH = `${TRAIN_PATH}/template`;
const TRAIN_TEMPLATE_UPLOAD_PATH = `${TRAIN_TEMPLATE_PATH}/upload`;

const OPEN_DATA_PATH = '/open-data';
const OPEN_DATA_GEO_PATH = `${OPEN_DATA_PATH}/geo`;
const OPEN_DATA_FIELDBORDERS_PATH = `${OPEN_DATA_GEO_PATH}/fieldborders`;
const INTEGRATED_SERVICES_PATH = '/integrated-services';

const URLS_PATH = '/urls';
const URLS_BASIC_AUTH_PATH = '/urls/basic-auth';

const LICENSES_PATH = '/licenses';

const TRITON_PATH = '/triton';

const EDGE_BENCHMARK_PATH = '/edge-benchmark';
const EDGE_BENCHMARK_DEVICE_PATH = `${EDGE_BENCHMARK_PATH}/device`;
const EDGE_BENCHMARK_DEVICE_HEADER_PATH = `${EDGE_BENCHMARK_DEVICE_PATH}/header`;
const EDGE_BENCHMARK_START_PATH = `${EDGE_BENCHMARK_PATH}/start`;
const EDGE_BENCHMARK_JOBS_PATH = `${EDGE_BENCHMARK_PATH}/jobs`;

export {
    MODELS_PATH,
    AGROVOC_KEYWORD,
    AGROVOC_KEYWORDS,
    GEONAMES_LOCATION,
    GEONAMES_LOCATIONS,
    ONTOLOGY_PATH,
    DATASETS_PATH,
    DATASETS_UPLOAD_DATA_PATH,
    DATASETS_UPLOAD_ANNOTATION_PATH,
    DATASETS_DOWNLOAD_PATH,
    DATASETS_CONVERT_PATH,
    DATASETS_CONVERT_FORMATS,
    DATASETS_AUTO_ANNOTATION_PATH,
    TASKS_PATH,
    TAGS_PATH,
    CVAT_PATH,
    CVAT_LOGIN_PATH,
    CVAT_LOGOUT_PATH,
    CVAT_USER_CREATE_PATH,
    CVAT_USER_EXISTS_PATH,
    EDGE_GROUPS_PATH,
    EDGE_DEVICES_PATH,
    APPLICATIONS_PATH,
    DOCKER_LIST,
    DOCKER_RUN,
    USERS_ME,
    USERS_PING,
    CONTAINER_IMAGES_PATH,
    INFERENCE_CONTAINER_TEMPLATES_PATH,
    CONTAINER_DEPLOYMENTS_PATH,
    TRAIN_ARCHITECTURES_PATH,
    TRAIN_CONFIG_PATH,
    TRAIN_PROVIDERS_PATH,
    TRAIN_CONFIG_DOWNLOAD_PATH,
    TRAIN_CONFIG_UPLOAD_PATH,
    TRAIN_CONFIG_EXPORT_PATH,
    TRAIN_TEMPLATE_PATH,
    TRAIN_TEMPLATE_UPLOAD_PATH,
    TRAIN_PATH,
    TRAIN_CONTAINERS_PATH,
    OPEN_DATA_FIELDBORDERS_PATH,
    INTEGRATED_SERVICES_PATH,
    URLS_PATH,
    URLS_BASIC_AUTH_PATH,
    LICENSES_PATH,
    NETWORK_PATH,
    TRITON_PATH,
    EDGE_BENCHMARK_PATH,
    EDGE_BENCHMARK_DEVICE_PATH,
    EDGE_BENCHMARK_DEVICE_HEADER_PATH,
    EDGE_BENCHMARK_START_PATH,
    EDGE_BENCHMARK_JOBS_PATH,
};
