import React, {Component} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const electron = window.require('electron');
const {setWords} = electron.remote.require('./electron.js');
const path = require('path');

export default class SongEnter extends Component {

  state = {songData: this.props.songData};

  handleOnChange(e) {
    e.persist();
    this.setState({songData: {verses: [e.target.value]}});
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('component update')
    setWords(nextState.songData.verses[0]);
    if (nextProps.songData !== this.props.songData) {
      console.log('prop change')
      this.setState({songData: nextProps.songData});
    }
  }

  render() {
    console.log('render update', this.props.songData.verses[0])
    return (
      <main>

        <div className="root" >
        <form>
        <FormControl >
         
          <TextField className="verse" id="v1" 
              label="Verse 1" multiline rows="5" 
              variant="outlined" name="verse1"
              value={this.state.songData.verses[0]}
              onChange={this.handleOnChange.bind(this)}/>
         
        </FormControl>
        </form>
        </div>
      </main>
    );
  }
}
