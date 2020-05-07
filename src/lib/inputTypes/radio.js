import React, { Component } from "react";
import {Input, Col, FormGroup, Label} from "reactstrap";
import {FieldLabel, FieldMessage} from "../field";

class CustomRadio extends Component {
  render() {
    const {error,touched,description,
           required, label,onChange} = this.props;
    return (
      <Col>
          <FormGroup tag="fieldset">
              <FieldLabel 
                  label={label}
                  required={required} 
              />
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
