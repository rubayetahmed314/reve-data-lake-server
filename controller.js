const mysql = require("mysql2/promise");
const sharp = require("sharp");

const fs = require("fs");
const { spawn } = require("child_process");

const encoder = new TextEncoder("utf-8");
const decoder = new TextDecoder("utf-8");
const utf8 = require("utf8");

const tesseract = require("node-tesseract-ocr");

let filename = null;
let ocrData = "";

global.Buffer = global.Buffer || require("buffer").Buffer;

if (typeof btoa === "undefined") {
    global.btoa = function (str) {
        return new Buffer.from(str, "binary").toString("base64");
    };
}

if (typeof atob === "undefined") {
    global.atob = function (b64Encoded) {
        return new Buffer.from(b64Encoded, "base64").toString("binary");
    };
}

function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
    c = array[i++];
    switch(c >> 4)
    { 
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
    }

    return out;
}

function bytesToString(bytes) {
    var chars = [];
    for(var i = 0, n = bytes.length; i < n;) {
        chars.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
    }
    return String.fromCharCode.apply(null, chars);
}

function dataURLtoFile(dataurl) {
    let arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1].split("/")[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    filename = `input.${mime}`;
    console.log("File Name:", filename);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    // fs.writeFile(filename, u8arr, err => {});

    sharp(u8arr)
        // .resize(32, 32)
        .grayscale()
        .toFile(filename, (err, info) => {
            if (err) {
                console.log(err.message);
            }
        });
}

exports.getData = async function (req, res) {
    console.log("Request: ", req.body);
    try {
        const conn = await mysql.createConnection({
            host: "119.148.4.21",
            port: 3306,
            user: "tusher",
            password: "12345",
            database: "sd09_tts_data",
        });
        const [rows, fields] = await conn.execute(`SELECT * FROM data_offline`);
        const results = { users: rows };
        // res.render("pages/index", results);
        res.json({
            result: results,
        });
        await conn.end();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
};

exports.postData = async function (req, res) {
    console.log("Request: ", req.body);
    try {
        const conn = await mysql.createConnection({
            host: "119.148.4.21",
            port: 3306,
            user: "tusher",
            password: "12345",
            database: "sd09_tts_data",
        });
        const [rows, fields] = await conn.execute(
            `INSERT INTO data_offline VALUES ('${req.body.content}', '${req.body.reference}')`
        );
        const results = { users: rows };
        // res.render("pages/index", results);
        res.json({
            result: results,
        });
        await conn.end();
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
};

exports.convert = (req, res) => {
    console.log("Request: ", req.body);

    /*
        let base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");

        fs.writeFile("test.jpg", base64Data, 'base64', function(err) {
            console.log(err);
        });
    */

    dataURLtoFile(req.body.image);

    try {
        // const pythonProcess = spawn("python", [
        //     "first_ocr.py",
        //     filename,
        //     req.body.psm_mode,
        // ]);

        // pythonProcess.stdout.on("data", data => {
        //     // Do something with the data returned from python script
        //     // console.log(`stdout: ${data}`);
        // });

        // pythonProcess.stderr.on("data", data => {
        //     console.log(`stderr: ${data}`);
        //     res.json({ status: "ERROR" });
        // });

        // pythonProcess.on("close", code => {
        //     // res.json({ status: "DONE" });
        //     console.log(`child process exited with code: ${code}`);
        //     fs.readFile("ocr.txt", 'utf8', function(err, data) {
        //         if (err) throw err;
        //         console.log(data);
        //         res.json({
        //             result: data,
        //         });
        //       });
        // });
        let config = {
            lang: "ben",
            oem: 1,
            psm: req.body.psm_mode,
          }
          
          tesseract
            .recognize(filename, config)
            .then((text) => {
              console.log("Result:", text)
              res.json({
                    result: text
                });
            })
            .catch((error) => {
              console.log(error.message)
            });
    } catch (err) {
        console.error("Error:", err);
        res.send("Error " + err);
    }
};
