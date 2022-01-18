// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: cloud;
/**
 * Author: Ryan Stanley (stanleyrya@gmail.com)
 * Github: https://www.github.com/stanleyrya
 * Tips: https://www.paypal.me/stanleyrya
 *
 * A set of classes that can create a word cloud image. Basic Usage:
 *  * const wordCloudWords = [new WordCloudWord({word, weight}), ...]
 *  * const wordCloud = new WordCloud({width, height, wordCloudWords});
 *  * const image = await wordCloud.getImage();
 *
 * This is a minified version to make scripts easier to read,
 * but the full version along with a demo can be found here:
 * https://github.com/stanleyrya/scriptable-word-cloud
 *
 * Advanced features (explained in the demo):
 *  * Modify how the words are displayed and processed (font, color, etc.)
 *  * Modify how the words are placed on the word cloud (star shape, galaxy shape, etc.)
 *  * Display the debugging algorithm by passing in debug=true
 *  * and more!
 *
 * Here's the complete WordCloud constructor for the curious!
 *  {
 *    width, height, wordCloudWords, // required
 *    respectScreenScale = true,
 *    growToFit = true,
 *    debug = false,
 *    weightFunction = this._defaultWeightFunction,
 *    placementFunction = this._defaultPlacementFunction,
 *    growthFunction = this._defaultGrowthFunction,
 *  }
 *
 * This script is split into four sections to make it easier to edit:
 * 1. WORD CLOUD OBJECTS
 * 2. EXAMPLE WEIGHT FUNCTIONS (the `weightFunction` parameter!)
 * 3. EXAMPLE PLACEMENT FUNCTIONS (the `placementFunction` parameter!)
 * 4. SAMPLE LOGIC
 *
 */

/******************************
 ***** WORD CLOUD OBJECTS *****
 ******************************/

