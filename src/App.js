import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SongEnter from './SongEnter';
import SongList from './SongList';
import Controls from './Controls';

const electron = window.require('electron');
const {getSongs, setSong} = electron.remote.require('./electron.js');

class App extends Component {

  state = {songList: [], songData: {verses: ['la La la']}};

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
        <SongEnter songData={this.state.songData}/>
        <Controls/>
        <SongList
          songList={this.state.songList}
          updateSong={this.updateSong.bind(this)}/>
      </div>
    );
  }
}

export default App;
