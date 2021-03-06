

import React, {Component} from 'react'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import Tooltip from '@material-ui/core/Tooltip';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { Document, Page, pdfjs } from 'react-pdf';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import RefreshIcon from '@material-ui/icons/Refresh';
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


pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.js`;


function PDFPage(props) {
  const [pageLoaded, setPageLoaded] = React.useState('not');
  const [selected, setSelected] = React.useState(false);
  const [id, setID] = React.useState(`pdfPage${props.page}`);
  const [height, setHeight] = React.useState(200);

  const loadPage = async () => {
    if (pageLoaded !== 'not') return;
    setPageLoaded('loading');
    const page = await props.pdfDoc.getPage(props.page);
    const viewport = page.getViewport(2.0);
    const canvas = document.getElementById(id);
    const context = canvas.getContext('2d');

    const ratio = viewport.width / viewport.height;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.height = 250 / ratio + 'px';
    canvas.style.width = '100%';

    setHeight(canvas.style.height - 20);

    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext);
    setPageLoaded('loaded');

  };

  loadPage();

  const handleClick = e => {
    props.handleClick(props.page);
  };

  React.useEffect(() => {
    setSelected(props.selected);
  }, [props.selected]);

  return  <div style={{
    display: 'inline-block',
    width: '250px',
    height: height + 'px',
    margin: '5px'
    }}>
      <Button onClick={handleClick}>

      <canvas id={id}  style={{
      display: 'inline-block',
      border: selected ? '2px solid' : '1px solid',
      borderColor: selected ? '#f00' : props.colorTheme === 'Dark' ? '#fff' : '#000',
      padding: '0px',
      boxShadow: '5px 10px 8px ' + (props.colorTheme === 'Dark' ? '#000' : selected ? '#998888' :  '#888888')}}/>

      </Button>
      <span style={{
        display: 'block',
        textAlign: 'center',
        color: selected ? '#f00' : props.colorTheme === 'Dark' ? '#fff' : '#000'
        }}>{props.page}</span>
    </div>;
}

function PDFDocument(props) {
  const [numPages, setNumPages] = React.useState(0);
  const [pdfDoc, setPDFDoc] = React.useState(undefined);
  const [selected, setSelected] = React.useState(undefined);

  const loadFile = async file => {
    if (numPages !== 0) return;
    try {
      const pdfDoc = await pdfjs.getDocument(file);
      setPDFDoc(pdfDoc);
      setNumPages(pdfDoc.numPages);
      props.onDocumentLoadSuccess(pdfDoc.numPages);
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    if (props.file) {
      loadFile(props.file);
    }
  }, [props.file]);

  React.useEffect(() => {
    if (props.selected) {
      setSelected(props.selected);
    }
  }, [props.selected]);

  loadFile(props.file);

  return <div style={{display: 'float'}}>

    {(() => {
      const pages = [];
      for (let i=0;i<numPages;++i) {
        pages.push(<PDFPage 
          colorTheme={props.colorTheme}
          page={i+1}
          pdfDoc={pdfDoc}
          handleClick={props.handleClick}
          selected={selected === i+1}/>);
      }
      return pages;
    })()}

  </div>;
}

function scrollIntoViewIfNeeded(target) { 
  if (target.getBoundingClientRect().bottom > window.innerHeight) {
      target.scrollIntoView(false);
  }

  if (target.getBoundingClientRect().top < 0) {
      target.scrollIntoView();
  } 
}


export default class PDF extends Component {

  state = {
    numPages: 0,
    selectedPage: 1,
    pdfFile: this.props.pdfFile,
    pptFile: this.props.pptFile
  }

  componentDidMount() {
    this.props.mousetrap('down', e => {
      if (!this.state.pdfFile) return;
      if (e) {e.preventDefault();}
      this.nextSlide();
    });

    this.props.mousetrap('up', e => {
      if (!this.state.pdfFile) return;
      if (e) {e.preventDefault();}
      console.log('prev slide');
      this.prevSlide();
    });

    for (let i=1; i<10; ++i) {
      this.props.mousetrap(i.toFixed(0), e => {
        if (!this.state.pdfFile) return;
        if (e) {e.preventDefault();}
        console.log('slide', i);
        this.setState({selectedPage: i});
      });
    }
  }

  componentDidUpdate() {
  }

  componentWillUpdate(nextProps, nextState) {
   // console.log('component update')

    if (nextProps.pdfFile !== this.props.pdfFile ||
      nextProps.pptFile !== this.props.pptFile) {
      console.log('prop change');
      this.setState({pdfFile: nextProps.pdfFile, pptFile: nextProps.pptFile, selectedPage: 1});
    }

    if (nextState.pdfFile != this.state.pdfFile ||
        nextState.selectedPage != this.state.selectedPage) {
        window.showPDF({file: nextState.pdfFile, page: nextState.selectedPage});
      }
  }

  nextSlide() {
    console.log('next slide');
    let next = this.state.selectedPage + 1;
    if (next > this.state.numPages) {
      next = this.state.numPages;
    }
    console.log(next);
    this.setState({selectedPage: next});

    const element = document.getElementById(`pdfPage${next}`);
    if (element) {
      scrollIntoViewIfNeeded(element);
    }
  }

  prevSlide() {
    let prev = this.state.selectedPage - 1;
    if (prev < 1) {
      prev = 1;
    }
    this.setState({selectedPage: prev});
    console.log(prev);

    const element = document.getElementById(`pdfPage${prev}`);
    if (element) {
      scrollIntoViewIfNeeded(element);
    }
  }

  reload() {
    this.props.reload();
  }

  render() {
    if (this.state.pptFile === undefined && this.state.pdfFile === undefined) {
      return null;
    }

    if (!this.state.pdfFile) {
      return <CircularProgress />;
    }

    console.log('render');
    return (
        <div>
           <ThemeProvider theme={this.props.colorTheme === 'Dark' ? darkTheme : lightTheme}>
        {
        this.state.pptFile ?
        <Tooltip title="Reload">
        <IconButton onClick={this.reload.bind(this)}>
          <RefreshIcon/>
        </IconButton>
        </Tooltip> : null
        }
        <PDFDocument
          colorTheme={this.props.colorTheme}
          file={this.state.pdfFile}
          selected={this.state.selectedPage}
          onDocumentLoadSuccess={numPages => {
            this.setState({ numPages });
          }}
          handleClick={page => {
            this.setState({selectedPage: page});
          }}/>
          </ThemeProvider>
    </div>
    );
  }
}
