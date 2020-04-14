const svcpath = '/tfws/';
const apiversion = 'v1';
const apir = 'r/';
const apiprefix ='/api'
class generateUrl {
  static buildURL(urlin) {
    let url = `${apiprefix}${svcpath}${apir}${apiversion}${urlin}`;
    console.log(url)
    return url;
  }
}
export default generateUrl;