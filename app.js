import express from 'express'
import fs from 'fs'
import ejs from 'ejs'
import xml2js from 'xml2js'
const app = express(); 
const PORT = process.env.PORT || 8000;
const SERVER_ADDR = "127.0.0.1"

app.use(express.static('public'));
app.engine('html',ejs.renderFile);
app.set('view engine', 'html')


app.get('/',async (req,res) => {
    
    const xml = fs.readFileSync(__dirname + '/public/mpd4/dash.mpd', 'utf-8');
    const parser = new xml2js.Parser();
 
     parser.parseString(xml, function(err, result) {
        // console.log(result)
        console.log(result.MPD.Period[0].AdaptationSet[0].SegmentTemplate[0].$);
        console.log(result.MPD.Period[0].AdaptationSet[0].Representation[0].$);
        const seg = result.MPD.Period[0].AdaptationSet[0].SegmentTemplate[0].$
        const rep = result.MPD.Period[0].AdaptationSet[0].Representation[0].$
        const params =  {
            media:seg.media,
            init:seg.initialization,
            startNumber: seg.startNumber,
            mimeType:rep.mimeType,
            codecs:rep.codecs,
            sourceBuffer: `${rep.mimeType}; codecs="${rep.codecs}"`
        }
        console.log('params > ',params)
        res.render('index',params)
    });
})

app.listen(PORT, function() {
	console.log(`Launching server listening on ... app http://${SERVER_ADDR}:${PORT}`);
})

