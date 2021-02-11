import React, { Component } from "react";
import { Input, Col, FormGroup, InputGroup, InputGroupAddon, Button, Row } from "reactstrap";
import { AsyncTypeahead, Typeahead } from "react-bootstrap-typeahead";
import { FieldLabel, FieldMessage, FieldHeader } from "../field";

class CustomSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      options: props.fieldinfo.options || [],
      defaultSelected: "",
      showAllOptions: false,
      query: "",
      isSelected: false,
      isOpen: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.onSearchHandler = this.onSearchHandler.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.globalSearchHandler = this.globalSearchHandler.bind(this);
    this.resetFieldValue = this.resetFieldValue.bind(this);
    this.handleSelectFieldChange = this.handleSelectFieldChange.bind(this);
  }

  // resets the field value for typehead, asynctypehead and its autopopulated fields.
  // if default value is present it resets to default value
  resetFieldValue(clearInput) {
    const { defaultSelected } = this.state;
    const { mode } = this.props;
    if (mode == "Edit" && defaultSelected && defaultSelected.id && defaultSelected.label && !clearInput) {
      this.typeahead && this.typeahead.getInstance()._updateSelected(defaultSelected);
      this.asynctypeahead && this.asynctypeahead.getInstance()._updateSelected(defaultSelected);
    } else {
      this.typeahead && this.typeahead.getInstance().clear();
      this.asynctypeahead && this.asynctypeahead.getInstance().clear();
    }
  }

  // performs a global search with parameter as ""(empty value) to bring all the records
  async globalSearchHandler() {
    const { getFormData, id, formMetadata, fieldinfo } = this.props;
    const { showAllOptions } = this.state;
    if (!showAllOptions && fieldinfo.isasync) {
      this.setState({ isLoading: true });
      let options = await getFormData.getFormData(id, "", formMetadata);
      this.setState({ isLoading: false, options: options, showAllOptions: !showAllOptions });
      this.typeahead.focus();
    } else if (fieldinfo.options) {
      this.setState({ showAllOptions: !showAllOptions, options: fieldinfo.options });
      this.typeahead.focus();
    } else {
      this.setState({ showAllOptions: !showAllOptions });
    }
  }

  handleSelectFieldChange(event) {
    const { id, onResetFields, handleFieldMetadata, fieldMetadata, formMetadata, setFormMetadata } = this.props;
    const { value } = event.target;
    const { options } = this.state;
    let { defaultSelected } = this.state;
    options.forEach((option) => {
      if (option.id === value) {
        defaultSelected = option;
      }
    });

    if (defaultSelected.id && defaultSelected.label) {
      this.setState({
        defaultSelected,
      });
    }

    this.updateDependentField(value);

    let newFieldMetadata = fieldMetadata;
    newFieldMetadata[id] = { isSelected: true };
    handleFieldMetadata(newFieldMetadata);
    onResetFields([]);
    let formInfo = formMetadata || [];
    formInfo[id] = value;
    setFormMetadata(formInfo);
    this.props.onChange(event, defaultSelected);
  }

  updateDependentField(parentSelectedValue) {
    const { fieldinfo, getFormData, updateFieldData, formMetadata } = this.props;
    if (fieldinfo && fieldinfo.autoPopulateFields && fieldinfo.autoPopulateFields.length) {
      fieldinfo.autoPopulateFields.forEach((depentFieldId) => {
        getFormData.getFormData(depentFieldId, parentSelectedValue, formMetadata).then((options) => {
          let newOptions = [];
          options.forEach((option) => {
            if (option.id) {
              newOptions.push({ id: option.id, label: option.label });
            }
          });
          updateFieldData && updateFieldData(depentFieldId, newOptions);
        });
      });
    }
  }

  //clears the current and the dependent input fields as well as formik state
  clearInput() {
    const { setValues, id, fieldinfo, formValues, onResetFields, handleFieldMetadata, fieldMetadata } = this.props;
    const { resetFields } = fieldinfo;

    let fieldData = {};
    fieldData[id] = "";
    let newFieldMetadata = fieldMetadata;
    newFieldMetadata[id] = { isSelected: false };
    resetFields &&
      resetFields.map((item) => {
        fieldData[item] = "";
        newFieldMetadata[item] = { isSelected: false };
      });
    resetFields && onResetFields(resetFields);
    handleFieldMetadata(newFieldMetadata);
    let newFieldValues = Object.assign(formValues, fieldData);
    Object.keys(newFieldValues).map((k) => (newFieldValues[k] = newFieldValues[k].trim()));
    this.setState({ isSelected: false, query: "", defaultSelected: "" }, this.resetFieldValue({ clearInput: true }));
    setValues(newFieldValues);
  }

  // renders a form element of type select and switches from asynctypehead to typehead on global search
  renderFormElement() {
    const { isLoading, options, showAllOptions, defaultSelected } = this.state;
    const {
      name,
      error,
      touched,
      value,
      defaultSet,
      fieldMetadata,
      fieldinfo,
      disabled,
      placeholder,
      onChange,
      id,
    } = this.props;
    if (fieldinfo.typeahead) {
      let filterByFields = [];
      if (fieldinfo.labelMapping && showAllOptions)
        filterByFields = fieldinfo.fieldDisplayInfo.map((item) => {
          return item.field;
        });
      else filterByFields[0] = (fieldinfo.labelMapping && fieldinfo.fieldDisplayInfo[0].field) || "label";
      const primaryId = (fieldinfo.labelMapping && fieldinfo.fieldDisplayInfo[0].field) || "label";
      let mappedFieldLength = (fieldinfo.labelMapping && fieldinfo.fieldDisplayInfo.length) || 0;
      return (
        <InputGroup>
          <Col style={{ margin: 0, padding: 0 }}>
            {!showAllOptions ? (
              <AsyncTypeahead
                id={id}
                isLoading={isLoading}
                labelKey={(option) => `${option[primaryId]}`}
                defaultInputValue={value || ""}
                filterBy={filterByFields}
                ref={(typeahead) => (this.asynctypeahead = typeahead)}
                minLength={fieldinfo.minLength || 2}
                placeholder={placeholder}
                renderMenuItemChildren={(option) => (
                  <div>
                    <Row>{option[primaryId]}</Row>
                    {fieldinfo.labelMapping && (
                      <Row>
                        {fieldinfo.fieldDisplayInfo.slice(1).map((opt, index) => {
                          if (option[opt.field])
                            return (
                              <small>
                                <b>{opt.fieldDescription}:</b>
                                {option[opt.field]} {index < mappedFieldLength - 2 ? " , " : ""}
                              </small>
                            );
                        })}
                      </Row>
                    )}
                  </div>
                )}
                onChange={this.handleChange}
                disabled={disabled}
                onSearch={this.onSearchHandler}
                multiple={fieldinfo.multiselect}
                isInvalid={error && touched}
                options={options}
              />
            ) : (
              <Typeahead
                id={id}
                ref={(typeahead) => (this.typeahead = typeahead)}
                labelKey={(option) => `${option[primaryId]}`}
                filterBy={filterByFields}
                onChange={this.handleChange}
                defaultInputValue={value || ""}
                renderMenuItemChildren={(option) => (
                  <div>
                    <Row>{option[primaryId]}</Row>
                    {fieldinfo.labelMapping && (
                      <Row>
                        {fieldinfo.fieldDisplayInfo.slice(1).map((opt) => {
                          return (
                            <small>
                              <b>{opt.fieldDescription}:</b>
                              {option[opt.field] + ","}
                            </small>
                          );
                        })}
                      </Row>
                    )}
                  </div>
                )}
                options={options}
                placeholder={placeholder}
              />
            )}
          </Col>
          <InputGroupAddon addonType="append">
            {fieldMetadata && fieldMetadata[id] && fieldMetadata[id].isSelected && (
              <Button outline onClick={this.clearInput} disabled={disabled}>
                {!isLoading && <i class="fa fa-times"></i>}
              </Button>
            )}
            {fieldinfo && fieldinfo.globalSearch && (
              <Button outline onClick={this.globalSearchHandler} disabled={disabled}>
                {!isLoading && !showAllOptions && <i class="fas fa-ellipsis-h"></i>}
                {!isLoading && showAllOptions && <i class="fas fa-globe"></i>}
                {isLoading && <i class="fas fa-spinner fa-spin"></i>}
              </Button>
            )}
          </InputGroupAddon>
        </InputGroup>
      );
    } else
      return (
        <Input
          type="select"
          id={name}
          name={name}
          placeholder={placeholder}
          value={defaultSelected ? defaultSelected.id : value}
          defaultValue={defaultSelected ? defaultSelected.id : value}
          disabled={disabled}
          onChange={this.handleSelectFieldChange}
          invalid={error && touched}
        >
          {!defaultSet && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {fieldinfo &&
            fieldinfo.options &&
            fieldinfo.options.map((opt) => {
              return (
                <option index={opt.id || opt} value={opt.id || opt}>
                  {opt.label || opt}
                </option>
              );
            })}
        </Input>
      );
  }

  //after user selects a value, on change is triggered and sets the selected value.
  handleChange(selectedOptions) {
    const {
      setValues,
      setFieldValue,
      setFormMetadata,
      formValues,
      fieldinfo,
      fieldMetadata,
      handleFieldMetadata,
      onResetFields,
      id,
      formMetadata,
    } = this.props;
    const { autoSelectFields } = fieldinfo;
    const { showAllOptions } = this.state;
    let fieldData = {};
    let selectedOption = selectedOptions[0] || null;
    if (selectedOption) {
      if (autoSelectFields && autoSelectFields.length) {
        autoSelectFields.map((item) => {
          if (selectedOption[item]) {
            fieldData[item] = selectedOption[item];
          }
        });
        if (fieldinfo.fieldDisplayInfo) {
          fieldData[id] = selectedOption[fieldinfo.fieldDisplayInfo[0].field];
        } else {
          fieldData[id] = selectedOption[id];
        }
        let newFieldValues = Object.assign(formValues, fieldData);
        Object.keys(newFieldValues).map(
          (k) => (newFieldValues[k] = newFieldValues[k] && newFieldValues[k].toString().trim())
        );
        setValues(newFieldValues);
      } else {
        if (fieldinfo.fieldDisplayInfo) {
          let field = fieldinfo.fieldKey ? fieldinfo.fieldKey : fieldinfo.fieldDisplayInfo[0].field;
          setFieldValue(id, selectedOption[field]);
        } else if (fieldinfo.autoPopulateFields) {
          // For single select the selectedOption is always string as per the above code
          // TODO: Check what should be the pattern for multi select and update.
          this.updateDependentField(selectedOptions);
          this.props.onChange(id, selectedOptions, fieldinfo.autoPopulateFields);
          setFieldValue(id, selectedOption.id);
        } else {
          this.props.onChange(id, selectedOptions, null);
          setFieldValue(id, selectedOption[fieldinfo.fieldKey || "id"]);
        }
      }
      let newFieldMetadata = fieldMetadata;
      newFieldMetadata[id] = { isSelected: true };
      handleFieldMetadata(newFieldMetadata);
      onResetFields([]);
      let formInfo = formMetadata || [];
      formInfo[id] = selectedOption;
      setFormMetadata(formInfo);
      if (showAllOptions) this.setState({ showAllOptions: false });
    }
  }

  async componentDidMount() {
    const { value, fieldinfo, id, updateFieldData, getFormData, mode, setFieldValue } = this.props;
    if(mode === "New") {
      this.resetFieldValue(true);
    }
    this.setState({ defaultSelected: { id: value, label: value } });
    if (value && fieldinfo.isasync && fieldinfo.options && fieldinfo.options.length == 0) {
      this.setState({ isLoading: true });
      let options = await getFormData.getFormData(id, value);
      updateFieldData(id, options);
      let defaultSelected =
        options.find((option) => (option && option.id === value) || option.label === value) || defaultSelected;
      this.setState({ isLoading: false, options, defaultSelected }, () => {
        this.updateDependentField(value);
      });
    } else if (value && !fieldinfo.isasync && fieldinfo.options.length) {
      let defaultSelected =
        fieldinfo.options &&
        fieldinfo.options.find(
          (option) => option && (option.id === value || option.label === value || option === value)
        );
      this.setState({ defaultSelected });
    }

    if(fieldinfo.options && fieldinfo.options.length && mode === "New") {
      const defaultValue = fieldinfo.options[0];
      this.setState({ defaultSelected: { id: defaultValue.id, label: defaultValue.label } }, () => {
        setFieldValue(id, defaultValue.id);
      });
    }
  }

  // onSearchHandler is triggered on asynctypehead search.
  async onSearchHandler(query) {
    const { fieldinfo, getFormData, id, formMetadata } = this.props;
    if (fieldinfo.isasync) {
      this.setState({ isLoading: true });
      let options = await getFormData.getFormData(id, query, formMetadata);
      this.setState({ isLoading: false, options: options });
    } else {
      this.setState({ options: fieldinfo.options });
    }
  }

  render() {
    const {
      name,
      error,
      touched,
      description,
      required,
      label,
      fieldinfo,
      index,
      isResetAll,
      fieldHeader,
      resetFields,
    } = this.props;
    if (isResetAll) this.resetFieldValue();
    else if (resetFields.length && fieldinfo.typeahead) {
      resetFields.map((field) => {
        if (field == name) this.resetFieldValue();
      });
    }
    return (
      <FormGroup>
        <Col>
          {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
          {label && <FieldLabel label={label} required={required} />}
          {this.renderFormElement()}
          <FieldMessage error={error} touched={touched} description={description} />
        </Col>
      </FormGroup>
    );
  }
}

export default CustomSelect;
