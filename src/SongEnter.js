import React, {Component} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
const getCaretCoordinates = require('textarea-caret');

export default class SongEnter extends Component {

  state = {
    songData: this.props.songData
  };

  line = 0;
  field = 0;
  orderIdx = 0;
  nLines = 2;
  textInputs = {'#i': 'blur'};
  started = false;
  editing = false;

  componentDidMount() {
    this.props.mousetrap('down', e => {
      e.preventDefault();
      console.log('down');
      if (this.started) {
        this.nextLines();
      } else {
        this.highlightLines();
        this.started = true;
      }
    });

    const ids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'c', 'b'];

    ids.forEach( id => {
      this.props.mousetrap(id, e => {
        if (this.editing) return;
        if(!this.state.songData) return;
        e.preventDefault();
        console.log('pressed', id);
        this.line = 0;
        this.field = this.state.songData.ids.indexOf(`#${id.toUpperCase()}`);
        this.orderIdx = this.getOrderField().indexOf(id.toUpperCase());
        this.started = true;
        console.log(this.field,  this.orderIdx);
        this.highlightLines();
      });

    });

    this.props.mousetrap('up', e => {
      e.preventDefault();
      console.log('up');
      if (this.started) {
        this.prevLines();
      } else {
        this.highlightLines();
        this.started = true;
      }
    });

    window.addEventListener('resize', () => {this.updateDot();});
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
    this.line += this.nLines;
    if (this.line >= fieldLines.length) {
      this.nextField();
      fieldLines = this.getField(this.state.songData).split('\n');
    }

    console.log('field', this.field, 'line', this.line, 'orderidx', this.orderIdx);

    this.highlightLines(fieldLines);
  }

  updateDot() {
    window.requestAnimationFrame(() => {
      this.moveDot();
    });
  }

  moveDot() {
    const dot = document.getElementById('dot');
    if (!dot) return;

    if (!this.textInputs['#O']) {
      dot.style.top = "-10px";
      dot.style.left = "-10px";
      return;
    }
    const p1 = getCaretCoordinates(this.textInputs['#O'], this.orderIdx);
    const p2 = getCaretCoordinates(this.textInputs['#O'], this.orderIdx + 1);
    const rect = this.textInputs['#O'].getBoundingClientRect();

    dot.style.top = (p1.top + rect.top + window.scrollY) + "px";
    dot.style.left = (p1.left + rect.left + window.scrollX) + "px";
    dot.style.width = (p2.left - p1.left) + "px";
    dot.style.height = p1.height + "px";
  }

  highlightLines(fieldLines) {
    fieldLines = fieldLines || this.getField(this.state.songData).split('\n');
    let count1 = 0;
    for (let i=0;i<this.line;++i) {
      count1 += fieldLines[i].length +1;
    }
    let count2 = count1;
    for (let i=0;i<this.nLines;++i) {
      if (this.line + i < fieldLines.length) {
        count2 += fieldLines[this.line + i].length + 1;
      }
    }
    window.setWords(fieldLines.slice(this.line, this.line+this.nLines).join('\n'));

    const orderField = this.getOrderField();
    if (this.orderIdx < orderField.length) {
      const id = '#' + orderField.charAt(this.orderIdx).toUpperCase();
      if (this.textInputs[id]) {
        this.textInputs[id].setSelectionRange(count1, count2);
        this.textInputs[id].focus();
      }
    }

    this.moveDot();
  }

  prevLines() {
    let fieldLines = this.getField(this.state.songData).split('\n');
    this.line -= this.nLines;
    if (this.line < 0) {
      this.prevField();
      fieldLines = this.getField(this.state.songData).split('\n');
      const remain = fieldLines.length % this.nLines;
      this.line = fieldLines.length - (remain === 0 ? this.nLines : remain);
    }
    this.highlightLines(fieldLines);
  }

  handleOnChange(i, e) {
    e.persist();
    let songData = Object.assign({}, this.state.songData);
    songData.fields[i] = e.target.value;
    this.setState({songData});
    this.updateDot();
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('component update')
    if (nextState.songData !== undefined) {
      
    }
    if (nextProps.songData !== this.props.songData) {
      console.log('prop change')
      this.setOrderIndex(0);
      this.setState({songData: nextProps.songData});
      this.started = false;
      window.setWords('');
    }
  }

  componentDidUpdate() {
    this.updateDot();
  }

  render() {

    const songData = this.state.songData;
    if (songData === undefined) return null;
    this.updateDot();

    return (
      <main>

        <div id="songEnterRoot" className="root">
        <Grid container alignItems="stretch" direction="row" spacing={2}>
      
          {songData.fields.map((f, i) => {
            
            if (f === undefined || f.length === 0) return null;

            return (
              <Grid item xs={6}>
              <TextField className="field" id={songData.ids[i]} key={songData.ids[i]}
                inputRef={x => this.textInputs[songData.ids[i]] = x}
                label={songData.names[i]} multiline rows="1" rowsMax="20"
                variant="outlined" name={songData.names[i]}
                value={f}
                onKeyDownCapture={e => {
                  if (!this.editing) {
                    e.preventDefault();
                  }
                }}
                onBlur={e => {this.editing = false;}}
                onClick={e => {this.editing = true;}}
                onChange={this.handleOnChange.bind(this, i)}/>
                
                </Grid>
                );
          })}
      
        </Grid>

        <div id="dot" style={{
          position: 'absolute',
          top: '-10px',
          left: '-10px',
          width: '4px',
          height: '2px',
          borderTop: '2px solid black',
          }}></div>
        </div>
      </main>
    );
  }
}
