import React, { Fragment } from 'react';
import {Row, UncontrolledTooltip,Col} from "reactstrap";

export default class PageTitle extends React.Component {
    render() {
       const {styles,help,metadata} = this.props;
       const {pageTitle,helpMargin,helpIcon} = styles;
       const {pgtitle,pgsubtitle,helpLblTxt,subHeader,pgid} = metadata.pgdef;
       return (
        <Fragment>
            <Row>
                <h1 style={pageTitle}>{pgtitle}</h1>
                {helpLblTxt && (
                    <span style={helpMargin}>
                        <span id="help">
                            <i className="fas fa-question-circle  fa-lg" onClick={() => help(pgid)} style={helpIcon} />
                        </span>
                        <UncontrolledTooltip placement="right" target="help">
                            <span> {helpLblTxt} </span>
                        </UncontrolledTooltip>
                    </span>
                )}
            </Row>
                {pgsubtitle ? <Row><p>{pgsubtitle}</p></Row> : null}
                {subHeader ? <Row><p>{subHeader}</p></Row>: null}
        </Fragment>
        )
    }
}