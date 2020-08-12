import React, { Component } from 'react';
import './App.css';
import SongEnter from './SongEnter';

import Plan from './Plan';
import Style from './Style';
import VideoControls from './VideoControls';
import PDF from './PDF';
import Picture from './Picture';
import WebPage from './WebPage';
import Mousetrap from 'mousetrap';
import FlexSearch from 'flexsearch';
import './Scrollbar'; 

const keyCodeMap = {
  down: [40, 34], up: [38, 33], 
  1: [49,97], 2: [50,98], 3: [51,99], 4: [52,100], 
  5: [53,101], 6: [54,102], 7: [55,103], c: [67], b: [66], m: [77], f: [70],
  i: [73], p: [80], d: [68], e: [69],  escape: [27]};

class App extends Component {

  state = {
    songList: [],
    songData: undefined,
    video: undefined,
    audio: undefined,
    youtube: undefined,
    ppt: undefined,
    pdf: undefined,
    picture: undefined,
    url: undefined,
    plan: [],
    backdrops: [],
    styles: {},
    colorTheme: window.getColorTheme()
  };
  searchIndex = new FlexSearch({
    threshold: 7,
    depth: 3
  });
  searchIndex2 = new FlexSearch({
    threshold: 7,
    depth: 3
  });
  searchIndex3 = new FlexSearch({
    threshold: 7,
    depth: 3
  });
  editing=false;
  resetSong=undefined;
  songDatabase={};

  keyMap = {};
  callbacks = {};

  updateSong(songData) {
    //console.log('app update song');
    window.setWords('');
    setTimeout(() => {
      this.setState({songData});
      if (this.resetSong) {
        this.resetSong(songData);
      }
    }, 400);
  }

  setResetCallback(callback) {
    this.resetSong = callback;
  }

  indexSong(i, songData) {
    // Index title
    this.searchIndex.add(i, songData.name);
    // Index first lines
    const chorus = songData.fields[songData.ids.indexOf('#C')];
    if (chorus) {
      const lines = chorus.split('\n');
      if (lines.length > 0) {
        this.searchIndex2.add(i, lines[0]);
      }
    }
    const verse1 = songData.fields[songData.ids.indexOf('#1')];
    if (verse1) {
      const lines = verse1.split('\n');
      if (lines.length > 0) {
        this.searchIndex3.add(i, lines[0]);
      }
    }
  }

  removeSong(i) {
    this.searchIndex.remove(i);
    this.searchIndex2.remove(i);
    this.searchIndex3.remove(i);
  }

  indexSongs() {
    this.searchIndex.clear();
    const songList = Object.keys(this.songDatabase)
      .filter(key => this.songDatabase[key] !== undefined);
    songList.forEach((song, i) => {
      this.indexSong(i, this.songDatabase[song])
    });
    this.setState({songList});
  }

  componentDidMount() {
    window.getSongs(songDatabase => {
      this.songDatabase = songDatabase;
      this.indexSongs();
    });

    window.loadPlan(plan => {
      this.setState({plan});
    });

    window.getBackdrops(backdrops => {
      this.setState({backdrops});
    });

    window.loadStyles(styles => {
      this.setState({styles});
    });
    
    window.setKeyDownCallback(which => {
      const callback = this.keyMap[which];
      if (callback) {
        callback();
      }
    });

    window.loadPDF = file => {
      //console.log('loadPDF', file);
      if (this.state.ppt !== undefined) {
        this.setState({pdf: file});
      }
    };

    window.loadSongs = songDatabase => {
      this.songDatabase = songDatabase;
      this.indexSongs();
    };

    window.loadBackdrops = files => {
      this.setState({backdrops: files});
    };

    window.setColorTheme = () => {
      this.setState({colorTheme: window.getColorTheme()});
    };
    
    window.addEventListener("keydown", e => {
      if (this.editing) return;
      if (e.defaultPrevented) return;
      const callback = this.keyMap[e.which];
      if (callback) {
        callback(e);
      }
    }, false);
  }

