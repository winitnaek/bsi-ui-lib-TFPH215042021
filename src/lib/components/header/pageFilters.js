import React, { Fragment } from 'react';
import FilterValues from "./filterValues";
import {Col} from "reactstrap";


export default class PageFilters extends React.Component {
    render() {
        const {metadata,styles,fieldData,formFilterData} = this.props;
        const {isfilter,parentConfig} = metadata.griddef;
        return (
            <Col>
                {isfilter ? (
                <FilterValues
                    style={styles}
                    fieldData={
                        parentConfig && parentConfig.griddef ? 
                        parentConfig.griddef.columns : fieldData
                    }
                    formFilterData={formFilterData}
                />
                ) : null}
            </Col>
        )
    }
}
