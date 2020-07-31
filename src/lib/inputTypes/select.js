import React, { Component } from 'react';
import { Input, Col, FormGroup, Label } from 'reactstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { FieldLabel, FieldMessage, FieldHeader } from '../field';

class CustomSelect extends Component {
  constructor(props) {
    super(props);
    const { fieldinfo = {} } = this.props;
    const { options = [] } = fieldinfo;
    this.state = {
      isLoading: false,
      options,
      defaultSelected: { id: '', label: '' }
    };
    this.handleChange = this.handleChange.bind(this);
    this.onSearchHandler = this.onSearchHandler.bind(this);
    this.handleSelectFieldChange = this.handleSelectFieldChange.bind(this);
    this.updateDependentField = this.updateDependentField.bind(this);
  }

  handleChange(selectedOptions) {
    const { onChange, id } = this.props;
    if (selectedOptions.length > 0) {
      if (selectedOptions.length == 1) selectedOptions = selectedOptions[0].id;
    } else {
      selectedOptions = '';
    }
    this.updateDependentField((selectedOptions && selectedOptions.label) || '');
    onChange(id, selectedOptions);
  }

  handleSelectFieldChange(event) {
    const { onChange } = this.props;
    this.updateDependentField(event.target.value);
    onChange(event);
  }

  updateDependentField(parentSelectedValue) {
    const { dependentFields, autoComplete, updateFieldData } = this.props;
    if (dependentFields && dependentFields.length) {
      dependentFields.forEach(depentFieldId => {
        autoComplete.getAutoCompleteData(depentFieldId, parentSelectedValue).then(options => {
          updateFieldData && updateFieldData(depentFieldId, options);
        });
      });
    }
  }

  componentDidMount() {
    const { options = [] } = this.state;
    let { defaultSelected } = this.state;
    const { value } = this.props;
    defaultSelected = options.find(option => option && option.id === value) || defaultSelected;
    this.setState({ defaultSelected }, () => {
      if(defaultSelected.id && defaultSelected.label){
        this.typeahead && this.typeahead.getInstance()._updateSelected([defaultSelected]);
  }
    });
  }

  onSearchHandler(query) {
    const { autoComplete, fieldinfo, id, updateFieldData } = this.props;
    if (fieldinfo.isasync) {
      this.setState({ isLoading: true });
      autoComplete.getAutoCompleteData(id, query).then(options => {
        this.setState(
          {
          isLoading: false,
          options: options
          },
          () => {
            updateFieldData(id, options);
          }
        );
      });
    } else {
      this.setState({ options: fieldinfo.options });
    }
  }

  render() {
    const { defaultSelected, isLoading, options } = this.state;
    const {
      name,
      error,
      touched,
      description,
      required,
      label,
      value,
      defaultSet,
      index,
      fieldinfo,
      disabled,
      placeholder,
      onChange,
      isReset,
      id,
      fieldHeader
    } = this.props;

    if (isReset) {
      if (defaultSelected) this.typeahead && this.typeahead.getInstance()._updateSelected([defaultSelected]);
      else this.typeahead && this.typeahead.getInstance().clear();
    }
    
    return (
      <FormGroup>
        <Col>
          {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
          {label && <FieldLabel label={label} required={required} />}

          {fieldinfo && fieldinfo.typeahead ? (
            <AsyncTypeahead
              id={id}
              isLoading={isLoading}
              labelKey={option => `${option.label ? option.label : ''}`}
              defaultInputValue={value && value.label ? (value.label) : ''}
              ref={typeahead => (this.typeahead = typeahead)}
              placeholder={placeholder}
              onChange={this.handleChange}
              onInputChange={this.handleInputChange}
              disabled={disabled}
              onSearch={this.onSearchHandler}
              multiple={fieldinfo.multiselect}
              error={error && touched}
              options={options}
            />
          ) : (
            <Input
              type="select"
              name={name}
              placeholder={placeholder}
              value={value}
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
                fieldinfo.options.map(opt => {
                  return (
                    <option index={opt.id || opt} value={opt.id || opt}>
                      {opt.label || opt}
                    </option>
                  );
                })}
            </Input>
          )}
          <FieldMessage error={error} touched={touched} description={description} />
        </Col>
      </FormGroup>
    );
  }
}

export default CustomSelect;
