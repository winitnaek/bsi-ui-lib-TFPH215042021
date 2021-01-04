import React, { Component } from "react";
import { Input, Col, FormGroup, Label } from "reactstrap";
import { FieldLabel, FieldMessage, FieldHeader } from "../field";

class CustomDate extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { id, onChange, setFormMetadata, formMetadata } = this.props;
    let formInfo = formMetadata || [];
    formInfo[id] = e.target.value;
    setFormMetadata(formInfo);
    onChange(e);
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
      onBlur,
      index,
    } = this.props;

    return (
      <FormGroup>
        <Col>
          {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
          {label && <FieldLabel label={label} required={required} />}
          <Input
            type={"date"}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={this.handleChange}
            onBlur={onBlur}
            invalid={error && touched}
            disabled={disabled}
          />
          <FieldMessage error={error} touched={touched} description={description} />
        </Col>
      </FormGroup>
    );
  }
}

export default CustomDate;