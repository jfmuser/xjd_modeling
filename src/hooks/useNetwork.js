import { resetNetwork } from '../apis/org/site.api';
export async function onResetNetwork(callback) {
  try {
    const response = await resetNetwork();
    callback(response.network);
  } catch (error) {
    console.error(error);
  }
}
