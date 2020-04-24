import React, { Component } from "react";
import { Formik, Form} from "formik";
import { Col, Button, Row } from "reactstrap";
import { updateGrid } from "./utils/updateGrid.js";
import Input from "./inputTypes/input";
import Select from "./inputTypes/select";
import Radio from "./inputTypes/radio";
import Checkbox from "./inputTypes/checkbox";
import Usage from "./usage";
import { Container, ModalBody, ModalFooter } from "reactstrap";
import { createYupSchema } from "./utils/createYupSchema";
import * as yup from "yup";

class DynamicForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDelete: false,
      isReset: false,
    };
    this.handleView = () => {
      const { formProps, renderGrid } = this.props;
      const { pgid } = formProps;
      let data = this.props.tftools.filter(tftool => {
        if (tftool.id == pgid) return tftool;
      });
      renderGrid(data[0])
    };

    this.handleReset = () => {
      this.setState({
        isReset: true
      })
    }
  }

  disabledHandler(id) {
    const {formMetaData, formProps} = this.props;
    try {
      let formflds = formMetaData[formProps.pgid].formdef.formflds;
      if (formflds) {
        let row = formflds.filter(r => id == r.id);
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

  renderFormElements(props, fieldInfo, autoComplete) {
    if(this.state.isReset) {
      this.setState({
        isReset: false
      })
    }

    return fieldInfo.map((item, index) => {
      const fieldMap = { 
        text:Input,
        date:Input,
        select:Select,
        checkbox:Checkbox,
        radio:Radio
      };
      const Component = fieldMap[item.fieldtype];
      let error = props.errors.hasOwnProperty(item.id) && props.errors[item.id];
      let touched = props.touched.hasOwnProperty(item.id) && props.touched[item.id];
      if (item.fieldtype) {
            return (
              <Component
                key={index}
                type={item.fieldtype}
                label={item.label}
                fieldinfo={item.fieldinfo}
                name={item.id}
                id={item.id}
                placeholder={item.placeholder}
                description={item.description}
                disabled={this.disabledHandler(item.id)}
                value={props.values[item.id]}
                required={item.validation.required}
                autoComplete={autoComplete}
                onChange={item.fieldinfo.typeahead ? props.setFieldValue : props.handleChange}
                onBlur={props.handleBlur}
                error={error}
                touched={touched}
                isReset={this.state.isReset}
              />
            );
      }
      return "";
    });
  }

  render() {
    const { formProps, tftools, recentUsage, fieldData, formMetaData, autoComplete, saveGridData } = this.props;
    const { close, deleteRow, pgid, filter} = formProps;
    const fieldInfo = fieldData[pgid];
    let initialValues = {};

    this.displayForm = () => {
      return (
          <Formik
            initialValues={initialValues}
            validationSchema={validateSchema}
            validateOnChange={true}
            onSubmit={(values, actions) => {
              try {
                    let rowid = null;
                    const mode = this.props.formData.mode;
                    if (mode === "Edit") {
                      rowid = this.props.formData.index;
                    }
                    if(!filter){
                      updateGrid(values, rowid, mode);
                      saveGridData.saveGridData(pgid, values, mode);
                    }else{
                      formProps.renderMe(pgid, values, filter);
                    }
                    close();
                    actions.resetForm({});
              } catch (error) {
                    console.log("Form Error >>>>>>  ", error);
                    actions.setSubmitting(false);
                    actions.setErrors({ submit: error.message });
              }
            }}
            onReset={() => {
              fieldInfo.forEach(item => {
                if (item.fieldtype != "select" && item.fieldinfo.options) {
                  item.fieldinfo.options.forEach(subItem => {
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
                    <Form onSubmit={this.props.submit} style={{display: "flex", margin: "0 auto", width: "70%", flexWrap: "wrap"}} id="myform">
                        <Col>{this.renderFormElements(props, fieldInfo, autoComplete)}</Col>
                    </Form>
                    {formMetaData[pgid].formdef.hasRecentUsage && (
                    <Usage pgid={pgid} tftools={tftools} close={close} recentUsage={recentUsage} />
                    )}
                  </ModalBody> 
                  <ModalFooter>
                    <Button color="primary" className="btn btn-primary" onClick={close}> Cancel </Button>
                    <Button onClick={ e=> this.handleReset() }color="secondary" className="btn btn-primary mr-auto" type="reset"> Reset </Button>
                    {this.props.showDelete && this.props.deletePermission && (
                      <Button onClick={e => this.props.delete()} color="danger"> Delete </Button>
                    )}
                    <Button type="submit" color="success"> {this.props.filter ? " View " : " Submit "}</Button>
                  </ModalFooter>
                </Container>
              </Form>
            )}
          </Formik>
      );
    };

    this.handleDelete = () => {
      const { rowIndex } = this.props.formData.index;
      deleteRow(rowIndex);
      close();
    };

    if (this.props.formData.mode == "Edit") {
      initialValues = this.props.formData.data;
    } else {
      fieldInfo.forEach((item, index) => {
        initialValues[item.id] = item.value || "";
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
