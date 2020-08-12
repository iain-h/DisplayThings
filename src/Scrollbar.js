function addCss(rule) {
    var css = document.createElement('style');
    css.type = 'text/css';
    if (css.styleSheet) css.styleSheet.cssText = rule; // Support for IE
    else css.appendChild(document.createTextNode(rule)); // Support for the rest
    document.getElementsByTagName("head")[0].appendChild(css);
 }
 
 const css  = `
 ::-webkit-scrollbar {
    height: 8px;
    width: 8px;
 }
 ::-webkit-scrollbar-track-piece {
    background: #555;
 }
 ::-webkit-scrollbar-thumb:vertical,
 ::-webkit-scrollbar-thumb:horizontal {
    background: #E5E5E5;
    border-radius: 20px;
 } 
 `;


 addCss(css);
