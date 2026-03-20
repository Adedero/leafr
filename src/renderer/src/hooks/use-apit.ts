export function useApi() {
  const openExternalLink = (url: string) => {
    window.api.link.openExternal(url);
  };

  const openFileDialog = async (options?: Electron.OpenDialogOptions) => {
    const result = await window.api.files.openDialog(options);
    return result;
  };

  const getFilePath = async (file: File) => {
    const result = await window.api.files.getFilePath(file);
    return result;
  };

  return { openExternalLink, openFileDialog, getFilePath };
}
