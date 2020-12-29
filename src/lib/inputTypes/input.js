import React, { Component } from "react";
import {Input, Col, FormGroup} from "reactstrap";
import {FieldLabel, FieldMessage, FieldHeader} from "../field";

class CustomInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = (e) => {
      const { id, onChange, setFormMetadata, formMetadata } = this.props;
      let formInfo = formMetadata || [];
      formInfo[id] = e.target.value;
      setFormMetadata(formInfo);
      onChange(e);
    };
  }

  render() {
    const {name,error,touched,description,required,label,fieldHeader,
           disabled,placeholder,value,onChange,onBlur,index,maxLength,hidden} = this.props;
    return (
      <FormGroup>
          <Col>
                {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
                {label && <FieldLabel label={label} required={required} hidden={hidden?"hidden":""}/>}
                <Input
                    type={"input"}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={this.handleChange}
                    onBlur={onBlur}
                    invalid={error && touched}
                    disabled={disabled}
                    maxLength={maxLength}
                    hidden={hidden?"hidden":""}
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
