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
  const addWebpage = () => {
    setAnchorEl(null);
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
      <MenuItem onClick={addFile}>Add file</MenuItem>
      <MenuItem onClick={addWebpage}>Add webpage</MenuItem>
      </Menu>
    </div>
  );
}

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
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

const getListStyle = isDraggingOver => ({
  //background: isDraggingOver ? 'lightblue' : 'lightgrey',
  minHeight: '80px'
});

const isVideo = name => {
  const lower = name.toLowerCase();
  return lower.endsWith('.mp4');
};

const isPDF = name => {
  const lower = name.toLowerCase();
  return lower.endsWith('.pptx') || lower.endsWith('.ppt') || lower.endsWith('.pdf');
};

const isPicture = name => {
  const lower = name.toLowerCase();
  return lower.endsWith('.jpg') || lower.endsWith('.png') || lower.endsWith('.jpeg');
};

export default class Plan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.plan,
      selected: '',
      fileDragging: false
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.plan !== this.state.items) {
      this.setState({items: nextProps.plan});
    }
  }

  onDragEnd(result) {

    console.log('Drag end');

    let items;
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    else if (result.destination.droppableId !== 'droppable') {
      items = removeItem(
        this.state.items,
        result.source.index
      );
    }
    else if (result.source.droppableId === result.destination.droppableId) {
      items = reorder(
        this.state.items,
        result.source.index,
        result.destination.index
      );
    } else {
      items = insertItem(
        this.state.items,
        result.destination.index,
        result.draggableId
      );
    }

    this.props.setPlan(items);
  }

  handlePlay(name, index, e) {
    if (this.state.selected === name) return this.deselect();
    e.preventDefault();

    // Check for video
    if (isVideo(name)) {
      this.props.updateSong(undefined);
      this.props.setVideo(name);
      this.props.setPPT(undefined);
      this.props.setPicture(undefined);
      this.setState({selected: name});
      return;
    }

     // Check for ppt
     if (isPDF(name)) {
      this.props.updateSong(undefined);
      this.props.setVideo(undefined);
      this.props.setPPT(name);
      this.props.setPicture(undefined);
      this.setState({selected: name});
      return;
    }

    // Check for picture
    if (isPicture(name)) {
      this.props.updateSong(undefined);
      this.props.setVideo(undefined);
      this.props.setPPT(undefined);
      this.props.setPicture(name);
      this.setState({selected: name});
      return;
    }

    const songData = this.props.setSong(name);
    this.props.updateSong(songData);
    this.setState({selected: name});
    this.props.setVideo(undefined);
    this.props.setPPT(undefined);
    this.props.setPicture(undefined);
    return true;
  }

  deselect() {
    this.setState({selected: ''});
    this.props.setVideo(undefined);
    this.props.setPPT(undefined);
    this.props.setPicture(undefined);
    this.props.updateSong();
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
      if (item.endsWith('.ppt') || item.endsWith('.pptx')) {
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
      <DragDropContext className="plan" onDragEnd={this.onDragEnd}>

      <Paper className="paper">
      <Toolbar>
      <Typography >Plan</Typography>
      <div style={{position: 'absolute', right: '20px'}}>
      <Tooltip title="Clear the plan">
      <IconButton onClick={() => {this.setState({items: []}); this.props.setPlan([]);}}>
      <DeleteSweepIcon/>
      </IconButton>
      </Tooltip>
      <AddToPlanMenu addFiles={files => this.handleFileDrop(files.map(f => {return {path:f}}))}/>
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

                {this.state.items.length === 0 ? <div class="dragHint">Drag items here...</div> :
                 this.state.items.map((item, index) => (
                  <Draggable key={item} draggableId={item} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        ContainerComponent="li"
                        ContainerProps={{ ref: provided.innerRef }}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style,
                          this.state.selected === item,
                          index+1
                        )}
                      >
                        <ListItemIcon>
                        <Tooltip title="Show this">
                          {this.state.selected !== item ?
                        <IconButton onClick={this.handlePlay.bind(this,item, index)}>
                         <PlayArrowIcon/><span style={{width: '20px'}}>{index + 1}</span>
                         </IconButton> : 
                          <IconButton onClick={this.handlePlay.bind(this,item, index)}>
                          <DesktopWindowsIcon /><span style={{width: '20px'}}>{index + 1}</span>
                          </IconButton> 
                        }
                         </Tooltip>
                          </ListItemIcon>
                          <div style={{paddingRight:'10px'}}>
                          {isVideo(item) ? 
                          <Tooltip title="Video">
                            <TheatersIcon/></Tooltip> : 
                            isPDF(item) ? 
                            <Tooltip title="Presentation">
                            <PictureInPictureIcon/></Tooltip> :
                            isPicture(item) ? 
                            <Tooltip title="Picture"><ImageIcon/></Tooltip> :
                            <Tooltip title="Song"><QueueMusicIcon /></Tooltip>}</div>
                          <Tooltip title={item}>
                        <ListItemText
                           primary={
                            (() => {
                              let displayName = item;
                              if (displayName.startsWith('file://')) {
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
                           <IconButton onClick={this.handleRemove.bind(this,item)}>
                            <DeleteIcon />
                            </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            </RootRef>
          )}
        </Droppable>
      
     </Paper>

     <SongList
          songList={this.props.songList}
          setSong={name=> {
            this.setState({selected: ''});
            return this.props.setSong(name);
          }}
          searchIndex={this.props.searchIndex}
          updateSong={this.props.updateSong}
          handleEditing={this.props.handleEditing}
          plan={this.props.plan}
          addToPlan={this.props.addToPlan}
          createSong={this.props.createSong}
          />

      </DragDropContext>

     </div>
    );
  }
}
