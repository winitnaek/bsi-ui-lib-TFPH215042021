import React, { Component } from "react";
import {Label} from "reactstrap";

export class FieldMessage extends Component {
    render() {
        const {error,touched,description} = this.props;
        const renderError = error && touched ? (
            <div style={{color:'red', fontSize:15, paddingTop:4}}>{error}</div>
        ) : null;
        const renderDescription = description ? (
            <div style={{color:'#33b5e5', fontSize:15, paddingTop:4}}>{description}</div>
        ) : null;
        return renderError?renderError:renderDescription
    }
}

export class FieldLabel extends Component {
    render() {
        const {label, required} = this.props;
        return (
            <Label>{label}
                {required && <Label style={{color:'red', fontSize: 20}}>{" *"}</Label> }
            </Label>
        )
    }
}