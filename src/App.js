import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SongEnter from './SongEnter';
import SongList from './SongList';
import Controls from './Controls';
import Plan from './Plan';
import Grid from '@material-ui/core/Grid';
import Mousetrap from 'mousetrap';
import FlexSearch from 'flexsearch';

const keyCodeMap = {down: 40, up: 38};

class App extends Component {

  state = {songList: [], songData: undefined};
  searchIndex = new FlexSearch({
    threshold: 7,
    depth: 3
  });

  keyMap = {};

  updateSong(songData) {
    console.log('app update song');
    this.setState({songData});
  }

  componentDidMount() {
    window.getSongs(songList => {
      this.searchIndex.clear();
      songList.forEach((song, i) => this.searchIndex.add(i, song.search));
      this.setState({songList});
    });
  }

  mousetrap(key, callback) {
    Mousetrap.bind(key, callback);
    this.keyMap[keyCodeMap[key]] = callback;
  }

  render() {
    return (
      <div onKeyDownCapture = {e => {
        const callback = this.keyMap[e.which];
        if (callback) {
          e.preventDefault();
          callback(e);
        }
      }} className="App">

      <Grid container spacing={3}>
      <Grid item xs={6}>
        <SongEnter mousetrap={this.mousetrap.bind(this)} songData={this.state.songData}/>
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
            searchIndex={this.searchIndex}
            updateSong={this.updateSong.bind(this)}/>
        </Grid>

      </Grid>

      </Grid>
      </div>
    );
  }
}

export default App;
