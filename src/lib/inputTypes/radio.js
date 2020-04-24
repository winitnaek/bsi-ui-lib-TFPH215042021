import React, { Component } from "react";
import {Input, Col, FormGroup, Label} from "reactstrap";

class CustomRadio extends Component {
  render() {
    const renderError = this.props.error && this.props.touched ? (
      <div style={{color:'red', fontSize:12}}>{this.props.error}</div>
    ) : null;
    const renderDescription = this.props.description ? (
      <div style={{color:'#33b5e5', fontSize:15, paddingTop:4}}>{this.props.description}</div>
    ) : null;
    return (
      <Col>
          <FormGroup tag="fieldset">
            <Label>{this.props.label}
                {this.props.required && <Label style={{color:'red', fontSize: 20}}>{" *"}</Label> }
            </Label>
            {this.props.fieldinfo.options.map(opt => {
                    return (
                            <Col>
                                <Label check>
                                    <Input
                                        type="radio"
                                        name={this.props.id}
                                        id={opt.id}
                                        value={opt.id}
                                        onChange={this.props.onChange}
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

export default CustomRadio;
