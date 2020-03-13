import React, {Component} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Mousetrap from 'mousetrap';

export default class SongEnter extends Component {

  state = {
    songData: this.props.songData
  };

  line = 0;
  field = 0;
  orderIdx = 0;

  componentDidMount() {
    Mousetrap.bind('down', e => {
      e.preventDefault();
      console.log('down');
      this.nextLines();
    });
    Mousetrap.bind('up', e => {
      e.preventDefault();
      console.log('up');
      this.prevLines();
    });
  }

  getOrderField() {
    if (!this.state.songData) return '#1';
    return this.state.songData.fields[
      this.state.songData.ids.indexOf('#O')] || '#1';
  }

  setOrderIndex(orderIdx) {
    if (!this.state.songData) return;
    const orderField = this.getOrderField();
    console.log(orderField, orderIdx);
    if (orderIdx < orderField.length) {
      console.log('orderIdx', orderIdx);
      const id = '#' + orderField.charAt(orderIdx).toUpperCase();
      this.line = 0;
      this.orderIdx = orderIdx;
      this.field = this.state.songData.ids.indexOf(id);
    }
  }

  getField(songData) {
    if (songData === undefined) return '';
    return songData.fields[this.field] || '';
  }

  nextField() {
    console.log('next field');
    const orderField = this.getOrderField();
    let nextIdx = this.orderIdx += 1;
    if (nextIdx >= orderField.length) {
      nextIdx = 0;
    }
    this.setOrderIndex(nextIdx);
  }

  prevField() {
    console.log('prev field');
    const orderField = this.getOrderField();
    let prevIdx = this.orderIdx -= 1;
    if (prevIdx < 0) {
      prevIdx = orderField.length - 1;
    }
    this.setOrderIndex(prevIdx);
  }

  nextLines() {
    let fieldLines = this.getField(this.state.songData).split('\n');
    this.line += 2;
    if (this.line >= fieldLines.length) {
      this.nextField();
      fieldLines = this.getField(this.state.songData).split('\n');
    }
    window.setWords(fieldLines.slice(this.line, this.line+2).join('\n'));
  }

  prevLines() {
    let fieldLines = this.getField(this.state.songData).split('\n');
    this.line -= 2;
    if (this.line < 0) {
      this.prevField();
      fieldLines = this.getField(this.state.songData).split('\n');
      const remain = fieldLines.length % 2;
      console.log('remain', remain)
      this.line = fieldLines.length - (remain === 0 ? 2 : remain);
      console.log('line', this.line)
    }
    window.setWords(fieldLines.slice(this.line, this.line+2).join('\n'));
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
      const fieldLines = this.getField(nextState.songData).split('\n');
      console.log(this.getField());
      window.setWords(fieldLines.slice(this.line, this.line+2).join('\n'));
    }
    if (nextProps.songData !== this.props.songData) {
      console.log('prop change')
      this.setOrderIndex(0);
      this.setState({songData: nextProps.songData});
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
