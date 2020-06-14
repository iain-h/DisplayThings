import React, {Component} from 'react'

import {Checkbox, FormGroup, FormControlLabel} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';

export default class Controls extends Component {

  state = {show: false};

  handleChange(e) {
    if (e) {
      console.log('checkbox change', e.target.checked);
      this.setState({show: e.target.checked});
      if (!e.target.checked) {this.props.deselectPlan();}
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.show != this.state.show) {
        console.log('setShow', nextState.show);
        window.setShow(nextState.show);
      }
  }

  componentDidMount() {
    console.log('hide display');
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
                onChange={e => this.handleChange(e)}
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
