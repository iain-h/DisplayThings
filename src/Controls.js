import React, {Component} from 'react'

import {Checkbox, FormGroup, FormControlLabel} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

export default class Controls extends Component {

  state = {show: false};

  handleChange(event) {
    this.setState({show: event.target.checked});
  }

  componentWillUpdate(nextProps, nextState) {
    window.setShow(nextState.show);
  }

  render() {
    return (
      <main>
        <Paper style={{paddingLeft: '16px', marginBottom: '20px'}}>
      <FormGroup row>
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
       </FormGroup>
       </Paper>
      </main>
    );
  }
}
