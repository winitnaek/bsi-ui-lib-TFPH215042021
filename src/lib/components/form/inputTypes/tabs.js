import React, { Component } from "react";
import { FormGroup, ButtonGroup, Button } from "reactstrap";
import { FieldLabel, FieldMessage, FieldHeader } from "../field";

class CustomTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleTabChange = (fieldId, selectedId) => {
      const { setFieldValue, field } = this.props;
      // if (field.value == selectedId) setFieldValue(fieldId, "");
      // else setFieldValue(fieldId, selectedId);
      setFieldValue(fieldId, selectedId);
    };
  }
  render() {
    const { fieldHeader, name, label, fieldinfo, required, description, hidden, error, value, touched } = this.props;
    let options = (fieldinfo && fieldinfo.options) || [];
    return (
      <FormGroup>
        {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={1} />}
        {label && <FieldLabel label={label} required={required} hidden={hidden ? "hidden" : ""} />}
        <ButtonGroup className="d-flex">
          {options.map((opt) => {
            return (
              <Button
                onClick={() => this.handleTabChange(name, opt.id)}
                outline={value == opt.id ? false : true}
                color={value == opt.id ? "info" : "secondary"}
                style={{ flexBasis: "100%" }}
                className="text-center"
              >
                {opt.label}
              </Button>
            );
          })}
        </ButtonGroup>
        <FieldMessage error={error} touched={touched} description={description} />
      </FormGroup>
    );
  }
}

export default CustomTabs;
