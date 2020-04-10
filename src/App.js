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
  1: [49,97], 2: [50,98], 3: [51,99], 4: [52,100], 5: [53,101], 6: [54,102], 7: [55,103], c: [67],
  escape: [27]};

class App extends Component {

  state = {songList: [], songData: undefined, plan: []};
  searchIndex = new FlexSearch({
    threshold: 7,
    depth: 3
  });
  editing=false;
  resetSong=undefined;
  songDatabase={};

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
    window.getSongs(songDatabase => {
      this.songDatabase = songDatabase;
      this.searchIndex.clear();

      const songList = Object.keys(songDatabase);

      songList.forEach((song, i) => this.searchIndex.add(i, song));

      window.loadPlan(plan => {
        this.setState({songList, plan});
      });
    });
    
    window.setKeyDownCallback(which => {
      const callback = this.keyMap[which];
      if (callback) {
        callback();
      }
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

  render() {
    return (
      <div onKeyDownCapture = {e => {
        if (this.editing) return;
        const callback = this.keyMap[e.which];
        if (callback) {
          callback(e);
        }
      }} className="App">

      <div style={{position: 'absolute', top: '0px', paddingTop: '10px', left: '20px', right: '440px', bottom: '0px', overflowY: 'auto'}}>

      
        <SongEnter 
          mousetrap={this.mousetrap.bind(this)}
          songData={this.state.songData}
          setResetCallback={this.setResetCallback.bind(this)}/>
      </div>
     
      <div style={{position: 'absolute', top: '0px', paddingTop: '10px', width: '400px', paddingRight: '20px', right: '0px', bottom: '0px', overflowY: 'auto'}}>

        <Controls/>
        <Plan 
          mousetrap={this.mousetrap.bind(this)}
          plan={this.state.plan}
          setPlan={plan => {this.setState({plan}); window.savePlan(plan);}}
          songList={this.state.songList}
          searchIndex={this.searchIndex}
          updateSong={this.updateSong.bind(this)}
          handleEditing={editing => {this.editing = editing;}}
          addToPlan={item =>{
            const plan2 = Array.from(this.state.plan);
            plan2.push(item);
            this.setState({plan: plan2});
            window.savePlan(plan2);
            }}
          setSong={name => {return this.songDatabase[name];}}
          />

      </div>
      </div>
    );
  }
}

export default App;
