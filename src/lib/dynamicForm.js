import React, { Component } from 'react';
import { Formik, Form } from 'formik';
import { Col, Button, Row, Label, Container, UncontrolledTooltip, ModalBody, ModalFooter, FormGroup } from 'reactstrap';
import { updateGrid } from './utils/updateGrid.js';
import Input from './inputTypes/input';
import Select from './inputTypes/select';
import Radio from './inputTypes/radio';
import Checkbox from './inputTypes/checkbox';
import Date from './inputTypes/date';
import FileUpload from './inputTypes/fileUpload';
import Usage from './usage';
import { createYupSchema } from './utils/createYupSchema';
import * as yup from 'yup';
import moment from 'moment';

class DynamicForm extends Component {
  constructor(props) {
    super(props);
    const { fieldData } = props;
    //let recentUsage = [];

    /**/
    this.state = {
      showDelete: false,
      isReset: false,
      disabledFields: [],
      fieldData,
      saveAsMode: false,
      recentUsageData: []
    };

    this.handleView = () => {
      const { formProps, renderGrid } = this.props;
      const { pgid } = formProps;
      let data = this.props.tftools.filter(tftool => {
        if (tftool.id == pgid) return tftool;
      });
      renderGrid(data[0]);
    };

    this.handleReset = () => {
      this.setState({
        isReset: true
      });
    };

    this.renderMe = (pgid, values, filter) => {
      this.props.renderMe(pgid, values, filter);
    };

    this.onDisableField = fields => {
      this.setState({
        disabledFields: fields
      });
    };

    this.updateFieldData = this.updateFieldData.bind(this);

    this.handleViewAll = (event, { values }) => {
      event.preventDefault();
      const { formProps, formData } = this.props;
      this.props.handleChildGrid();
    };

    this.handleSaveAs = (e, props) => {
      e.preventDefault();
      this.setState(
        {
          saveAsMode: true
        },
        () => {
          this.props.handleSaveAs(e, props);
        }
      );
    };

    this.showMappedFields = ({ mappedFieldsToShow = [] }) => {
      const { fieldData } = this.state;
      const updatedFieldData = fieldData.map((field, key) => {
        const { fieldHeader, id } = field;
        if (field.hasOwnProperty('hide')) {
          field.hide = mappedFieldsToShow.indexOf(id) === -1;
          if (fieldData[key + 1]) {
            fieldData[key + 1].fieldHeader = field.hide && fieldHeader ? fieldHeader : '';
          }
        }

        return field;
      });

      this.setState({
        fieldData: updatedFieldData
      });
    };

    this.getFilteredValues = values => {
      const { fieldData } = this.state;
      fieldData.forEach(field => {
        const { id, hide } = field;
        if (hide) {
          delete values[id];
        }
      });
      return values;
    };
  }

