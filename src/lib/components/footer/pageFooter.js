import React, { Fragment } from 'react';
import {Row, UncontrolledTooltip,Col} from "reactstrap";
import { copyToClipboard } from "../../utils/copyToClipboard";

export default class PageFooter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.copyToClipboardHandler = this.copyToClipboardHandler.bind(this);
        this.mapToolUsage = this.mapToolUsage.bind(this);
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

      exportToFile(type){
        debugger
        const {metadata} = this.props;
        const {pgid} = metadata.pgdef;
        let _id = document.querySelector("div[role='grid']").id;
        $("#" + _id).jqxGrid('exportdata',type, pgid);
        //exportExternal({pageid:pgid,type:type});
      }

      mapToolUsage(id, successMessage, errorMessage){
        const { mapToolUsage,metadata} = this.props;
        const {pgid} = metadata.pgdef;
        // TODO: Check for request payload format
        mapToolUsage.createDefaultMapping(pgid, { id }).then(res => {
          const { alertInfo } = this.state;
          this.setState({
            alertInfo: Object.assign({}, alertInfo, { abody: successMessage, showAlert: true })
          });
        });
      };
  

    render() {
        const {styles,metadata} = this.props;
        const {gridLinkStyle,gridRowStyle} = styles;
        const { hasDeleteAll, extraLinks } = metadata.pgdef;
        return (
            <Row style={gridRowStyle}>
                <a href="#" id="exportToExcel" onClick={() => this.exportToFile("xls")}>
                    <i class="fas fa-table fa-lg fa-2x"></i>
                </a>
                <UncontrolledTooltip placement="right" target="exportToExcel">
                    <span> Export to Excel </span>
                </UncontrolledTooltip>
                <a href="#" id="exportToCsv" onClick={() => this.exportToFile("csv")} style={gridLinkStyle}>
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