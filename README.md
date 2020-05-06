About
============
I made a new tool called HTML Build that builds Linux, Mac, and Windows apps from an HTML file. To make an app, use the HTMLifier, then upload the HTMLified project and an icon ( in PNG format ) to https://html-build.glitch.me/, type in a name, click build, and wait. And wait. And wait. Status messages are logged to the console. When it's done, it will download a zip file. In that zip, there are 3 more, for Linux, Mac, and Windows respectively. Run the file in your platform's zip that sounds most like “nw” or “nwjs”.

How It Works
------------
This is a web app that downloads zip files from the nw.js servers, and adds the necessary files with JSZip. No information from the form is sent to any servers. I hope you find this useful!
