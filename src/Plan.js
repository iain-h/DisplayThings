import React, { Component } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  ListItemSecondaryAction
} from "@material-ui/core";
import RootRef from "@material-ui/core/RootRef";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import InboxIcon from "@material-ui/icons/Inbox";
import ImageIcon from '@material-ui/icons/Image';
import PanoramaWideAngleIcon from '@material-ui/icons/PanoramaWideAngle';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteIcon from '@material-ui/icons/Delete';
import GraphicEqIcon from '@material-ui/icons/GraphicEq';
import YouTubeIcon from '@material-ui/icons/YouTube';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SongList from './SongList';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import TheatersIcon from '@material-ui/icons/Theaters';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import PictureInPictureIcon from '@material-ui/icons/PictureInPicture';
import AddIcon from '@material-ui/icons/Add';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PublicIcon from '@material-ui/icons/Public';
import Controls from './Controls';
import SearchIcon from '@material-ui/icons/Search';
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

let player;
let addOnTitle = false;

function YouTubeDialog(props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [title, setTitle] = React.useState('');

  let timer;
  const onPlayerStateChange = () => {
    console.log('play ready');
    if (player) {
      console.log('get title');
      const data = player.getVideoData();
      if (data) {
        console.log(data.title);
        setTitle(data.title);
        if (data.title && addOnTitle) {
          props.onClose(getVideoId(data.video_id), data.title);
          window.closeBrowser();
          clearVideo();
        } 
      } else {
        setTimeout(onPlayerStateChange, 1000);
      }
    }
  };

  const onPlayerReady = () => {
    if (player && value && typeof player.loadVideoById === 'function') {
      player.loadVideoById(getVideoId(value));
    }
  };

  const getVideoId = val => {
    let videoId = val;
    if (videoId.startsWith('http') || videoId.startsWith('www.')) {
      const res = videoId.match(/v=([^ &]*)/);
      if (res) {
        videoId = res[1];
      }
    }
    console.log('videoId', videoId);
    return videoId;
  };

  const clearVideo = () => {
    if (player && typeof player.loadVideoById === 'function') {
      player.loadVideoById('');
    }
    setValue('');
    setTitle('');
  };

  const handleAdd = () => {
    props.onClose(getVideoId(value), title);
    window.closeBrowser();
    clearVideo();
  };

  window.addYouTube = url => {
    const id = getVideoId(url);
    addOnTitle = true;
    setValue(id);
    if (player && typeof player.loadVideoById === 'function') {
      player.loadVideoById(id);
    }
  };

  const handleCancel = () => {
    clearVideo();
    window.closeBrowser();
    props.onClose();
  };

  React.useEffect(() => {
    setOpen(props.open);

    if (props.open) {
      clearVideo();
      addOnTitle = false;
      window.YT = undefined;
      let tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      let firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        console.log('youtube api ready');
        player = new window.YT.Player('player', {
          height: '100%',
          width: '100%',
          videoId: '',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      };
      window.showBrowser(true);
    }
  }, [props.open]);

  return (
    <Dialog open={open} onClose={handleCancel} aria-labelledby="form-dialog-title">
      <DialogTitle style={{color: '#000'}} id="form-dialog-title">Add YouTube to plan</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Video ID"
          fullWidth
          value={value}
          onChange={e => {
            setValue(e.target.value);
            if (player && typeof player.loadVideoById === 'function') {
              player.loadVideoById(getVideoId(e.target.value));
            }
          }}
          onFocus={e => props.handleEditing(true)}
          onBlur={e => props.handleEditing(false)}
        />
        {
        [1].map(()=>{
          const disp = value ? 'block' : 'none';
          return(<div>
          <div style={{display: disp, height: '50px', width:'300px', color: '#000'}}>{title ? title.substring(0, 80) : ''}</div>
          <div style={{display: disp, width: '300px', height: '200px'}}><div id="player"></div></div></div>);
        })
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAdd} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddToPlanMenu(props) {

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const addFile = async () => {
    setAnchorEl(null);
    const files = await window.openFile();
    props.addFiles(files);
  };

  const addYouTube = () => {
    setAnchorEl(null);
    props.addYouTube();
  };
  const addWebPage = () => {
    setAnchorEl(null);
    props.addWebPage();
  };

  return (
    <div style={{display: 'inline'}}>
      <Tooltip title="Add file or webpage">
      <IconButton onClick={handleClick}>
      <AddIcon/>
      </IconButton>
      </Tooltip>

      <Menu
      id="simple-menu"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
      
      >
      <MenuItem style={{color: '#000'}} onClick={addFile}><InsertDriveFileIcon/> <span style={{width: '5px'}}/>Add File</MenuItem>
      <MenuItem style={{color: '#000'}} onClick={addWebPage}><PublicIcon/> <span style={{width: '5px'}}/>Add Web Page</MenuItem>
      <MenuItem style={{color: '#000'}} onClick={addYouTube}><YouTubeIcon/> <span style={{width: '5px'}}/>Add YouTube</MenuItem>
      </Menu>
    </div>
  );
}

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list).filter(i => i);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const removeItem = (list, startIndex) => {
  const result = Array.from(list);
  result.splice(startIndex, 1);
  return result;
};

const insertItem = (list, endIndex, newItem) => {
  const result = Array.from(list);
  if (result.indexOf(newItem) === -1) {
    result.splice(endIndex, 0, newItem);
  }
  return result;
};

const getItemStyle = (isDragging, draggableStyle, selected, index) => ({
  // styles we need to apply on draggables
  ...draggableStyle, height: '30px',

  ...(isDragging && {
    background: "rgb(235,235,235)"
  }),
  ...(index % 2 === 0 && {
    background: "rgb(230,230,250)"
  }),
  ...(index % 2 !== 0 && {
    background: "rgb(230,250,250)"
  }),
  ...(selected && {
    background: "rgb(256,256,0)"
  })
});

const getItemStyleDark = (isDragging, draggableStyle, selected, index) => ({
  // styles we need to apply on draggables
  ...draggableStyle, height: '30px',

  ...(isDragging && {
    background: "rgb(0, 0, 0)"
  }),
  ...(index % 2 === 0 && {
    background: "rgb(40, 40, 40)"
  }),
  ...(index % 2 !== 0 && {
    background: "rgb(10, 10, 10)"
  }),
  ...(selected && {
    background: "rgb(50,50,150)"
  })
});

const getListStyle = isDraggingOver => ({
  //background: isDraggingOver ? 'lightblue' : 'lightgrey',
  minHeight: '80px'
});

const isVideo = name => {
  const lower = name.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.ogg') || lower.endsWith('.wav');
};

const isAudio = name => {
  const lower = name.toLowerCase();
  return lower.endsWith('.mp3');
};

const isYouTube = name => {
  return name.includes('youtube://');
};

const isURL = name => {
  return name.includes('http://') || name.includes('https://');
};

const isPDF = name => {
  const lower = name.toLowerCase();
  return lower.endsWith('.odt') || lower.endsWith('.odp') || lower.endsWith('.pptx') || lower.endsWith('.ppt') || lower.endsWith('.pdf');
};

const isPicture = name => {
  const lower = name.toLowerCase();
  return lower.endsWith('.jpg') || lower.endsWith('.png') || lower.endsWith('.jpeg');
};

const isSong = name => {
  return !isVideo(name) &&
         !isAudio(name) &&
         !isYouTube(name) &&
         !isURL(name) &&
         !isPDF(name) &&
         !isPicture(name);
};

export default class Plan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.plan,
      selected: '',
      fileDragging: false,
      youtubeOpen: false
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.reselect = undefined;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.plan !== this.state.items) {
      this.setState({items: nextProps.plan});
      /*if (this.state.selected &&
         nextProps.plan.indexOf(this.state.selected) !== -1) {
        this.playItem(this.state.selected);
      }*/
    }
  }

  componentDidUpdate(nextProps, nextState) {
  }

  onDragEnd(result) {

    console.log('Drag end');

    let items;
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    else if (result.destination.droppableId !== 'droppable' && result.source.droppableId === 'droppable') {
      items = removeItem(
        this.state.items,
        result.source.index
      );
    }
    else if (result.source.droppableId === 'droppable' && result.destination.droppableId === 'droppable') {
      items = reorder(
        this.state.items,
        result.source.index,
        result.destination.index
      );
    } else if (result.source.droppableId !== 'droppable' && result.destination.droppableId === 'droppable') {
      items = insertItem(
        this.state.items,
        result.destination.index,
        result.draggableId
      );
    } else {
      return;
    }

    this.props.setPlan(items);
  }

  playItem(name) {

    this.props.setURL(isURL(name) ? name : undefined, n => {
      if (isSong(name)) {
        const songData = this.props.setSong(name);
        this.props.updateSong(songData);
      } else {
        this.props.updateSong(undefined);
      }
      this.props.setVideo(isVideo(name) ? name : undefined);
      this.props.setAudio(isAudio(name) ? name : undefined);
      this.props.setYouTube(isYouTube(name) ? name : undefined);
      this.props.setPPT(isPDF(name) ? name : undefined);
      this.props.setPicture(isPicture(name) ? name : undefined);
      window.setControls();
    });
      
  }

  handlePlay(name, e) {

    if (!window.getShow()) {
      this.reselect = name; 
      window.showDisplay();
      return;
    }

    if (!name) return;
    if (this.state.selected === name) return this.deselect();
    if (e) {
      e.preventDefault();
    }

    this.playItem(name);
    this.setState({selected: name});
  }

  deselect() {
    this.setState({selected: ''});
    this.props.setURL(undefined, ()=>{});
    this.props.setVideo(undefined);
    this.props.setAudio(undefined);
    this.props.setYouTube(undefined);
    this.props.setPPT(undefined);
    this.props.setPicture(undefined);
    this.props.updateSong();
    window.setControls();
  }


  handleFileDrop(files) {
    for (let i=0; i<files.length; ++i) {
      const file = files[i];
      const item = `file://${file.path.replace(/\\/g, '/')}`;
      const result = Array.from(this.state.items);
      if (result.indexOf(item) === -1) {
        result.push(item);
      }
      this.props.setPlan(result);
      if (item.endsWith('.odt') || item.endsWith('.odp') || item.endsWith('.ppt') || item.endsWith('.pptx')) {
        window.convertPPTtoPDF(item, false, true);
      }
    }
  }

  componentDidMount() {
    this.props.mousetrap('escape', e => {
      if (e) {e.preventDefault();}
      console.log('escape');
      this.deselect();
    });

    const dropZone = document.createElement("DIV");
    dropZone.id = "dropZone";
    dropZone.style.top = "0px";
    dropZone.style.left = "0px";
    dropZone.style.width = "100%";
    dropZone.style.width = "100%";
    dropZone.style.height = "100%";
    dropZone.style.position = "absolute";
    //dropZone.style.pointerEvents = "none";
    dropZone.style.backgroundColor = "#000000";
    dropZone.style.opacity = 0.5;
    dropZone.style.zIndex = 10;
    dropZone.style.visibility = "hidden";
    const message = document.createElement("h1");
    message.style.textAlign = "center";
    message.style.position = "absolute";
    message.style.width = "100%";
    message.style.display = "block";
    message.style.top = "40%";
    message.style.color = "#fff";
    message.style.pointerEvents = "none";
    const textnode = document.createTextNode("Drop here to add to plan");
    message.appendChild(textnode);
    dropZone.appendChild(message);
    document.body.appendChild(dropZone);
    dropZone.onclick = e => {
      dropZone.style.visibility = "hidden";
    };

    const showDropZone = () => {
      dropZone.style.visibility = "visible";
    };
    const hideDropZone = () => {
      dropZone.style.visibility = "hidden";
    };
    const allowDrag = e => {
      if (true) {  // Test that the item being dragged is a valid one
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
      }
    };
    const handleDrop = e => {
      e.preventDefault();
      console.log('dropped');
      const dt = e.dataTransfer;
      const files = dt.files;
      this.handleFileDrop(files);
      hideDropZone();
    };
    window.addEventListener('dragenter', e => {
      showDropZone();
    });
    dropZone.addEventListener('dragenter', allowDrag);
    dropZone.addEventListener('dragover', allowDrag);
    dropZone.addEventListener('dragleave', e => {
      hideDropZone();
    });
    dropZone.addEventListener('drop', handleDrop);

    window.selectItem = item => {
      if (this.state.selected === item) return;
      console.log('SelectItem', item);
      this.handlePlay(item);
    };

    window.displayReady = () => {
      if (this.reselect) {
        this.handlePlay(this.reselect);
        this.reselect = undefined;
      }
      window.setControls();
    };

    window.reshowFullscreen = () => {
      this.reselect = this.state.selected; 
    };
  }

  handleRemove(name) {
    const index = this.state.items.indexOf(name);
    const items = removeItem(
      this.state.items,
      index
    );
    this.props.setPlan(items);
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    
    return (

      <div>
      
      <Controls 
        colorTheme={this.props.colorTheme}
        deselectPlan={redisplay => {
          if (redisplay) {
            this.reselect = this.state.selected;
          }
          this.deselect();
        }}
        setDisplay={() => {
          this.reselect = this.state.selected;
          this.deselect();
        }}/>

      <DragDropContext className="plan" onDragEnd={this.onDragEnd}>

      <ThemeProvider theme={this.props.colorTheme === 'Dark' ? darkTheme : lightTheme}>
      <Paper className={`paper`} style={{background: this.props.colorTheme === 'Dark' ? '#000' : '#fff'}}>
      <Toolbar>
      <Typography>Plan</Typography>
      <div style={{position: 'absolute', right: '20px'}}>
      <Tooltip title="Clear the plan">
      <IconButton onClick={() => {this.setState({items: []}); this.props.setPlan([]);}}>
      <DeleteSweepIcon/>
      </IconButton>
      </Tooltip>
      <AddToPlanMenu 
        addFiles={
          files => this.handleFileDrop(files.map(f => {return {path:f}}))}
        addYouTube={() => {
          this.setState({youtubeOpen: true});
        }}
        addWebPage={() => {
          const item = `https://www.google.com`;
          const result = Array.from(this.state.items);
          if (result.indexOf(item) === -1) {
            result.push(item);
          }
          this.props.setPlan(result);
        }}
      />
      <Tooltip title="Show nothing">
      <IconButton onClick={this.deselect.bind(this)}>
      <PanoramaWideAngleIcon/>
      </IconButton>
      </Tooltip>
      </div>

      </Toolbar>

        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <RootRef rootRef={provided.innerRef}>

              <List style={getListStyle(snapshot.isDraggingOver)}>

                {this.state.items.length === 0 ? <div className="dragHint">Drag items here...</div> :
                 this.state.items
                 .filter(item => (item!=='' && item !== null))
                 .map((item, index) => (
                  <Draggable key={item} draggableId={item} index={index}>
                    {(provided, snapshot) => {
                      const iconColor = this.props.colorTheme === 'Dark' ? "#fff" : "#000";
                      return (
                      <ThemeProvider theme={this.props.colorTheme === 'Dark' ? darkTheme : lightTheme}>
                      <ListItem
                        ContainerComponent="li"
                        ContainerProps={{ ref: provided.innerRef }}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={this.props.colorTheme === 'Dark' ? 
                        getItemStyleDark(
                          snapshot.isDragging,
                          provided.draggableProps.style,
                          this.state.selected === item,
                          index+1
                        ) : 
                        getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style,
                          this.state.selected === item,
                          index+1
                        )}
                      >
                        
                        <ListItemIcon>
                        <Tooltip title="Show this">
                          {this.state.selected !== item ?
                        <Button onClick={this.handlePlay.bind(this,item)}>
                         <PlayArrowIcon/><span style={{width: '20px'}}>{index + 1}</span>
                         </Button> : 
                          <Button onClick={this.handlePlay.bind(this,item)}>
                          <DesktopWindowsIcon /><span style={{width: '20px'}}>{index + 1}</span>
                          </Button> 
                        }
                         </Tooltip>
                          </ListItemIcon>
                          
                          <div style={{paddingRight:'10px'}}>
                          {!item ? null :
                            isVideo(item) ? 
                          <Tooltip title="Video">
                              <TheatersIcon style={{color: iconColor}}/></Tooltip> : 
                            isAudio(item) ?
                            <Tooltip title="Sound">
                              <GraphicEqIcon style={{color: iconColor}}/></Tooltip> : 
                            isYouTube(item) ? 
                            <Tooltip title="YouTube">
                              <YouTubeIcon style={{color: iconColor}}/></Tooltip> : 
                            isPDF(item) ? 
                            <Tooltip title="Presentation">
                              <PictureInPictureIcon style={{color: iconColor}}/></Tooltip> :
                            isURL(item) ? 
                            <Tooltip title="Web Page">
                              <PublicIcon style={{color: iconColor}}/></Tooltip> :
                            isPicture(item) ? 
                            <Tooltip title="Picture"><ImageIcon style={{color: iconColor}}/></Tooltip> :
                            <Tooltip title="Song Words"><QueueMusicIcon style={{color: iconColor}} /></Tooltip>}
                            </div>
                          <Tooltip title={item}>
                        <ListItemText style={{color: iconColor}}
                           primary={
                            (() => {
                              if (!item) return "Empty";
                              let displayName = item;
                              if (displayName.startsWith('file://') ||
                                  displayName.startsWith('youtube://')) {
                                const bits = item.split('/');
                                displayName = bits[bits.length - 1];
                              }
                             return displayName.length > 28 ?
                               displayName.substring(0, 20) + '...' : 
                               displayName;
                            })()}
                        />
                        </Tooltip>
                        

                        <ListItemSecondaryAction>
                          <Tooltip title="Remove from plan">
                           <Button onClick={this.handleRemove.bind(this,item)}>
                            <DeleteIcon />
                            </Button>
                            </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      </ThemeProvider>
                    );}}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            </RootRef>
          )}
        </Droppable>
      
     </Paper>
     </ThemeProvider>
     
     <SongList
          colorTheme={this.props.colorTheme}
          songList={this.props.songList}
          setSong={name=> {
            this.setState({selected: name});
            this.props.setVideo(undefined);
            this.props.setYouTube(undefined);
            this.props.setPPT(undefined);
            this.props.setPicture(undefined);
            return this.props.setSong(name);
          }}
          searchIndex={this.props.searchIndex}
          searchIndex2={this.props.searchIndex2}
          searchIndex3={this.props.searchIndex3}
          updateSong={this.props.updateSong}
          handleEditing={this.props.handleEditing}
          plan={this.props.plan}
          addToPlan={this.props.addToPlan}
          createSong={this.props.createSong}
          selected={this.state.selected}
          />

      </DragDropContext>

      <YouTubeDialog 
        open={this.state.youtubeOpen}
        handleEditing={this.props.handleEditing}
        onClose={(value, title) => {
          this.setState({youtubeOpen: false});
          if (value) {
            const item = `${title} youtube://${value}`;
            const result = Array.from(this.state.items);
            if (result.indexOf(item) === -1) {
              result.push(item);
            }
            this.props.setPlan(result);
          }
        }}
      />
     </div>
    );
  }
}
