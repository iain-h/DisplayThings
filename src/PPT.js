

import React, {Component} from 'react'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import Tooltip from '@material-ui/core/Tooltip';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `./pdf.worker.js`;

const styles = {
    paper: {
      display: 'inline',
      width: '100%',
      marginBottom: '10px',
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  };

export default class PPT extends Component {

  state = {
    numPages: 0,
    selectedPage: 1,
    pptFile: this.props.pptFile
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  }

  componentDidMount() {
    this.props.mousetrap('down', e => {
      if (e) {e.preventDefault();}
      this.nextSlide();
    });

    this.props.mousetrap('up', e => {
      if (e) {e.preventDefault();}
      console.log('prev slide');
      this.prevSlide();
    });
  }

  componentDidUpdate() {
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('component update')

    if (nextProps.pptFile !== this.props.pptFile) {
      console.log('prop change');
      this.setState({pptFile: nextProps.pptFile});

      // Prevent key capture in app parent
      this.props.handleEditing(nextProps.pptFile !== undefined);

    }

    if (nextState.pptFile != this.state.pptFile ||
        nextState.selectedPage != this.state.selectedPage) {
        window.showPDF({file: nextState.pptFile, page: nextState.selectedPage});
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
  }

  prevSlide() {
    let prev = this.state.selectedPage - 1;
    if (prev < 1) {
      prev = 1;
    }
    this.setState({selectedPage: prev});
    console.log(prev);
  }

  render() {
    if (this.state.pptFile === undefined) {
      return null;
    }
    console.log('render');
    return (

        <Document
                file={this.state.pptFile}
                onLoadSuccess={this.onDocumentLoadSuccess}
                >

             <div style={{
                display: 'float'
                }}>
          {(() => {
              const pages = [];
              for (let i=0;i<this.state.numPages;++i) {
                const selected = (i+1==this.state.selectedPage);
                pages.push(
                  <div style={{
                    display: 'inline-block',
                    width: '250px',
                    margin: '5px'
                    }}>
                <div style={{
                  display: 'inline-block',
                  width: '250px',
                  border: selected ? '2px solid' : '1px solid',
                  borderColor: selected ? '#f00' : '#000',
                  padding: '0px',
                  boxShadow: '5px 10px 8px ' + (selected ? '#998888' : '#888888')}}>
                  <Page width={250} pageNumber={i+1} />
                  </div>
                  <span style={{
                    display: 'block',
                    textAlign: 'center',
                    color: selected ? '#f00' : '#000'
                    }}>{i+1}</span>
                </div>
                );
              }
              return pages;
          })()
           }
           </div>
              
        </Document>

    );
  }
}
