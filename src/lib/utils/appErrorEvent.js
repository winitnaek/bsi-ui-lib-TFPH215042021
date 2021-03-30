export function getAdminErrorMessage() {
  return "Please contact your system administrator.";
}
export function generateAppErrorEvent(type, status, message, error) {
  $.event.trigger({
    type: type,
    status: status,
    message: message,
    time: new Date(),
    errorData: error,
  });
}

export function FocusOnErrorField(props) {
  const { name, errFld, error, touched, currentRef } = props;
  if (error && touched && name == errFld.id) {
    ReactDOM.findDOMNode(currentRef).scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }
}
