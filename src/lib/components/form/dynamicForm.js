import React, { Component, Fragment } from "react";
import { Formik, Form } from "formik";
import { Col, Button, Row, Label, Container, ModalBody, ModalFooter, FormGroup, UncontrolledTooltip } from "reactstrap";
import Input from "./inputTypes/input";
import Select from "./inputTypes/select";
import Radio from "./inputTypes/radio";
import Checkbox from "./inputTypes/checkbox";
import Password from "./inputTypes/password";
import moment from "moment";
//import MappedInput from "./inputTypes/mappedInput";
import Date from "./inputTypes/date";
import FileUpload from "./inputTypes/fileUpload";
import Usage from "../usage/usage";
import PopupGrid from "../modal/popupGrid";
import { createYupSchema } from "../../utils/createYupSchema";
import * as yup from "yup";

var fieldMetadata = {};
var resetFields = {};

class DynamicForm extends Component {
  constructor(props) {
    super(props);
    const { fieldData, formData } = props;
    let fieldDataCopy = [...fieldData];
    if (props.formData.mode == "Edit" && fieldData[0].hasSkipFields) {
      const payType = (
        formData.data[fieldData[0].dynamicFormKey] || formData.data[fieldData[0].dynamicFormKey.toLowerCase()]
      ).charAt(0);
      const otherFields = fieldData[fieldData.length - 1][payType];
      fieldDataCopy = [].concat([fieldData[0], ...otherFields]);
    }
    this.state = {
      showDelete: false,
      showSave: true,
      isResetAll: false,
      isLoading: false,
      saveAsMode: false,
      disabledFields: [],
      enabledFields: [],
      formMetadata: [],
      fieldData: fieldDataCopy,
    };

    this.updateFieldData = this.updateFieldData.bind(this);
    this.handleViewAll = (event, { values }) => {
      event.preventDefault();
      const { formProps, formData } = this.props;
      //this.props.handleFieldMetadataGrid();
    };

    this.handleSaveAs = (e, props) => {
      e.preventDefault();
      this.setState({ saveAsMode: true }, () => {
        this.props.handleSaveAs(e, props, this.state.saveAsMode);
      });
    };

    this.getFilteredValues = (values) => {
      const { fieldData } = this.state;
      fieldData.forEach((field) => {
        if (field.hide) delete values[field.id];
      });
      return values;
    };

    this.handleView = () => {
      const { formProps, renderGrid } = this.props;
      const { pgid } = formProps;
      let data = this.props.tftools.filter((tftool) => {
        if (tftool.id == pgid) return tftool;
      });
      renderGrid(data[0]);
    };

    this.handleFieldMetadata = (payload) => {
      fieldMetadata = payload;
    };

    //
    this.setFormMetadata = (formMetadata) => {
      this.setState({ formMetadata });
    };

    // sets list of field id's to reset
    this.onResetFields = (fields) => {
      resetFields = fields;
    };

    //On Click of View. Used to handle the popup filter form.
    this.handleFilters = (pgid, values, filter, actions) => {
      const { formProps } = this.props;
      if (formProps && formProps.handleFilters) {
        // External Filter Handler
        formProps.handleFilters(pgid, values, actions);
      } else {
        // On click of a link to filter the form data.
        formProps.renderMe(pgid, values, filter);
        actions.resetForm({});
        formProps.close();
      }
    };

    this.handleSubmit = (values, mode, pgid, formId, actions, formMetadata) => {
      const { formProps, saveGridData } = this.props;
      if (formProps && formProps.handleSubmit) {
        //External Handler
        formProps.handleSubmit(values, mode, pgid, formId, actions, formMetadata);
      } else {
        // Handles the submit of the form which is launched directly from a link
        const formValues = this.getFilteredValues(Object.assign({}, values));
        saveGridData.saveGridData(pgid, values, mode).then((saveStatus) => {
          if (saveStatus.status === "SUCCESS") {
            let message = saveStatus.message;
            if (this.props.showActionMessage) {
              formProps.showActionMessage("alert", "Save", message, pgid, formValues, saveStatus);
            } else {
              formProps.renderMe(pgid, formValues, saveStatus);
              alert(message);
            }
          } else if (saveStatus.status === "ERROR") {
            let message = saveStatus.message;
            if (this.props.showActionMessage) {
              this.props.showActionMessage("alert", "Save", message);
            } else {
              alert(message);
            }
          }
        });
        actions.resetForm({});
        formProps.close();
      }
    };

    // resets the entire form
    // fieldMetadata keeps track of the state of the field,
    // like to show or hide clear buttons
    this.handleReset = () => {
      fieldMetadata = {};
      this.setState({ isResetAll: true });
    };

    this.renderMe = (pgid, values, filter) => {
      this.props.renderMe(pgid, values, filter);
    };

    // list of field id's that needs to be disabled
    this.onDisableField = (fields) => {
      this.setState({ disabledFields: fields });
    };
    // list of field id's that needs to be enabled
    this.onEnableField = (fields) => {
      this.setState({ enabledFields: fields });
    };

    this.handleClose = () => {
      const { formProps } = this.props;
      const { close } = formProps;
      if (this.props.toggle) this.props.toggle();
      else close();
    };

    this.handleGenerate = this.handleGenerate.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.resetDependentFields = this.resetDependentFields.bind(this);
    this.getPermissions = this.getPermissions.bind(this);
  }