  disabledHandler(id) {
    const { disabledFields } = this.state;
    const { formMetaData, formProps } = this.props;
    try {
      let row = disabledFields.filter(r => id == r);
      if (row.length > 0) return true;
      let formflds = formMetaData.formdef.formflds;
      if (formflds) {
        row = formflds.filter(r => id == r.id);
        if (row.length > 0) {
          if (row[0].isReadOnlyOnEdit == true && this.props.formData.mode == 'Edit') {
            return true;
          } else if (row[0].isReadOnlyOnNew == true && this.props.formData.mode != 'Edit') {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.log('error', error);
    }
  }

  updateFieldData(fieldId, options) {
    const { fieldData } = this.state;
    const updatedFieldData = fieldData.map(field => {
      if (field.id === fieldId && field.fieldinfo && field.fieldinfo.options) {
        field.fieldinfo.options = options;
      }
      return field;
    });
    this.setState({
      fieldData: updatedFieldData
    });
  }

  renderFormElements(props, fieldInfo, autoComplete) {
    if (this.state.isReset) {
      this.setState({
        isReset: false
      });
    }

    return fieldInfo.map((item, index) => {
      const fieldMap = {
        text: Input,
        date: Date,
        select: Select,
        checkbox: Checkbox,
        radio: Radio,
        fileUpload: FileUpload
      };
      const Component = fieldMap[item.fieldtype];
      let error = props.errors.hasOwnProperty(item.id) && props.errors[item.id];
      let touched = props.touched.hasOwnProperty(item.id) && props.touched[item.id];
      if (item.fieldtype && !item.hide) {
        return (
          <Component
            index={index}
            fieldHeader={item.fieldHeader}
            type={item.fieldtype}
            label={item.label}
            fieldinfo={item.fieldinfo && item.fieldinfo}
            name={item.id}
            id={item.id}
            placeholder={item.placeholder}
            description={item.description}
            disabled={this.disabledHandler(item.id)}
            onDisableField={this.onDisableField}
            fieldsToDisable={item.disable}
            value={props.values[item.id]}
            formValues={props.values}
            required={item.validation && item.validation.required}
            autoComplete={autoComplete}
            onChange={
              (item.fieldinfo && item.fieldinfo.typeahead) || item.fieldtype === 'checkbox'
                ? props.setFieldValue
                : props.handleChange
            }
            onBlur={props.handleBlur}
            error={error}
            touched={touched}
            isReset={this.state.isReset}
            dependentFields={item.dependentFields}
            updateFieldData={this.updateFieldData}
            showMappedFields={this.showMappedFields}
          />
        );
      }
      return '';
    });
  }

  componentDidMount() {
    const hasDelete = this.props.formMetaData.formdef.hasDelete;
    const mode = this.props.formData.mode;
    let isEdit = false;
    if (mode === 'Edit') {
      isEdit = true;
    }

    const hasDeletePermission = this.props.formProps.permissions && this.props.formProps.permissions.DELETE;

    this.setState({
      showDelete: hasDelete && isEdit && hasDeletePermission
    });
    this.props
      .recentUsage(this.props.formProps.pgid, this.props.formData.data || {}, this.props.formData.mode)
      .then(recentUsage => {
        console.log(recentUsage);
        this.setState({ recentUsageData: recentUsage });
      })
      .catch(error => {
        throw error;
      });
  }

  render() {
    const { formProps, tftools, recentUsage, formMetaData, autoComplete, saveGridData } = this.props;
    const { close, deleteRow, pgid, filter } = formProps;
    const { fieldData } = this.state;
    const fieldInfo = fieldData;
    let initialValues = {};

    if (this.props.filterFormData) {
      initialValues = this.props.filterFormData;
    }

    function handleGridRender(pgid, values, filter) {
      renderMe(pgid, values, filter);
    }

    this.displayForm = () => {
      const { hasDelete, hasViewPDF, hasSaveAs, viewAllBtnText } = this.props.formMetaData.formdef;
      const mode = this.props.formData.mode;
      let isEdit = false;
      if (mode === 'Edit') {
        isEdit = true;
      }
      const { saveAsMode } = this.state;
      const hasDeletePermission = this.props.formProps.permissions && this.props.formProps.permissions.DELETE;

      return (
        <Formik
          initialValues={initialValues}
          validationSchema={validateSchema}
          validateOnChange={true}
          onSubmit={(values, actions) => {
            try {
              let rowid = null;
              const { mode } = this.props.formData;

              if (mode === 'Edit') {
                rowid = this.props.formData.index;
              }
              if (!filter) {
                for (let key in values) {
                  if (values[key] === 'new Date()') {
                    values[key] = moment().format('MM/DD/yyyy');
                  }
                }
                // updateGrid(values, rowid, mode);
                const formValues = this.getFilteredValues(Object.assign({}, values));
                saveGridData.saveGridData(pgid, formValues, mode).then(({ status }) => {
                  if (status === 'SUCCESS') {
                    formProps.renderMe(pgid, formValues);
                  }
                });
              } else {
                formProps.renderMe(pgid, values, filter);
              }
              close(true);
              actions.resetForm({});
            } catch (error) {
              console.log('Form Error >>>>>>  ', error);
              actions.setSubmitting(false);
              actions.setErrors({ submit: error.message });
            }
          }}
          onReset={() => {
            fieldInfo &&
              fieldInfo.forEach(item => {
                if (item.fieldtype == 'radio' || item.fieldtyle == 'checkbox') {
                  item.fieldinfo.options &&
                    item.fieldinfo.options.forEach(subItem => {
                      document.getElementById(subItem.id).checked = false;
                    });
                }
              });
          }}
        >
          {props => (
            <Form>
              <Container>
                <ModalBody>
                  <Form
                    onSubmit={this.props.submit}
                    style={{
                      display: 'flex',
                      margin: '0 auto',
                      width: '70%',
                      flexWrap: 'wrap'
                    }}
                    id='myform'
                  >
                    <Col>{this.renderFormElements(props, fieldInfo, autoComplete)}</Col>
                  </Form>
                  {formMetaData.formdef && formMetaData.formdef.note && (
                    <FormGroup row>
                      <Col sm={2} style={{ marginLeft: '15px' }}>
                        <Label for='toolsFile'></Label>
                      </Col>
                      <Col sm={9}>
                        <Label style={{ fontWeight: 'bold' }}>{formMetaData.formdef.note}</Label>
                      </Col>
                    </FormGroup>
                  )}
                  {formMetaData.formdef && formMetaData.formdef.hasRecentUsage && (
                    <Usage
                      pgid={pgid}
                      tftools={tftools}
                      pgtitle={formMetaData.pgdef.pgtitle}
                      mode={this.props.formData.mode}
                      data={this.props.formData.data || {}}
                      close={close}
                      recentUsage={this.props.recentUsage}
                    />
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color='primary' className='btn btn-primary' onClick={() => close(false)}>
                    Cancel
                  </Button>
                  <Button onClick={this.handleReset} color='secondary' className='btn btn-primary mr-auto' type='reset'>
                    Reset
                  </Button>
                  {this.state.showDelete &&
                    !saveAsMode &&
                    this.state.recentUsageData &&
                    !this.state.recentUsageData.usageDataStr && (
                      <Button onClick={this.handleDelete} color='danger'>
                        Delete
                      </Button>
                    )}
                  {hasViewPDF && mode === 'Edit' ? (
                    <Button onClick={this.props.handlePdfView} color='success'>
                      View PDF
                    </Button>
                  ) : null}
                  <Button type='submit' color='success'>
                    {this.props.filter || this.props.formMetaData.griddef.isfilterform ? ' View ' : ' Save '}
                  </Button>

                  {hasSaveAs && !saveAsMode && mode === 'Edit' ? (
                    <Button id='saveAsNew' color='success' onClick={e => this.handleSaveAs(e, props)}>
                      Save As New
                      <UncontrolledTooltip placement='right' target='saveAsNew'>
                        <span> Save As A New Record </span>
                      </UncontrolledTooltip>
                    </Button>
                  ) : null}

                  {viewAllBtnText && (
                    <Button color='success' onClick={e => this.handleViewAll(e, props)}>
                      {viewAllBtnText}
                    </Button>
                  )}
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
      close(false);
    };

    if (this.props.formData.mode == 'Edit') {
      initialValues = this.props.formData.data;
      fieldInfo.forEach(field => {
        const { fieldinfo = {}, id, fieldtype } = field;
        const { options } = fieldinfo;

        if (fieldtype === 'select' && options && initialValues.hasOwnProperty(id)) {
          for (let i = options.length - 1; i >= 0; i--) {
            const { id: optionId, label } = options[i];
            if (initialValues[id] === label) {
              initialValues[id] = optionId;
              break;
            }
          }
        }
      });
    } else {
      fieldInfo.forEach(item => {
        const { fieldtype, value, id } = item;
        if (fieldtype === 'date' && value === 'new Date()') {
          item.value = moment().format('yyyy-MM-DD');
        }
        initialValues[id] = item.value || '';
      });
    }

    const yepSchema = fieldInfo.reduce(createYupSchema, {});
    const validateSchema = yup.object().shape(yepSchema);

    return this.displayForm();
  }
}

export default DynamicForm;
