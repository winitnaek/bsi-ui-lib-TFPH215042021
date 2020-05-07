import React, { Component } from "react";
import {Input, Col, FormGroup} from "reactstrap";
import {FieldLabel, FieldMessage} from "../field";

class CustomInput extends Component {
  render() {
    const {name,error,touched,description,required,label,
           disabled,placeholder,value,onChange,onBlur} = this.props;
    return (
      <FormGroup>
          <Col>
                <FieldLabel 
                    label={label}
                    required={required} 
                />
                <Input
                    type={"input"}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    invalid={error && touched}
                    disabled={disabled}
                />
                <FieldMessage 
                    error={error} 
                    touched={touched} 
                    description={description} 
                />
          </Col>
      </FormGroup>
    );
  }
}

export default CustomInput;
