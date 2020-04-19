

import React, {Component} from 'react'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import Tooltip from '@material-ui/core/Tooltip';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

const styles = {
    paper: {
      width: '100%',
      marginBottom: '10px',
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  };

export default class VideoControls extends Component {

  state = {playing: false, status: {}};

  progressDiv;
  progressBarDiv;
  timeDiv;
  time=0;
  duration=0;
  draggingProgress=false;
  progressLeft=0;
  progressMax=10;
  leftDiff=0;
  suspendProgress=false;

  handlePlay() {
      if (this.state.playing) {
        window.playVideo({action: 'pause'});
        this.updateStatus();
        this.setState({playing: false});
      } else {
        window.playVideo({action: 'play'});
        this.setState({playing: true});
      }
  }

  handleSkipStart() {
    window.playVideo({action: 'skip', time: 0});
    this.suspendProgress = true;
  }

  updateStatus() {
    if (this.suspendProgress) {
      // Avoid jumping when skipping to time
      this.suspendProgress = false;
      return;
    }

    if (this.draggingProgress) return;

    this.setState({status: JSON.parse(window.getVideoStatus())});
    if (this.state.status.time >= this.state.status.duration) {
      this.setState({playing: false});
    }

    if (this.state.status.paused === true) {
      this.setState({playing: false});
    } else {
      this.setState({playing: true});
    }

    this.time = this.state.status.time;
    this.duration = this.state.status.duration;

    if (this.progressDiv && this.progressBarDiv) {
      const width = this.progressBarDiv.clientWidth - 50;
      const ratio = this.state.status.time / this.state.status.duration;
     // console.log('width', width, 'ratio', ratio);
      const left = Math.floor(ratio * width);
      this.progressDiv.style.left = left + 'px';
    }
  }

  getStatusTimer() {
    //console.log(this.state.status);
    setTimeout(this.getStatusTimer.bind(this), 500);
    this.updateStatus();
  }

  progressDown(e) {
    this.draggingProgress = true;
    this.progressDiv.style.backgroundColor = '#bbb';
    const rect =  this.progressBarDiv.getBoundingClientRect();
    const rect2 =  this.progressDiv.getBoundingClientRect();
    this.progressMax = rect.width - 50;
    this.progressLeft = rect.left;
    this.leftDiff = rect2.left - e.clientX;
    e.preventDefault();
  }

  progressUp(e) {
    if (!this.draggingProgress) return;
    this.draggingProgress = false;
    this.progressDiv.style.backgroundColor = '#fff';
    const ratio = (e.clientX - this.progressLeft + this.leftDiff) / this.progressMax;
    const time = this.duration * ratio;
    window.playVideo({action: 'skip', time});
    this.suspendProgress = true;
  }

  progressMove(e) {
    if (!this.draggingProgress) return;
    let left = e.clientX - this.progressLeft + this.leftDiff;
    left = Math.min(left, this.progressMax);
    left = Math.max(left, 0);
    this.progressDiv.style.left = left + 'px';
    const ratio = left / this.progressMax;
    const time = this.duration * ratio;
    this.timeDiv.innerHTML = this.printSeconds(time);
  }

  componentDidMount() {
      this.getStatusTimer();
      this.progressDiv = document.getElementById('progress');
      this.progressBarDiv = document.getElementById('progressBar');
      this.timeDiv = document.getElementById('timeDisplay');

      this.progressDiv.addEventListener('mousedown', this.progressDown.bind(this));
      window.addEventListener('mouseup', this.progressUp.bind(this));
      window.addEventListener('mousemove', this.progressMove.bind(this));
  }

  printSeconds(seconds) {
    if (seconds === undefined) return '0';
    const min = Math.floor(seconds / 60.0);
    const sec = seconds - (60 * min);

    if (min > 0) return `${min.toFixed(0)}m ${sec.toFixed(0)}s`;

    return `${sec.toFixed(0)}s`;
  }

  render() {
    return (

        <Paper className={styles.paper}>

          <div style={{display: 'grid', gridTemplateColumns: '50px 50px auto'}}>
            <Tooltip title="Skip to start">
            <IconButton aria-label="skip to start" onClick={this.handleSkipStart.bind(this)}>
                <SkipPreviousIcon className={styles.playIcon} />
            </IconButton>
            </Tooltip>

            <Tooltip title="Play / Pause">
            <IconButton aria-label="play/pause" onClick={this.handlePlay.bind(this)}>
                {this.state.playing ?
                <PauseCircleFilledIcon className={styles.playIcon} /> :
                <PlayArrowIcon className={styles.playIcon} />
                }
            </IconButton>
            </Tooltip>

            <div id="progressBar" style={{display: 'inline-block', position: 'relative', left: '0px', top: '12px', width: '100%', height: '40px'}}>
              <div style={{
                display: 'block',
                position: 'relative',
                marginLeft: '20px',
                top: '9px',
                marginRight: '40px',
                height: '6px',
                backgroundColor: '#bbb'
                }}>
              </div>

              <div id="progress" style={{
                height: '24px',
                width: '24px',
                backgroundColor: '#fff',
                borderStyle: 'solid',
                borderWidth: '2px',
                borderColor: '#bbb',
                borderRadius: '50%',
                display: 'inline-block',
                position: 'relative',
                top: '-7px'
                }}>
              </div>
            </div>

            <div></div>
            <div></div>
            <div>
            <div id="timeDisplay"
              style={{
              textAlign: 'left',
              paddingRight: '40px',
              paddingBottom: '10px',
              display: 'inline'
            }}>{this.printSeconds(this.time)}</div>
            <div style={{
              float: 'right',
              textAlign: 'right',
              paddingRight: '40px',
              paddingBottom: '10px',
              display: 'inline'
            }}>{this.printSeconds(this.duration)}
            </div>
            </div>

            </div>
        </Paper>

    );
  }
}
