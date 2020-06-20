

import React, {Component} from 'react'
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import {
  IconButton
} from "@material-ui/core";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import BookmarkIcon from '@material-ui/icons/Bookmark';

const styles = {
    paper: {
      width: '100%',
      marginBottom: '10px',
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  };

export default class WebPage extends Component {

  state = {
    url: this.props.url,
    title: ''
  };

  inputref = undefined;

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.url != this.props.url) {
      this.setState({url: nextProps.url});
    }
  }

  componentDidMount() {
    window.updateTitle = title => {
      this.setState({title});
    };
  }

  render() {
    if (!this.state.url) return null;
    return (

        <Paper style={styles.paper}>
          <div style={{paddingTop: '50px', paddingBottom: '50px', padding: '20px'}}>

            <Tooltip title="Bookmarked Address">
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Web Page Address"
              fullWidth
              value={this.state.url}
              inputRef={x => this.inputref = x}
              onChange={e => {
                this.setState({url: e.target.value});
              }}
              onFocus={e => this.props.handleEditing(true)}
              onBlur={
                e => {
                  if (this.state.url != this.props.url) {
                    this.props.handleEditing(false);
                    this.props.updateURL(this.state.url);
                  }
                }
              }
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  this.inputref.blur();
                }
              }}
            />
            </Tooltip>

            </div>

            <Tooltip title="Navigate Back">
            <IconButton onClick={()=>window.goBack()}>
            <NavigateBeforeIcon/>
            </IconButton>
            </Tooltip>

            <Tooltip title="Navigate Forward">
            <IconButton onClick={()=>window.goForward()}>
            <NavigateNextIcon/>
            </IconButton>
            </Tooltip>

            <Tooltip title="Bookmark current page">
            <IconButton onClick={() =>{
                console.log('***URL=', window.getURL());
                const url = window.getURL();
                this.props.updateURL(url);
              }
              }>
            <BookmarkIcon/>
            </IconButton>
            </Tooltip>

            <div style={{padding: '20px'}}>
            {this.state.title ? this.state.title : null}
            </div>
        </Paper>

    );
  }
}
