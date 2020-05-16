

import React, {Component} from 'react'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import Tooltip from '@material-ui/core/Tooltip';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import Slider from '@material-ui/core/Slider';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const LightTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#3f51b5',
    color: 'white',
    boxShadow: theme.shadows[1],
    fontSize: 14,
  },
  arrow: {
    color: '#3f51b5'
  }
}))(Tooltip);

const styles = {
    paper: {
      width: '100%',
      marginBottom: '10px',
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  };

function ValueLabelComponent(props) {
  const { children, open, value } = props;

  return (
    <LightTooltip open={open} 
    enterTouchDelay={0} 
    placement="top" 
    title={value} 
    arrow>
      {children}
    </LightTooltip>
  );
}

export default class VideoControls extends Component {

  state = {playing: false, status: {}, youtube: this.props.youtube, time: 0};

  progressDiv;
  progressBarDiv;
  timeDiv;
  duration=0;
  title='';
  timer;

  playVideo(control) {
    if (this.state.youtube) {
      window.playYouTube(control);
    } else {
      window.playVideo(control);
    }
  }

  handlePlay() {
      if (this.state.playing) {
        this.playVideo({action: 'pause'});
        this.updateStatus();
        this.setState({playing: false});
        this.getStatusTimer();
      } else {
        this.playVideo({action: 'play'});
        this.setState({playing: true});
        this.getStatusTimer();
      }
  }

  handleSkipStart() {
    this.playVideo({action: 'skip', time: 0});
    this.getStatusTimer();
  }

  updateStatus() {
    if (this.suspendProgress) {
      return;
    }

    const status = JSON.parse(window.getVideoStatus());
    this.setState({
      status: status,
      time: status.time
    });
    if (status.time >= status.duration) {
      this.setState({playing: false});
    }

    if (status.paused === true) {
      this.setState({playing: false});
    } else {
      this.setState({playing: true});
    }

    this.duration = status.duration;
  }

  getStatusTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.getStatusTimer.bind(this), 200);
    this.updateStatus();
  }

  componentDidMount() {
      this.getStatusTimer();
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.video !== this.props.video) {
      this.setState({video: nextProps.video});
    }
    if (nextProps.youtube !== this.props.youtube) {
      this.setState({youtube: nextProps.youtube});
    }
  }

  printSeconds(seconds) {
    if (seconds === undefined) return '0';
    const min = Math.floor(seconds / 60.0);
    const sec = seconds - (60 * min);
    if (min > 0) {
      let secStr  = `${sec.toFixed(0)}`;
      if (secStr.length < 2) secStr = '0' + secStr;
      return `${min.toFixed(0)}m ${secStr}s`;
    }
    return `${sec.toFixed(0)}s`;
  }

  render() {
    if (!this.state.video && !this.state.youtube) return null;

    return (

        <Paper className={styles.paper}>

          <div style={{display: 'grid', paddingTop: '50px', paddingBottom: '50px', gridTemplateColumns: '50px 50px auto'}}>
            <Tooltip title="Skip to start">
            <IconButton aria-label="skip to start" onClick={this.handleSkipStart.bind(this)}>
                <SkipPreviousIcon className={styles.playIcon} fontSize="large" color="primary"/>
            </IconButton>
            </Tooltip>

            <Tooltip title="Play / Pause">
            <IconButton aria-label="play/pause" onClick={this.handlePlay.bind(this)}>
                {this.state.playing ?
                <PauseCircleFilledIcon className={styles.playIcon} fontSize="large" color="primary"/> :
                <PlayArrowIcon className={styles.playIcon} fontSize="large" color="primary" outline/>
                }
            </IconButton>
            </Tooltip>

            <div id="progressBar" style={{display: 'inline-block', position: 'relative', left: '0px', top: '16px', marginLeft: '30px', marginRight: '30px', height: '40px'}}>
              
            <Slider
              defaultValue={0}
              getAriaValueText={value => this.printSeconds(value)}
              valueLabelFormat={value => this.printSeconds(value)}
              ValueLabelComponent={ValueLabelComponent}
              aria-labelledby="continuous-slider"
              step={0.1}
              min={0}
              max={this.duration}
              valueLabelDisplay="on"
              value={this.state.time ? this.state.time : 0}
              onChange={(e, val) => {
                this.setState({time: val});
                this.playVideo({action: 'skip', time: val, allowSeekAhead: false});
                if (this.timer) clearTimeout(this.timer);
              }}
              onChangeCommitted={e => {
                this.playVideo({action: 'skip', time: this.state.time, allowSeekAhead: true});
                setTimeout(this.getStatusTimer.bind(this), 2000);
              }}
            />

            <div style={{
              float: 'right',
              textAlign: 'right',
              paddingRight: '10px',
              paddingBottom: '10px',
              display: 'inline'
            }}><Tooltip title="Duration Time"><Typography>{this.printSeconds(this.duration)}</Typography></Tooltip>
            </div>
            </div>
            

            </div>

            <div style={{padding: '20px'}}>
            {this.state.status.title ? this.state.status.title : null}
            </div>
        </Paper>

    );
  }
}
