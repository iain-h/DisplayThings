import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SongEnter from './SongEnter';

import Controls from './Controls';
import Plan from './Plan';
import Grid from '@material-ui/core/Grid';
import Mousetrap from 'mousetrap';
import FlexSearch from 'flexsearch';

const keyCodeMap = {
  down: [40], up: [38], 
  1: [49,97], 2: [50,98], 3: [51,99], 4: [52,100], 5: [53,101], 6: [54,102], 7: [55,103], c: [67]};

class App extends Component {

  state = {songList: [], songData: undefined, plan: []};
  searchIndex = new FlexSearch({
    threshold: 7,
    depth: 3
  });
  editing=false;
  resetSong=undefined;

  keyMap = {};

  updateSong(songData) {
    console.log('app update song');
    this.setState({songData});
    if (this.resetSong) {
      this.resetSong();
    }
  }

  setResetCallback(callback) {
    this.resetSong = callback;
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
    const codes = keyCodeMap[key];
    if (codes) {
      codes.forEach(code => this.keyMap[code] = callback);
      this.keyMap[key] = callback;
    }
  }

  doKey(which) {
    const callback = this.keyMap[which];
    if (callback) {
      callback();
    }
  }

  render() {
    return (
      <div onKeyDownCapture = {e => {
        if (this.editing) return;
        const callback = this.keyMap[e.which];
        if (callback) {
          callback(e);
        }
      }} className="App">

      <div style={{position: 'absolute', padding: '20px', top: '0px', left: '0px', height: '100%', right: '420px', overflowY: 'auto'}}>

      
        <SongEnter 
          mousetrap={this.mousetrap.bind(this)}
          songData={this.state.songData}
          setResetCallback={this.setResetCallback.bind(this)}/>
      </div>
     
      <div style={{position: 'absolute', padding: '20px', top: '0px', right: '0px', height: '100%', width: '400px', overflowY: 'auto'}}>

        <Controls/>
        <Plan 
          plan={this.state.plan}
          setPlan={plan => this.setState({plan})}
          songList={this.state.songList}
          searchIndex={this.searchIndex}
          updateSong={this.updateSong.bind(this)}
          handleEditing={editing => {this.editing = editing;}}
          addToPlan={item =>{
            const plan2 = Array.from(this.state.plan);
            plan2.push(item);
            this.setState({plan: plan2})
            }}
          
          />

      </div>
      </div>
    );
  }
}

export default App;
