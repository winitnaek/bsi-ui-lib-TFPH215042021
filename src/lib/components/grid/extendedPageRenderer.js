import React, { Fragment } from "react";
import ConfirmModal from "../modal/confirmModal";
import ReusableAlert from "../modal/reusableAlert";
import PageTitle from "../header/pageTitle";
import PageFilters from "../header/pageFilters";
import PageActions from "../header/pageActions";
import ExtendedGrid from "./extendedGrid";
import PageFooter from "../footer/pageFooter";

//This is a container for Page Header, Extended Grid (ServerSide Paging), Action Buttons and Footer(Exports)
class ExtendedPageRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allSelected: false,
      showClipboard: false,
      numOfRows: 0,
      isOpen: false,
      viewPdfMode: false,
      isSaveSuccess: false,
      showConfirm: false,
      alertInfo: {
        showAlert: false,
        aheader: "",
        abody: "",
        abtnlbl: "Ok",
      },
    };
    this.handleParentGrid = this.handleParentGrid.bind(this);
    this.setIsOpen = this.setIsOpen.bind(this);
  }

  // Navigates back to parent grid from a child grid.
  handleParentGrid() {
    const { tftools, renderGrid, metadata } = this.props;
    let parentConfig = metadata.pgdef.parentConfig;
    const pgData = tftools.filter((item) => {
      if (item.id === parentConfig) return item;
    });
    renderGrid(pgData[0]);
  }

  // Sets the state for the popup form (Modal).
  setIsOpen(isOpen) {
    this.setState({ isOpen: isOpen });
  }

  // Renders the Page title, Page filters, Extended Grid, and Page footer components.
  render() {
    const { isOpen } = this.state;
    const { styles, fieldData, formFilterData, metadata, setFormData, mapToolUsage, exportHandler } = this.props;
    const { hidePageTitle, hidePageFilter, hidePageActions, hidePageFooter } = metadata.pgdef;
    return (
      <Fragment>
        {!hidePageTitle && <PageTitle styles={styles} help={this.props.help} metadata={metadata} />}
        {!hidePageFilter && (
          <PageFilters styles={styles} metadata={metadata} fieldData={fieldData} formFilterData={formFilterData} />
        )}
        {!hidePageActions && (
          <PageActions
            styles={styles}
            metadata={metadata}
            setIsOpen={this.setIsOpen}
            formFilterData={formFilterData}
            setFormData={setFormData}
            handleParentGrid={this.handleParentGrid}
          />
        )}
        <ExtendedGrid {...this.props} isOpen={isOpen} setIsOpen={this.setIsOpen} />
        {!hidePageFooter && (
          <PageFooter styles={styles} metadata={metadata} mapToolUsage={mapToolUsage} exportHandler={exportHandler} />
        )}
        {metadata.confirmdef ? (
          <ConfirmModal
            showConfirm={this.state.showConfirm}
            {...metadata.confirmdef}
            handleOk={this.handleOk}
            handleCancel={this.handleCancel}
          />
        ) : null}
        {this.state.alertInfo.showAlert ? (
          <ReusableAlert {...this.state.alertInfo} handleClick={this.handleAlertOk} />
        ) : null}
      </Fragment>
    );
  }
}
export default ExtendedPageRenderer;
