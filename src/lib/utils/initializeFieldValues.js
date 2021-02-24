import moment from "moment";

export default function InitializeFieldValues(fieldInfo) {
  let initialValues = {};
  fieldInfo.forEach((item) => {
    const { validation, value, id } = item;
    if (validation && validation.constraint) {
      let constraints = validation.constraint;
      for (let key in constraints) {
        if (constraints[key].type == "startOfMonth") {
          initialValues[id] = moment()
            .startOf("month")
            .format(constraints[key].format || "YYYY-MM-DD");
          break;
        } else if (constraints[key].type == "endOfMonth") {
          initialValues[id] = moment()
            .endOf("month")
            .format(constraints[key].format || "YYYY-MM-DD");
          break;
        } else if (constraints[key].type == "currentDate") {
          initialValues[id] = moment(new Date()).format(constraints[key].format || "YYYY-MM-DD");
          break;
        } else if (constraints[key].type == "currentYear") {
          initialValues[id] = moment(new Date()).format("YYYY");
          break;
        } else if (constraints[key].type == "currentQuarter") {
          initialValues[id] = moment(new Date()).quarter();
          break;
        } else if (constraints[key].type == "currentMonth") {
          initialValues[id] = moment(new Date()).month();
          break;
        } else if (constraints[key].type == "currentDay") {
          initialValues[id] = moment(new Date()).format("DD");
          break;
        } else {
          initialValues[id] = value || "";
          break;
        }
      }
    } else {
      initialValues[id] = item.value || "";
    }
  });
  return initialValues;
}
