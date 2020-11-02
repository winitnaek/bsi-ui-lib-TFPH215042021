import React, { Component } from "react";
import { link, rowStyle, selectStyle, star, goldStar, buttonColStyle } from "../../css/sidebar-css";
import { Row, FormGroup, Col, UncontrolledTooltip } from "reactstrap";
import Select from "react-select";

class Search extends Component {
  constructor() {
    super();
    this.setFavorite = this.setFavorite.bind(this);
    this.setUnFavorite = this.setUnFavorite.bind(this);
  }

  setFavorite(fav) {
    if (!this.props.favorites.some(favItem => favItem.id === fav.id)) {
      this.props.setFavorite([...this.props.favorites, fav]);
    }
  }

  setUnFavorite(fav) {
    const favorite = this.props.favorites.filter(option => option.id !== fav.id);
    this.props.setFavorite(favorite);
  }

  render() {
    const { options, favorites, renderApplication } = this.props;
    const Option = props => {
      const { data } = props;
      if (data.link) {
        return (
          <Row key={data.id} style={rowStyle}>
            <Col className="p-0 text-left">
              <div className="mylink" style={link}>
                {favorites.some(fav => fav.id === data.id) ? (
                  <button className="fav-icon" style={buttonColStyle} onClick={e => this.setUnFavorite(data)}>
                    <i class="far fa-star fav" style={goldStar}></i>
                  </button>
                ) : (
                  <button className="fav-icon" style={buttonColStyle} onClick={e => this.setFavorite(data)}>
                    <i class="far fa-star" style={star}></i>
                  </button>
                )}
                <span id={`jumpto-${data.value}`} onClick={e => renderApplication(data)}>
                  {data.label}
                </span>
                <UncontrolledTooltip placement="right" target={`jumpto-${data.value}`}>
                  Jump to {data.label}
                </UncontrolledTooltip>
              </div>
            </Col>
          </Row>
        );
      }
      return null;
    };

    return (
      <FormGroup
        style={{ zIndex: 999, position: "relative", display: "inline-block", minWidth: "50%" }}
        className="m-0"
      >
        <Select
          singleValue
          isSearchable
          placeholder="Search Links"
          options={options}
          style={selectStyle}
          components={{ Option }}
        />
      </FormGroup>
    );
  }
}

export default Search;
