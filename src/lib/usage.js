import React, { Component } from "react";
import {Col, Collapse, Button} from "reactstrap";

class Usage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen:false,
            recentUsage: []
        }
        this.toggle = this.toggle.bind(this);
      }

    componentDidMount() {
        this.props.recentUsage(this.props.pgid)
        .then((recentUsage) =>{
            this.setState({
                recentUsage: recentUsage
            })
        })
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
        return (
        <Col>
        {recentUsage && (
            <div>
            <Button color="link" onClick={this.toggle} style={{marginTop: 8, paddingLeft: 0}}>Usage 
                {!isOpen && <i class="fas fa-caret-right" style = {{marginTop:8, paddingLeft:4}}/>}
                {isOpen && <i class="fas fa-caret-down" style = {{marginTop:8, paddingLeft:4}} />}
            </Button>
            <Collapse isOpen={isOpen}>
                    <div>
                        <span>This company is being used in the following contexts: </span>
                        <ul>
                            {recentUsage.map((item,key) => {
                                for (let x in tftools) {
                                    if (tftools[x].id == item) {
                                        return (  
                                            <li>
                                                <a href="#" onClick={() => this.handleLink(tftools[x])}>{tftools[x].label}</a>
                                            </li>
                                        )
                                    }
                                } 
                            })}
                        </ul>
                    </div>
            </Collapse>
            </div>
        )}
        </Col>
        )
    }
}
export default Usage;
