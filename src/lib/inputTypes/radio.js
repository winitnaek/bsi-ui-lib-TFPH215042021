import React, { Component } from "react";
import {Input, Col, FormGroup, Label} from "reactstrap";

class CustomRadio extends Component {
  render() {
    const renderError = this.props.error ? (
      <div style={{color:'red', fontSize:12}}>{this.props.error}</div>
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
                  {renderError}     
          </FormGroup>
      </Col>
    );
  }
}

export default CustomRadio;
