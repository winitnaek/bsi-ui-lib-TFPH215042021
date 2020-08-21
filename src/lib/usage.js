import React, { Component } from "react";
import {Col, Collapse, Button} from "reactstrap";

class Usage extends Component {
    constructor(props) {
        super(props);
        console.log("this.props.recentUsage");
        console.log(this.props.recentUsage);
        this.state = {
            isOpen:false,
            recentUsage: []
        }
        this.toggle = this.toggle.bind(this);
      }

    componentDidMount() {
        /*this.props.recentUsage.getUsageData(this.props.pgid,this.props.formValues.data,this.props.mode)
        .then((recentUsage) =>{
            this.setState({
                recentUsage: recentUsage
            })
        })*/
        this.props.recentUsage(
            this.props.pgid,
            this.props.data,
            this.props.mode
          )
          .then(recentUsage=> {
            console.log("recentUsage");
            console.log(recentUsage);
            this.setState({
                recentUsage: recentUsage
            })
          })
          .catch((error) => {
            throw error;
          });
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    handleLink(data) {
        renderTFApplication("pageContainer", data);
        this.props.close();
    }

    render() {
        const {tftools} = this.props;
        const {isOpen, recentUsage} = this.state;
        let usageDataInfo = null;

        if (recentUsage && recentUsage.usageDataPages && recentUsage.usageDataPages.length > 0) {
          usageDataInfo = (
            <div>
              <span>
                This  {this.props.pgtitle} is being used in the following contexts:{" "}
              </span>
              <ul>
                {recentUsage &&
                  recentUsage.usageDataPages &&
                  recentUsage.usageDataPages.map((item, key) => {
                    for (let x in tftools) {
                      if (tftools[x].id == item.pageId) {
                        return (
                          <li>
                            <a href="#" onClick={() => this.handleLink(tftools[x])}>
                              {tftools[x].label}
                            </a>
                          </li>
                        );
                      }
                    }
                  })}
              </ul>
            </div>
          );
        } else {
          usageDataInfo = (
            <div>
              <span>This {this.props.pgtitle} is not being used.</span>
            </div>
          );
        }
        return (
        <Col>
        {recentUsage && (
            <div>
            <Button color="link" onClick={this.toggle} style={{marginTop: 8, paddingLeft: 0}}>Usage 
                {!isOpen && <i class="fas fa-caret-right" style = {{marginTop:8, paddingLeft:4}}/>}
                {isOpen && <i class="fas fa-caret-down" style = {{marginTop:8, paddingLeft:4}} />}
            </Button>
            <Collapse isOpen={isOpen}>
                 {usageDataInfo}
            </Collapse>
            </div>
        )}
        </Col>
        )
    }
}
export default Usage;
