import React, { Component } from "react";
import { Row, Col, Button } from "reactstrap";
import FlyoutMenu from "./FlyoutMenu";
import Search from "./Search";

class SearchBar extends Component {
  constructor() {
    super();
    this.state = {
      isOpen: false
    };
    this.toggle = this.toggle.bind(this);
    this.renderApplication = this.renderApplication.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  renderApplication(data) {
    this.setState({
      isOpen: false
    });
    this.props.renderApplication(data);
  }
  render() {
    const { options, favorites, title, setFavorite, sectionLayout } = this.props;
    const { isOpen } = this.state;
    return (
      <div style={{ position: "relative", zIndex: 200 }}>
        <Row className="p-2 mb-3" style={{ borderBottom: "0px solid #003764" }}>
          <Col className='text-center p-2'>
            <Button color="link" onClick={this.toggle}>
              <span className="d-inline-block mr-1"> {title} </span>
              <i className={`fas fa-caret-${isOpen ? "up" : "down"}`} aria-hidden="true"></i>
            </Button>
            <Search
              favorites={favorites}
              options={options}
              renderApplication={this.renderApplication}
              setFavorite={setFavorite}
            />
          </Col>
        </Row>
        {isOpen ? (
          <div
            className="modal-content"
            style={{
              position: "absolute",
              zIndex: 99,
              top: "55px",
              left: "0",
              height: "700px",
              overflowY: "auto"
            }}
          >
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={this.toggle}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row" style={{ height: '100%' }}>
                <div className="col">
                  <FlyoutMenu
                    favorites={favorites}
                    options={options}
                    setFavorite={setFavorite}
                    renderApplication={this.renderApplication}
                    sectionLayout={sectionLayout}
                    showSideMenu
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default SearchBar;
