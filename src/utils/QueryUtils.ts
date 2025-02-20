export function buildQuery(params: {
  [key: string]: string | string[] | null | undefined;
}): URLSearchParams {
  const newSearchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => newSearchParams.append(key, v));
      } else {
        newSearchParams.set(key, value);
      }
    }
  });
  return newSearchParams;
}

export function createFilter(key: string, value: string): string {
  return `${key}:${value}`;
}
