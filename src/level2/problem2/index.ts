export type DowntimeLogs = [Date, Date][];

export function merge(...args: DowntimeLogs[]): DowntimeLogs {

  // I combined all downtime logs into a single array
  const mergedLogs: DowntimeLogs = args.reduce((acc, logs) => acc.concat(logs), []);

  // Then we sort it based on the start time of each downtime period
  mergedLogs.sort((a, b) => a[0].getTime() - b[0].getTime());

  // Created an array to store the merged downtime logs
  const result: DowntimeLogs = [];

  // I then initialize the currentPeriod with the first downtime period
  let currentPeriod = mergedLogs[0];

  // This iteration is sorting the array and merging overlapping downtime periods
  for (let i = 1; i < mergedLogs.length; i++) {
    const nextPeriod = mergedLogs[i];

    // This is the checking of overlaps to satisfy the test script.
    if (currentPeriod[1].getTime() >= nextPeriod[0].getTime()) {
      // If the next period overlaps with the current period, merge them
      currentPeriod[1] = new Date(Math.max(currentPeriod[1].getTime(), nextPeriod[1].getTime()));
    } else {
      // If there is no overlap, push the current period to the result and update the current period
      result.push(currentPeriod);
      currentPeriod = nextPeriod;
    }
  }

  // Push the last merged period
  result.push(currentPeriod);

  return result;
}
