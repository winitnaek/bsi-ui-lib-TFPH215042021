import React, { Component, Fragment } from "react";
import { Button } from "reactstrap";
import { star, goldStar, buttonColStyle } from "../../css/sidebar-css";

class Section extends Component {
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
    const favorites = this.props.favorites.filter(option => option.id !== fav.id);
    this.props.setFavorite(favorites);
  }

  GetSortOrder(prop) {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return 1;
      } else if (a[prop] < b[prop]) {
        return -1;
      }
      return 0;
    };
  }

  render() {
    const { sectionHeader, section, renderApplication, options, favorites, sectionIcon, from, to } = this.props;
    let sectionOptions = options.filter(option => section === option.section);

    if (from !== undefined) {
      if (to !== undefined) {
        sectionOptions = sectionOptions.slice(from, to);
      } else {
        sectionOptions = sectionOptions.slice(from);
      }
    }

    return (
      <div>
        <p className="mb-1 mt-2">
          {sectionHeader ? (
            <Fragment>
              <i class={`fas fa-${sectionIcon}`} aria-hidden="true"></i> {sectionHeader}
            </Fragment>
          ) : null}
        </p>
        {sectionOptions.sort(this.GetSortOrder("label")).map(option => (
          <div className="d-flex menu-link">
            {favorites.some(fav => fav.id === option.id) ? (
              <button className="fav-icon" style={buttonColStyle} onClick={e => this.setUnFavorite(option)}>
                <i class="far fa-star fav" style={goldStar}></i>
              </button>
            ) : (
              <button className="fav-icon" style={buttonColStyle} onClick={e => this.setFavorite(option)}>
                <i class="far fa-star" style={star}></i>
              </button>
            )}

            <Button
              color="link"
              onClick={() =>
                option.type === "externallink" && option.href
                  ? window.open(option.href, "_blank")
                  : renderApplication(option)
              }
              className="d-block p-0"
              style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {option.label}
            </Button>
          </div>
        ))}
      </div>
    );
  }
}

export default Section;
