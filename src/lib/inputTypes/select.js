import React, { Component } from "react";
import {Input, Col, FormGroup,InputGroup,InputGroupAddon,Button,Row} from "reactstrap";
import {AsyncTypeahead, Typeahead} from "react-bootstrap-typeahead";
import {FieldLabel, FieldMessage, FieldHeader} from "../field";

class CustomSelect extends Component {
  constructor(props) {
    super(props);
    const { fieldinfo = {}, value } = this.props;
    const { options = [] } = fieldinfo;
    const defaultSelected = options.find(option => option.id === value) || { id: '', label: '' };

    this.state = {
        isLoading: false,
        options: [],
        defaultSelected,
        showAllOptions: false,
        query: "",
        isSelected:false,
        isOpen:false,
    }

    
    this.handleChange = this.handleChange.bind(this);
    this.onSearchHandler = this.onSearchHandler.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.globalSearchHandler = this.globalSearchHandler.bind(this);
    this.resetFieldValue = this.resetFieldValue.bind(this);
  }


  // resets the field value for typehead, asynctypehead and its autopopulated fields.
  // if default value is present it resets to default value
  resetFieldValue() {
    const {defaultSelected} = this.state;
    if(defaultSelected){
        this.typeahead && this.typeahead.getInstance()._updateSelected([defaultSelected]);
        this.asynctypeahead && this.asynctypeahead.getInstance()._updateSelected([defaultSelected]);
    }else{
        this.typeahead && this.typeahead.getInstance().clear(); 
        this.asynctypeahead && this.asynctypeahead.getInstance().clear(); 
    }
  }

  // performs a global search with parameter as ""(empty value) to bring all the records 
  async globalSearchHandler () {
    const {getFormData,id,formMetadata} = this.props;
    const {showAllOptions} = this.state;
    if(!showAllOptions){
      this.setState({isLoading:true});
      let options = await getFormData.getFormData(id, "",formMetadata);
      this.setState({isLoading: false, options: options,showAllOptions:!this.state.showAllOptions});
      this.typeahead.focus();
    }else{
      this.setState({showAllOptions:false});
    }
  }

  handleSelectFieldChange(event) {
    debugger
    const { onChange, fieldinfo } = this.props;
    const { value } = event.target;
    const { options } = this.state;
    let { defaultSelected } = this.state;
    options.forEach(option => {
      if (option.id === value) {
        defaultSelected = option;
      }
    });

    if (defaultSelected.id && defaultSelected.label) {
      this.setState({
        defaultSelected
      });
    }

    this.updateDependentField(value);
    onChange(event, defaultSelected);
  }

  updateDependentField(parentSelectedValue) {
    debugger
    const {fieldinfo, getFormData, updateFieldData } = this.props;
    if (fieldinfo && fieldinfo.dependentFields && fieldinfo.dependentFields.length) {
      fieldinfo.dependentFields.forEach(depentFieldId => {
        getFormData.getFormData(depentFieldId, parentSelectedValue).then(options => {
          updateFieldData && updateFieldData(depentFieldId, options);
        });
      });
    }
  }

  //clears the current and the dependent input fields as well as formik state
  clearInput(){
    debugger
    const {setValues, id, fieldinfo, formValues, onResetFields,handleChild,childMetadata} = this.props;
    const {resetFields} = fieldinfo;
    this.resetFieldValue();
    let fieldData = {};
    fieldData[id] = "";
    let metadata = childMetadata;
    metadata[id] = {isSelected:false};
    resetFields && resetFields.map(item => {
      fieldData[item] = "";
      metadata[item] = {isSelected:false}
    });
    resetFields && onResetFields(resetFields);
    handleChild(metadata);
    let newFieldValues = Object.assign(formValues, fieldData);
    Object.keys(newFieldValues).map(k => newFieldValues[k] = newFieldValues[k].trim());
    this.setState({isSelected:false,query:""});
    setValues(newFieldValues);
  }

