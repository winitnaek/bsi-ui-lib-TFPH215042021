import { Row, Badge } from "reactstrap";

//Displays the filter values for the selected form filters in the header section.
export default function FilterValues({ fieldData = [], formFilterData }) {
  const values = Object.assign({}, formFilterData);
  fieldData.forEach(({ id, disable, hidden, datafield }) => {
    if (disable && disable.length && values[id]) {
      disable.forEach((disabled) => {
        delete values[disabled];
      });
    }
    if (hidden) {
      delete values[datafield];
    }
  });

  return (
    <Row className="mt-2 mb-3">
      {/* placeholder is for checkboxes having no label */}
      {fieldData.map(({ id, label, placeholder, text, datafield }) => {
        return values[id || datafield] ? (
          <span className="mb-1">
            <Badge color="light">{label || text || placeholder}</Badge>{" "}
            <Badge color="dark" className="mr-1">{`${values[id || datafield]}`}</Badge>
          </span>
        ) : null;
      })}
    </Row>
  );
}
