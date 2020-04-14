import * as c from '../constants/IndexConstants';

export function makeNavs(visibleAreas) {
    const navs = getNavs(visibleAreas);
    addAreaLinks(navs);
}

export function makeSearch(searchData) {
    addSearchLinks(searchData);
}

const addAreaLinks = (navs) => {
    var newNavs = _.cloneDeep(navs);
    abbrvTitles(newNavs);
    var compiled = _.template(document.querySelector('#templateAreaNavBarMenu').innerHTML);
    $("#" + c.appAreaSideMenuId).html(compiled({
        navs: newNavs
    }));
};

const addSearchLinks = (search) => {
    var newSearchs = _.cloneDeep(search);
    console.log('newSearchs');
    console.log(newSearchs);
    var compiled = _.template(document.querySelector('#templateSeachArea').innerHTML);
    $("#" + c.appSearchAreaId).html(compiled({
        navs: newSearchs
    }));
};

const abbrvTitles = (obj) => {
    _.forEach(obj.areas, function (area) {
        if (area.title && area.title.length > 20) {
            area.title = area.title.slice(0, 16).concat('..');
        }
    });
};

const getNavs = (navInput) => {
    let navs = {
        'renderFunction': navInput.rf,
        'anchorId': navInput.anchorId
    };
    navs.areas = [];
    _.forEach(navInput.areas, function (areaObj) {
        navs.areas.push({
            icon: areaObj.icon,
            popover: areaObj.tooltip,
            title: areaObj.title,
            renderName: areaObj.renderName
        });
    });
    console.debug('navs =>');
    console.debug(navs);
    return navs;
};