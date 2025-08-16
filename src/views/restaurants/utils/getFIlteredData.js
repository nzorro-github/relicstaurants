export const getFilterData = (data, filters) => {
  let filteredData = [];

  if (data) {
    filteredData = data
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
      )
      .filter((value) => value.rating >= filters.rating)
      .filter((value) => value.price >= filters.prices)
      .filter((value) =>
        filters.cuisine ? value.cuisine === filters.cuisine : true
      );
    return filteredData;
  }
  return filteredData;
};
