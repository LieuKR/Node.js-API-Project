import path from "path";

interface FileList {
  [key: string]: string;
}

const HtmlList : FileList = {
  "mainpage": path.join(__dirname, '../Frontside/Page/mainpage/index.html'),
  "errorpage": path.join(__dirname, '../Frontside/Page/errorpage/index.html'),
};

// Get html file path by page name
const GetPageHtmlAbsolutePath = function(pagename : string){

  let AbsolutePath: string;
  if(!Object.keys(HtmlList).includes(pagename)) AbsolutePath = HtmlList.errorpage;
  AbsolutePath = HtmlList[pagename];

  return AbsolutePath;
}

export {GetPageHtmlAbsolutePath}