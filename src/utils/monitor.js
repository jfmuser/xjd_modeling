import _ from 'lodash';
export function transformData({
  failedJobCount = 0,
  runningJobCount = 0,
  successJobCount = 0,
  waitingJobCount = 0,
  cancelJobCount = 0,
  timeoutJobCount = 0,
  totalJobs,
  failedPercent,
  successPercent,
  waitingPercent,
  runningPercent,
  cancelPercent,
  timeoutPercent,
}) {
  let total;
  if (_.isNil(totalJobs)) {
    total =
      failedJobCount +
      runningJobCount +
      successJobCount +
      waitingJobCount +
      cancelJobCount +
      timeoutJobCount;
  } else {
    total = totalJobs;
  }

  return {
    canceled: cancelJobCount,
    canceled_percent: cancelPercent ?? cancelJobCount / total,
    failed: failedJobCount,
    failed_percent: failedPercent ?? failedJobCount / total,
    running: runningJobCount,
    running_percent: runningPercent ?? runningJobCount / total,
    success: successJobCount,
    success_percent: successPercent ?? successJobCount / total,
    timeout: timeoutJobCount,
    timeout_percent: timeoutPercent ?? timeoutJobCount / total,
    waiting: waitingJobCount,
    waiting_percent: waitingPercent ?? waitingJobCount / total,
    total,
  };
}
