

import React, {Component} from 'react'

export default function Picture(props) {
  const [file, setFile] = React.useState(undefined);

  React.useEffect(() => {
    setFile(props.file);
  }, [props.file]);

  return props.file ? <img src={props.file} style={{maxWidth: '300px', maxHeight: '300px'}}></img> : null;
}
