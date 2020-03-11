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

  handleOnChange(i, e) {
    e.persist();
    let songData = Object.assign({}, this.state.songData);
    songData.fields[i] = e.target.value;
    this.setState({songData});
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('component update')
    if (nextState.songData !== undefined) {
      setWords(nextState.songData.fields[0]);
    }
    if (nextProps.songData !== this.props.songData) {
      console.log('prop change')
      this.setState({songData: nextProps.songData});
    }
  }

  render() {

    const songData = this.state.songData;
    if (songData === undefined) return null;

    return (
      <main>

        <div className="root" >
        <form>
        <FormControl >
         
          {songData.fields.map((f, i) => {

            if (f === undefined || f.length === 0) return null;

            return (

              <TextField className="verse" id={songData.ids[i]} key={i}
                label={songData.names[i]} multiline rows="1" rowsMax="20"
                variant="outlined" name={songData.names[i]}
                value={f}
                onChange={this.handleOnChange.bind(this, i)}/>);
          })}

        </FormControl>
        </form>
        </div>
      </main>
    );
  }
}
