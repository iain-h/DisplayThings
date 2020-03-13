import React, {Component} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

const electron = window.require('electron');
const {setWords} = electron.remote.require('./electron.js');
const path = require('path');

export default class SongEnter extends Component {

  state = {
    songData: this.props.songData
  };

  lines = [0, 1];
  field = 0;
  orderIdx = 0;

  getOrderField(songData) {
    return songData.fields[songData.ids.indexOf('#O')];
  }

  setOrderIndex(orderIdx, songData) {
    const orderField = this.getOrderField(songData);
    if (orderIdx < orderField.length) {
      const id = '#' + orderField[orderIdx];
      this.setState({
        songData,
        lines: [0, 1],
        orderIdx,
        field: songData.ids.indexOf(id)});
    }
  }

  nextField() {
    const orderField = this.getOrderField();
    let nextIdx = this.state.orderIdx += 1;
    if (nextIdx >= orderField.length) {
      nextIdx = 0;
    }
    setOrderIndex(nextIdx, this.state.songData);
  }

  nextLines() {
    let lines = [this.state.lines[1] + 1, this.state.lines[1] + 2];
    const fieldLines = getField().split('\n');

    if (lines[0] >= fieldLines.length) {
      nextField();
    }
  }

  handleOnChange(i, e) {
    e.persist();
    let songData = Object.assign({}, this.state.songData);
    songData.fields[i] = e.target.value;
    this.setState({songData});
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('component update')
    if (nextState.songData !== undefined) {
      const fieldLines = getField().split('\n');
      setWords(nextState.songData.fields[0]);
    }
    if (nextProps.songData !== this.props.songData) {
      console.log('prop change')
      setOrderIndex(orderIdx, nextProps.songData);
    }
  }

  render() {

    const songData = this.state.songData;
    if (songData === undefined) return null;

    return (
      <main>

        <div className="root" >
        <Grid container alignItems="stretch" direction="row" spacing={2}>
      
          {songData.fields.map((f, i) => {

            if (f === undefined || f.length === 0) return null;

            return (
              <Grid item xs={6}>
              <TextField className="field" id={songData.ids[i]} key={i}
                label={songData.names[i]} multiline rows="1" rowsMax="20"
                variant="outlined" name={songData.names[i]}
                value={f}
                onChange={this.handleOnChange.bind(this, i)}/>
                </Grid>
                );
          })}
      
        </Grid>
        </div>
      </main>
    );
  }
}
