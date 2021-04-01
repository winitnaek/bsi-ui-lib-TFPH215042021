import React, { Component } from "react";
import { Label, ListGroup, ListGroupItem } from "reactstrap";

export class FieldMessage extends Component {
  render() {
    const { error, touched, description } = this.props;
    const renderError =
      error && touched ? <div style={{ color: "red", fontSize: 15, paddingTop: 4 }}>{error}</div> : null;
    const renderDescription = description ? (
      <div style={{ color: "#33b5e5", fontSize: 15, paddingTop: 4, marginLeft: 4 }}>{description}</div>
    ) : null;
    return renderError ? renderError : renderDescription;
  }
}

export class FieldLabel extends Component {
  render() {
    const { label, required, style } = this.props;
    return (
      <Label style={style} className="pb-1 mb-0">
        {label}
        {required && <span style={{ color: "red", fontSize: 20 }}>{" *"}</span>}
      </Label>
    );
  }
}

export class FieldHeader extends Component {
  render() {
    const { fieldHeader, index } = this.props;
    return (
      <ListGroup>
        <ListGroupItem active style={{ marginTop: index == 0 ? 25 : 65, marginBottom: 25 }}>
          {fieldHeader}
        </ListGroupItem>
      </ListGroup>
    );
  }
}
