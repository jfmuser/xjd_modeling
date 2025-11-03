import packageInfo from '../../package.json';

/**
 * To confirm localStorage/sessionStorage key is unique between apps
 * @param {*} name
 * @returns
 */
export default function storageKey(name) {
  return `${name}-${import.meta.env.VITE_APP}-${packageInfo.name}`;
}
