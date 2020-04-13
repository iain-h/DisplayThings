

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import { SwatchesPicker } from 'react-color';
import { Popover } from '@material-ui/core';

function SwatchButton(props) {

  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);
  const [color, setColor] = React.useState({
    r: '241',
    g: '112',
    b: '19',
    a: '1',
  });
  const [anchorEl, setAnchorEl] = React.useState(null);

  const styles = {
      color: {
        width: '36px',
        height: '14px',
        borderRadius: '2px',
        background: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`,
      },
      swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
      }
    };


  const handleClick = event => {
    setDisplayColorPicker(!displayColorPicker);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (color) => {
    setColor(color.rgb);
  };

  return (
    <div>
      <div style={ styles.swatch } onClick={ handleClick }>
        <div style={ styles.color } />
      </div>
      { displayColorPicker ? <Popover
        id={1}
        anchorEl={anchorEl}
        open={true}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <SwatchesPicker color={ color } onChange={ handleChange } />
        </Popover>: null }

    </div>
  )
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%x',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
    paddingTop: '10px',
    paddingBottom: '10px'
  },
  pictures: {
    height: '200px',
    width: '150px',
    overflowY: 'auto'
  }
}));

export default function PictureSelect(props) {
  const classes = useStyles();

  const handleClick = (file, e) => {
    window.setBackdrop(file);
  };

  const handleColor = color => {

  };

  return (

      <Paper className={classes.paper}>

      <div className={classes.pictures}>
        {props.files.map((file, i) => {
          console.log(`url(${file})`);
          return (
            <IconButton onClick={handleClick.bind(null, file)}>
            <img key={i} alt='' src={file} width='90px'/>
            </IconButton>
          );}
        )}

        
      </div>
      <SwatchButton onChange={ handleColor } />
      </Paper>

  );
}
