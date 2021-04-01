import React, { Component } from "react";
import { Input, Col, FormGroup, Label } from "reactstrap";
import { FieldLabel, FieldMessage, FieldHeader } from "../field";

class CustomRadio extends Component {
  constructor(props) {
    super(props);
    this.RadioItem = this.RadioItem.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { currentTarget: target } = event;
    const { fieldinfo, value, onChange, id, fieldsToDisable, onDisableField } = this.props;
    let valueArray = value || [];

    valueArray = target.checked;
    onChange(id, valueArray);

    if (valueArray.length || valueArray) {
      if (fieldsToDisable) {
        onDisableField(fieldsToDisable);
      }
    } else {
      onDisableField([]);
    }
  }
  render() {
    const {
      error,
      touched,
      description,
      fieldHeader,
      id,
      value,
      required,
      label,
      onChange,
      index,
      fieldinfo,
      disabled,
      name,
    } = this.props;
    return (
      <Col className="pl-0 pr-0">
        <FormGroup tag="fieldset">
          {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
          {label && fieldinfo && fieldinfo.options && <FieldLabel label={label} required={required} />}
          {fieldinfo &&
            fieldinfo.options &&
            fieldinfo.options.map((opt) => {
              return this.RadioItem(id, opt.id, opt.value, opt.label, onChange, disabled, name);
            })}
          {!fieldinfo && this.RadioItem(id, null, value, label, onChange, disabled, name)}
          <FieldMessage error={error} touched={touched} description={description} />
        </FormGroup>
      </Col>
    );
  }
  RadioItem(id, cid, value, label, onChange, disabled, name) {
    return (
      <Col className="pl-0 pr-0">
        <Label check>
          <Input
            disabled={disabled}
            type="radio"
            name={name || id}
            id={cid ? cid : id}
            value={value}
            onChange={this.handleChange}
          />{" "}
          {label ? label : id}
        </Label>
      </Col>
    );
  }
}

export default CustomRadio;
