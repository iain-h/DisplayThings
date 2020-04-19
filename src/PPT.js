

import React, {Component} from 'react'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import Tooltip from '@material-ui/core/Tooltip';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
const ppt2png = require('ppt2png');

const styles = {
    paper: {
      width: '100%',
      marginBottom: '10px',
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  };

export default class PPT extends Component {

  state = {};

  componentDidMount() {
    /*"C:\Program Files\LibreOffice\program\simpress.exe" --headless --invisible --convert-to pdf --outdir "C:\Users\henleyi\Documents" "D:\DisplayThings\public\Test.pptx"*/
  }

  render() {
    return (

        <Paper className={styles.paper}>

            PPT
           
        </Paper>

    );
  }
}
