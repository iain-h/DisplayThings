

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(theme => ({
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  }));

export default function VideoControls(props) {
  const classes = useStyles();

  const [playing, setPlaying] = React.useState(false);

  const handlePlay = () => {
      if (playing) {
        window.playVideo({action: 'pause'});
        setPlaying(false);
      } else {
        window.playVideo({action: 'play'});
        setPlaying(true);
      }
  };

  const handleSkipStart = () => {
    window.playVideo({action: 'skipStart'});
  };

  return (

      <Paper className={classes.paper}>

        <Tooltip title="Skip to start">
          <IconButton aria-label="skip to start" onClick={handleSkipStart}>
            <SkipPreviousIcon className={classes.playIcon} />
          </IconButton>
          </Tooltip>

          <Tooltip title="Play / Pause">
          <IconButton aria-label="play/pause" onClick={handlePlay}>
            {playing ?
             <PauseCircleFilledIcon className={classes.playIcon} /> :
             <PlayArrowIcon className={classes.playIcon} />
            }
          </IconButton>
          </Tooltip>
      </Paper>

  );
}
