import React, { Component } from "react";
import { Input, Col, FormGroup, Label } from "reactstrap";
import { FieldLabel, FieldMessage, FieldHeader } from "../field";

class CustomCheckbox extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.CheckBoxItem = this.CheckBoxItem.bind(this);
  }
  componentDidMount() {
    const { value, fieldsToDisable = [], onDisableField, fieldinfo, fieldsToEnable = [], onEnableField } = this.props;
    const isSingleCheck = this.isSingleCheckBox(fieldinfo);
    if ((isSingleCheck && value) || (value && value.length && fieldsToDisable && fieldsToDisable.length)) {
      onDisableField(fieldsToDisable);
    }
    if ((isSingleCheck && value) || (value && value.length && fieldsToEnable && fieldsToEnable.length)) {
      onEnableField(fieldsToEnable);
    }
  }
  isSingleCheckBox(fieldinfo) {
    return fieldinfo && fieldinfo.options && fieldinfo.options.length === 1;
  }

  handleChange(event) {
    const { currentTarget: target } = event;
    const {
      fieldinfo,
      value,
      onChange,
      id,
      fieldsToDisable,
      onDisableField,
      fieldsToEnable,
      onEnableField,
    } = this.props;
    let valueArray = value || [];

    if (this.isSingleCheckBox(fieldinfo)) {
      valueArray = target.checked;
      onChange(id, valueArray);
    } else {
      if (target.checked) {
        if (valueArray.indexOf(target.id) === -1) {
          // Check for duplicate entry
          valueArray.push(target.id);
        }
      } else {
        valueArray.splice(valueArray.indexOf(target.id), 1);
      }
      onChange(id, valueArray);
    }

    if (valueArray.length || valueArray) {
      if (fieldsToDisable) {
        onDisableField(fieldsToDisable);
      }
      if (fieldsToEnable) {
        onEnableField(fieldsToEnable);
      }
    } else {
      onDisableField([]);
      onEnableField([]);
    }
  }

  render() {
    const {
      error,
      id,
      description,
      required,
      fieldHeader,
      value,
      label,
      fieldinfo,
      touched,
      index,
      disabled,
    } = this.props;

    const isChecked = this.isSingleCheckBox(fieldinfo) && value;

    return (
      <Col className="pl-0 pr-0">
        <FormGroup>
          {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
          {label && fieldinfo && fieldinfo.options && <FieldLabel label={label} required={required} />}
          {fieldinfo &&
            fieldinfo.options &&
            fieldinfo.options.map((opt) => {
              return this.CheckBoxItem(
                opt.id,
                opt.value,
                opt.label,
                isChecked || (value && value.indexOf(opt.id) !== -1),
                this.handleChange,
                disabled
              );
            })}
          {/* {!fieldinfo && this.RadioItem(id, value, label, this.handleChange)} */}
          <FieldMessage error={error} touched={touched} description={description} />
        </FormGroup>
      </Col>
    );
  }
  CheckBoxItem(id, value, label, checked, onChange, disabled) {
    return (
      <Col>
        <Label check>
          {disabled ? (
            <Input disabled type="checkbox" name={id} id={id} value={value} onChange={onChange} checked={checked} />
          ) : (
            <Input type="checkbox" name={id} id={id} value={value} onChange={onChange} checked={checked} />
          )}

          {label}
        </Label>
      </Col>
    );
  }
}

export default CustomCheckbox;
