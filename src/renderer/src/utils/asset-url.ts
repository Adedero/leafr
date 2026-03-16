export default function assetURL(path: string) {
  return `${window.api.protocolName}://${path}`;
}
