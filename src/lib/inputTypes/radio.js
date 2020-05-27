import React, { Component } from "react";
import {Input, Col, FormGroup, Label} from "reactstrap";
import {FieldLabel, FieldMessage, FieldHeader} from "../field";

class CustomRadio extends Component {
  constructor(props) {
    super(props);
    this.RadioItem = this.RadioItem.bind(this);
  }
  render() {
    const {error,touched,description,fieldHeader,id,value,
           required,label,onChange,index,fieldinfo} = this.props;
    return (
      <Col>
          <FormGroup tag="fieldset">
              {fieldHeader && 
                  <FieldHeader fieldHeader={fieldHeader} index={index} />}
              {label && fieldinfo && fieldinfo.options && 
                  <FieldLabel label={label} required={required} />}
              {fieldinfo && fieldinfo.options && 
                  fieldinfo.options.map(opt => {
                    return this.RadioItem(opt.id,opt.value,opt.label,onChange);
                  })}
              {!fieldinfo && this.RadioItem(id,value,label,onChange)} 
              <FieldMessage 
                  error={error} 
                  touched={touched} 
                  description={description} 
              />     
          </FormGroup>
      </Col>
    );
  }
  RadioItem(id,value,label,onChange){
    return (
      <Col>
          <Label check>
              <Input
                  type="radio"
                  name={id}
                  id={id}
                  value={value}
                  onChange={onChange}
              />{' '}
               {label?label:id}
          </Label>
      </Col>
    )
  }
}

export default CustomRadio;