  /*
    Reset dependent fields
    @params: 
      autoPopulateFields:string[]
      formicProps: FormicProps // to access formic api
  */
  resetDependentFields(autoPopulateFields, formikProps) {
    const { fieldData } = this.state;
    autoPopulateFields.forEach((fieldId) => {
      formikProps.setFieldValue(fieldId, "");
      const childDependentField = fieldData.find(
        (formField) => formField.id === fieldId && formField.autoPopulateFields
      );
      if (childDependentField) {
        this.resetDependentFields(childDependentField.autoPopulateFields, formikProps);
      }
    });
  }

  handleFieldChange(event, selected, autoPopulateFields, item, props) {
    if (item.fieldtype === "checkbox") {
      props.setFieldValue(event, selected);
    } else {
      props.handleChange(event);
    }
    // Clear dependent fields values
    if (autoPopulateFields) {
      this.resetDependentFields(autoPopulateFields, props);
    }

    if (selected) {
      let { disabledFields = [], enabledFields } = this.state;
      if (selected.disable) {
        disabledFields.push(...selected.disable);
      }
      if (selected.disable) {
        const filteredEnabledFields = enabledFields.filter((field) => selected.disable.indexOf(field) === -1);
        enabledFields = filteredEnabledFields;
      }
      if (selected.enable) {
        enabledFields.push(...selected.enable);
      }
      if (selected.enable) {
        const filteredDisabledFields = disabledFields.filter((field) => selected.enable.indexOf(field) === -1);
        disabledFields = filteredDisabledFields;
      }
      if (selected.valuesToUpdate) {
        const keys = Object.keys(selected.valuesToUpdate);
        keys.forEach((key) => {
          props.setFieldValue(key, selected.valuesToUpdate[key]);
        });
      }

      let { fieldData } = this.state;

      if (item.hasSkipFields) {
        const payType = (
          selected[0][fieldData[0].dynamicFormKey] || selected[0][fieldData[0].dynamicFormKey.toLowerCase()]
        ).charAt(0);
        const otherFields = this.props.fieldData[this.props.fieldData.length - 1][payType];
        this.props.fieldData[0].value = selected[0].label;
        fieldData = [].concat([this.props.fieldData[0], ...otherFields]);
      }

      // DO NOT UPDATE BELOW CODE
      this.setState({
        disabledFields,
        fieldData,
        enabledFields,
      });
    }
  }
  handleGenerate(e, formValues) {
    const { formHandlerService, formProps, fieldData } = this.props;
    const { pgid } = formProps;
    const payload = {};
    fieldData.forEach(({ id }) => {
      payload[id] = formValues[id];
    });
    this.props.showProgress(true);
    this.generateButton.disabled = true;
    formHandlerService.generate(pgid, payload).then((response) => {
      if (response.status === "SUCCESS") {
        formProps.renderMe(pgid, formValues, response);
        this.generateButton.disabled = false;
      } else if (response.status === "ERROR") {
        let message = response.message;
        this.generateButton.disabled = false;
        if (this.props.showActionMessage) {
          this.props.showActionMessage("alert", "Save", message);
        } else {
          alert(message);
        }
      }
    });
  }
  updateFieldData(fieldId, options) {
    const { fieldData } = this.state;
    const updatedFieldData = fieldData.map((field) => {
      if (field.id === fieldId && field.fieldinfo) {
        field.fieldinfo.options = options;
      }
      return field;
    });
    this.setState({
      fieldData: updatedFieldData,
    });
  }

