import React, { Component, Fragment } from 'react';
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
      recentUsageData: [],
      type2PgIds: ['customTaxFormulas', 'worksiteCompanies']
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
    this.populateIdForEntity = this.populateIdForEntity.bind(this);
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

    this.handleGenerate = this.handleGenerate.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.resetDependentFields = this.resetDependentFields.bind(this);
  }

  /*
    Reset dependent fields
    @params: 
      dependentFields:string[]
      formicProps: FormicProps // to access formic api
  */
  resetDependentFields(dependentFields, formikProps) {
    const { fieldData } = this.state;
    dependentFields.forEach(fieldId => {
      formikProps.setFieldValue(fieldId, '');
      const childDependentField = fieldData.find(formField => formField.id === fieldId && formField.dependentFields);
      if (childDependentField) {
        this.resetDependentFields(childDependentField.dependentFields, formikProps);
      }
    });
  }

  handleFieldChange(event, selected, item, props) {
    if ((item.fieldinfo && item.fieldinfo.typeahead) || item.fieldtype === 'checkbox') {
      props.setFieldValue(event, selected);
    } else {
      props.handleChange(event);
    }

    // Clear dependent fields values
    if (item.dependentFields) {
      this.resetDependentFields(item.dependentFields, props);
    }

    if (selected) {
      let { disabledFields } = this.state;
      if (selected.disable) {
        disabledFields.push(...selected.disable);
      }
      if (selected.enable) {
        const filteredDisabledFields = disabledFields.filter(field => selected.enable.indexOf(field) === -1);
        disabledFields = filteredDisabledFields;
      }

      if (selected.valuesToUpdate) {
        const keys = Object.keys(selected.valuesToUpdate);
        keys.forEach(key => {
          props.setFieldValue(key, selected.valuesToUpdate[key]);
        });
      }
      this.setState({
        disabledFields
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
    formHandlerService.generate(pgid, payload).then(response => {
      if (response.status === 'SUCCESS') {
        formProps.renderMe(pgid, formValues, response);
      } else if (response.status === 'ERROR') {
        let message = response.message;
        alert(message);
      }
    });
  }

  disabledHandler(id) {
    const { disabledFields } = this.state;
    const { formMetaData } = this.props;
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
  populateIdForEntity(initialValues, pageId) {
    if (pageId == this.state.type2PgIds[0]) {
      initialValues.taxCode = this.props.formFilterData.taxCode;
    } else if (pageId == this.state.type2PgIds[1]) {
      initialValues.company = this.props.formFilterData.company;
      initialValues.companyName = this.props.formFilterData.companyName;
    }
    return initialValues;
  }
  renderFormElements(props, fieldInfo, autoComplete) {
    if (this.state.isReset) {
      this.setState({
        isReset: false
      });
    }
    const { values } = props;

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
      let show = true;

      if (item.show) {
        const keys = Object.keys(item.show);
        for (let length = keys.length - 1; length >= 0; length--) {
          const key = keys[length];
          const showForValues = item.show[key];
          show = show && showForValues.indexOf(values[key]) !== -1;
        }
        const nextField = fieldInfo[index + 1];
        if (nextField) {
          nextField.fieldHeader = (!show && item.nextFieldHeader) || '';
        }
      }

      if (item.fieldtype && show) {
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
            maxLength={item.fieldlength.maxlength}
            hidden={item.hidden}
            onChange={(event, selected) => {
              this.handleFieldChange(event, selected, item, props);
            }}
            onBlur={props.handleBlur}
            error={error}
            touched={touched}
            isReset={this.state.isReset}
            dependentFields={item.dependentFields}
            updateFieldData={this.updateFieldData}
          />
        );
      }
      return '';
    });
  }

  componentDidMount() {
    const hasDelete = this.props.formMetaData.formdef.hasDelete;
    const hasUsage = this.props.formMetaData.formdef.hasRecentUsage;
    const mode = this.props.formData.mode;
    let isEdit = false;
    if (mode === 'Edit') {
      isEdit = true;
    }

    const hasDeletePermission = this.props.formProps.permissions && this.props.formProps.permissions.DELETE;

    this.setState({
      showDelete: hasDelete && isEdit && hasDeletePermission
    });
    if (hasUsage) {
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
      const {
        hasDelete,
        hasViewPDF,
        hasSaveAs,
        viewAllBtnText,
        hideReset,
        submitButtonText,
        hasGenerate,
        generateButtonText
      } = this.props.formMetaData.formdef;
      const mode = this.props.formData.mode;
      let isEdit = false;
      if (mode === 'Edit') {
        isEdit = true;
      }
      const { saveAsMode } = this.state;
      const hasDeletePermission = this.props.formProps.permissions && this.props.formProps.permissions.DELETE;
      const pgId = this.props.formProps.pgid;
      if (mode === 'New' && this.state.type2PgIds.includes(pgId)) {
        initialValues = this.populateIdForEntity(initialValues, pgId);
      }
      return (
        <Formik
          enableReinitialize
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
                saveGridData.saveGridData(pgid, formValues, mode).then(saveStatus => {
                  if (saveStatus.status === 'SUCCESS') {
                    formProps.renderMe(pgid, formValues, saveStatus);
                    let message = saveStatus.message;
                    alert(message);
                  } else if (saveStatus.status === 'ERROR') {
                    let message = saveStatus.message;
                    alert(message);
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
                  {!hideReset && (
                    <Fragment>
                      <Button color='primary' className='btn btn-primary' onClick={() => close(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={this.handleReset}
                        color='secondary'
                        className='btn btn-primary mr-auto'
                        type='reset'
                      >
                        Reset
                      </Button>
                    </Fragment>
                  )}
                  {this.state.showDelete &&
                    !saveAsMode &&
                    this.state.recentUsageData &&
                    !this.state.recentUsageData.usageDataStr && (
                      <Button onClick={this.handleDelete} color='danger'>
                        Delete
                      </Button>
                    )}
                  {hasGenerate && (
                    <Button onClick={e => this.handleGenerate(e, props.values)} color='success'>
                      {generateButtonText}
                    </Button>
                  )}
                  {hasViewPDF && mode === 'Edit' ? (
                    <Button onClick={this.props.handlePdfView} color='success'>
                      View PDF
                    </Button>
                  ) : null}
                  {!hasGenerate && (
                    <Button type='submit' color='success'>
                      {this.props.filter || this.props.formMetaData.griddef.isfilterform
                        ? submitButtonText || ' View '
                        : ' Save '}
                    </Button>
                  )}

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
        initialValues[id] = initialValues[id] || item.value || '';
      });
    }

    const yepSchema = fieldInfo.reduce(createYupSchema, {});
    const validateSchema = yup.object().shape(yepSchema);

    return this.displayForm();
  }
}

export default DynamicForm;
