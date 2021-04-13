import { Row, Badge } from "reactstrap";

//Displays the filter values for the selected form filters in the header section.
export default function FilterValues({ fieldData = [], formFilterData }) {
  const values = Object.assign({}, formFilterData);
  // fieldData.forEach(({ id, disable, hidden, datafield, fieldtype, fieldinfo }) => {
  formFilterData &&
    fieldData.forEach((obj) => {
      if (obj.disable && obj.disable.length && values[obj.id]) {
        obj.disable.forEach((disabled) => {
          delete values[disabled];
        });
      }
      if (obj.hidden) {
        delete values[obj.datafield];
      }
      if (obj.fieldtype == "select") {
        let selObj = obj.fieldinfo && obj.fieldinfo.options && obj.fieldinfo.options.filter((opt) => {
          if (opt.id == values[obj.id]) return opt;
        });
        if (selObj && selObj[0]) obj.displayText = selObj[0].label;
      }
    });
  return (
    <Row className="mt-2 mb-3">
      {/* placeholder is for checkboxes having no label */}
      {fieldData.map(({ id, label, placeholder, text, datafield, displayText }) => {
        return values[id || datafield] ? (
          <span className="mb-1">
            <Badge color="light">{label || text || placeholder}</Badge>{" "}
            <Badge color="dark" className="mr-1" id={`badge${id}`}>
              {displayText ? displayText : values[id || datafield]}
            </Badge>
          </span>
        ) : null;
      })}
    </Row>
  );
}