class WordCloudWord{constructor({word:r,weight:i}){if(!r)throw"word is required!";if(!i)throw"weight is required!";this.word=r,this.weight=i}}
class WordCloudFont{constructor({fontName:s,cssUrl:o}){if(!s)throw"fontName is required!";this.fontName=s,this.cssURL=o}}
class WordCloudProcessedWord{constructor({word:o,wordCloudFont:r,fontSize:d,color:t}){if(!o)throw"word is required!";if(!r)throw"wordCloudFont is required!";if(!(r instanceof WordCloudFont))throw"wordCloudFont must be a WordCloudFont object!";if(!d)throw"fontSize is required!";if(!t)throw"color is required!";this.word=o,this.wordCloudFont=r,this.fontSize=d,this.color=t}}
class WordCloud{constructor({width:t,height:e,wordCloudWords:i,weightFunction:o=this._defaultWeightFunction,placementFunction:s=this._defaultPlacementFunction,growToFit:n=!0,growthFunction:h=this._defaultGrowthFunction,respectScreenScale:r=!0,debug:d=!1}){if(!t||!e||!i)throw"Could not get width, height, and wordCloudWords from input. Please see documentation.";this.providedWidth=t,this.providedHeight=e,this.placementFunction=s,this.weightFunction=o,this.growToFit=!!n,this.growthFunction=h,this.respectScreenScale=!!r,this.debug=!!d,this.processedWords=i.map(t=>this.weightFunction(t)),this.wordsToPlace=[...this.processedWords],this.placedWords=[],this.webView=new WebView,this.loadedCssUrls={},this.textDimensionsMap={},this.bufferRoom=10;const c=t>e?t:e;this.xRatio=t/c,this.yRatio=e/c}_defaultWeightFunction(t){return new WordCloudProcessedWord({word:t.word,wordCloudFont:new WordCloudFont({fontName:"TrebuchetMS-Bold"}),fontSize:t.weight/10*50+10,color:Device.isUsingDarkAppearance()?Color.white():Color.black()})}_defaultPlacementFunction(t,e,i,o,s,n,h){let r,d,c,a;return h?(({radius:r,radiusDirection:d,angle:c,angleDirection:a}=h),r+=.75*d,c+=2*Math.PI/50*a):(r=0,c=0,d=Math.random()<.5?-1:1,a=Math.random()<.5?-1:1),{x:i+r*Math.cos(c)*s,y:o+r*Math.sin(c)*n,radius:r,angle:c,radiusDirection:d,angleDirection:a}}_defaultGrowthFunction(t,e,i,o){return{width:t+.1*t,height:e+.1*e}}_loadFontToWebView(t,e){const i='<link rel="preconnect" href="https://fonts.gstatic.com"> <link href="REPLACE_HREF" rel="stylesheet"> <div style="font-family: REPLACE_FONT_FAMILY;">.</div>'.replace("REPLACE_HREF",e).replace("REPLACE_FONT_FAMILY",t);return this.webView.loadHTML(i)}_getTextDimensionsUsingWebView(t,e){const i='function getTextDimensions(t,e){const n=document.createElement("canvas").getContext("2d");n.font=e;const o=n.measureText(t);return{width:3*o.width/4,height:3*(o.actualBoundingBoxAscent+o.actualBoundingBoxDescent)/4}}getTextDimensions("REPLACE_TEXT","REPLACE_FONT");'.replace("REPLACE_TEXT",t).replace("REPLACE_FONT",e);return this.webView.evaluateJavaScript(i)}async _getTextDimensions(t,e,i){const o=i+"pt "+e.fontName,s=t+" "+o;if(this.textDimensionsMap[s])return this.textDimensionsMap[s];{e.cssURL&&(this.loadedCssUrls[e.cssURL]||(await this._loadFontToWebView(e.fontName,e.cssURL),this.loadedCssUrls[e.cssURL]=!0));const i=await this._getTextDimensionsUsingWebView(t,o);return this.textDimensionsMap[s]=i,i}}_checkRectCollision(t){for(const e of this.hitBoxes)if(t.minX<e.maxX+this.bufferRoom&&t.maxX>e.minX-this.bufferRoom&&t.minY<e.maxY+this.bufferRoom&&t.maxY>e.minY-this.bufferRoom)return!0;return!1}_checkRectOutsideBorders(t){return t.minX<0+this.bufferRoom||t.maxX>this.width-this.bufferRoom||t.minY<0+this.bufferRoom||t.maxY>this.height-this.bufferRoom}_checkPointCollision(t,e){for(const i of this.hitBoxes)if(t<i.maxX+this.bufferRoom&&t>i.minX-this.bufferRoom&&e<i.maxY+this.bufferRoom&&e>i.minY-this.bufferRoom)return!0;return!1}async _addTextCentered({x:t,y:e,processedWord:i,shouldDraw:o,checkHitboxes:s}){const{word:n,wordCloudFont:h,fontSize:r,color:d}=i,c=await this._getTextDimensions(n,h,r),a=t-c.width/2,l=e-c.height/2,w=new Rect(a,l,c.width,c.height);if(s&&this._checkRectCollision(w))return{textPlaced:!1,rectCollision:!0,outsideBorders:!1};if(this._checkRectOutsideBorders(w))return{textPlaced:!1,rectCollision:!1,outsideBorders:!0};if(this.debug&&console.log("writing "+n),this.hitBoxes.push(w),o){this.debug&&(this.ctx.setLineWidth(5),this.ctx.setStrokeColor(Color.red()),this.ctx.strokeRect(w));const t=c.height/4;this.ctx.setTextColor(d),this.ctx.setFont(new Font(h.fontName,r)),this.ctx.drawText(n,new Point(a,l-t))}return{textPlaced:!0,rectCollision:!1,outsideBorders:!1}}async _writeWithPlacementFunction(t,e){let i,o,s,n=!1,h=!1,r=!1,d=!1;const c=new Path;c.move(new Point(this.centerX,this.centerY));let a=!1;for(;!(n&&h&&r&&d);)if(i=this.placementFunction(this.width,this.height,this.centerX,this.centerY,this.xRatio,this.yRatio,i),({x:o,y:s}=i),this.debug&&e&&c.addLine(new Point(o,s)),!this._checkPointCollision(o,s)){if(t){const{textPlaced:i,rectCollision:n,outsideBorders:h}=await this._addTextCentered({x:o,y:s,processedWord:t,shouldDraw:e,checkHitboxes:!0});if(i){this.placedWords.push({xFromCenter:o-this.centerX,yFromCenter:s-this.centerY,processedWord:t}),this.wordsToPlace.shift(),a=!0;break}if(h&&this.growToFit)break}o<0&&(n=!0),o>this.width&&(h=!0),s<0&&(r=!0),s>this.height&&(d=!0)}return this.debug&&e&&(this.ctx.setLineWidth(1),this.ctx.addPath(c),this.ctx.setStrokeColor(new Color("6693F5")),this.ctx.strokePath()),a}async _writePendingWords(t){this.debug&&console.log("writing pending words");let e=!0;const i=[...this.wordsToPlace];for(const o of i)if(!await this._writeWithPlacementFunction(o,t)&&(e=!1,this.growToFit))return!1;return e}async _writeAlreadyPlacedWords(t){this.debug&&console.log("writing already placed words");for(const e of this.placedWords)await this._addTextCentered({x:e.xFromCenter+this.centerX,y:e.yFromCenter+this.centerY,processedWord:e.processedWord,shouldDraw:t,checkHitboxes:!1})}async _getWordStats(){let t=0,e=0,i=0;for(const o of this.processedWords){const{word:s,wordCloudFont:n,fontSize:h,color:r}=o,d=await this._getTextDimensions(s,n,h);t<d.width&&(t=d.width),e<d.height&&(e=d.height),i+=d.width*d.height}return{minWidth:t,minHeight:e,minArea:i}}async _getStackedMinDimensions(t,e){let i=0,o=0;for(const s of this.processedWords){const{word:n,wordCloudFont:h,fontSize:r,color:d}=s,c=await this._getTextDimensions(n,h,r);c.width>t/2&&(i+=c.height),c.height>e/2&&(o+=c.width)}return{stackedMinWidth:o,stackedMinHeight:i}}async _preflightGrow(t,e){let i=t,o=e;const{minWidth:s,minHeight:n,minArea:h}=await this._getWordStats();for(;s>i||n>o;)console.log("increasing because of min width or height"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight));for(;h>i*o;)console.log("increasing because of min area"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight));let{stackedMinWidth:r,stackedMinHeight:d}=await this._getStackedMinDimensions(i,o);for(;r>i||d>o;)console.log("increasing because of stacked width or height"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight)),({stackedMinWidth:r,stackedMinHeight:d}=await this._getStackedMinDimensions(i,o));return{width:i,height:o}}async getImage(){let t=this.providedWidth,e=this.providedHeight;this.growToFit&&({width:t,height:e}=await this._preflightGrow(t,e));let i=!1;for(;!i&&(this.width=t,this.height=e,this.centerX=t/2,this.centerY=e/2,this.hitBoxes=[],await this._writeAlreadyPlacedWords(!1),i=await this._writePendingWords(!1),this.growToFit);)i||(console.log("increasing because words couldn't fit area"),({width:t,height:e}=this.growthFunction(t,e,this.providedWidth,this.providedHeight)));return this.ctx=new DrawContext,this.ctx.opaque=!1,this.ctx.respectScreenScale=this.respectScreenScale,this.ctx.size=new Size(t,e),this.debug&&(this.ctx.setLineWidth(5),this.ctx.setStrokeColor(Color.red()),this.ctx.strokeRect(new Rect(0,0,t,e)),await this._writeWithPlacementFunction(null,!0)),await this._writeAlreadyPlacedWords(!0),this.ctx.getImage()}}

