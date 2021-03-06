

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
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import { saveStyles } from './electron';
import FormatColorTextIcon from '@material-ui/icons/FormatColorText';
import FormatSizeIcon from '@material-ui/icons/FormatSize';
import Slider from '@material-ui/core/Slider';
import fontList from './font_list.json';
import {Checkbox, FormGroup, FormControlLabel} from '@material-ui/core';
import { createMuiTheme, ThemeProvider  } from '@material-ui/core/styles';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    background: '#000',
  },
});
const lightTheme = createMuiTheme({
  palette: {
    type: 'light',
    background: '#fff',
  },
});

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
    width: '80%',
    overflowY: 'auto',
    margin: '5px'
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
    <ThemeProvider theme={lightTheme}>
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
        <ThemeProvider theme={props.colorTheme === 'Dark' ? darkTheme : lightTheme}>
        <TextField {...params} label="Style (type to add new)" />
        </ThemeProvider>
      )}
    />
    </ThemeProvider>
  );
}

function FontSelect(props) {
  const [value, setValue] = React.useState(props.font || fontList[0]);

  const handleChange = e => {
    setValue(e.target.value);
    props.setFont(e.target.value);
  };

  React.useEffect(() => {
    setValue(props.font || fontList[0]);
  }, [props.font]);

  return (
    
      <FormControl>

        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          onChange={handleChange}
          theme={lightTheme}
        >
          {fontList.map((item, key) => {
            return <MenuItem 
              style={{color: '#000'}}
              key={key}
              value={item}><div style={{fontFamily: item}}>{item}</div></MenuItem>
          })}
        </Select>
      </FormControl>
  );
}


