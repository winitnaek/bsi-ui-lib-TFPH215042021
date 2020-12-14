import * as yup from "yup";
import moment from "moment";

// yup.addMethod(yup.string, "matches", function(args) {
//   const message = args["message"];
//   const regex = args["input"];
//   const requiredMsg = args["requiredMsg"];
//   return yup.string().required(requiredMsg).test(`matches`,message, value => regex.test(value));
// })

yup.addMethod(yup.string, "matches", function (args) {
  const message = args["message"];
  const regex = new RegExp(unescape(args["input"]));
  const requiredMsg = args["requiredMsg"];
  return yup
    .string()
    .required(requiredMsg)
    .test(`matches`, message, function (value) {
      debugger;
      const { path, createError } = this;
      return regex.test(value) || createError({ path, message });
    });
});

yup.addMethod(yup.date, "range", function (args) {
  const dependentField = args["dependentField"];
  const message = args["message"];
  const input = args["input"];
  return yup
    .date()
    .when(dependentField, (field, schema) => {
      return field && schema.min(field, message);
    })
    .when(dependentField, (field, schema) => {
      return field && schema.max(moment(field).add(input, "month").toString(), message);
    });
});

yup.addMethod(yup.date, "after", function (args) {
  const dependentField = args["dependentField"];
  const message = args["message"];
  return yup.date().when(dependentField, (field, schema) => {
    return field && schema.min(field, message);
  });
});

yup.addMethod(yup.date, "before", function (args) {
  const dependentField = args["dependentField"];
  const message = args["message"];
  return yup.date().when(dependentField, (field, schema) => {
    return field && schema.max(field, message);
  });
});

// yup.addMethod(yup.string, "minLen", function(args) {
//   const input = args["input"];
//   const message = args["message"];
//   yup.string().test('len', message, val => val.length === 45);
//   return yup.string().required().test(`minLen`, message, function(value) {
//     const { path, createError } = this;
//     return !value || value.toString().length >= input || createError({ path, message });
//   });
// })

// yup.addMethod(yup.string, "maxLen", function(args) {
//   const input = args["input"];
//   const message = args["message"];
//   return yup.string().required().test(`maxLen`,message, function(value) {
//     const { path, createError } = this;
//     return !value || value.toString().length <= input || createError({ path, message });
//   });
// })

export function createYupSchema(schema, config) {
  let constraintParams = [];
  let subtypeParams = [];
  const { id, validation = [] } = config;
  if (!yup[validation.type]) return schema;
  let validator = yup[validation.type]();
  if (validation.required) validator = validator["required"]([config.errmsg]);
  if (validation.constraint) {
    validation.constraint.forEach((valdt) => {
      const { type, input, message, dependentField, range } = valdt;
      if (!validator[type]) return;
      constraintParams["input"] = input;
      constraintParams["message"] = message;
      constraintParams["dependentField"] = dependentField;
      constraintParams["requiredMsg"] = config.errmsg;
      validator = validator[type](constraintParams);
    });
  }
  if (validation.subtype) {
    validation.subtype.forEach((valdt) => {
      const { type, message } = valdt;
      if (!validator[type]) return;
      subtypeParams[0] = message;
      validator = validator[type](subtypeParams);
    });
  }
  schema[id] = validator;
  return schema;
}
