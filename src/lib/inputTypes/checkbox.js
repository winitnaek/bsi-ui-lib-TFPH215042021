import React, { Component } from "react";
import {Input, Col, FormGroup, Label} from "reactstrap";
import {FieldLabel, FieldMessage, FieldHeader} from "../field";

class CustomCheckbox extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
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
    const {error,id,description,required,fieldHeader,
           label,fieldinfo,touched,index} = this.props;
    return (
      <Col>
          <FormGroup>
              {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
              {label && <FieldLabel label={label} required={required} />}
              {fieldinfo.options.map(opt => {
                  return (
                          <Col>
                              <Label check>
                                  <Input
                                      type="checkbox"
                                      name={id}
                                      id={opt.id}
                                      value={opt.id}
                                      onChange={this.handleChange}
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

export default CustomCheckbox;
