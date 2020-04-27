import * as yup from "yup";

export function createYupSchema(schema, config) {
  let constraintParams = [];
  let subtypeParams=[];
  const { id, validation = [] } = config;
  if (!yup[validation.type]) {
    return schema;
  }
  let validator = yup[validation.type]();
  if(validation.required)
    validator = validator["required"](...[config.errmsg]);
  if(validation.constraint){
    validation.constraint.forEach(valdt => {
      const {type, input, message} = valdt;
      if(!validator[type]){
        return;
      }
      constraintParams[0] = input;
      constraintParams[1] = message;
      validator = validator[type](...constraintParams);
    });
  }
  if(validation.subtype){
    validation.subtype.forEach(valdt => {
      const {type, message} = valdt;
      if(!validator[type]){
        return;
      }
      subtypeParams[0] = message;
      validator = validator[type](...subtypeParams);
    });
  } 
  if(validation.dependent && validation.type == "date"){
    validation.dependent.forEach(valdt => {
      const {message, inputField} = valdt;
      validator = validator.when(inputField, (field, schema) => field && schema.min(field, message));
    });
  } 
  schema[id] = validator;
  return schema;
}
