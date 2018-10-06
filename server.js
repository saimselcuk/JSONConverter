var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var json2md = require("json2md");
var fs = require('fs');

var app = express();


app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('someview', { msg: '', status: '', file: '' });
});

app.use(fileUpload());

app.post('/upload', function (req, res) {
    if (!req.files.jsonupload)
        return res.render('someview', { msg: 'Please select a file!', status: 'error', file: '' });
    let jsonupload = req.files.jsonupload;
    if (jsonupload.mimetype === "text/plain") {
        jsonupload.mv(__dirname + '/static/uploaded/' + jsonupload.name, function (err) {
            if (err)
                return res.render('someview', { msg: err, status: 'error', file: '' });
            else
                return res.render('someview', { msg: 'Selected file uploaded successfully!', status: 'success', file: jsonupload.name });
        });
    }
    else
        return res.render('someview', { msg: 'Please select a JSON file!', status: 'error', file: '' });
});

app.post('/convert', function (req, res) {

    let convert2rmd = req.body.convert2rmd;
    let rawdata = fs.readFileSync(__dirname + '/static/uploaded/' + convert2rmd);
    var rmd = json2md({ img: [convertormd(rawdata)] });
    fs.writeFile(__dirname + '/static/uploaded/convert2rmd.rmd', rmd, function (err) {
        if (err) {
            return res.render('someview', { msg: err, status: 'error', file: '' });
        }
        return res.redirect('someview/download');
    });
});

app.get('/someview/download', function (req, res) {
    var file = __dirname + '/static/uploaded/convert2rmd.rmd';
    res.download(file);  
});

function convertormd(text) {
    var disassemble = text.toString().split(",");
    var rmd = "";
    for (var i = 0; i < disassemble.length; i++) {
        var line = disassemble[i].toString().split(":");
        var title = line[0];
        var content = line[1];
        if (title !== null && content !== null) {
            title = title.toString().replace("{", '');
            content = content.toString().replace("}", '');
            rmd += "{ title:" + title + ", source:" + content + "},";
        }
    }
    rmd = rmd.substring(0, rmd.length - 1);
    return rmd;
}

app.use('/static', express.static('static'));
app.listen(1337);

   
