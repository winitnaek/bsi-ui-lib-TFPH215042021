import React, { Component } from "react";
import {Input, FormFeedback, Col, FormGroup, Label} from "reactstrap";

class CustomInput extends Component {
  render() {
    const renderError = this.props.error && this.props.touched ? (
      <FormFeedback>{this.props.error}</FormFeedback>
    ) : null;
    return (
      <FormGroup>
        <Col>
          <Label>{this.props.label}
              {this.props.required && <Label style={{color:'red', fontSize: 20}}>{" *"}</Label> }
          </Label>
          <Input
            type={this.props.type}
            name={this.props.name}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.props.onChange}
            invalid={this.props.error && this.props.touched}
            disabled={this.props.disabled}
          />
          {renderError}
        </Col>
      </FormGroup>
    );
  }
}

export default CustomInput;
