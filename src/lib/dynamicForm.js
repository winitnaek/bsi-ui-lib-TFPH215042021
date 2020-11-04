import React, { Component } from "react";
import { Formik, Form} from "formik";
import { Col, Button, Row, Label,Container, ModalBody, ModalFooter,FormGroup} from "reactstrap";
import Input from "./inputTypes/input";
import Select from "./inputTypes/select";
import Radio from "./inputTypes/radio";
import Checkbox from "./inputTypes/checkbox";
import moment from "moment";
//import MappedInput from "./inputTypes/mappedInput";
import Date from "./inputTypes/date";
import FileUpload from "./inputTypes/fileUpload";
import Usage from "./usage";
import PopupGrid from "./popupGrid";
import { createYupSchema } from "./utils/createYupSchema";
import * as yup from "yup";

var childMetadata = {};
var resetFields = {};

class DynamicForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDelete: false,
      isResetAll: false,
      isLoading: false,
      disabledFields:[],
      formMetadata: [],
    };
   
    this.handleView = () => {
      const { formProps, renderGrid } = this.props;
      const { pgid } = formProps;
      let data = this.props.tftools.filter(tftool => {
        if (tftool.id == pgid) return tftool;
      });
      renderGrid(data[0])
    };

    this.handleChild = (payload) => {
      childMetadata = payload;
    }
    
    //
    this.setFormMetadata = (formMetadata) => {
      this.setState({formMetadata});
    } 

    // sets list of field id's to reset
    this.onResetFields = (fields) => {
      resetFields = fields;
    }

    // resets the entire form
    this.handleReset = () => {
      childMetadata = {}
      this.setState({isResetAll: true});
    }

    this.renderMe = (pgid, values, filter) => {
      this.props.renderMe(pgid, values, filter);
    }

    // list of field id's that needs to be disabled
    this.onDisableField = fields => {
      this.setState({
        disabledFields: fields
      });
    }

    this.handleClose = () => {
      const {formProps} = this.props;
      const {close} = formProps;
      if(this.props.toggle) {
        this.props.toggle();
      }else{
        close();
      }
    }
  }

  disabledHandler(id) {
    const {disabledFields} = this.state;
    const {metadata, formProps} = this.props;
    try {
      let row = disabledFields.filter(r => id == r);
      if(row.length > 0) return true;
      let formflds = metadata.formdef.formflds;
      if (formflds) {
        row = formflds.filter(r => id == r.id);
        if (row.length > 0) {
          if (row[0].isReadOnlyOnEdit == true && this.props.formData.mode == "Edit") {
            return true;
          } else if (
            row[0].isReadOnlyOnNew == true &&
            this.props.formData.mode != "Edit"
          ) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.log("error", error);
    }
  }

  renderFormElements(props, fieldInfo,popupGrids,getFormData,setFormData,mode) {
    if(this.state.isResetAll) {
      this.setState({
        isResetAll: false
      })
    }

    return fieldInfo.map((item, index) => {
      const fieldMap = { 
        text:Input,
        date:Date,
        select:Select,
        checkbox:Checkbox,
        radio:Radio,
        fileUpload:FileUpload,
        //mappedInput:MappedInput
      };
      const Component = fieldMap[item.fieldtype];
      let error = props.errors.hasOwnProperty(item.id) && props.errors[item.id];
      let touched = props.touched.hasOwnProperty(item.id) && props.touched[item.id];
      if (item.fieldtype) {
            return (
              <Component
                index={index}
                fieldHeader={item.fieldHeader}
                type={item.fieldtype}
                mode={mode}
                label={item.label}
                fieldinfo={item.fieldinfo && item.fieldinfo}
                name={item.id}
                id={item.id}
                placeholder={item.placeholder}
                description={item.description}
                disabled={this.disabledHandler(item.id)}
                onDisableField={this.onDisableField}
                popupGrids={popupGrids}
                getFormData={getFormData}
                setFormData={setFormData}
                formMetadata={this.state.formMetadata}
                setFormMetadata = {this.setFormMetadata}
                formValues={props.values}
                fieldsToDisable={item.disable}
                value={props.values[item.id]}
                required={item.validation && item.validation.required}
                onChange={props.handleChange}
                setValues={props.setValues}
                setFieldValue={props.setFieldValue}
                onBlur={props.handleBlur}
                error={error}
                touched={touched}
                isResetAll={this.state.isResetAll}

                resetFields={resetFields}
                onResetFields = {this.onResetFields}
                handleChild={this.handleChild}
                childMetadata={childMetadata}
              />
            );
      }
      return "";
    });
  }

  componentDidMount () {
    const hasDelete = this.props.metadata.formdef.hasDelete;
    const mode = this.props.formData.mode
    let isEdit = false;
    childMetadata={};
    resetFields={};
    if (mode === "Edit") {
      isEdit = true
    }
    if (hasDelete && isEdit) {
      this.setState({ showDelete: true})
    }
  }

  render() {
    const { formProps, tftools, getFormData, fieldData, metadata,formId, 
      saveGridData,setFormData,gridType,formActions} = this.props;
    const { close, deleteRow, pgid, filter,saveAndRefresh,handleSubmit} = formProps;
    const {mode} = this.props.formData;
    const {popupGrids} = metadata.pgdef;
    const {isLoading} = this.state;
    const fieldInfo = fieldData;
    let initialValues = {};

    this.displayForm = () => {
      const hasDelete = this.props.metadata.formdef.hasDelete;
      let isEdit = false;
    if (mode === "Edit") {
      isEdit = true
    }
      return (
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={validateSchema}
          validateOnChange={true}
          onSubmit={(values, actions) => {
            try {
              debugger
              if (gridType == "page"){
                handleSubmit(values,formId);
              }else if (!filter) {
                metadata.formdef.hasPopupGrid ?
                saveGridData.saveGridData(pgid, values, mode):
                saveAndRefresh(pgid,values,mode);
                close();
                actions.resetForm({});
              }else {
                formProps.renderMe(pgid, values, filter);
                close();
                actions.resetForm({});
              }
            } catch (error) {
              console.log("Form Error >>>>>>  ", error);
              actions.setSubmitting(false);
              actions.setErrors({ submit: error.message });
            }
          }}
          onReset={() => {
            fieldInfo && fieldInfo.forEach((item) => {
              if (item.fieldtype == "radio" || item.fieldtyle == "checkbox") {
                item.fieldinfo.options && item.fieldinfo.options.forEach((subItem) => {
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
                    <Col>
                      {this.renderFormElements(props, fieldInfo, popupGrids,getFormData,setFormData,mode)}
                    </Col>
                  </Form>
                  {metadata.formdef && metadata.formdef.note && (
                    <FormGroup row>
                    <Col sm={2} style={{marginLeft:'15px'}}>
                      <Label for="toolsFile"></Label>
                    </Col>
                      <Col sm={9}>
                        <Label style={{ fontWeight: "bold" }}>
                          {metadata.formdef.note}
                        </Label>
                      </Col>
                    </FormGroup>
                  )}
                  {metadata.formdef &&
                    metadata.formdef.hasRecentUsage && (
                      <Usage
                        pgid={pgid}
                        tftools={tftools}
                        close={close}
                        getFormData={getFormData}
                      />
                    )}
                    {metadata.formdef &&
                    metadata.formdef.hasPopupGrid && (
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
                  <Button
                    color="primary"
                    className="btn btn-primary"
                    onClick={this.handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={(e) => this.handleReset()}
                    color="secondary"
                    className="btn btn-primary mr-auto"
                    type="reset"
                  >
                    Reset
                  </Button>
                  {this.state.showDelete && (
                    <Button onClick={(e) => this.handleDelete(props.values)} color="danger">
                      {!isLoading && "Delete"}
                      {isLoading && <i class="fas fa-spinner fa-spin"></i>}
                    </Button>
                  )}
                  <Button type="submit" color="success">
                    {" "}
                    {this.props.filter   || this.props.metadata.griddef.isfilterform ? " View " : " Submit "}
                  </Button>
                </ModalFooter>
                  ):(
                    <ModalFooter>
                      {formActions}
                    </ModalFooter>
                  )}
              </Container>
            </Form>
          )}
        </Formik>
      );
    };

    this.handleDelete = async (values) => {
      const {gridType} = this.props;
      const {hasPopupGrid} = this.props.metadata.formdef;
       const {deleteHandler, handleDelete} = formProps;
       debugger
        this.setState({isLoading: true});
        if(hasPopupGrid){
          let _id = $("#popupgrid").children(":first")[0].id;
          var rows = $("#"+_id).jqxGrid('selectedrowindexes');
          var selectedRecords = new Array();
          for (var m = 0; m < rows.length; m++) {
              var row = $("#"+_id).jqxGrid('getrowdata', rows[m]);
              selectedRecords[selectedRecords.length] = row;
          }
          if(selectedRecords.length) {
              const {formProps, deleteGridData} = this.props;
              const {pgid} = formProps;
              await deleteGridData.deleteGridData(pgid,selectedRecords);
          }
      }else if(values){
          gridType == "page" ?
          handleDelete(values):
          await deleteHandler(values);
      }
      this.setState({isLoading: false});
      close();
    }

    if (this.props.formData.mode == "Edit") {
      initialValues = this.props.formData.data;
    } else {
      fieldInfo.forEach((item, index) => {
        const {validation,value,id} = item;
        if(validation && validation.constraint && validation.constraint.map(validation => validation.type) == "startOfMonth") 
          initialValues[id] =  moment().startOf('month').format("YYYY-MM-DD"); 
        else if (validation && validation.constraint && validation.constraint.map(validation => validation.type) == "endOfMonth")
          initialValues[id] =  moment().endOf('month').format("YYYY-MM-DD"); 
        else
        initialValues[id] = item.value || "";
      });
    }

    const yepSchema = fieldInfo.reduce(createYupSchema, {});
    const validateSchema = yup.object().shape(yepSchema);

    return (
      this.displayForm()
    );
  }
}

export default DynamicForm;
