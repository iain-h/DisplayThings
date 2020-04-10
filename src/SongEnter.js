import React, {Component, useCallback} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from "@material-ui/core";
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const getCaretCoordinates = require('textarea-caret');


export default class SongEnter extends Component {

  state = {
    songData: this.props.songData,
    anchorEl: null
  };

  line = 0;
  field = 0;
  orderIdx = 0;
  fieldId = -1;
  nLines = 2;
  textInputs = {'#i': 'blur'};
  started = false;
  editing = false;

  reset() {
    this.line = -this.nLines;
    this.field = 0;
    this.orderIdx = 0;
    this.nextLines();
  }

  componentDidMount() {
    this.props.mousetrap('down', e => {
      if (e) {e.preventDefault();}
      console.log('down');
      this.nextLines();
    });

    const ids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'c', 'b'];

    ids.forEach( id => {
      this.props.mousetrap(id, e => {
        if (this.editing) return;
        if(!this.state.songData) return;
        if (e) {e.preventDefault();}
        console.log('pressed', id);
        this.line = 0;
        this.fieldId = `#${id.toUpperCase()}`;
        this.field = this.state.songData.ids.indexOf(this.fieldId);
        this.orderIdx = this.getOrderField().indexOf(id.toUpperCase());
        this.started = true;
        console.log(this.field,  this.orderIdx);
        this.highlightLines();
      });

    });

    this.props.mousetrap('up', e => {
      if (e) {e.preventDefault();}
      console.log('up');
      if (this.started) {
        this.prevLines();
      } else {
        this.highlightLines();
        this.started = true;
      }
    });

    //window.addEventListener('resize', () => {this.updateDot();});

    this.props.setResetCallback(this.reset.bind(this));
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
    const rect2 = this.textInputs['#O'].parentElement.parentElement.parentElement.getBoundingClientRect();
    const x = rect.left - rect2.left;
    const y = rect.top - rect2.top;

    dot.style.top = (p1.top + y ) + "px";
    dot.style.left = (p1.left + x ) + "px";
    dot.style.width = (p2.left - p1.left) + "px";
    dot.style.height = p1.height - 2 + "px";
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

    let id;
    if (this.orderIdx == -1) {
      id = this.fieldId;
    } else {
      const orderField = this.getOrderField();
      id = '#' + orderField.charAt(this.orderIdx).toUpperCase();
    }
    
    if (id != -1 && this.textInputs[id]) {
      this.textInputs[id].setSelectionRange(count1, count2);
      this.textInputs[id].focus();
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
    if (nextProps.reset !== undefined) {
      this.reset();
      this.props.reset = undefined;
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

  handleClick(event) {
    this.setState({anchorEl: event.currentTarget});
  }

  handleClose(id) {
    if (id) {
      let songData = Object.assign({}, this.state.songData);
      songData.hasField[id] = true;
      this.setState({anchorEl: null, songData});
    } else {
      this.setState({anchorEl: null});
    }
  }

  render() {

    const songData = this.state.songData;
    if (songData === undefined) return null;
    this.updateDot();

    return (
      <main>
       
        <div id="songEnterRoot" className="root">
        <Grid container alignItems="stretch" direction="row" spacing={2} justify="flex-start"
        style={{
          margin: 0,
          width: '100%',
        }}>
      
          {songData.ids.filter((id, i) => {

            const f = songData.fields[i];
            return songData.hasField[id] || (f !== null && f !== undefined && f.length !== 0);

          }).map(id => {

            const idx = songData.ids.indexOf(id);
            const f = songData.fields[idx];
            const name = songData.names[idx];

            return (
              <Grid item xs={6} flex-grow={1} key={id}>
                <div>
                {id === '#O' ?
                (<div id="dot" style={{
                  position: 'relative',
                  top: '-10px',
                  left: '-10px',
                  width: '4px',
                  height: '2px',
                  borderBottom: '2px solid black',
                  backgroundColor: '#FF0'
                  }}></div>) : null}
              <TextField className="field" id={id} 
                inputRef={x => this.textInputs[id] = x}
                label={name} multiline rows="1" rowsMax="20"
                variant="outlined" name={name}
                value={f}
                onKeyDownCapture={e => {
                  if (!this.editing) {
                    e.preventDefault();
                  }
                }}
                onBlur={e => {this.editing = false;}}
                onClick={e => {this.editing = true;}}
                onChange={this.handleOnChange.bind(this, idx)}>
                </TextField>
                </div>
                </Grid>
                );
          })}
      
        </Grid>

        <Tooltip title="Add a field">
        <IconButton onClick={this.handleClick.bind(this)}>
          <AddIcon/>
        </IconButton>
        </Tooltip>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose.bind(this)}
        >
          {
          songData.ids.map((id, i) => {

            const f = songData.fields[i];
            if (!songData.hasField[id] && (f === null || f === undefined || f.length === 0)) {
              return (<MenuItem onClick={this.handleClose.bind(this, id)} key={id}>{songData.names[i]}</MenuItem>);
            }
            return null;

          })
          }
        </Menu>
        
        </div>
      </main>
    );
  }
}
