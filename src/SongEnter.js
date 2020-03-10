import React, {Component} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const electron = window.require('electron');
const {setWords} = electron.remote.require('./electron-starter.js');
const path = require('path');

export default class SongEnter extends Component {

  state = {verse1: ''};

  handleOnChange(e) {
    e.persist();
    this.setState({[e.target.id]: e.target.value});
  }

  componentWillUpdate(nextProps, nextState) {
    setWords(nextState.verse1);
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