/************************************
 ***** EXAMPLE WEIGHT FUNCTIONS *****
 ************************************/

/**
 * Functions that use fonts already installed in iOS.
 *
 * Find the fonts here:
 * http://iosfonts.com
 */

function simpleAndCleanWeightFunction(o){return new WordCloudProcessedWord({word:o.word,wordCloudFont:new WordCloudFont({fontName:"TrebuchetMS-Bold"}),fontSize:o.weight/10*50+10,color:Device.isUsingDarkAppearance()?Color.white():Color.black()})}
function builtInFestiveWeightFunction(o){return new WordCloudProcessedWord({word:o.word,wordCloudFont:new WordCloudFont({fontName:"SnellRoundhand-Black"}),fontSize:o.weight/10*50+10,color:Math.random()<.5?Color.red():new Color("#1E792C")})}
function hackerWeightFunction(o){const e=new Color(Color.green().hex,Color.green().alpha*(o.weight/10));return new WordCloudProcessedWord({word:o.word,wordCloudFont:new WordCloudFont({fontName:"CourierNewPS-BoldMT"}),fontSize:60,color:e})}
function celestialWeightFunction(o){return new WordCloudProcessedWord({word:o.word,wordCloudFont:new WordCloudFont({fontName:"GillSans-LightItalic"}),fontSize:o.weight/10*50+10,color:Color.lightGray()})}

/**
 * Functions that use fonts installed through an app.
 * A url of the css stylesheet is still required due
 * to limitations of the system. The fontName is the
 * font family.
 *
 * This article [1] suggests this app [2] is the
 * safest way to download fonts to iOS. Be careful,
 * use at your own risk!
 *
 * [1] - https://9to5mac.com/2020/06/12/fontcase-open-source-fonts-app-iphone-ipad
 * [2] - https://apps.apple.com/us/app/fontcase-manage-your-type/id1205074470
 */

