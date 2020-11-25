import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import JqxTooltip from "../../../deps/jqwidgets-react/react_jqxtooltip";
import ConfirmModal from "../../confirmModal";
import ReusableAlert from "../../reusableAlert";
import PageTitle from "../header/pageTitle";
import PageFilters from "../header/pageFilters";
import PageActions from "../header/pageActions";
import BaseGrid from "../grid/baseGrid";
import PageFooter from "../footer/pageFooter";

class EntityPageRenderer extends React.Component {
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
        abtnlbl: "Ok"
      },
    };
    this.handleParentGrid = this.handleParentGrid.bind(this);
    this.setIsOpen = this.setIsOpen.bind(this);
  }

  handleParentGrid(){
    debugger
    const { tftools, renderGrid, metadata} = this.props;
    let parentConfig = metadata.pgdef.parentConfig;
    const pgData = tftools.filter(item => {
      if (item.id === parentConfig) return item;
    });
    renderGrid(pgData[0]);
  };

  setIsOpen(isOpen){
    this.setState({ isOpen: isOpen});
  };

  render() {
    const {isOpen} = this.state;
    const {styles,fieldData,formFilterData,metadata,setFormData,mapToolUsage} = this.props;
    const {hidePageTitle,hidePageFilter,hidePageActions,hidePageFooter} = metadata.pgdef;
    return (
      <Fragment>
            {!hidePageTitle &&
            <PageTitle styles = {styles} help={this.props.help} metadata={metadata} />}
            {!hidePageFilter && 
            <PageFilters styles = {styles} metadata={metadata} fieldData = {fieldData} formFilterData = {formFilterData} />}
            {!hidePageActions &&
            <PageActions styles = {styles} metadata={metadata} setIsOpen={this.setIsOpen} formFilterData = {formFilterData}
                         setFormData={setFormData} handleParentGrid={this.handleParentGrid}
            />}
            <BaseGrid {...this.props} isOpen={isOpen} setIsOpen={this.setIsOpen} />
            {!hidePageFooter && 
            <PageFooter styles = {styles} metadata={metadata} mapToolUsage={mapToolUsage} />}
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
export default EntityPageRenderer;


