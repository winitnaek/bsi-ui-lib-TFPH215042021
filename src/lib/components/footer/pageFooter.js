import React, { Fragment } from "react";
import { Row, UncontrolledTooltip, Col } from "reactstrap";
import { copyToClipboard } from "../toast/copyToClipboard";

// Component Used to handle export functionality.
export default class PageFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.copyToClipboardHandler = this.copyToClipboardHandler.bind(this);
  }

  // Handles the copy to clipboard functionality.
  copyToClipboardHandler(event) {
    event.preventDefault();
    var numOfRows = copyToClipboard();
    this.setState(
      {
        showClipboard: true,
        numOfRows: numOfRows,
      },
      () => {
        window.setTimeout(() => {
          this.setState({ showClipboard: false });
        }, 2000);
      }
    );
  }

  //TODO
  // Handles the export to file.
  exportToFile(type) {
    const { metadata, exportHandler } = this.props;
    const { pgid, exportAll } = metadata.pgdef;
    if (exportAll) exportHandler(type);
    else {
      let _id = document.querySelector("div[role='grid']").id;
      $("#" + _id).jqxGrid('exportdata', type, pgid, true, null, true, '/dataexport.php');

      // TESTING ONLY!!
      // $("#" + _id).jqxGrid('exportdata', type, pgid, true, null, true, 'https://dev1w1v.bsihq.com:41001/dataexport.php');
      // END TESTING ONLY!!
    }
  } 

  // Renders the export and copy to clipboard buttons.
  render() {
    const { styles } = this.props;
    const { gridLinkStyle, gridRowStyle } = styles;
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
      </Row>
    );
  }
}
