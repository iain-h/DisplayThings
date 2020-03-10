import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SongEnter from './SongEnter';
import SongList from './SongList';
import Controls from './Controls';

class App extends Component {
  render() {
    return (
      <div className="App">
        <SongEnter/>
        <Controls/>
        <SongList/>
      </div>
    );
  }
}

export default App;
