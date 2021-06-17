import {environment} from './environments/environment';

export const DEFAULT_BASE_DESCRIPTION = 'Спутник';
export const DEFAULT = 'default';
export const RASTER = 'raster';
export const GEOJSON = 'geojson';
export const LAYER = 'layer';
export const POINTS = 'points';
export const CLUSTER = 'cluster';
export const FILTER = 'filter';
export const LINE = 'line';
export const URL_LAYER_LIST = environment.baseUrl + 'layers';
export const URL_FILTER = environment.baseUrl + 'filter';
export const URL_FIELDS = environment.baseUrl + 'fields';
export const URL_LAYER = environment.baseUrl + 'layers/';
export const URL_CLUSTER = environment.baseUrl + 'cluster/';
export const URL_UPDATE_COORDINATES = environment.baseUrl + 'coordinates';
export const URL_USER = environment.baseUrl + 'user/';
export const URL_USER_LIST = environment.baseUrl + 'user_list';
export const URL_USER_GROUPS = environment.baseUrl + 'user_groups';
export const URL_NEWS_LIST = environment.baseUrl + 'news_list';
export const URL_NEWS = environment.baseUrl + 'news';
export const URL_USER_ADD = environment.baseUrl + 'user';
export const URL_USER_PUT = environment.baseUrl + 'user_put';
export const URL_CRYPT = 'http://nature.mpr26.ru/esia/sign/';
export const URL_NEW_MESSAGES = environment.baseUrl + 'new_messages';
export const URL_SEND_MESSAGES = environment.baseUrl + 'send_messages';
export const FILL = 'fill';
export const LOCATE = 'locate';
export const TILE_SIZE = 256;
export const TILE_SIZE_PKK = 1024;
export const ZOOM = 13;
export const VERSION = 8;
export const IMAGES = ['fish', 'san', 'pit', 'tech', 'rekr', 'dam', 'resh', 'cont', 'reddozer', 'greendozer'];
export const CENTER = {lon: 41.9683431, lat: 45.0454764};
