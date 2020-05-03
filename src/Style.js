

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { SwatchesPicker } from 'react-color';
import { Popover } from '@material-ui/core';

import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { saveStyles } from './electron';
import FormatColorTextIcon from '@material-ui/icons/FormatColorText';
import FormatSizeIcon from '@material-ui/icons/FormatSize';
import Slider from '@material-ui/core/Slider';

function SwatchButton(props) {

  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);
  const [color, setColor] = React.useState({
    r: '241',
    g: '112',
    b: '19',
    a: '1',
  });
  const [anchorEl, setAnchorEl] = React.useState(null);

  React.useEffect(() => {
    setColor(props.color);
  }, [props.color]);

  const handleClick = event => {
    setDisplayColorPicker(!displayColorPicker);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (color) => {
    setColor(color.rgb);
    props.onChange(color.rgb);
  };

  return (
    <div style={{display: 'inline-block', height: '20px'}}>

      <Tooltip title="Font Color">
      <IconButton onClick={handleClick}>
        <FormatColorTextIcon style={{backgroundColor: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`}}/>
      </IconButton>
      </Tooltip>

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
    width: '100%'
  },
  pictures: {
    height: '200px',
    width: '100%',
    overflowY: 'auto'
  },
  contents: {
    padding: '10px'
  }
}));

const filter = createFilterOptions();

function FreeSoloCreateOption(props) {
  const [value, setValue] = React.useState({title: 'Default'});

  React.useEffect(() => {
    setValue({title: props.currentStyle});
 }, [props.currentStyle]);

  return (
    <Autocomplete
      value={value ? value.title : null}
      onChange={(event, newValue) => {
        // Create a new value from the user input
        if (newValue && newValue.inputValue) {
          const newVal = {
            title: newValue.inputValue,
          };
          setValue(newVal);
          props.addStyle(newValue.inputValue);
          return;
        } else {
          setValue(newValue);
          props.changeStyle(newValue.title);
        }
      }}
      onBlur={e => {
        if (value === '') {
          setValue({title: 'Default'});
        }
        props.handleEditing(false);
      }}
      onFocus={e => {props.handleEditing(true);}}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        // Suggest the creation of a new value
        if (params.inputValue !== '') {
          filtered.push({
            inputValue: params.inputValue,
            title: `Add "${params.inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      id="free-solo-with-text-demo"
      options={Object.keys(props.styles).map(s => props.styles[s])}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.title;
      }}
      renderOption={(option) => option.title}
      style={{ width: "100%" }}
      freeSolo
      disableClearable
      renderInput={(params) => (
        <TextField {...params} label="Style (type to add new)" />
      )}
    />
  );
}


export default function PictureSelect(props) {
  const classes = useStyles();
  const [backdrop, setBackdrop] = React.useState('');
  const [color, setColor] = React.useState({r:255, g:255, b:255, a:1});
  const [size, setSize] = React.useState(4.5);
  const [currentStyle, setCurrentStyle] = React.useState('Default');

  const handleBackdrop = (newBackdrop, save) => {
    newBackdrop = newBackdrop || props.backdrops[0];
    if (!newBackdrop) return;
    window.setBackdrop(newBackdrop);
    setBackdrop(newBackdrop);
    if (save) {
      props.addStyle(currentStyle, {
        backdrop: newBackdrop,
        color,
        size
      });
    }
  };

  const handleColor = (newColor, save) => {
    newColor = newColor || {
      r: '241',
      g: '112',
      b: '19',
      a: '1',
    };
    window.setColor(newColor);
    setColor(newColor);
    if (save) {
      props.addStyle(currentStyle, {
        backdrop,
        color: newColor,
        size
      });
    }
  };

  const handleSize = (newSize, save) => {
    newSize = newSize || 4.5;
    window.setSize(newSize);
    setSize(newSize);
    if (save) {
      props.addStyle(currentStyle, {
        backdrop,
        color,
        size: newSize
      });
    }
  };

  const handleStyleChange = style => {
    setCurrentStyle(style);
    if (props.styles[style]) {
      console.log('change style');
      const vals = props.styles[style];
      handleBackdrop(vals.backdrop, false);
      handleColor(vals.color, false);
      handleSize(vals.size, false);
    }
  };

  const handleDelete = e => {
    props.deleteStyle(currentStyle);
    setCurrentStyle('Default');
  };

  React.useEffect(() => {
     handleStyleChange(currentStyle);
  }, [props.backdrops]);

  React.useEffect(() => {
    if (!props.songData) return
    const style = props.songData.style || 'Default';
    handleStyleChange(style);
  }, [props.songData]);

  React.useEffect(() => {
    handleStyleChange(currentStyle);
  }, [props.styles]);

  return (

      <Paper className={classes.paper}>
        <div className={classes.contents}>

      <FreeSoloCreateOption
        styles={props.styles}
        currentStyle={currentStyle}
        changeStyle={name => {
          handleStyleChange(name);
          if (props.songData) {
            props.setSongStyle(name);
          }
        }}
        addStyle={newVal => {
          props.addStyle(newVal, {
            backdrop, color, size});
          handleStyleChange(newVal);
          if (props.songData) {
            props.setSongStyle(newVal);
          }
        }}
        handleEditing={props.handleEditing}
      />

      <div className={classes.pictures}>
        {props.backdrops.map((file, i) => {
          const selected = backdrop === file;
          console.log(`url(${file})`);
          return (
            <Button onClick={handleBackdrop.bind(null, file, true)}>
            <div style={{
              width:'100px', height:'60px',
              border: '2px solid',
              borderColor: selected ? '#66f' : '#fff',
              opacity: selected ? 1 : 0.5,
              backgroundImage: `url(${file})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
              }}>
            </div>
            </Button>
          );}
        )}

        
      </div>

      
        <SwatchButton  color={color} onChange={ color => handleColor(color, true) } />

        
        <div style={{display: 'inline-block', position: 'relative', top: '8px'}}>
        <Tooltip title="Font Size">
          <FormatSizeIcon/>
        </Tooltip>
        </div>
        <div style={{
          display: 'inline-block',
          position: 'relative',
          top: '10px',
          width: '100px',
          marginLeft: '10px'
          }}>
          <Slider
            defaultValue={9}
            getAriaValueText={value => `${value}`}
            aria-labelledby="discrete-slider-small-steps"
            step={1}
            marks
            min={2}
            max={40}
            valueLabelDisplay="auto"
            value={size * 2}
            onChange={(e, val) => handleSize(val * 0.5, false)}
            onChangeCommitted={e => handleSize(size, true)}
          />
        </div>

        {currentStyle === 'Default' ? null :
          <div style={{display: 'inline-block', float: 'right'}}>
          <Tooltip title="Delete this style">
          <IconButton onClick={handleDelete}>
          <DeleteIcon disabled={true}/>
          </IconButton>
          </Tooltip>
          </div>
        }
        
     
      </div>
      </Paper>

  );
}
