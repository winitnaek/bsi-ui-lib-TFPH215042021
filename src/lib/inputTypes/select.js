import React, { Component } from "react";
import {Input, FormFeedback, Col, FormGroup, Label} from "reactstrap";
import {AsyncTypeahead} from "react-bootstrap-typeahead";

class CustomSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: false,
        options: [],
        defaultSelected: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.onSearchHandler = this.onSearchHandler.bind(this);
  }

  handleChange(selectedOptions) {
    const values = (selectedOptions.length > 0) ? selectedOptions : '';
    this.props.onChange(this.props.id, values);
  }
  
  componentDidMount(){
    this.setState({defaultSelected:this.props.value})
  }

  onSearchHandler(query){
    const {autoComplete} = this.props;
    if(this.props.fieldinfo.isasync){
      this.setState({isLoading: true});
      autoComplete.getAutoCompleteData(this.props.id, query)
      .then((options) => {
        this.setState({
          isLoading: false,
          options: options,
        });
      });
    }else {
        this.setState({options: this.props.fieldinfo.options})
    }
  }
  
  render() {
    let defaultSet = false;
    const renderError = this.props.error && this.props.touched ? (
      <div style={{color:'red', fontSize:12, paddingTop:4}}>{this.props.error}</div>
    ) : null;
    
    if (this.props.isReset) {
      if(this.state.defaultSelected)
        this.typeahead && this.typeahead.getInstance()._updateSelected([this.state.defaultSelected]);
      else
        this.typeahead && this.typeahead.getInstance().clear(); 
    }

    return (
      <FormGroup>
        <Col>
          <Label>{this.props.label}
              {this.props.required && <Label style={{color:'red', fontSize: 20}}>{" *"}</Label> }
          </Label>
          {(this.props.fieldinfo.typeahead) ? (
            <AsyncTypeahead
              id={this.props.id}
              isLoading={this.state.isLoading}
              labelKey={option => `${option}`}
              defaultInputValue= {this.props.value || ''}
              ref={(typeahead) => this.typeahead = typeahead}
              placeholder={this.props.placeholder}
              onChange={this.handleChange}
              onInputChange={this.handleInputChange}
              value={this.props.value}
              disabled={this.props.disabled}
              onSearch={this.onSearchHandler}
              multiple={this.props.fieldinfo.multiselect}
              error={this.props.error && this.props.touched}
              options={this.state.options}
          />
          ):(
              <Input
                type="select"
                name={this.props.name}
                placeholder={this.props.placeholder}
                value={this.props.value}
                disabled={this.props.disabled}
                onChange={this.props.onChange}
                invalid={this.props.error && this.props.touched}
              >
                {!defaultSet && (
                <option value="" disabled>
                  {this.props.placeholder}
                </option>
              )}
                  {this.props.fieldinfo.options.map(opt => {
                    return (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    );
                  })}
              </Input>
          )}
          {renderError}
        </Col>
      </FormGroup>
    );
  }
}

export default CustomSelect;
