export default function useExternalLink() {
  const open = (url: string) => {
    window.api.link.openExternal(url);
  };

  return { open };
}
