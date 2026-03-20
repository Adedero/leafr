export const useLabelUtils = () => {
  const getAllLabels = async () => await window.api.labels.getAllLabels();

  return {
    getAllLabels
  };
};
