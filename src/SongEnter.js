import React, {Component} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;
var runExec = electron.remote.require('./electron-starter.js').runExec;


export default class SongEnter extends Component {

  state = {verse1: ''};

  handleOnChange(e) {
    e.persist();
    this.setState({[e.target.id]: e.target.value});
  }

  componentWillUpdate(nextProps, nextState) {
    runExec(nextState.verse1);
  }

  render() {
    return (
      <main>

        <div className="root" >
        <form>
        <FormControl >
         
          <TextField className="verse" id="verse1" 
              label="Verse 1" multiline rows="5" 
              variant="outlined" name="verse1"
              onChange={this.handleOnChange.bind(this)}/>
         
        </FormControl>
        </form>
        </div>
      </main>
    );
  }
}
