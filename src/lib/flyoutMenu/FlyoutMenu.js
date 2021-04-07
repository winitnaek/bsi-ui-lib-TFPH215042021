import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import Section from "./Section";
import Sidebar from "./Sidebar";

class FlyoutMenu extends Component {
  render() {
    const { showSideMenu, options, favorites = [], setFavorite, renderApplication, sectionLayout } = this.props;
    return (
      <Row style={{ height: '100%'}}>
        {showSideMenu ? (
          <Col xs="3" className="border-right border-dark">
            <Sidebar renderApplication={renderApplication} favorites={favorites} setFavorite={setFavorite} />
          </Col>
        ) : null}
        <Col>
          <Row>
            {sectionLayout.map(sections => {
              return (
                <Col style={{ maxWidth: "33.3%" }}>
                  {sections.map(section => (
                    <Section
                      favorites={favorites}
                      options={options}
                      renderApplication={renderApplication}
                      setFavorite={setFavorite}
                      {...section}
                    />
                  ))}
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>
    );
  }
}

export default FlyoutMenu;