  getPermissions(tftools, pgid) {
    debugger;
    let currScreen = tftools.filter((tftool) => {
      if (tftool.id == pgid) return tftool;
    });
    if (currScreen && currScreen[0] && currScreen[0].permissions) return currScreen[0].permissions;
    else return null;
  }

  disabledHandler(id) {
    const { disabledFields, enabledFields } = this.state;
    const { metadata, formProps } = this.props;
    try {
      if (enabledFields.includes(id)) return;
      let row = disabledFields.filter((r) => id == r);
      if (row.length > 0) return true;
      let formflds = metadata.formdef.formflds;
      if (formflds) {
        row = formflds.filter((r) => id == r.id);
        if (row.length > 0) {
          if (row[0].isReadOnlyOnEdit == true && this.props.formData.mode == "Edit") {
            return true;
          } else if (row[0].isReadOnlyOnNew == true && this.props.formData.mode != "Edit") {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.log("error", error);
    }
  }

  renderFormElements(props, fieldInfo, popupGrids, getFormData, setFormData, mode) {
    if (this.state.isResetAll) this.setState({ isResetAll: false });
    const { values } = props;
    return fieldInfo.map((item, index) => {
      const fieldMap = {
        text: Input,
        date: Date,
        select: Select,
        checkbox: Checkbox,
        radio: Radio,
        fileUpload: FileUpload,
        password: Password,
        //mappedInput:MappedInput
      };
      const Component = fieldMap[item.fieldtype];
      let error = props.errors.hasOwnProperty(item.id) && props.errors[item.id];
      let touched = props.touched.hasOwnProperty(item.id) && props.touched[item.id];
      let show = true;

      if (item.show) {
        const keys = Object.keys(item.show);
        for (let length = keys.length - 1; length >= 0; length--) {
          const key = keys[length];
          const showForValues = item.show[key];
          show = show && showForValues.indexOf(values[key]) !== -1;
        }
        const nextField = fieldInfo[index + 1];
        if (nextField && item.nextFieldHeader) {
          nextField.fieldHeader = (!show && item.nextFieldHeader) || "";
        }
      }

      if (!this.props.hasChildData && item.dataDependent) {
        return null;
      }

      if (item.fieldtype && !item.hidden && show) {
        return (
          <Component
            index={index}
            fieldHeader={item.fieldHeader}
            type={item.fieldtype}
            mode={mode}
            label={item.label}
            fieldinfo={item.fieldinfo && item.fieldinfo}
            name={item.name || item.id}
            id={item.id}
            placeholder={item.placeholder}
            description={item.description}
            disabled={this.disabledHandler(item.id)}
            onDisableField={this.onDisableField}
            onEnableField={this.onEnableField}
            popupGrids={popupGrids}
            getFormData={getFormData}
            setFormData={setFormData}
            formMetadata={this.state.formMetadata}
            setFormMetadata={this.setFormMetadata}
            formValues={props.values}
            fieldsToDisable={item.disable}
            fieldsToEnable={item.enable}
            value={props.values[item.id]}
            required={item.validation && item.validation.required}
            onChange={(event, selected, autoPopulateFields) => {
              this.handleFieldChange(event, selected, autoPopulateFields, item, props);
            }}
            setValues={props.setValues}
            setFieldValue={props.setFieldValue}
            onBlur={props.handleBlur}
            error={error}
            touched={touched}
            isResetAll={this.state.isResetAll}
            resetFields={resetFields}
            onResetFields={this.onResetFields}
            maxLength={item.fieldlength && item.fieldlength.maxlength}
            handleFieldMetadata={this.handleFieldMetadata}
            fieldMetadata={fieldMetadata}
            autoPopulateFields={item.autoPopulateFields}
            updateFieldData={this.updateFieldData}
          />
        );
      }
      return "";
    });
  }

  componentDidMount() {
    fieldMetadata = {};
    resetFields = {};
    debugger;
    const { formData, tftools, metadata, formProps } = this.props;
    const hasDelete = metadata.formdef.hasDelete;
    const mode = formData.mode;
    let permissions = this.getPermissions(tftools, formProps.pgid);
    let isEdit = mode === "Edit" ? true : false;
    if (permissions) this.setState({ showDelete: permissions.DELETE && isEdit, showSave: permissions.SAVE });
    else this.setState({ showDelete: hasDelete && isEdit });
    // const hasDeletePermission = this.props.formProps.permissions && this.props.formProps.permissions.DELETE;
    //this.setState({showDelete: hasDelete && isEdit && hasDeletePermission});
  }

  render() {
    const {
      formProps,
      tftools,
      getFormData,
      fieldData,
      formId,
      setFormData,
      formActions,
      metadata,
      formFilterData,
    } = this.props;
    //const { close, pgid, filter, handleSubmit, handleFilters } = formProps;
    const { pgid, filter, close, permissions, handleDelete, handleSubmit, handleFilters, renderMe } = formProps;
    const { mode } = this.props.formData;
    const { popupGrids } = metadata.pgdef;
    //DO NOT UPDATE BELOW LINE
    const fieldInfo = this.state.fieldData;
    let initialValues = {};
    if (mode == "Edit") {
      initialValues = this.props.formData.data;
    } else {
      fieldInfo.forEach((item, index) => {
        const { validation, value, id } = item;
        if (validation && validation.constraint) {
          let constraints = validation.constraint;
          for (let key in constraints) {
            if (constraints[key].type == "startOfMonth") {
              initialValues[id] = moment()
                .startOf("month")
                .format(constraints[key].format || "YYYY-MM-DD");
              break;
            } else if (constraints[key].type == "endOfMonth") {
              initialValues[id] = moment()
                .endOf("month")
                .format(constraints[key].format || "YYYY-MM-DD");
              break;
            } else if (constraints[key].type == "currentDate") {
              initialValues[id] = moment(new Date()).format(constraints[key].format || "YYYY-MM-DD");
              break;
            } else if (constraints[key].type == "currentYear") {
              initialValues[id] = moment(new Date()).format(constraints[key].format || "YYYY");
              break;
            } else {
              initialValues[id] = item.value || "";
              break;
            }
          }
        } else {
          initialValues[id] = item.value || "";
        }
      });
    }

    this.displayForm = () => {
      const {
        hasDelete,
        hasViewPDF,
        hasSaveAs,
        viewAllBtnText,
        hideReset,
        submitButtonText,
        hasGenerate,
        generateButtonText,
      } = metadata.formdef;
      const { saveAsMode, showDelete, showSave, formMetadata } = this.state;
      if (mode === "New" && this.props.fillParentInfo) {
        //Do not remove this. To Handle New with values from parent
        initialValues = this.props.fillParentInfo(fieldInfo, initialValues, pgid);
      }
      return (
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={validateSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={(values, actions) => {
            debugger;
            try {
              if (filter) this.handleFilters(pgid, values, filter, actions);
              else this.handleSubmit(values, mode, pgid, formId, actions, formMetadata);
            } catch (error) {
              console.log(error.message);
              actions.setSubmitting(false);
              actions.setErrors({ submit: error.message });
            }
          }}
          onReset={() => {
            fieldInfo &&
              fieldInfo.forEach((item) => {
                if (item.fieldtype == "radio" || item.fieldtyle == "checkbox") {
                  item.fieldinfo.options &&
                    item.fieldinfo.options.forEach((subItem) => {
                      document.getElementById(subItem.id).checked = false;
                    });
                }
              });
          }}
        >
          {(props) => (
            <Form>
              <Container>
                <ModalBody>
                  <Form
                    onSubmit={this.props.submit}
                    style={{
                      display: "flex",
                      margin: "0 auto",
                      width: "100%",
                      flexWrap: "wrap",
                    }}
                    id="myform"
                  >
                    <Col>{this.renderFormElements(props, fieldInfo, popupGrids, getFormData, setFormData, mode)}</Col>
                  </Form>
                  {metadata.formdef && metadata.formdef.note && (
                    <FormGroup row>
                      <Col sm={2} style={{ marginLeft: "15px" }}>
                        <Label for="toolsFile"></Label>
                      </Col>
                      <Col sm={9}>
                        <Label style={{ fontWeight: "bold" }}>{metadata.formdef.note}</Label>
                      </Col>
                    </FormGroup>
                  )}
                  {metadata.formdef && metadata.formdef.hasRecentUsage && (
                    <Usage
                      pgid={pgid}
                      tftools={tftools}
                      mode={mode}
                      data={this.props.formData.data || {}}
                      close={close}
                      getFormData={getFormData}
                      recentUsage={this.props.recentUsage}
                    />
                  )}
                  {metadata.formdef && metadata.formdef.hasPopupGrid && (
                    <PopupGrid
                      pgid={pgid}
                      tftools={tftools}
                      close={close}
                      getFormData={getFormData}
                      values={props.values}
                      metadata={metadata}
                    />
                  )}
                </ModalBody>
                {!formActions ? (
                  <ModalFooter>
                    {!hideReset && (
                      <Fragment>
                        <Button color="primary" className="btn btn-primary" onClick={() => close(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={this.handleReset}
                          color="warning"
                          className="btn btn-primary mr-auto"
                          type="reset"
                        >
                          Reset
                        </Button>
                      </Fragment>
                    )}
                    {showDelete && (
                      <Button onClick={(e) => this.deleteHandler(props.values, props)} color="danger">
                        Delete
                      </Button>
                    )}
                    {hasGenerate && (
                      <Button
                        innerRef={(button) => (this.generateButton = button)}
                        onClick={(e) => this.handleGenerate(e, props.values)}
                        color="success"
                      >
                        {generateButtonText}
                      </Button>
                    )}
                    {hasViewPDF && mode === "Edit" ? (
                      <Button onClick={this.props.handlePdfView} color="success">
                        View PDF
                      </Button>
                    ) : null}
                    {!hasGenerate && showSave && (
                      <Button type="submit" color="success">
                        {this.props.filter || this.props.metadata.griddef.isfilterform
                          ? submitButtonText || " View "
                          : " Save "}
                      </Button>
                    )}

                    {hasSaveAs && !saveAsMode && mode === "Edit" ? (
                      <Button id="saveAsNew" color="success" onClick={(e) => this.handleSaveAs(e, props)}>
                        Save As New
                        <UncontrolledTooltip placement="right" target="saveAsNew">
                          <span> Save As A New Record </span>
                        </UncontrolledTooltip>
                      </Button>
                    ) : null}

                    {viewAllBtnText && (
                      <Button id="_viewAllBtnId" color="success">
                        {viewAllBtnText}
                      </Button>
                    )}
                  </ModalFooter>
                ) : (
                  <ModalFooter>{formActions}</ModalFooter>
                )}
              </Container>
            </Form>
          )}
        </Formik>
      );
    };

    this.deleteHandler = async (values) => {
      const { metadata, formData } = this.props;
      const { hasPopupGrid } = metadata.formdef;
      const { handleDelete } = formProps;
      this.setState({ isLoading: true });
      //TODO To be removed later
      if (hasPopupGrid) {
        let _id = $("#popupgrid").children(":first")[0].id;
        var rows = $("#" + _id).jqxGrid("selectedrowindexes");
        var selectedRecords = new Array();
        for (var m = 0; m < rows.length; m++) {
          var row = $("#" + _id).jqxGrid("getrowdata", rows[m]);
          selectedRecords[selectedRecords.length] = row;
        }
        if (selectedRecords.length) {
          const { formProps, deleteGridData } = this.props;
          const { pgid } = formProps;
          //await deleteGridData.deleteGridData(pgid, selectedRecords);
          handleDelete(formData.index, selectedRecords);
        }
      } else if (values) {
        handleDelete(formData.index, values);
      }
      this.setState({ isLoading: false });
      close();
    };

    const yepSchema = fieldInfo.reduce(createYupSchema, {});
    const validateSchema = yup.object().shape(yepSchema);

    return this.displayForm();
  }
}

export default DynamicForm;
