export function execOnWindow(
  fnName: string,
  fnBody: string,
  ...args: any[]): any {
  const w = window as any;
  w[fnName] = eval(fnBody);
  const result = w[fnName].apply(null, args);
  delete w[fnName];
  return result;
}
