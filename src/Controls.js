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

  state = {show: true, webcam: false};

  handleChange(e) {
    if (e) {
      console.log('checkbox change', e.target.checked);
      this.setState({show: e.target.checked});
      if (!e.target.checked) {this.props.deselectPlan();}
      else {this.props.setDisplay();}
    }
  }

  handleWebcam(e) {
    if (e) {
      console.log('webcam change', e.target.checked);
      this.setState({webcam: e.target.checked});
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.show != this.state.show) {
        console.log('setShow', nextState.show);
        window.setShow(nextState.show);
      }
   if (nextState.webcam != this.state.webcam) {
        console.log('webcam', nextState.webcam);
        window.setWebcam(nextState.webcam);
      }
  }

  componentDidMount() {
    console.log('hide display');
    window.hideDisplay = redisplay => {
      this.setState({show: false});
      this.props.deselectPlan(redisplay);
      if (redisplay) {
        window.setShow(true);
        this.setState({show: true});
      }
    };
    window.showDisplay = () => {
      window.setShow(true);
      this.setState({show: true});
    };
    window.setControls = () => {
      window.setWebcam(this.state.webcam);
    };
    window.setShow(this.state.show);
    window.setInitialWebcam = val => {
      if (typeof val == 'boolean') {
        this.setState({webcam: val});
      }
    };
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

            <FormControlLabel
              control={
                <Checkbox
                checked={this.state.webcam}
                onChange={e => this.handleWebcam(e)}
                value="show"
                color="primary"
                style={{color: this.props.colorTheme === 'Dark' ? '#fff' : '#000'}}
              />
              }
              style={{color: this.props.colorTheme === 'Dark' ? '#fff' : '#000'}}
              label="Webcam"
            />
         </ThemeProvider>
         </Tooltip>
       </FormGroup>
      
       </Paper>
      
      </main>
    );
  }
}