  mousetrap(key, callback) {
    if (this.callbacks[key] === undefined) {
      this.callbacks[key] = [callback];
    } else {
      this.callbacks[key].push(callback);
    }

    const func = e => {
      this.callbacks[key].forEach(f => {
        if (e && e.defaultPrevented) return;
        f(e);
      }
      )};

    Mousetrap.bind(key, func);
    const codes = keyCodeMap[key];
    if (codes) {
      codes.forEach(code => this.keyMap[code] = func);
      this.keyMap[key] = func;
    }
  }

  setSongStyle(style) {
    if (this.state.songData && this.state.songData.style !== style) {
      //console.log('Update current song style', style);
      const newSongData = Object.assign({}, this.state.songData);
      newSongData.style = style;
      this.setState({songData: newSongData});
      this.songDatabase[newSongData.name] = newSongData;
      window.updateSongDatabase(JSON.stringify(newSongData), '');
    }
  }

  render() {
    return (
      <div onKeyDownCapture = {e => {
        if (this.editing && ![40, 34, 38, 33].includes(e.which)) return;
        if (e.defaultPrevented) return;
        const callback = this.keyMap[e.which];
        if (callback) {
          callback(e);
        }
      }} className={`App App${this.state.colorTheme}`}>

      <div className={`Editor Editor${this.state.colorTheme}`}>

        <SongEnter 
          colorTheme={this.state.colorTheme}
          mousetrap={this.mousetrap.bind(this)}
          songData={this.state.songData}
          setResetCallback={this.setResetCallback.bind(this)}
          handleEditing={editing => { this.editing = editing;}}
          saveSongChanges={
            songData => {
              const title = songData.fields[songData.ids.indexOf('#T')];
              if (!title) return;
              let newPlan = Array.from(this.state.plan);
              let deleteName;
              if (title != songData.name) {
                deleteName = songData.name;
                this.songDatabase[songData.name] = undefined;
                const idx = this.state.plan.indexOf(deleteName);
                if (idx != -1) {
                  newPlan.splice(idx, 1, title);
                  window.savePlan(newPlan);
                  this.setState({plan: newPlan});
                  window.selectItem(title);
                }
              }
              songData.name = title;
              this.songDatabase[songData.name] = songData;
              this.setState({songData});

              const songList = Object.keys(this.songDatabase)
                .filter(key => this.songDatabase[key] !== undefined);
              const idx = songList.indexOf(title);
              console.log(title, idx);
              this.indexSong(idx, songData);
              this.setState({songList});

              window.updateSongDatabase(JSON.stringify(songData), deleteName);

              if (newPlan.indexOf(songData.name) === -1) {
                newPlan.push(songData.name);
                this.setState({plan: newPlan});
                window.savePlan(newPlan);
                window.selectItem(songData.name);
              }
            }
          }
          deleteSong={songData => {
            const deleteName = songData.name;
            this.removeSong(this.state.songList.indexOf(deleteName));
            this.songDatabase[deleteName] = undefined;
            const songList = Object.keys(this.songDatabase)
              .filter(key => this.songDatabase[key] !== undefined);
            this.setState({songList});
            
            window.updateSongDatabase('', deleteName);
            this.setState({songData: undefined});
            const idx = this.state.plan.indexOf(deleteName);
            if (idx != -1) {
              const newPlan = Array.from(this.state.plan);
              newPlan.splice(idx, 1);
              this.setState({plan: newPlan});
              window.savePlan(newPlan);
            }
          }}
          />
           <audio id="audio" src=""></audio>
          <VideoControls 
            colorTheme={this.state.colorTheme}
            video={this.state.video}
            youtube={this.state.youtube}
            audio={this.state.audio}/>
          <PDF
            colorTheme={this.state.colorTheme}
            pdfFile={this.state.pdf}
            pptFile={this.state.ppt}
            reload={() => {
              window.convertPPTtoPDF(this.state.ppt, true, true);
              this.setState({pdf: undefined});
            }}
            handleEditing={editing => { this.editing = editing;}}
            mousetrap={this.mousetrap.bind(this)}/>

          <Picture file={this.state.picture}/>
          <WebPage 
            colorTheme={this.state.colorTheme}
            url={this.state.url}
            updateURL={url => {
              if (url === this.state.url) return;
              this.setState({url});
              if (!url) return;
              const idx = this.state.plan.indexOf(this.state.url);
              if (idx != -1) {
                let newPlan = Array.from(this.state.plan);
                newPlan.splice(idx, 1, url);
                window.savePlan(newPlan);
                this.setState({plan: newPlan});
                window.selectItem(url);
              }
            }}
            handleEditing={editing => { this.editing = editing;}}/>
        
      </div>
     
      <div style={{position: 'absolute', top: '0px', paddingTop: '10px', width: '400px', paddingRight: '20px', right: '0px', bottom: '0px', overflowY: 'auto'}}>

        <Plan 
          colorTheme={this.state.colorTheme}
          mousetrap={this.mousetrap.bind(this)}
          plan={this.state.plan}
          setPlan={plan => {this.setState({plan}); window.savePlan(plan);}}
          songList={this.state.songList}
          searchIndex={this.searchIndex}
          searchIndex2={this.searchIndex2}
          searchIndex3={this.searchIndex3}
          updateSong={this.updateSong.bind(this)}
          handleEditing={editing => { this.editing = editing;}}
          addToPlan={item =>{
            if (this.state.plan.indexOf(item) !== -1) return;
            const plan2 = Array.from(this.state.plan);
            plan2.push(item);
            this.setState({plan: plan2});
            window.savePlan(plan2);
            }}
          setSong={name => {
            const songData = this.songDatabase[name];
            return songData;}}
          createSong={() => {
            this.setState({songData: window.createSong('Untitled')});
          }}
          setVideo={file => {
            this.setState({video: file});
            window.setVideo(file);
          }}
          setAudio={file => {
            this.setState({audio: file});
          }}
          setYouTube={name => {
            this.setState({youtube: name});
            window.setYouTube(name);
          }}
          setPicture={file => {
            this.setState({picture: file});
            window.setPicture(file);
          }}
          setURL={(url, callback) => {
            console.log('SetURL', url);
            this.setState({url});
            window.setURL(url, callback);
          }}
          setPPT={
            file => {
              //console.log('setPPT', file);
              if (typeof file === 'string') {
                window.convertPPTtoPDF(file, true, false);
              }
              this.setState({ppt: file, pdf: undefined});
              if (file === undefined) {
                window.showPDF();
              }
          }}
          />
          <Style 
            colorTheme={this.state.colorTheme}
            styles={this.state.styles}
            backdrops={this.state.backdrops}
            addStyle={(name, style) => {
                //console.log('Add style', name);
                const newStyles = Object.assign({}, this.state.styles);
                newStyles[name] = style;
                newStyles[name].title = name;
                this.setState({styles: newStyles});
                window.saveStyles(newStyles);
              }}
            songData={this.state.songData}
            setSongStyle={styleName => this.setSongStyle(styleName)}
            deleteStyle={style => {
              const newStyles = Object.assign({}, this.state.styles);
              delete newStyles[style];
              this.setState({styles: newStyles});
              window.saveStyles(newStyles);
              Object.keys(this.songDatabase).forEach(key => {
                const songData = this.songDatabase[key];
                if (songData.style === style) {
                  const newSongData = Object.assign({}, songData);
                  delete newSongData.style;
                  window.updateSongDatabase(JSON.stringify(newSongData), '');
                }
              });
              const songData = this.state.songData;
              if (songData && songData.style === style) {
                const newSongData = Object.assign({}, songData);
                delete newSongData.style;
                this.setState({songData: newSongData});
              }
            }}
            handleEditing={editing => { this.editing = editing;}}
          />

      </div>
      </div>
    );
  }
}

export default App;
