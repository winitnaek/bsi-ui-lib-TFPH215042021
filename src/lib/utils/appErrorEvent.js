export function getAdminErrorMessage(){
	return 'Please contact your system administrator.'
}
export function generateAppErrorEvent(type, status, message,error) {
    $.event.trigger({
        type: type,
        status:status,
        message: message,
        time: new Date(),
        errorData:error
    });
}