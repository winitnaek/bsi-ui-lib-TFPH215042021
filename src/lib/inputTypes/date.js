import React, { Component } from "react";
import { Input, Col, FormGroup, Label } from "reactstrap";
import { FieldLabel, FieldMessage, FieldHeader } from "../field";
import moment from "moment";

class CustomDate extends Component {
  constructor() {
    super();
    this.getValue = value => {
      const momentObj = moment(value);
      if (momentObj.isValid()) {
        return momentObj.format("yyyy-MM-DD");
      }
      return value;
    };
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
      classNames="",
      colClassNames="",
      labelClassNames="",
      inputClassNames=""
    } = this.props;
    return (
      <FormGroup className={classNames}>
        <Col className={colClassNames}>
          {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
          {label && (
            <FieldLabel label={label} required={required} className={labelClassNames} />
          )}
          <Input
            type={"date"}
            name={name}
            placeholder={placeholder}
            value={this.getValue(value)}
            onChange={onChange}
            onBlur={onBlur}
            invalid={error && touched}
            disabled={disabled}
            className={inputClassNames}
          />
          <FieldMessage error={error} touched={touched} description={description} />
        </Col>
      </FormGroup>
    );
  }
}

export default CustomDate;
