const svcpath = '/cfws/';
const apiversion = 'v1';
const apir = 'r';
//const w2admws = '/EEW2AdminService';
const apiprefix ='/api'
class urlUtils {
  static buildURL(urlin) {
    let url = `${apiprefix}${svcpath}${apir}${urlin}`; return url;
  }
}
export default urlUtils;