// https://fonts.google.com/specimen/Lacquer
function spookyWeightFunction(o){return new WordCloudProcessedWord({word:o.word,wordCloudFont:new WordCloudFont({fontName:"Lacquer",cssUrl:"https://fonts.googleapis.com/css2?family=Lacquer&display=swap"}),fontSize:o.weight/10*50+10,color:Color.orange()})}
// https://fonts.google.com/specimen/Cinzel+Decorative
function customFestiveWeightFunction(o){return new WordCloudProcessedWord({word:o.word,wordCloudFont:new WordCloudFont({fontName:"Cinzel Decorative",cssUrl:"https://fonts.googleapis.com/css2?family=Cinzel+Decorative&display=swap"}),fontSize:o.weight/10*50+10,color:Math.random()<.5?Color.red():new Color("#1E792C")})}
// https://fonts.google.com/specimen/Fredericka+the+Great
function stencilWeightFunction(o){return new WordCloudProcessedWord({word:o.word,wordCloudFont:new WordCloudFont({fontName:"Fredericka the Great",cssUrl:"https://fonts.googleapis.com/css2?family=Fredericka+the+Great&display=swap"}),fontSize:o.weight/10*50+10,color:Color.lightGray()})}

/***************************************
 ***** EXAMPLE PLACEMENT FUNCTIONS *****
 ***************************************/

/**
 * Please see this script for additional examples:
 * https://github.com/stanleyrya/scriptable-playground/blob/main/experiments/word-cloud-experiments/draw-spiral.js
 */

function spiralPlacementFunction(a,n,i,t,r,e,o){let c,l,s,u;return o?(({radius:c,radiusDirection:l,angle:s,angleDirection:u}=o),c+=.75*l,s+=2*Math.PI/50*u):(c=0,s=0,l=Math.random()<.5?-1:1,u=Math.random()<.5?-1:1),{x:i+c*Math.cos(s)*r,y:t+c*Math.sin(s)*e,radius:c,angle:s,radiusDirection:l,angleDirection:u}}
function galaxyPlacementFunction(n,t,a,c,i,e,o){const h=o?o.i+1:0,l=234*Math.PI/500*h;return{x:2*l*Math.cos(10*l)+a,y:2*l*Math.sin(10*l)+c,angle:l,i:h}}
function starPlacementFunction(t,n,a,c,e,i,o){let s=o?o.i+1:0;const h=336*Math.PI/500*s;return{x:.25*h*Math.cos(100*h)+a,y:.25*h*Math.sin(100*h)+c,angle:h,i:s}}

// Sample input

const wordCloudWords = [
  new WordCloudWord({ word: "Seattle", weight: 10 }),
  new WordCloudWord({ word: "Boston", weight: 10 }),
  new WordCloudWord({ word: "Chicago", weight: 8 }),
  new WordCloudWord({ word: "Denver", weight: 7 }),
  new WordCloudWord({ word: "Boise", weight: 7 }),
  new WordCloudWord({ word: "Los Angeles", weight: 7 }),
  new WordCloudWord({ word: "San Fransisco", weight: 6 }),
  new WordCloudWord({ word: "Victoria", weight: 6 }),
  new WordCloudWord({ word: "Portland", weight: 5 }),
  new WordCloudWord({ word: "London", weight: 5 }),
  new WordCloudWord({ word: "Dublin", weight: 3 }),
  new WordCloudWord({ word: "Barcelona", weight: 3 }),
  new WordCloudWord({ word: "Amsterdam", weight: 3 }),
  new WordCloudWord({ word: "Budapest", weight: 3 }),
  new WordCloudWord({ word: "Venice", weight: 3 }),
  new WordCloudWord({ word: "Florence", weight: 2 }),
  new WordCloudWord({ word: "Oslo", weight: 2 }),
  new WordCloudWord({ word: "Paris", weight: 2 }),
  new WordCloudWord({ word: "Tokyo", weight: 1 }),
  new WordCloudWord({ word: "New York", weight: 1 }),
  new WordCloudWord({ word: "Fort", weight: 1 })
];

const width = config.widgetFamily === "small" ? 250 : 530;
const height = config.widgetFamily === "large" ? 530 : 250;

const wordCloud = new WordCloud({
  // required

  width,
  height,
  wordCloudWords,

  // optional

  // may help with homescreen memory issues
  // respectScreenScale: false,

  // shows how the algorithm works
  // debug: true,

  // changes the way way words are displayed
  // weightFunction: hackerWeightFunction,

  // changes the way words are placed
  // placementFunction: starPlacementFunction,
});
const image = await wordCloud.getImage();

// Sample usage

const widget = new ListWidget();
widget.setPadding(0, 0, 0, 0);
const widgetImage = widget.addImage(image);
widgetImage.applyFillingContentMode();
widgetImage.centerAlignImage();
// The word cloud image has a clear background.
// The default weight function uses Device.isUsingDarkAppearance()
// to set the font color. It is slow to update
// which could make the font blend in with the
// widget's automatic background. To protect
// against this you can set the background explicitly:
widget.backgroundColor = Device.isUsingDarkAppearance() ? Color.black() : Color.white();

if (config.runsInWidget) {
  Script.setWidget(widget);
  Script.complete();
} else {
  widget.presentLarge();
}
