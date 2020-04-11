

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  ListItemSecondaryAction
} from "@material-ui/core";
import InboxIcon from "@material-ui/icons/Inbox";
import EditIcon from "@material-ui/icons/Edit";
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import Input from '@material-ui/core/Input';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import RootRef from "@material-ui/core/RootRef";
const headCells = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Name' }
];

const getItemStyle = (isDragging, draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle, height: '30px',

  ...(isDragging && {
    background: "rgb(235,235,235)"
  })
});

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  search: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%'
  }
}));

const EnhancedTableToolbar = props => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.froot, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {(
       <div>
      
       <Input
         className={classes.input}
         placeholder="Search Songs"
         inputProps={{ 'aria-label': 'search for songs' }}
         onChange={props.handleSearch}
         onFocus={e => {props.handleEditing(true);}}
         onBlur={e => {props.handleEditing(false);}}
       />

       <IconButton className={classes.iconButton} aria-label="search">
         <SearchIcon />
       </IconButton>
       
       <Tooltip title="Add a song">
        <IconButton onClick={props.createSong}>
            <AddIcon/>
          </IconButton>
        </Tooltip>
       </div>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%x',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
   
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function EnhancedTable(props) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  React.useEffect(() => {
    console.log('doSearch');
    doSearch(searchTerm);
  }, [props.songList]);

  const handleEdit = (name, event) => {
    const songData = props.setSong(name);
    console.log(name, songData.fields);
    props.updateSong(songData);
  };

  const doSearch = (value) => {
    if (value.length === 0) {
      setSearchResults([]);
      console.log('no search');
    }
    //if (!props.searchIndex) return;
    props.searchIndex.search(value, {
      limit: 20
    }, results => {
      //if (results.length > 0) {
        setSearchResults(results.map(idx => props.songList[idx]));
        handleChangePage(null, 0);
      //}
    });
  };

  const handleSearch = e => {
    setSearchTerm(e.target.value);
    doSearch(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = name => props.plan.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, props.songList.length - page * rowsPerPage);

  const rows = searchTerm === '' ? props.songList : searchResults;

  return (

      <Paper className={classes.paper}>
        <EnhancedTableToolbar
           searchIndex={props.searchIndex}
           handleSearch={handleSearch}
           songList={props.songList}
           handleChangePage={handleChangePage}
           handleEditing={props.handleEditing}
           createSong={props.createSong}
        />
          <Droppable droppableId="songList">
            {(provided, snapshot) => (
              <RootRef rootRef={provided.innerRef}>
                <List>
                  {rows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage + props.plan.length)
                        .filter((row, index) => props.plan.indexOf(row) == -1)
                        .map((row, index) => {
                          if (index >= rowsPerPage) return null;
                       return (
                    <Draggable key={row} draggableId={row} index={index}>
                       {(provided, snapshot) => (
                      <ListItem
                          ContainerComponent="li"
                          ContainerProps={{ ref: provided.innerRef }}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <ListItemIcon>
                          <IconButton onClick={handleEdit.bind(null,row, index)}>
                            <EditIcon/>
                          </IconButton>
                          </ListItemIcon>
                          <Tooltip title={row}>
                          <ListItemText
                            primary={row.length > 28 ? row.substring(0, 25) + '...' :  row}
                          />
                          </Tooltip>
                          <ListItemSecondaryAction>

                          </ListItemSecondaryAction>
                        </ListItem>)}
                    </Draggable>
                  );}
                  )}
                  {provided.placeholder}
                </List>
              </RootRef>
            )}
          </Droppable>

        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />

      </Paper>

  );
}
