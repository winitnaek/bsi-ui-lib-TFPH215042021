import * as yup from "yup";
import moment from "moment";

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
const socialSecurityRegExp = /^((?!000)(?!666)(?:[0-6]\d{2}|7[0-2][0-9]|73[0-3]|7[5-6][0-9]|77[0-2]))-((?!00)\d{2})-((?!0000)\d{4})$/

yup.addMethod(yup.string, "phoneNumber", function(args) {
  debugger
  const message = args[1];
  return yup.mixed().test(`phoneNumber`,message, function(value) {
    const { path, createError } = this;
    return (phoneRegExp.test(value) && value.length <= 15) || createError({ path, message });
  })
})

yup.addMethod(yup.string, "socialSecurity", function(args) {
  const message = args[1];
  return yup.mixed().test(`socialSecurity`,message, function(value) {
    const { path, createError } = this;
    return socialSecurityRegExp.test(value) || createError({ path, message });
  })
})


export function createYupSchema(schema, config) {
  let constraintParams = [];
  let subtypeParams=[];
  const { id, validation = [] } = config;
  if (!yup[validation.type]) return schema;
  let validator = yup[validation.type]();
  if(validation.required)
    validator = validator["required"]([config.errmsg]);
  if(validation.constraint){
    validation.constraint.forEach(valdt => {
      const {type, input, message} = valdt;
      if (!validator[type]) return;
        constraintParams[0] = input;
        constraintParams[1] = message;
        validator = validator[type](constraintParams);
    });
  }
  if(validation.subtype){
    validation.subtype.forEach(valdt => {
      const {type, message} = valdt;
      if(!validator[type]) return;
      subtypeParams[0] = message;
      validator = validator[type](subtypeParams);
    });
  } 
  // if(validation.dependent && validation.type == "date"){
  //   validation.dependent.forEach(valdt => {
  //     const {message, inputField, range} = valdt;
  //     debugger
  //     validator = validator.when(inputField, (field, schema) => field && schema.min(field, message));
  //     if(range)
  //     validator = validator.when(inputField, (field, schema) => field && schema.max(moment(field).add(range, 'month').toString(), `Invalid dates range. The From and To date values must be within ${range} months.`));
  //   });
  // }
  schema[id] = validator;
  return schema;
}
