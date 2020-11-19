import React, { Fragment } from 'react';
import {Row, UncontrolledTooltip,Col} from "reactstrap";
import { copyToClipboard } from "../../utils/copyToClipboard";

export default class PageFooter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.exportToExcel = this.exportToExcel.bind(this);
        this.exportToCsv = this.exportToCsv.bind(this);
        this.copyToClipboardHandler = this.copyToClipboardHandler.bind(this);
        this.mapToolUsage = this.mapToolUsage.bind(this);
    }

    exportToExcel() {
        const {pgdef,ref} = this.props;
        ref.exportdata("xls", pgdef.pgid);
      }
    
      exportToCsv() {
        debugger
        const {pgdef,ref} = this.props;
        ref.exportdata("csv", pgdef.pgid);
      }
    
      copyToClipboardHandler(event) {
        event.preventDefault();
        var numOfRows = copyToClipboard();
        this.setState(
          {
            showClipboard: true,
            numOfRows: numOfRows
          },
          () => {
            window.setTimeout(() => {
              this.setState({ showClipboard: false });
            }, 2000);
          }
        );
      }

      mapToolUsage(id, successMessage, errorMessage){
        const { mapToolUsage,pgid } = this.props;
        // TODO: Check for request payload format
        mapToolUsage.createDefaultMapping(pgid, { id }).then(res => {
          const { alertInfo } = this.state;
          this.setState({
            alertInfo: Object.assign({}, alertInfo, { abody: successMessage, showAlert: true })
          });
        });
      };
  

    render() {
        const {styles,pgdef} = this.props;
        const {gridLinkStyle,gridRowStyle,helpMargin,helpIcon} = styles;
        const { hasDeleteAll, extraLinks } = pgdef;
        return (
            <Row style={gridRowStyle}>
                <a href="#" id="exportToExcel" onClick={this.exportToExcel}>
                    <i class="fas fa-table fa-lg fa-2x"></i>
                </a>
                <UncontrolledTooltip placement="right" target="exportToExcel">
                    <span> Export to Excel </span>
                </UncontrolledTooltip>
                <a href="#" id="exportToCsv" onClick={this.exportToCsv} style={gridLinkStyle}>
                    <i class="fas fa-pen-square fa-lg fa-2x"></i>
                </a>
                <UncontrolledTooltip placement="right" target="exportToCsv">
                    <span> Export to CSV </span>
                </UncontrolledTooltip>

                <a href="#" id="copyToClipboard" onClick={this.copyToClipboardHandler} style={gridLinkStyle}>
                    <i class="far fa-copy fa-lg fa-2x"></i>
                </a>
                <UncontrolledTooltip placement="right" target="copyToClipboard">
                    <span> Copy to clipboard </span>
                </UncontrolledTooltip>
                {hasDeleteAll ? (
                    <Fragment>
                    <a href="#" id="deleteAll" onClick={this.deleteAll} style={gridLinkStyle}>
                        <i class="fas fa-trash fa-lg fa-2x"></i>
                    </a>
                    <UncontrolledTooltip placement="right" target="deleteAll">
                        <span>Delete All</span>
                    </UncontrolledTooltip>
                    </Fragment>
                ) : null}
                {extraLinks
                    ? extraLinks.map(({ id, description, icon, successMessage, errorMessage }) => (
                        <Fragment>
                        <a
                            href="#"
                            id={id}
                            onClick={() => this.mapToolUsage(id, successMessage, errorMessage)}
                            style={gridLinkStyle}
                        >
                            <i class={`fas ${icon} fa-lg fa-2x`}></i>
                        </a>
                        <UncontrolledTooltip placement="right" target={id}>
                            <span>{description}</span>
                        </UncontrolledTooltip>
                        </Fragment>
                    ))
                    : null}
            </Row>
        );
    }
}