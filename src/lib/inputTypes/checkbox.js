import React, { Component } from "react";
import {Input, Col, FormGroup, Label} from "reactstrap";
import {FieldLabel, FieldMessage, FieldHeader} from "../field";

class CustomCheckbox extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.CheckBoxItem = this.CheckBoxItem.bind(this);
  }
  handleChange(event){
    const target = event.currentTarget;
    let valueArray = this.props.value || [];
    if (target.checked) {
        valueArray.push(target.id);
    } else {
        valueArray.splice(valueArray.indexOf(target.id), 1);
    }
    this.props.onChange(this.props.id, valueArray);
    if(valueArray.length){
      if(this.props.fieldsToDisable)
        this.props.onDisableField(this.props.fieldsToDisable);
    }
    else{ 
      this.props.onDisableField([]);
    }
  };

  render() {
    const {error,id,description,required,fieldHeader,value,
           label,fieldinfo,touched,index} = this.props;
    return (
      <Col>
          <FormGroup>
              {fieldHeader && 
                  <FieldHeader fieldHeader={fieldHeader} index={index} />}
              {label && fieldinfo && fieldinfo.options && 
                  <FieldLabel label={label} required={required} />}
              {fieldinfo && fieldinfo.options &&
                  fieldinfo.options.map(opt => {
                    return this.CheckBoxItem(opt.id,opt.value,opt.label,this.handleChange);
                  })}
              {!fieldinfo && this.RadioItem(id,value,label,this.handleChange)}
              <FieldMessage 
                  error={error} 
                  touched={touched} 
                  description={description} 
              />
          </FormGroup>
      </Col>
    );
  }
  CheckBoxItem(id,value,label,onChange){
    return (
      <Col>
          <Label check>
              <Input
                  type="checkbox"
                  name={id}
                  id={id}
                  value={value}
                  onChange={onChange}
              />{' '}
              {label}
          </Label>
      </Col>
    )
}
}

export default CustomCheckbox;
