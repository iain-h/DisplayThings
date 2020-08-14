import React, {Component} from 'react'

import {Checkbox, FormGroup, FormControlLabel} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import { createMuiTheme, ThemeProvider  } from '@material-ui/core/styles';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    background: '#000',
  },
});
const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    background: '#fff',
  },
});

export default class Controls extends Component {

  state = {show: true};

  handleChange(e) {
    if (e) {
      console.log('checkbox change', e.target.checked);
      this.setState({show: e.target.checked});
      if (!e.target.checked) {this.props.deselectPlan();}
      else {this.props.setDisplay();}
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
    window.setShow(true);
  }

  render() {
    return (
      <main>
         
        <Paper style={{
          paddingLeft: '16px',
          marginBottom: '20px',
          background: this.props.colorTheme === 'Dark' ? '#000' : '#fff'}}>
        
      <FormGroup row>
        <Tooltip title="Display on the second screen">
        <ThemeProvider theme={this.props.colorTheme === 'Dark' ? darkTheme : lightTheme}>
            <FormControlLabel
              control={
                <Checkbox
                checked={this.state.show}
                onChange={e => this.handleChange(e)}
                value="show"
                color="primary"
                style={{color: this.props.colorTheme === 'Dark' ? '#fff' : '#000'}}
              />
              }
              style={{color: this.props.colorTheme === 'Dark' ? '#fff' : '#000'}}
              label="Show"
            />
         </ThemeProvider>
         </Tooltip>
       </FormGroup>
      
       </Paper>
      
      </main>
    );
  }
}
