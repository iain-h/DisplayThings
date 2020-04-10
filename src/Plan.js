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

import PanoramaWideAngleIcon from '@material-ui/icons/PanoramaWideAngle';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteIcon from '@material-ui/icons/Delete';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SongList from './SongList';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';

// fake data generator
const getItems = count =>
 [];

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
  result.splice(endIndex, 0, newItem);
  return result;
};

const getItemStyle = (isDragging, draggableStyle, selected) => ({
  // styles we need to apply on draggables
  ...draggableStyle, height: '30px',

  ...(isDragging && {
    background: "rgb(235,235,235)"
  }),
  ...(selected && {
    background: "rgb(256,256,0)"
  })
});

const getListStyle = isDraggingOver => ({
  //background: isDraggingOver ? 'lightblue' : 'lightgrey',
});

export default class Plan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.plan,
      selected: ''
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.plan !== this.state.items) {
      this.setState({items: nextProps.plan});
    }
  }

  onDragEnd(result) {

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

  handleEdit(name, index, e) {
    if (this.state.selected === name) return this.deselect();
    e.preventDefault();
    window.setSong(name, songData => {
      this.props.updateSong(songData);
    });
    this.setState({selected: name});
    return true;
  }

  deselect() {
    this.setState({selected: ''});
    window.setWords('');
  }

  componentDidMount() {
    this.props.mousetrap('escape', e => {
      if (e) {e.preventDefault();}
      console.log('escape');
      this.deselect();
    });
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
      <Tooltip title="Show nothing">
      <IconButton onClick={this.deselect.bind(this)}>
      <PanoramaWideAngleIcon/>
      </IconButton>
      </Tooltip>
      </Toolbar>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <RootRef rootRef={provided.innerRef}>
              <List style={getListStyle(snapshot.isDraggingOver)}>
                {this.state.items.map((item, index) => (
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
                          this.state.selected === item
                        )}
                      >
                        <ListItemIcon>
                        <Tooltip title="Show this">
                          {this.state.selected !== item ?
                        <IconButton onClick={this.handleEdit.bind(this,item, index)}>
                         <PlayArrowIcon/>{index + 1}
                         </IconButton> : 
                          <IconButton onClick={this.handleEdit.bind(this,item, index)}>
                          <DesktopWindowsIcon />{index + 1}
                          </IconButton> 
                        }
                         </Tooltip>
                          </ListItemIcon>
                          <Tooltip title={item}>
                        <ListItemText
                           primary={item.length > 28 ? item.substring(0, 25) + '...' :  item}
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
            this.deselect();
            return this.props.setSong(name);
          }}
          searchIndex={this.props.searchIndex}
          updateSong={this.props.updateSong}
          handleEditing={this.props.handleEditing}
          plan={this.props.plan}
          addToPlan={this.props.addToPlan}
          />

      </DragDropContext>
     </div>
    );
  }
}
