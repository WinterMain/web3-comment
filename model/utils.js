export function sliceString(originalStr = '', start = 6, end = 4, c = '...') {
  const length = start + end;

  if (originalStr.length <= length) {
    return originalStr;
  }

  return `${start > 0 ? originalStr.slice(0, start) : ''}${c}${
    end > 0 ? originalStr.slice(-end) : ''
  }`;
}