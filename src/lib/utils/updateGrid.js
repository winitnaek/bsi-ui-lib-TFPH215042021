export const updateGrid = (payload, rowid, mode) => {
  let _id;
  if (mode === "Edit") {
    _id = document.querySelector("div[role='grid']").id;
    $($("#" + _id)).jqxGrid("updaterow", rowid, payload);
  } else {
    _id = document.querySelector("div[role='grid']").id;
    $($("#" + _id)).jqxGrid("addrow", rowid, payload);
  }
};