  // renders a form element of type select and switches from asynctypehead to typehead on global search
  renderFormElement(){
    const {isLoading, options,showAllOptions, defaultSelected} = this.state;
    const {name,error,touched,value,defaultSet,childMetadata,
           fieldinfo,disabled,placeholder,onChange,id} = this.props;
    if(fieldinfo.typeahead){
      let filterByFields = [];
      if(fieldinfo.labelMapping && showAllOptions) 
        filterByFields = fieldinfo.fieldDisplayInfo.map(item => {return item.field});
      else 
        filterByFields[0] = (fieldinfo.labelMapping && fieldinfo.fieldDisplayInfo[0].field) || "label";
      const primaryId = (fieldinfo.labelMapping && fieldinfo.fieldDisplayInfo[0].field) || "label";
      let mappedFieldLength = (fieldinfo.labelMapping && fieldinfo.fieldDisplayInfo.length) || 0;
      return <InputGroup>
              <Col style={{margin:0,padding:0}}>
                  {!showAllOptions ? (
                    <AsyncTypeahead
                      id={id}
                      isLoading={isLoading}
                      labelKey={option => `${option[primaryId]}`}
                      defaultInputValue= {value || ''}
                      filterBy={filterByFields}
                      ref={(typeahead) => this.asynctypeahead = typeahead}
                      minLength={fieldinfo.minLength || 2}
                      placeholder={placeholder}
                      renderMenuItemChildren={(option) => (
                        <div>
                          <Row>{option[primaryId]}</Row>
                          {fieldinfo.labelMapping &&
                            <Row>
                              {fieldinfo.fieldDisplayInfo.slice(1).map((opt,index) => {
                                 if (option[opt.field]) return <small><b>{opt.fieldDescription}:</b>{option[opt.field]} {index<mappedFieldLength-2? " , ":""}</small>
                              })}
                            </Row>
                          }
                        </div>
                      )}
                      onChange={this.handleChange}
                      disabled={disabled}
                      onSearch={this.onSearchHandler}
                      multiple={fieldinfo.multiselect}
                      isInvalid={error && touched}
                      options={options}
                    />
                  ):(
                    <Typeahead
                      id={id}
                      ref={(typeahead) => this.typeahead = typeahead}
                      labelKey={option => `${option[primaryId]}`}
                      filterBy={filterByFields}
                      onChange={this.handleChange}
                      defaultInputValue= {value || ''}
                      renderMenuItemChildren={(option) => (
                        <div>
                          <Row>{option[primaryId]}</Row>
                          {fieldinfo.labelMapping &&
                            <Row>
                              {fieldinfo.fieldDisplayInfo.slice(1).map(opt => {
                                return <small><b>{opt.fieldDescription}:</b>{option[opt.field] + ","}</small>
                              })}
                            </Row>
                          }
                        </div>
                      )}
                      options={options}
                      placeholder={placeholder}
                    />
                  )}
              </Col>
              <InputGroupAddon addonType="append">
                {childMetadata && childMetadata[id] && childMetadata[id].isSelected && (
                  <Button outline onClick={this.clearInput}>
                                {!isLoading && <i class="fa fa-times"></i>}
                  </Button>
                )}
                {fieldinfo && fieldinfo.globalSearch &&
                <Button outline onClick={this.globalSearchHandler}>
                    {!isLoading && !showAllOptions && <i class="fas fa-ellipsis-h"></i>}
                    {!isLoading && showAllOptions && <i class="fas fa-globe"></i>}
                    {isLoading && <i class="fas fa-spinner fa-spin"></i>}
                </Button>}
              </InputGroupAddon>
          </InputGroup>
    }else return <Input
    type='select'
    name={name}
    placeholder={placeholder}
    value={defaultSelected.id}
    disabled={disabled}
    onChange={this.handleSelectFieldChange}
    invalid={error && touched}
  >
    {!defaultSet && (
      <option value='' disabled>
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
  }
  
  //after user selects a value, on change is triggered and sets the selected value. 
  handleChange(selectedOptions) {
    const {setValues,setFieldValue,setFormMetadata,formValues,fieldinfo,childMetadata,
           handleChild,onResetFields,id,formMetadata} = this.props;
    const {autoSelectFields} = fieldinfo;
    const {showAllOptions} = this.state;
    let fieldData = {};
    let selectedOption = selectedOptions[0] || null;
    if(selectedOption){
        if(autoSelectFields && autoSelectFields.length) {
          autoSelectFields.map(item => {
            if(selectedOption[item]) {
              fieldData[item] = selectedOption[item];
            }
          });
          fieldData[id] = selectedOption[id];
          let newFieldValues = Object.assign(formValues, fieldData);
          Object.keys(newFieldValues).map(k => newFieldValues[k] = newFieldValues[k].trim());
          setValues(newFieldValues);
        }else{
          setFieldValue(id,selectedOption[id]);
        }
        let metadata = childMetadata;
        metadata[id] = {isSelected:true};
        handleChild(metadata);
        onResetFields([]);
        let formInfo = formMetadata || [];
        formInfo[id] = selectedOption;
        setFormMetadata(formInfo);
         // For single select the selectedOption is always string as per the above code
        // TODO: Check what should be the pattern for multi select and update.
        if (fieldinfo.dependentFields) {
          this.updateDependentField(selectedOptions);
        }
        if(showAllOptions) this.setState({showAllOptions:false});
    }
  }

  componentWillReceiveProps(nextProps) {
    // sync default selected value based on the value change
    if (nextProps.value !== this.state.defaultSelected.id && !this.props.fieldinfo.typeahead) {
      const defaultSelected = nextProps.fieldinfo.options.find(option => option.id === nextProps.value) || { id: '', label: '' };
      this.setState({
        defaultSelected
      });
    }
  }
  
  componentDidMount(){
    this.setState({defaultSelected:this.props.value});
    let { options = [] } = this.state;
    let { defaultSelected } = this.state;
    // for first time load options if empty, so the value will not populate in form as defautlSelection is null.
    // Step-1 request for the autoComplete options.
    // Step-2 find if the value is present in id or label.
    // Step-3 populate the value in the field.
    const { value, fieldinfo, autoComplete, id, updateFieldData, getFormData} = this.props;
    if (value && !options.length && fieldinfo.isasync) {
      debugger
      this.setState({ isLoading: true });
      getFormData.getFormData(id, value).then(results => {
        options = results;
        defaultSelected =
          options.find(option => (option && option.id === value) || option.label === value) || defaultSelected;
        this.setState(
          {
            isLoading: false,
            options: options,
            defaultSelected
          },
          () => {
            if (defaultSelected.id && defaultSelected.label) {
              this.typeahead && this.typeahead.getInstance()._updateSelected([defaultSelected]);
            }
            updateFieldData(id, options);
          }
        );
      });
    } else {
      defaultSelected =
        options.find(option => option && (option.id === value || option.label === value || option === value)) ||
        defaultSelected;
      this.setState({ defaultSelected }, () => {
        if (defaultSelected.id && defaultSelected.label) {
          this.typeahead && this.typeahead.getInstance()._updateSelected([defaultSelected]);
        }
      });
    }
  }

  // onSearchHandler is triggered on asynctypehead search.
  async onSearchHandler(query){
    debugger
    const {fieldinfo,getFormData,id,formMetadata} = this.props;
    if(fieldinfo.isasync){
      this.setState({isLoading: true});
      let options = await getFormData.getFormData(id, query,formMetadata);
      debugger
      this.setState({isLoading: false, options: options});
    }else {
        this.setState({options: fieldinfo.options})
    }
  }
  
  render() {   
    const {
      name,error,touched,description,required,label,fieldinfo,
      index,isResetAll,fieldHeader,resetFields,
    } = this.props;
    if(isResetAll) this.resetFieldValue();
    else if(resetFields.length && fieldinfo.typeahead){
      resetFields.map(field => {
        if(field == name) this.resetFieldValue();
      });
    }
    return (
      <FormGroup>
        <Col>
            {fieldHeader && <FieldHeader fieldHeader={fieldHeader} index={index} />}
            {label && <FieldLabel label={label} required={required} />}
            {this.renderFormElement()}
            <FieldMessage 
              error={error} 
              touched={touched} 
              description={description} 
            />
        </Col>  
      </FormGroup>
    );
  }
}

export default CustomSelect;
