export const rowsToObj = (rows: any[], keyCol: string, valueCol: string, extendCol?: string): Object => {
    let obj = {};
    if (rows.length) {
        rows.forEach((row) => {
            obj[row[keyCol]] = extendCol ? `${row[valueCol]}/${row[extendCol]}` : row[valueCol];
        });
    }
    return obj;
};

export const isEmptyObject = (param: Object): boolean => {
    return Object.keys(param).length === 0 && param.constructor === Object;
};

export const timestampToDateWithTimeStr = (date: Date): string => {
    return date.toISOString().replace(/T/, ' ').substring(0, 19);
};

export const getKeyFromEnumByValue = (obj: {}, value: string) => {
    return Object.entries(obj).find(([key, val]) => val === value)[0];
};
