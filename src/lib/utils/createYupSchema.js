import * as yup from "yup";
import * as vldt from "./validate";
import moment from "moment";

yup.addMethod(yup.string, "matches", function (args) {
  const message = args["message"];
  const regex = new RegExp(unescape(args["input"]));
  const requiredMsg = args["requiredMsg"];
  const isRequired = args["isRequired"];
  if (isRequired) {
    return yup
      .string()
      .required(requiredMsg)
      .test(`matches`, message, function (value) {
        if (!value) return true;
        if (!(value && value.trim()) && !isRequired) return true;
        return regex.test(value);
      })
      .nullable();
  } else {
    return yup
      .string()
      .test(`matches`, message, function (value) {
        if (!value) return true;
        if (!(value && value.trim()) && !isRequired) return true;
        return regex.test(value);
      })
      .nullable();
  }
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

yup.addMethod(yup.string, "isValidDate", function (args) {
  const message = args["message"];
  return this.test("validDate", message, function (value) {
    if (!value) return true;
    return value.toString().length <= 10;
  });
});

yup.addMethod(yup.string, "isValidRoutingNumber", function (args) {
  const message = args["message"];
  return this.test("isValidRoutingNumber", message, function (value) {
    if (!value) return true;
    return vldt.validateRoutingNumber(value);
  });
});

yup.addMethod(yup.mixed, "minLen", function (args) {
  const input = args["input"];
  const message = args["message"];
  return this.test("len", message, function (value) {
    if (!value) return true;
    return value.toString().length >= input;
  });
});

yup.addMethod(yup.mixed, "maxLen", function (args) {
  const input = args["input"];
  const message = args["message"];
  return this.test("len", message, function (value) {
    if (!value) return true;
    return value.toString().length <= input;
  });
});

export function createYupSchema(schema, config) {
  let constraintParams = [];
  let subtypeParams = [];
  const { id, validation = [] } = config;
  if (!yup[validation.type]) return schema;
  let validator = yup[validation.type]();
  if (validation.required) validator = validator["required"]([config.errmsg]);
  validator = validator.nullable();
  if (validation.constraint) {
    validation.constraint.forEach((valdt) => {
      const { type, input, message, dependentField, range } = valdt;
      if (!validator[type]) return;
      constraintParams["input"] = input;
      constraintParams["message"] = message;
      constraintParams["dependentField"] = dependentField;
      constraintParams["requiredMsg"] = config.errmsg;
      constraintParams["isRequired"] = validation.required;
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
