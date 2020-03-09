import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;
var runExec = electron.remote.require('./electron-starter.js').runExec;

const useStyles = makeStyles(theme => ({
    container: {
        
        top: '0px'
    },
    formControl: {
     position: 'absolute',
      margin: '5px',
      top: '0px',
      left: '0px'
    },
    input: {
        padding: '10px',
        width: '340px'
    }
  }));

export default () => {
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null }
  })
  const [inputs, setInputs] = useState({
    email: '',
    message: ''
  })
  const classes = useStyles();
  const handleServerResponse = (ok, msg) => {
    if (ok) {
      setStatus({
        submitted: true,
        submitting: false,
        info: { error: false, msg: msg }
      })
    } else {
      setStatus({
        info: { error: true, msg: msg }
      })
    }
  }
  const handleOnChange = e => {
    e.persist()
    setInputs(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
    setStatus({
      submitted: false,
      submitting: false,
      info: { error: false, msg: null }
    })
  }
  const handleOnSubmit = e => {
    e.preventDefault()

    runExec(inputs.name);
  }

  const name = '';
  return (
    <main>
      <form>
      <FormControl className={classes.formControl}>
        <TextField className={classes.input} 
        label="Name" id="name" required variant="outlined" multiline
        onChange={handleOnChange}/>
        <TextField className={classes.input} id="email" 
        label="Email" type="email" name="_replyto" required variant="outlined" multiline
        onChange={handleOnChange}/>
        <TextField className={classes.input} id="message" 
            label="Message" multiline rows="5" 
            variant="outlined" name="message" required
            onChange={handleOnChange}/>
        <Button disabled={status.submitting} variant="contained"
         style={{width: '120px', left: '150px'}}onClick={handleOnSubmit}>
        {!status.submitting
            ? !status.submitted
              ? 'Submit'
              : 'Submitted'
            : 'Submitting...'}
        </Button>
      </FormControl>
      </form>

      {status.info.error && (
        <div style={{position: 'absolute', left: '20px', bottom: '10px'}}>Error: {status.info.msg}</div>
      )}
      {!status.info.error && status.info.msg && <p>{status.info.msg}</p>}
    </main>
  )
}
