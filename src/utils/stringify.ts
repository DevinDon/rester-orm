export const stringify = (param: any) => {
  if (Object.prototype.hasOwnProperty.call(param, 'toHexString')) {
    return param['toHexString']();
  }
  if (Object.prototype.hasOwnProperty.call(param, 'toString')) {
    return param['toString']();
  }
  return JSON.stringify(param);
};
