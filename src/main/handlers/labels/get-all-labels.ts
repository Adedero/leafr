import db from "../../database";

export type GetAllLabelsResponse = Awaited<ReturnType<typeof getAllLabels>>;

export const getAllLabels = async () => {
  const labels = await db.query.labels.findMany({
    with: {
      books: {
        with: {
          readingProgress: true
        }
      }
    }
  });
  return labels;
};
