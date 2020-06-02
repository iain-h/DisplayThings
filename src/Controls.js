import React, {Component} from 'react'

import {Checkbox, FormGroup, FormControlLabel} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';

export default class Controls extends Component {

  state = {show: false};

  handleChange(event) {
    this.setState({show: event.target.checked});
  }

  componentWillUpdate(nextProps, nextState) {
    window.setShow(nextState.show);
    
  }

  componentDidMount() {
    window.hideDisplay = () => {this.setState({show: false})};
  }

  render() {
    return (
      <main>
        <Paper style={{paddingLeft: '16px', marginBottom: '20px'}}>
      <FormGroup row>
        <Tooltip title="Display on the second screen">
            <FormControlLabel
              control={
                <Checkbox
                checked={this.state.show}
                onChange={this.handleChange.bind(this)}
                value="show"
                color="primary"
              />
              }
              label="Show"
            />
         </Tooltip>
       </FormGroup>
       </Paper>
      </main>
    );
  }
}
