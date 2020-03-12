import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SongEnter from './SongEnter';
import SongList from './SongList';
import Controls from './Controls';
import Plan from './Plan';
import Grid from '@material-ui/core/Grid';

const electron = window.require('electron');
const {getSongs, setSong} = electron.remote.require('./electron.js');

class App extends Component {

  state = {songList: [], songData: undefined};

  updateSong(songData) {
    console.log('app update song');
    this.setState({songData});
  }

  componentDidMount() {
    getSongs(songList => {
      this.setState({songList});
    });
  }

  render() {
    return (
      <div className="App">

      <Grid container spacing={3}>
      <Grid item xs={6}>
        <SongEnter songData={this.state.songData}/>
      </Grid>
      <Grid item xs={6}>
     
      <Grid container
        direction="column"
        justify="flex-start"
        alignItems="stretch" spacing={3}>

       <Grid item xs={12}>
          <Controls/>
        </Grid>

        <Grid item xs={12}>
          <Plan/>
        </Grid>

        <Grid item xs={12}></Grid>
          <SongList
            songList={this.state.songList}
            updateSong={this.updateSong.bind(this)}/>
        </Grid>

      </Grid>

      </Grid>
      </div>
    );
  }
}

export default App;
