import React, { Component } from "react";
import { linkColStyle, favoriteLinkStyle, favoriteListStyle } from "../../css/sidebar-css";
import { Row, Col, UncontrolledTooltip, Container, Button } from "reactstrap";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.removeFavorite = this.removeFavorite.bind(this);
  }

  removeFavorite(fav) {
    const favorite = this.props.favorites.filter(option => option.id == fav.id);
    const favorites = this.props.favorites.filter(option => option.id !== fav.id);
    this.props.setFavorite(favorites,favorite,0);
  }

  render() {
    const { favorites } = this.props;
    let displayFavorites = favorites.sort().map(item => {
      return (
        <Row key={item.label} className="selected" key={item.id}>
          <Col style={linkColStyle}>
            <Button color="link" className="d-block p-0" id={`jumpto-${item.id}`} onClick={() => item.type === "externallink" && item.href
                  ? window.open(item.href, "_blank") : this.props.renderApplication(item)}>
              {item.label.length <= 30 ? item.label : item.label.substring(0,27)+'...'}
            </Button>
            <UncontrolledTooltip placement="top" target={`jumpto-${item.id}`}>
              Jump to {item.label}
            </UncontrolledTooltip>
          </Col>
          <Col sm="2">
            <Button id={`markas-${item.id}`} close onClick={e => this.removeFavorite(item)} />
            <UncontrolledTooltip placement="right" target={`markas-${item.id}`}>
              <span> Remove {item.label} from favorites </span>
            </UncontrolledTooltip>
          </Col>
        </Row>
      );
    });

    function compare(a, b) {
      // Use toUpperCase() to ignore character casing
      const keyA = a.key.toUpperCase();
      const keyB = b.key.toUpperCase();

      let comparison = 0;
      if (keyA > keyB) {
        comparison = 1;
      } else if (keyA < keyB) {
        comparison = -1;
      }
      return comparison;
    }

    displayFavorites = displayFavorites.sort(compare);

    return (
      <Row>
        <Col className="sidebar">
          <p style={favoriteLinkStyle}> <span style={{fontSize:'125%'}}>Favorite Links</span></p>
          {displayFavorites ? <Container style={favoriteListStyle}>{displayFavorites.sort()}</Container> : <p> None</p>}
        </Col>
      </Row>
    );
  }
}

export default Sidebar;
