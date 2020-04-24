import React, { Component } from "react";
import {Input, Col, FormGroup, Label} from "reactstrap";

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
  };

  render() {
    const renderError = this.props.error && this.props.touched ? (
      <div style={{color:'red', fontSize:12}}>{this.props.error}</div>
    ) : null;
    const renderDescription = this.props.description ? (
      <div style={{color:'#33b5e5', fontSize:15, paddingTop:4}}>{this.props.description}</div>
    ) : null;
    return (
      <Col>
          <FormGroup>
            <Label>{this.props.label}
                {this.props.required && <Label style={{color:'red', fontSize: 20}}>{" *"}</Label> }
            </Label>
            {this.props.fieldinfo.options.map(opt => {
                    return (
                            <Col>
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        name={this.props.id}
                                        id={opt.id}
                                        value={opt.id}
                                        onChange={this.handleChange}
                                    />{' '}
                                    {opt.label}
                                </Label>
                            </Col>
                    );
                  })}
                   {renderError?renderError:renderDescription}
          </FormGroup>
      </Col>
    );
  }
}

export default CustomCheckbox;
