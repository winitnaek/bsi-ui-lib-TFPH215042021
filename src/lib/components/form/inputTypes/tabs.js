import React, { Component } from "react";
import { FormGroup, Col, Label, InputGroup, InputGroupAddon, Button } from "reactstrap";
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
    let lastIndex = (options && options.length - 1) || -1;
    return (
      <FormGroup>
        <Col>
          {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={1} />}
          {label && <FieldLabel label={label} required={required} hidden={hidden ? "hidden" : ""} />}
          <InputGroup id={name} hidden={hidden ? "hidden" : ""} style={{ flex: 1 }}>
            {options.map((opt, index) => {
              return (
                <InputGroupAddon addonType={index == lastIndex ? "append" : "prepend"} id={opt.id} style={{ flex: 1 }}>
                  <Button
                    onClick={() => this.handleTabChange(name, opt.id)}
                    outline={value == opt.id ? false : true}
                    color={value == opt.id ? "primary" : "secondary"}
                    style={{ flex: 1 }}
                    className="text-center"
                  >
                    {opt.label}
                  </Button>
                </InputGroupAddon>
              );
            })}
          </InputGroup>
          <FieldMessage error={error} touched={touched} description={description} />
        </Col>
      </FormGroup>
    );
  }
}

export default CustomTabs;
