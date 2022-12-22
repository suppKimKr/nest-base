import Hashids from 'hashids';
import _ from 'lodash';
import * as __codes__ from '../../database/code.json';
const hashIds = new Hashids('krackerWorld', 10);

/**
 * @return hashedString: string
 * @params str: string
 * @example '80JjDFLTN0'
 */
export const generateHashIds = (value: string): string => {
    return hashIds.encode(value.split(','));
};

/**
 * @return ids: string
 * @params str: string
 * @example '1,2'
 */
export const decodeHashIds = (value: string): string => {
    return hashIds.decode(value).toString();
};

export const productHashToString = function (hash, separator?: string) {
    const ids = hashIds.decode(hash);
    const joinWith = separator ? separator : ' - ';

    let tmp = [];
    _.forEach(ids, function (el) {
        tmp.push(_.find(__codes__, { id: el }));
    });

    return _.map(tmp, 'name').join(joinWith);
};
