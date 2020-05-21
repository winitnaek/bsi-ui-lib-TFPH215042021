import React, { Component } from "react";
import {Input, Col, FormGroup, Label} from "reactstrap";
import {FieldLabel, FieldMessage, FieldHeader} from "../field";

class CustomRadio extends Component {
  render() {
    const {error,touched,description,fieldHeader,
           required, label,onChange,index} = this.props;
    return (
      <Col>
          <FormGroup tag="fieldset">
              {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
              {label && <FieldLabel label={label} required={required} />}
              {fieldinfo.options.map(opt => {
                      return (
                              <Col>
                                  <Label check>
                                      <Input
                                          type="radio"
                                          name={id}
                                          id={opt.id}
                                          value={opt.id}
                                          onChange={onChange}
                                      />{' '}
                                      {opt.label}
                                  </Label>
                              </Col>
                      );
              })}   
              <FieldMessage 
                  error={error} 
                  touched={touched} 
                  description={description} 
              />     
            </FormGroup>
      </Col>
    );
  }
}

export default CustomRadio;
