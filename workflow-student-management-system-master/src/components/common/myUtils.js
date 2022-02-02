import uuid from 'react-uuid'

/**
 * Generate an uuid,
 */
export const genUUID = () => {
    return uuid();
};

/**
 * Generate file id by file name.
 * @param fileName
 * @returns {string}
 */
export const genFileId = (fileName) => {
    return uuid() + "-" + fileName;
};

/**
 * Set authentication infos to data.
 * @param data
 * @param authUser
 * @returns {*}
 */
export const setAuthInfo = (data, authUser) => {
    data.create_id = authUser.uid;
    data.create_name = authUser.email;
    data.create_date = new Date().getTime();
    return data;
};

/**
 * Change array to key object.
 * @param array
 * @param renderKeyValue
 */
export const arrayToKeyObj = (array, renderKeyValue) => {
    let keyObj = {};
    if (array && array.length > 0) {
        array.map((data) => {
            renderKeyValue(data, keyObj);
        });
    }
    return keyObj;
};

/**
 * Change key object to array.
 * @param keyObj
 * @param idName
 * @returns {Array}
 */
export const keyObjToArray = (keyObj, idName) => {
    if (!idName) {
        idName = 'id';
    }
    let array = [];
    if (keyObj) {
        Object.keys(keyObj).map(key => {
            let obj = {...keyObj[key]};
            obj[idName] = key;
            array.push(obj);
        });
    }
    return array
};

/**
 * Change keyObj to obj
 * @param keyObj
 * @param idName
 */
export const keyObjToObj = (keyObj, idName) => {
    if (!idName) {
        idName = 'id';
    }
    let obj = {};
    if (keyObj) {
        Object.keys(keyObj).map(key => {
            obj = keyObj;
            obj[idName] = key;
        });
    }
    return obj
};

/**
 * Given data time greater than or equal to current date time
 * @param dataTime
 * @returns {boolean}
 */
export const gtAndEqToCurrDate = (dataTime) => {
    if (!dataTime) {
        return false;
    }
    let currDateStr = getDateFormatYYYYMMDD(new Date()) + " 00:00:00";
    let givenDateStr = getDateFormatYYYYMMDD(new Date(dataTime)) + " 00:00:00";
    return new Date(givenDateStr).getTime() >= new Date(currDateStr).getTime();
};

/**
 * get date format : yyyy-mm-dd
 * @param dataTime
 * @returns {string|boolean}
 */
export const getDateFormatYYYYMMDD = (date) => {
    if (!date) {
        return false;
    }
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
};

