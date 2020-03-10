
import React, {Component} from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const electron = window.require('electron');
const {getSongs, setSong} = electron.remote.require('./electron-starter.js');

const columns = [
  { id: 'name', label: 'Name', minWidth: 170 }
];

export default class SongList extends Component {

state = {songs: [{name: "song"}]};

componentDidMount() {
    getSongs(songs => {
        this.setState({songs});
    });
}

handleClick(value) {
    setSong(value);
}

render() {

  return (
    <Paper className="songListRoot">
      <TableContainer style={{ maxHeight: 400 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.songs.map((row, i) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                  {columns.map(column => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align} onClick={() => this.handleClick(value)}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
 }
}