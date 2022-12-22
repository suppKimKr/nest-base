/**
 * @return boolean true = null, false = not null
 * @param value
 */
const isNullOrEmpty = (value: any): boolean => {
    let returnValue = false;
    try {
        if (
            (value !== 0 && !value) ||
            typeof value === 'undefined' ||
            value == null ||
            (typeof value === 'object' && Object.prototype.toString.call(value) != '[object Date]' && !Object.keys(value).length) ||
            (typeof value === 'string' && value.trim() === '') ||
            (typeof value === 'number' && isNaN(value))
        ) {
            returnValue = true;
        }
    } catch (e) {
        returnValue = false;
    }
    return returnValue;
};

export { isNullOrEmpty };
