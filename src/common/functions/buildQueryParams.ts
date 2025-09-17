export function buildQueryParams(
  params: Record<string, string | string[] | undefined>,
): string {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v) queryParams.append(key, v);
      });
    } else if (value) {
      queryParams.append(key, value);
    }
  });

  return queryParams.toString() ? `&${queryParams.toString()}` : '';
}
