import fateRequest from './fateRequest';

export function submitProject(payload) {
  return fateRequest.post('/job/submit', payload);
}

export function stopProject(jobId) {
  return fateRequest.post('/job/stop', { job_id: jobId });
}
