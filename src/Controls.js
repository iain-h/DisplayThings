import React, {Component} from 'react'

import {Checkbox, FormGroup, FormControlLabel} from '@material-ui/core';

const electron = window.require('electron');
const {setShow} = electron.remote.require('./electron-starter.js');


export default class Controls extends Component {

  state = {show: false};

  handleChange(event) {
    this.setState({show: event.target.checked});
  }

  componentWillUpdate(nextProps, nextState) {
    setShow(nextState.show);
  }

  render() {
    return (
      <main>
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

      </main>
    );
  }
}