export default function(props) {
  const classes = useStyles();
  const [backdrop, setBackdrop] = React.useState('');
  const [color, setColor] = React.useState({r:255, g:255, b:255, a:1});
  const [size, setSize] = React.useState(4.5);
  const [currentStyle, setCurrentStyle] = React.useState('Default');
  const [font, setFont] = React.useState(fontList[0]);
  const [allCaps, setAllCaps] = React.useState(false);
  const [shadow, setShadow] = React.useState(false);
  const [shadowRad, setShadowRad] = React.useState(3);
  const [border, setBorder] = React.useState(false);
  const [backCast, setBackCast] = React.useState(0);
  const [textAlign, setTextAlign] = React.useState('middle');

  const addStyle = (styleName, newStyle) => {
    const fullStyle = {
      backdrop,
      color,
      size,
      font,
      allCaps,
      shadow,
      shadowRad,
      border,
      backCast,
      textAlign
    };
    Object.keys(newStyle).forEach(s => {
      fullStyle[s] = newStyle[s];
    });
    props.addStyle(styleName, fullStyle);
  };

  const handleBackdrop = (newBackdrop, save) => {
    newBackdrop = newBackdrop || props.backdrops[0];
    if (!newBackdrop) return;
    window.setWordsStyle({'backdrop': newBackdrop});
    setBackdrop(newBackdrop);
    if (save) {
      addStyle(currentStyle, {backdrop: newBackdrop});
    }
  };

  const handleColor = (newColor, save) => {
    newColor = newColor || {
      r: '241',
      g: '112',
      b: '19',
      a: '1',
    };
    window.setWordsStyle({'color': newColor});
    setColor(newColor);
    if (save) {
      addStyle(currentStyle, {color: newColor});
    }
  };

  const handleSize = (newSize, save) => {
    newSize = newSize || 4.5;
    window.setWordsStyle({'size': newSize});
    setSize(newSize);
    if (save) {
      addStyle(currentStyle, {size: newSize});
    }
  };

  const handleTextAlign = (newAlign, save) => {
    newAlign = newAlign || 'middle';
    window.setWordsStyle({'textAlign': newAlign});
    setTextAlign(newAlign);
    if (save) {
      addStyle(currentStyle, {textAlign: newAlign});
    }
  };

  const handleAllCaps = (newAllCaps, save) => {
    window.setWordsStyle({'allCaps': newAllCaps});
    setAllCaps(newAllCaps || false);
    if (save) {
      addStyle(currentStyle, {allCaps: newAllCaps});
    }
  };

  const handleFont = (newFont, save) => {
    window.setWordsStyle({'font': newFont});
    setFont(newFont);
    if (save) {
      addStyle(currentStyle, {font: newFont});
    }
  };

  const handleShadow = (newShadow, save) => {
    window.setWordsStyle({'shadow': newShadow});
    setShadow(newShadow || false);
    if (save) {
      addStyle(currentStyle, {shadow: newShadow});
    }
  };

  const handleShadowRad = (newShadowRad, save) => {
    window.setWordsStyle({'shadowRad': newShadowRad});
    setShadowRad(newShadowRad || false);
    if (save) {
      addStyle(currentStyle, {shadowRad: newShadowRad});
    }
  };

  const handleBackCast = (newBackCast, save) => {
    window.setWordsStyle({'backCast': newBackCast});
    setBackCast(newBackCast || false);
    if (save) {
      addStyle(currentStyle, {backCast: newBackCast});
    }
  };

  const handleBorder = (newBorder, save) => {
    window.setWordsStyle({'border': newBorder});
    setBorder(newBorder || false);
    if (save) {
      addStyle(currentStyle, {border: newBorder});
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
      handleFont(vals.font, false);
      handleAllCaps(vals.allCaps, false);
      handleShadow(vals.shadow, false);
      handleShadowRad(vals.shadowRad, false);
      handleBorder(vals.border, false);
      handleBackCast(vals.backCast, false);
      handleTextAlign(vals.textAlign, false);
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

      <Paper className={classes.paper} style={{background: props.colorTheme === 'Dark' ? '#000' : '#fff'}}>
        <div className={classes.contents}>

      <FreeSoloCreateOption
        colorTheme={props.colorTheme}
        styles={props.styles}
        currentStyle={currentStyle}
        changeStyle={name => {
          handleStyleChange(name);
          if (props.songData) {
            props.setSongStyle(name);
          }
        }}
        addStyle={newVal => {
          addStyle(newVal, {});
          handleStyleChange(newVal);
          if (props.songData) {
            props.setSongStyle(newVal);
          }
        }}
        handleEditing={props.handleEditing}
      />

<ThemeProvider theme={props.colorTheme === 'Dark' ? darkTheme : lightTheme}>
      <div className={classes.pictures}>
        {props.backdrops.map((file, i) => {
          const selected = backdrop === file;
          //console.log(`url(${file})`);
          return (
            <Button key={i} onClick={handleBackdrop.bind(null, file, true)}>
            <div style={{
              width:'100px', height:'60px',
              border: '2px solid',
              borderColor: selected ? '#f44' : '#fff',
              opacity: selected ? 1 : 0.7,
              backgroundImage: `url("${file.replace('rootDir/', window.rootDir)}")`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              margin: '0px'
              }}>
            </div>
            </Button>
          );}
        )}

        
      </div>


        <div style={{display: 'block', padding: '10px'}}>
        <div style={{display: 'inline'}}>
         <FontSelect colorTheme={props.colorTheme} font={font} setFont={font => handleFont(font, true)}/>
        </div>
        <SwatchButton color={color} onChange={ color => handleColor(color, true) } />
        </div>
        
        <div style={{textAlign: 'center'}}>

        <FormControlLabel
              control={
                <Checkbox
                checked={allCaps}
                onChange={e => handleAllCaps(e.target.checked, true)}
                value="allCaps"
                color="secondary"
                style={{color: props.colorTheme === 'Dark' ? '#fff' : '#000'}}
              />
              }
              label="All Caps"
            />

        <FormControlLabel
              control={
                <Checkbox
                checked={border}
                onChange={e => handleBorder(e.target.checked, true)}
                value="border"
                color="secondary"
                style={{color: props.colorTheme === 'Dark' ? '#fff' : '#000'}}
              />
              }
              label="Border"
            />


        <FormControlLabel
              control={
                <Checkbox
                checked={shadow}
                onChange={e => handleShadow(e.target.checked, true)}
                value="shadow"
                color="secondary"
                style={{color: props.colorTheme === 'Dark' ? '#fff' : '#000'}}
              />
              }
              label="Shadow"
            />

      </div>

      <div style={{
          display: 'inline-block',
          position: 'relative',
          top: '10px',
          width: '300px',
          marginLeft: '10px'
          }}>
          Font Size
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


         <div style={{
          display: 'block',
          position: 'relative',
          top: '10px',
          width: '300px',
          marginLeft: '10px'
          }}>
            Shadow Blur
          <Slider
            defaultValue={3}
            getAriaValueText={value => `${value}`}
            aria-labelledby="discrete-slider-small-steps"
            step={1}
            marks
            min={-15}
            max={15}
            valueLabelDisplay="auto"
            value={shadowRad}
            onChange={(e, val) => {handleShadow(true, false); handleShadowRad(val, false);}}
            onChangeCommitted={e => {
              handleShadowRad(shadowRad, true);
              handleShadow(true, true);
            }}
          />
        </div>

        <div style={{
          display: 'block',
          position: 'relative',
          top: '10px',
          width: '300px',
          marginLeft: '10px'
          }}>
            Background Color Cast
          <Slider
            defaultValue={3}
            getAriaValueText={value => `${value}`}
            aria-labelledby="discrete-slider-small-steps"
            step={1}
            marks
            min={-20}
            max={20}
            valueLabelDisplay="auto"
            value={backCast}
            onChange={(e, val) => {handleBackCast(val, false);}}
            onChangeCommitted={e => {
              handleBackCast(backCast, true);
            }}
          />


        <FormControl component="fieldset">
          <FormLabel component="legend">Text Alignment</FormLabel>
          <RadioGroup name="textAlign" value={textAlign} onChange={(e, val) => {handleTextAlign(val, true);}}>
            <FormControlLabel value="top" control={<Radio />} label="Top" />
            <FormControlLabel value="middle" control={<Radio />} label="Middle" />
            <FormControlLabel value="bottom" control={<Radio />} label="Bottom" />
          </RadioGroup>
        </FormControl>

        </div>



        {currentStyle === 'Default' ? null :
          <div style={{display: 'block'}}>
          <Tooltip title="Delete this style">
          <IconButton onClick={handleDelete}>
          <DeleteIcon disabled={true}/>
          </IconButton>
          </Tooltip>
          </div>
        }
     </ThemeProvider>
      </div>
      </Paper>

  );
}
