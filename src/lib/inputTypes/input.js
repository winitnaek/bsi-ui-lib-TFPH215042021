import React, { Component } from "react";
import {Input, FormFeedback, Col, FormGroup, Label, UncontrolledTooltip} from "reactstrap";

class CustomInput extends Component {
  render() {
    const renderError = this.props.error && this.props.touched ? (
      <FormFeedback>{this.props.error}</FormFeedback>
    ) : null;
    const renderDescription = this.props.description ? (
      <div style={{color:'#33b5e5', fontSize:15, paddingTop:4}}>{this.props.description}</div>
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
            onBlur={this.props.onBlur}
            invalid={this.props.error && this.props.touched}
            disabled={this.props.disabled}
          />
          {renderError?renderError:renderDescription}
        </Col>
      </FormGroup>
    );
  }
}

export default CustomInput;
