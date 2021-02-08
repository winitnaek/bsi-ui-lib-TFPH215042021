import React, { Component } from "react";
import { Input, Col, FormGroup } from "reactstrap";
import { FieldLabel, FieldMessage, FieldHeader } from "../field";

class CustomPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  handleChange(e) {
    const { id, onChange, setFormMetadata, formMetadata } = this.props;
    let formInfo = formMetadata || [];
    formInfo[id] = e.target.value;
    setFormMetadata(formInfo);
    onChange(e);
  }

  onClick(event) {
    const { fieldsToDisable, onDisableField } = this.props;
    if (fieldsToDisable) {
      onDisableField(fieldsToDisable || []);
    }
  }
  render() {
    const {
      name,
      error,
      touched,
      description,
      required,
      label,
      fieldHeader,
      disabled,
      placeholder,
      value,
      onChange,
      onBlur,
      index,
      maxLength,
      hidden,
    } = this.props;
    return (
      <FormGroup>
        <Col>
          {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
          {label && <FieldLabel label={label} required={required} hidden={hidden ? "hidden" : ""} />}
          <Input
            id={name}
            type={"password"}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={this.handleChange}
            onBlur={onBlur}
            invalid={error && touched}
            disabled={disabled}
            maxLength={maxLength}
            onClick={this.onClick}
            hidden={hidden ? "hidden" : ""}
          />
          <FieldMessage error={error} touched={touched} description={description} />
        </Col>
      </FormGroup>
    );
  }
}

export default CustomPassword;
