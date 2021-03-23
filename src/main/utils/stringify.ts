export const stringify = <T>(param: T) => {
  if (Object.prototype.hasOwnProperty.call(param, 'toHexString')) {
    return param['toHexString']();
  }
  if (Object.prototype.hasOwnProperty.call(param, 'toString')) {
    return param['toString']();
  }
  return JSON.stringify(param);
};
