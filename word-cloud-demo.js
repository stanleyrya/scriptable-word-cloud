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
 * This is a demo script to help get newcomers started, but the
 * full version and minified version can be found in this github repo:
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
 *    growToFit = true,
 *    debug = false
 *    weightFunction = this._defaultWeightFunction,
 *    placementFunction = this._defaultPlacementFunction,
 *    growthFunction = this._defaultGrowthFunction
 *  }
 *
 */
class WordCloudWord{constructor({word:r,weight:i}){if(!r)throw"word is required!";if(!i)throw"weight is required!";this.word=r,this.weight=i}}
class WordCloudFont{constructor({fontName:s,cssUrl:o}){if(!s)throw"fontName is required!";this.fontName=s,this.cssURL=o}}
class WordCloudProcessedWord{constructor({word:o,wordCloudFont:r,fontSize:d,color:t}){if(!o)throw"word is required!";if(!r)throw"wordCloudFont is required!";if(!(r instanceof WordCloudFont))throw"wordCloudFont must be a WordCloudFont object!";if(!d)throw"fontSize is required!";if(!t)throw"color is required!";this.word=o,this.wordCloudFont=r,this.fontSize=d,this.color=t}}
class WordCloud{constructor({width:t,height:e,wordCloudWords:i,weightFunction:o=this._defaultWeightFunction,placementFunction:s=this._defaultPlacementFunction,growToFit:n=!0,growthFunction:r=this._defaultGrowthFunction,debug:h=!1}){if(!t||!e||!i)throw"Could not get width, height, and wordCloudWords from input. Please see documentation.";this.providedWidth=t,this.providedHeight=e,this.placementFunction=s,this.weightFunction=o,this.growToFit=!!n,this.growthFunction=r,this.debug=!!h,this.processedWords=i.map(t=>this.weightFunction(t)),this.wordsToPlace=[...this.processedWords],this.placedWords=[],this.webView=new WebView,this.loadedCssUrls={},this.textDimensionsMap={},this.bufferRoom=10;const c=t>e?t:e;this.xRatio=t/c,this.yRatio=e/c}_defaultWeightFunction(t){return new WordCloudProcessedWord({word:t.word,wordCloudFont:new WordCloudFont({fontName:"TrebuchetMS-Bold"}),fontSize:t.weight/10*50+10,color:Device.isUsingDarkAppearance()?Color.white():Color.black()})}_defaultPlacementFunction(t,e,i,o,s,n,r){let h,c,d,a;return r?(({radius:h,radiusDirection:c,angle:d,angleDirection:a}=r),h+=.75*c,d+=2*Math.PI/50*a):(h=0,d=0,c=Math.random()<.5?-1:1,a=Math.random()<.5?-1:1),{x:i+h*Math.cos(d)*s,y:o+h*Math.sin(d)*n,radius:h,angle:d,radiusDirection:c,angleDirection:a}}_defaultGrowthFunction(t,e,i,o){return{width:t+.1*t,height:e+.1*e}}_loadFontToWebView(t,e){const i='\n      // Preconnecting could decrease load time if using a Google font\n      // https://www.cdnplanet.com/blog/faster-google-webfonts-preconnect/\n      <link rel="preconnect" href="https://fonts.gstatic.com">\n\n      <link href="REPLACE_HREF" rel="stylesheet">\n\n      // Load the font so its available in the canvas\n      <div style="font-family: REPLACE_FONT_FAMILY;">.</div>\n'.replace("REPLACE_HREF",e).replace("REPLACE_FONT_FAMILY",t);return this.webView.loadHTML(i)}_getTextDimensionsUsingWebView(t,e){const i='\n      function getTextDimensions(text, font) {\n          const canvas = document.createElement("canvas");\n          const context = canvas.getContext("2d");\n          context.font = font;\n          const metrics = context.measureText(text);\n          return {\n              // I\'m not sure why yet but 3/4 is perfect for Scriptable\'s DrawContext\n              width: metrics.width * 3/4,\n              height: (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 3/4\n          };\n      }\n\n      getTextDimensions("REPLACE_TEXT", "REPLACE_FONT");\n'.replace("REPLACE_TEXT",t).replace("REPLACE_FONT",e);return this.webView.evaluateJavaScript(i)}async _getTextDimensions(t,e,i){const o=i+"pt "+e.fontName,s=t+" "+o;if(this.textDimensionsMap[s])return this.textDimensionsMap[s];{e.cssURL&&(this.loadedCssUrls[e.cssURL]||(await this._loadFontToWebView(e.fontName,e.cssURL),this.loadedCssUrls[e.cssURL]=!0));const i=await this._getTextDimensionsUsingWebView(t,o);return this.textDimensionsMap[s]=i,i}}_checkRectCollision(t){for(const e of this.hitBoxes)if(t.minX<e.maxX+this.bufferRoom&&t.maxX>e.minX-this.bufferRoom&&t.minY<e.maxY+this.bufferRoom&&t.maxY>e.minY-this.bufferRoom)return!0;return!1}_checkRectOutsideBorders(t){return t.minX<0+this.bufferRoom||t.maxX>this.width-this.bufferRoom||t.minY<0+this.bufferRoom||t.maxY>this.height-this.bufferRoom}_checkPointCollision(t,e){for(const i of this.hitBoxes)if(t<i.maxX+this.bufferRoom&&t>i.minX-this.bufferRoom&&e<i.maxY+this.bufferRoom&&e>i.minY-this.bufferRoom)return!0;return!1}async _addTextCentered({x:t,y:e,processedWord:i,shouldDraw:o,checkHitboxes:s}){const{word:n,wordCloudFont:r,fontSize:h,color:c}=i,d=await this._getTextDimensions(n,r,h),a=t-d.width/2,l=e-d.height/2,w=new Rect(a,l,d.width,d.height);if(s&&this._checkRectCollision(w))return{textPlaced:!1,rectCollision:!0,outsideBorders:!1};if(this._checkRectOutsideBorders(w))return{textPlaced:!1,rectCollision:!1,outsideBorders:!0};if(this.debug&&console.log("writing "+n),this.hitBoxes.push(w),o){this.debug&&(this.ctx.setLineWidth(5),this.ctx.setStrokeColor(Color.red()),this.ctx.strokeRect(w));const t=d.height/4;this.ctx.setTextColor(c),this.ctx.setFont(new Font(r.fontName,h)),this.ctx.drawText(n,new Point(a,l-t))}return{textPlaced:!0,rectCollision:!1,outsideBorders:!1}}async _writeWithPlacementFunction(t,e){let i,o,s,n=!1,r=!1,h=!1,c=!1;const d=new Path;d.move(new Point(this.centerX,this.centerY));let a=!1;for(;!(n&&r&&h&&c);)if(i=this.placementFunction(this.width,this.height,this.centerX,this.centerY,this.xRatio,this.yRatio,i),({x:o,y:s}=i),this.debug&&e&&d.addLine(new Point(o,s)),!this._checkPointCollision(o,s)){if(t){const{textPlaced:i,rectCollision:n,outsideBorders:r}=await this._addTextCentered({x:o,y:s,processedWord:t,shouldDraw:e,checkHitboxes:!0});if(i){this.placedWords.push({xFromCenter:o-this.centerX,yFromCenter:s-this.centerY,processedWord:t}),this.wordsToPlace.shift(),a=!0;break}if(r&&this.growToFit)break}o<0&&(n=!0),o>this.width&&(r=!0),s<0&&(h=!0),s>this.height&&(c=!0)}return this.debug&&e&&(this.ctx.setLineWidth(1),this.ctx.addPath(d),this.ctx.setStrokeColor(new Color("6693F5")),this.ctx.strokePath()),a}async _writePendingWords(t){this.debug&&console.log("writing pending words");let e=!0;const i=[...this.wordsToPlace];for(const o of i)if(!await this._writeWithPlacementFunction(o,t)&&(e=!1,this.growToFit))return!1;return e}async _writeAlreadyPlacedWords(t){this.debug&&console.log("writing already placed words");for(const e of this.placedWords)await this._addTextCentered({x:e.xFromCenter+this.centerX,y:e.yFromCenter+this.centerY,processedWord:e.processedWord,shouldDraw:t,checkHitboxes:!1})}async _getWordStats(){let t=0,e=0,i=0;for(const o of this.processedWords){const{word:s,wordCloudFont:n,fontSize:r,color:h}=o,c=await this._getTextDimensions(s,n,r);t<c.width&&(t=c.width),e<c.height&&(e=c.height),i+=c.width*c.height}return{minWidth:t,minHeight:e,minArea:i}}async _getStackedMinDimensions(t,e){let i=0,o=0;for(const s of this.processedWords){const{word:n,wordCloudFont:r,fontSize:h,color:c}=s,d=await this._getTextDimensions(n,r,h);d.width>t/2&&(i+=d.height),d.height>e/2&&(o+=d.width)}return{stackedMinWidth:o,stackedMinHeight:i}}async _preflightGrow(t,e){let i=t,o=e;const{minWidth:s,minHeight:n,minArea:r}=await this._getWordStats();for(;s>i||n>o;)console.log("increasing because of min width or height"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight));for(;r>i*o;)console.log("increasing because of min area"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight));let{stackedMinWidth:h,stackedMinHeight:c}=await this._getStackedMinDimensions(i,o);for(;h>i||c>o;)console.log("increasing because of stacked width or height"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight)),({stackedMinWidth:h,stackedMinHeight:c}=await this._getStackedMinDimensions(i,o));return{width:i,height:o}}async getImage(){let t=this.providedWidth,e=this.providedHeight;this.growToFit&&({width:t,height:e}=await this._preflightGrow(t,e));let i=!1;for(;!i&&(this.width=t,this.height=e,this.centerX=t/2,this.centerY=e/2,this.hitBoxes=[],await this._writeAlreadyPlacedWords(!1),i=await this._writePendingWords(!1),this.growToFit);)i||(console.log("increasing because words couldn't fit area"),({width:t,height:e}=this.growthFunction(t,e,this.providedWidth,this.providedHeight)));return this.ctx=new DrawContext,this.ctx.opaque=!1,this.ctx.respectScreenScale=!0,this.ctx.size=new Size(t,e),this.debug&&(this.ctx.setLineWidth(5),this.ctx.setStrokeColor(Color.red()),this.ctx.strokeRect(new Rect(0,0,t,e)),await this._writeWithPlacementFunction(null,!0)),await this._writeAlreadyPlacedWords(!0),this.ctx.getImage()}}

/************************************
 ***** EXAMPLE WEIGHT FUNCTIONS *****
 ************************************/

/**
 * Functions that use fonts already installed in iOS.
 *
 * Find the fonts here:
 * http://iosfonts.com
 */

function simpleAndCleanWeightFunction(wordCloudWord) {
  const max = 60;
  const min = 10;
  return new WordCloudProcessedWord({
    word: wordCloudWord.word,
    wordCloudFont: new WordCloudFont({
      fontName: 'TrebuchetMS-Bold'
    }),
    fontSize: (wordCloudWord.weight / 10) * (max - min) + min,
    color: Device.isUsingDarkAppearance() ? Color.white() : Color.black()
  });
}

function builtInFestiveWeightFunction(wordCloudWord) {
  const max = 60;
  const min = 10;
  return new WordCloudProcessedWord({
    word: wordCloudWord.word,
    wordCloudFont: new WordCloudFont({
      fontName: 'SnellRoundhand-Black'
    }),
    fontSize: (wordCloudWord.weight / 10) * (max - min) + min,
    color: Math.random() < 0.5 ? Color.red() : Color.green()
  });
}

function hackerWeightFunction(wordCloudWord) {
  const color = new Color(
    Color.green().hex,
    Color.green().alpha * (wordCloudWord.weight / 10)
  );
  return new WordCloudProcessedWord({
    word: wordCloudWord.word,
    wordCloudFont: new WordCloudFont({
      fontName: 'CourierNewPS-BoldMT'
    }),
    fontSize: 60,
    color: color
  });
}

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
function spookyWeightFunction(wordCloudWord) {
  const max = 60;
  const min = 10;
  return new WordCloudProcessedWord({
    word: wordCloudWord.word,
    wordCloudFont: new WordCloudFont({
      fontName: 'Lacquer',
      cssUrl: 'https://fonts.googleapis.com/css2?family=Lacquer&display=swap'
    }),
    fontSize: (wordCloudWord.weight / 10) * (max - min) + min,
    color: Color.orange()
  });
}

// https://fonts.google.com/specimen/Cinzel+Decorative
function customFestiveWeightFunction(wordCloudWord) {
  const max = 60;
  const min = 10;
  return new WordCloudProcessedWord({
    word: wordCloudWord.word,
    wordCloudFont: new WordCloudFont({
      fontName: 'Cinzel Decorative',
      cssUrl: 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative&display=swap'
    }),
    fontSize: (wordCloudWord.weight / 10) * (max - min) + min,
    color: Math.random() < 0.5 ? Color.red() : Color.green()
  });
}

// https://fonts.google.com/specimen/Fredericka+the+Great
function stencilWeightFunction(wordCloudWord) {
  const max = 60;
  const min = 10;
  return new WordCloudProcessedWord({
    word: wordCloudWord.word,
    wordCloudFont: new WordCloudFont({
      fontName: 'Fredericka the Great',
      cssUrl: 'https://fonts.googleapis.com/css2?family=Fredericka+the+Great&display=swap'
    }),
    fontSize: (wordCloudWord.weight / 10) * (max - min) + min,
    color: Color.lightGray()
  });
}

/***************************************
 ***** EXAMPLE PLACEMENT FUNCTIONS *****
 ***************************************/

/**
 * Please see this script for additional examples:
 * https://github.com/stanleyrya/scriptable-playground/blob/main/experiments/word-cloud-experiments/draw-spiral.js
 */

function spiralPlacementFunction(width, height, centerX, centerY, xRatio, yRatio, previousResult) {
  let radius, radiusDirection, angle, angleDirection;
  if (previousResult) {
    ({
      radius,
      radiusDirection,
      angle,
      angleDirection
    } = previousResult);
    // Try these values too: 0.75 -> 0.1, 50 -> 100
    radius += .75 * radiusDirection;
    angle += (Math.PI * 2) / 50 * angleDirection;
  } else {
    radius = 0;
    angle = 0;
    radiusDirection = Math.random() < 0.5 ? -1 : 1;
    angleDirection = Math.random() < 0.5 ? -1 : 1;
  }

  const x = centerX + radius * Math.cos(angle) * xRatio;
  const y = centerY + radius * Math.sin(angle) * yRatio;
  return { x, y, radius, angle, radiusDirection, angleDirection }
}

function galaxyPlacementFunction(width, height, centerX, centerY, xRatio, yRatio, previousResult) {
  const i = previousResult ? previousResult.i + 1 : 0;
  const scale = 2;
  const dots = 10;
  const range = 234;
  const angle = Math.PI * range / 500 * i;
  const x = scale * angle * Math.cos(dots * angle) + centerX;
  const y = scale * angle * Math.sin(dots * angle) + centerY;
  return { x, y, angle, i }
}

function starPlacementFunction(width, height, centerX, centerY, xRatio, yRatio, previousResult) {
  let i = previousResult ?
    previousResult.i + 1 :
    0;
  const scale = .25;
  const dots = 100;
  const range = 336;
  const angle = Math.PI * range / 500 * i;
  const x = scale * angle * Math.cos(dots * angle) + centerX;
  const y = scale * angle * Math.sin(dots * angle) + centerY;
  return { x, y, angle, i }
}

/*********************************
 ***** SAMPLE AND DEMO LOGIC *****
 *********************************/

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

function createTitleRow(text) {
  const row = new UITableRow();

  const titleCell = row.addText(text);
  titleCell.titleFont = Font.mediumMonospacedSystemFont(20);
  titleCell.centerAligned();

  return row;
}

function createDescriptionRow(text, height, url) {
  const row = new UITableRow();

  const descriptionCell = row.addText(text);
  descriptionCell.titleFont = Font.mediumMonospacedSystemFont(12);
  descriptionCell.leftAligned();

  row.height = height || 50;
  if (url) {
    row.onSelect = () => Safari.open(url);
  }
  return row;
}

// A replacer to be used with JSON.stringify when displaying WordCloud inputs examples
function demoDisplayReplacer(key, val) {
  const blocklist = ['wordCloudWords'];

  if (typeof val === 'function') {
    return val.name;
  } else if (blocklist.includes(key)) {
    return;
  }
  return val;
}

// Replace {{INPUT_HERE}} with input
// Mostly copied from minified wordcloud script
const demoTemplate = `
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
 * This copy was created from the demo script and uses the minified objects
 * for readability. The demo, full version, and minified versions can all be
 * found in this github repo:
 * https://github.com/stanleyrya/scriptable-word-cloud
 *
 * Advanced features (explained in full version and demo):
 *  * Modify how the words are displayed and processed (font, color, etc.)
 *  * Modify how the words are placed on the word cloud (star shape, galaxy shape, etc.)
 *  * Display the debugging algorithm by passing in debug=true
 *  * and more!
 *
 * Here's the complete WordCloud constructor for the curious!
 *  {
 *    width, height, wordCloudWords, // required
 *    growToFit = true,
 *    debug = false
 *    weightFunction = this._defaultWeightFunction,
 *    placementFunction = this._defaultPlacementFunction,
 *    growthFunction = this._defaultGrowthFunction
 *  }
 *
 */
class WordCloudWord{constructor({word:r,weight:i}){if(!r)throw"word is required!";if(!i)throw"weight is required!";this.word=r,this.weight=i}}
class WordCloudFont{constructor({fontName:s,cssUrl:o}){if(!s)throw"fontName is required!";this.fontName=s,this.cssURL=o}}
class WordCloudProcessedWord{constructor({word:o,wordCloudFont:r,fontSize:d,color:t}){if(!o)throw"word is required!";if(!r)throw"wordCloudFont is required!";if(!(r instanceof WordCloudFont))throw"wordCloudFont must be a WordCloudFont object!";if(!d)throw"fontSize is required!";if(!t)throw"color is required!";this.word=o,this.wordCloudFont=r,this.fontSize=d,this.color=t}}
class WordCloud{constructor({width:t,height:e,wordCloudWords:i,weightFunction:o=this._defaultWeightFunction,placementFunction:s=this._defaultPlacementFunction,growToFit:n=!0,growthFunction:r=this._defaultGrowthFunction,debug:h=!1}){if(!t||!e||!i)throw"Could not get width, height, and wordCloudWords from input. Please see documentation.";this.providedWidth=t,this.providedHeight=e,this.placementFunction=s,this.weightFunction=o,this.growToFit=!!n,this.growthFunction=r,this.debug=!!h,this.processedWords=i.map(t=>this.weightFunction(t)),this.wordsToPlace=[...this.processedWords],this.placedWords=[],this.webView=new WebView,this.loadedCssUrls={},this.textDimensionsMap={},this.bufferRoom=10;const c=t>e?t:e;this.xRatio=t/c,this.yRatio=e/c}_defaultWeightFunction(t){return new WordCloudProcessedWord({word:t.word,wordCloudFont:new WordCloudFont({fontName:"TrebuchetMS-Bold"}),fontSize:t.weight/10*50+10,color:Device.isUsingDarkAppearance()?Color.white():Color.black()})}_defaultPlacementFunction(t,e,i,o,s,n,r){let h,c,d,a;return r?(({radius:h,radiusDirection:c,angle:d,angleDirection:a}=r),h+=.75*c,d+=2*Math.PI/50*a):(h=0,d=0,c=Math.random()<.5?-1:1,a=Math.random()<.5?-1:1),{x:i+h*Math.cos(d)*s,y:o+h*Math.sin(d)*n,radius:h,angle:d,radiusDirection:c,angleDirection:a}}_defaultGrowthFunction(t,e,i,o){return{width:t+.1*t,height:e+.1*e}}_loadFontToWebView(t,e){const i='\n      // Preconnecting could decrease load time if using a Google font\n      // https://www.cdnplanet.com/blog/faster-google-webfonts-preconnect/\n      <link rel="preconnect" href="https://fonts.gstatic.com">\n\n      <link href="REPLACE_HREF" rel="stylesheet">\n\n      // Load the font so its available in the canvas\n      <div style="font-family: REPLACE_FONT_FAMILY;">.</div>\n'.replace("REPLACE_HREF",e).replace("REPLACE_FONT_FAMILY",t);return this.webView.loadHTML(i)}_getTextDimensionsUsingWebView(t,e){const i='\n      function getTextDimensions(text, font) {\n          const canvas = document.createElement("canvas");\n          const context = canvas.getContext("2d");\n          context.font = font;\n          const metrics = context.measureText(text);\n          return {\n              // I\'m not sure why yet but 3/4 is perfect for Scriptable\'s DrawContext\n              width: metrics.width * 3/4,\n              height: (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 3/4\n          };\n      }\n\n      getTextDimensions("REPLACE_TEXT", "REPLACE_FONT");\n'.replace("REPLACE_TEXT",t).replace("REPLACE_FONT",e);return this.webView.evaluateJavaScript(i)}async _getTextDimensions(t,e,i){const o=i+"pt "+e.fontName,s=t+" "+o;if(this.textDimensionsMap[s])return this.textDimensionsMap[s];{e.cssURL&&(this.loadedCssUrls[e.cssURL]||(await this._loadFontToWebView(e.fontName,e.cssURL),this.loadedCssUrls[e.cssURL]=!0));const i=await this._getTextDimensionsUsingWebView(t,o);return this.textDimensionsMap[s]=i,i}}_checkRectCollision(t){for(const e of this.hitBoxes)if(t.minX<e.maxX+this.bufferRoom&&t.maxX>e.minX-this.bufferRoom&&t.minY<e.maxY+this.bufferRoom&&t.maxY>e.minY-this.bufferRoom)return!0;return!1}_checkRectOutsideBorders(t){return t.minX<0+this.bufferRoom||t.maxX>this.width-this.bufferRoom||t.minY<0+this.bufferRoom||t.maxY>this.height-this.bufferRoom}_checkPointCollision(t,e){for(const i of this.hitBoxes)if(t<i.maxX+this.bufferRoom&&t>i.minX-this.bufferRoom&&e<i.maxY+this.bufferRoom&&e>i.minY-this.bufferRoom)return!0;return!1}async _addTextCentered({x:t,y:e,processedWord:i,shouldDraw:o,checkHitboxes:s}){const{word:n,wordCloudFont:r,fontSize:h,color:c}=i,d=await this._getTextDimensions(n,r,h),a=t-d.width/2,l=e-d.height/2,w=new Rect(a,l,d.width,d.height);if(s&&this._checkRectCollision(w))return{textPlaced:!1,rectCollision:!0,outsideBorders:!1};if(this._checkRectOutsideBorders(w))return{textPlaced:!1,rectCollision:!1,outsideBorders:!0};if(this.debug&&console.log("writing "+n),this.hitBoxes.push(w),o){this.debug&&(this.ctx.setLineWidth(5),this.ctx.setStrokeColor(Color.red()),this.ctx.strokeRect(w));const t=d.height/4;this.ctx.setTextColor(c),this.ctx.setFont(new Font(r.fontName,h)),this.ctx.drawText(n,new Point(a,l-t))}return{textPlaced:!0,rectCollision:!1,outsideBorders:!1}}async _writeWithPlacementFunction(t,e){let i,o,s,n=!1,r=!1,h=!1,c=!1;const d=new Path;d.move(new Point(this.centerX,this.centerY));let a=!1;for(;!(n&&r&&h&&c);)if(i=this.placementFunction(this.width,this.height,this.centerX,this.centerY,this.xRatio,this.yRatio,i),({x:o,y:s}=i),this.debug&&e&&d.addLine(new Point(o,s)),!this._checkPointCollision(o,s)){if(t){const{textPlaced:i,rectCollision:n,outsideBorders:r}=await this._addTextCentered({x:o,y:s,processedWord:t,shouldDraw:e,checkHitboxes:!0});if(i){this.placedWords.push({xFromCenter:o-this.centerX,yFromCenter:s-this.centerY,processedWord:t}),this.wordsToPlace.shift(),a=!0;break}if(r&&this.growToFit)break}o<0&&(n=!0),o>this.width&&(r=!0),s<0&&(h=!0),s>this.height&&(c=!0)}return this.debug&&e&&(this.ctx.setLineWidth(1),this.ctx.addPath(d),this.ctx.setStrokeColor(new Color("6693F5")),this.ctx.strokePath()),a}async _writePendingWords(t){this.debug&&console.log("writing pending words");let e=!0;const i=[...this.wordsToPlace];for(const o of i)if(!await this._writeWithPlacementFunction(o,t)&&(e=!1,this.growToFit))return!1;return e}async _writeAlreadyPlacedWords(t){this.debug&&console.log("writing already placed words");for(const e of this.placedWords)await this._addTextCentered({x:e.xFromCenter+this.centerX,y:e.yFromCenter+this.centerY,processedWord:e.processedWord,shouldDraw:t,checkHitboxes:!1})}async _getWordStats(){let t=0,e=0,i=0;for(const o of this.processedWords){const{word:s,wordCloudFont:n,fontSize:r,color:h}=o,c=await this._getTextDimensions(s,n,r);t<c.width&&(t=c.width),e<c.height&&(e=c.height),i+=c.width*c.height}return{minWidth:t,minHeight:e,minArea:i}}async _getStackedMinDimensions(t,e){let i=0,o=0;for(const s of this.processedWords){const{word:n,wordCloudFont:r,fontSize:h,color:c}=s,d=await this._getTextDimensions(n,r,h);d.width>t/2&&(i+=d.height),d.height>e/2&&(o+=d.width)}return{stackedMinWidth:o,stackedMinHeight:i}}async _preflightGrow(t,e){let i=t,o=e;const{minWidth:s,minHeight:n,minArea:r}=await this._getWordStats();for(;s>i||n>o;)console.log("increasing because of min width or height"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight));for(;r>i*o;)console.log("increasing because of min area"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight));let{stackedMinWidth:h,stackedMinHeight:c}=await this._getStackedMinDimensions(i,o);for(;h>i||c>o;)console.log("increasing because of stacked width or height"),({width:i,height:o}=this.growthFunction(i,o,this.providedWidth,this.providedHeight)),({stackedMinWidth:h,stackedMinHeight:c}=await this._getStackedMinDimensions(i,o));return{width:i,height:o}}async getImage(){let t=this.providedWidth,e=this.providedHeight;this.growToFit&&({width:t,height:e}=await this._preflightGrow(t,e));let i=!1;for(;!i&&(this.width=t,this.height=e,this.centerX=t/2,this.centerY=e/2,this.hitBoxes=[],await this._writeAlreadyPlacedWords(!1),i=await this._writePendingWords(!1),this.growToFit);)i||(console.log("increasing because words couldn't fit area"),({width:t,height:e}=this.growthFunction(t,e,this.providedWidth,this.providedHeight)));return this.ctx=new DrawContext,this.ctx.opaque=!1,this.ctx.respectScreenScale=!0,this.ctx.size=new Size(t,e),this.debug&&(this.ctx.setLineWidth(5),this.ctx.setStrokeColor(Color.red()),this.ctx.strokeRect(new Rect(0,0,t,e)),await this._writeWithPlacementFunction(null,!0)),await this._writeAlreadyPlacedWords(!0),this.ctx.getImage()}}

// Sample input

const wordCloud = new WordCloud({{INPUT_HERE}});
const image = await wordCloud.getImage();

// Sample usage

if (config.runsInWidget) {
  const widget = new ListWidget();
  widget.setPadding(0, 0, 0, 0);
  const widgetImage = widget.addImage(image);
  widgetImage.applyFillingContentMode();
  widgetImage.centerAlignImage();
  // Device.isUsingDarkAppearance() is slow to update, but seems to be the
  // only way to safely update the background and font color at the same time.
  // This is partly due to Color.dynamic() not working in the Draw Context.
  widget.backgroundColor = Device.isUsingDarkAppearance() ? Color.black() : Color.white();
  Script.setWidget(widget);
  Script.complete();
} else {
  await QuickLook.present(image);
}
`

// Given an object that contains functions, stringify them in a way that can still be run as a script.
function createCopyPasteableInput(wordCloudData) {
  function demoCopyReplacer(key, val) {
    if (typeof val === 'function') {
      return val.toString().replace(/(\r\n|\n|\r)/gm, "");
    }
    return val;
  }
  const objWithStringFuncs = JSON.stringify(wordCloudData, demoCopyReplacer, "\t");

  function removeQuotes(match, p1, offset, string) {
    const fixedFunc = p1.slice(1, -1);
    return match.replace(p1, fixedFunc);
  }
  const objWithRealFuncs = objWithStringFuncs.replace(/^.*Function".*: (".*")/gm, removeQuotes);

  return demoTemplate.replace("{{INPUT_HERE}}", objWithRealFuncs)
}

async function createDemoRow(wordCloudData, showJson = true) {
  const smallRow = new UITableRow();
  smallRow.height = 150;

  const input = JSON.stringify(wordCloudData, demoDisplayReplacer, "\t");
  if (wordCloudData.width === undefined) {
    wordCloudData.width = 250;
  }
  if (wordCloudData.height === undefined) {
    wordCloudData.height = 250;
  }
  wordCloudData.wordCloudWords = wordCloudWords;

  const wordCloud = new WordCloud(wordCloudData);
  const image = await wordCloud.getImage();
  const imageCell = smallRow.addImage(image);
  imageCell.centerAligned();

  if (showJson) {
    const textCell = smallRow.addText(input);
    textCell.titleFont = Font.mediumMonospacedSystemFont(12);
    smallRow.onSelect = () => Pasteboard.copyString(createCopyPasteableInput(wordCloudData));
  }

  return smallRow;
}

async function createDemoTable() {
  const table = new UITable();

  const rows = [
    createTitleRow("Dynamic Word Cloud!"),
	  await createDemoRow({ width: 700, height: 250 }, false),
    createDescriptionRow("This demo shows off a dynamic word cloud class that can be copy-pasted to your own script! Throughout the demo simply press on an example row to copy a full-working Scriptable script. These examples use a minified version of the word cloud classes which are easier to read. You can also cut to the chase and use either the normal [1] or minified [2] versions on Github. I strongly recommend using the minified version to start.", 160),
    createDescriptionRow(`-> [1] - https://github.com/stanleyrya/scriptable-word-cloud/blob/main/word-cloud.js`, 60, "https://github.com/stanleyrya/scriptable-word-cloud/blob/main/word-cloud.js"),
    createDescriptionRow(`-> [2] - https://github.com/stanleyrya/scriptable-word-cloud/blob/main/minified-word-cloud.js`, 60, "https://github.com/stanleyrya/scriptable-word-cloud/blob/main/minified-word-cloud.js"),

    createDescriptionRow("There are only three required fields: Width, Height, and WordCloudWords. WordCloudWords are objects with two properties: Word (string) and Weight (number). Here's an example of a WordCloudWords array:", 80),
    createDescriptionRow(JSON.stringify(wordCloudWords, undefined, "\t"), 300),
    createDescriptionRow("This object could be static or you could code something to generate it. I recommend calculating a word's weight by it's frequency in a dataset (Calendar events, weather, etc.), but you could use whatever you want!", 100),

    createDescriptionRow("Next is Width and Height. These are pretty simple to work with. Here are some examples:", 60),
	  await createDemoRow({ width: 250, height: 250 }),
	  await createDemoRow({ width: 530, height: 250 }),
    createDescriptionRow("The word cloud is generated dynamically so it can fit different widget sizes. It will also work with weirder sizes like long ones. Get creative!", 60),
	  await createDemoRow({ width: 200, height: 600 }),
    createDescriptionRow("The next sections will use the sample WordCloudWords object and a Width and Height of 250 each. Remember you can press any example row to get a working script example. Have fun!", 80),


// -------------------------------- //

    createTitleRow("Flags!"),
    createDescriptionRow("Now we get to the fun stuff. Here are some flags that you can pass in to modify the word cloud's behavior. When debug is set to true it will display the 'hitboxes' used in the placement algorithm for each word. it will also display the placement algorithm's path:", 120),
	  await createDemoRow({ debug: true }),
    createDescriptionRow("The growToFit flag determines whether or not the canvas will 'grow' to fit all of the words provided. When set to true (default) it will continuously increase the size of the canvas until all of the provided words can be placed. If it is set to false it will simply try to place words as best it can:", 120),
    await createDemoRow({ growToFit: false }),

// -------------------------------- //

	  createTitleRow("Placement Functions!"),
    createDescriptionRow("Placement functions are plotting functions that return (x,y) coordinates. They are called continuously until all of the words can be plotted with their center on a coordinate (or there is no more space if growToFit is false). They can be confusing at first but they are very powerful. Before we get into it, here's an example:", 140),
    createDescriptionRow(`
  function spiralPlacementFunction(width, height, centerX, centerY, xRatio, yRatio, previousResult) {
    let radius, angle;

    if (previousResult) {
      ({ radius, angle } = previousResult);
      radius += .75;
      angle += (Math.PI * 2) / 50;
    } else {
      radius = 0;
      angle = 0;
    }

    const x = centerX + radius * Math.cos(angle) * xRatio;
    const y = centerY + radius * Math.sin(angle) * yRatio;
    return { x, y, radius, angle }
  }
`, 320),
    createDescriptionRow("The inputs width, height, centerX, and centerY are pretty straightforward. xRatio and yRatio are the ratio of the side compared to the largest side and can be useful when scaling the algorithm for different input parameters. PreviousResult contains the results from the last iteration of the algorithm, which at a minimum includes the last x and y values. If it's helpful you can pass additional values in the result and use it in the next iteration, like radius and angle in the example.", 180),
    createDescriptionRow("I recommend reading the example functions and modifying them to understand how they work. I also recommend googling some cool (x,y) plots and converting them to placement functions. For investigation you could modify my script here:", 100),
    createDescriptionRow("-> https://github.com/stanleyrya/scriptable-playground/blob/main/experiments/word-cloud-experiments/draw-spiral.js", 60, 'https://github.com/stanleyrya/scriptable-playground/blob/main/experiments/word-cloud-experiments/draw-spiral.js'),
    createDescriptionRow("Here are some placement algorithms I created that are different than the provided spiral one. When the debug parameter is set to true you can see what the algorithm is plotting:", 80),
	  await createDemoRow({
      placementFunction: galaxyPlacementFunction,
    }),
	  await createDemoRow({
      placementFunction: galaxyPlacementFunction,
      debug: true
    }),
    await createDemoRow({
      placementFunction: starPlacementFunction,
    }),
	  await createDemoRow({
      placementFunction: starPlacementFunction,
      debug: true
    }),

// -------------------------------- //

	  createTitleRow("Weight Functions!"),
    createDescriptionRow("Word clouds aren't complete without modifying the font! A weight function can be provided to modify how the words are displayed. You can use this function to convert weight to size, font type, opacity, color, and more! Here's the default method for context:", 120),
    createDescriptionRow(`
  /**
   * @param {WordCloudWord} wordCloudWord
   *   - The word that is being processed.
   * @return {WordCloudProcessedWord}
   *   - The word after processing.
   */
  _defaultWeightFunction(wordCloudWord) {
    const max = 60;
    const min = 10;
    return new WordCloudProcessedWord({
      word: wordCloudWord.word,
      wordCloudFont: new WordCloudFont({
        fontName: "TrebuchetMS-Bold"
      }),
      fontSize: (wordCloudWord.weight / 10) * (max - min) + min,
      color: Device.isUsingDarkAppearance() ? Color.white() : Color.black()
    });
  }
`, 360),
    createDescriptionRow("Just as I mentioned above, I recommend playing with the functions provided and getting creative. Here are some examples using built-in fonts:", 60),
	  await createDemoRow({
      weightFunction: builtInFestiveWeightFunction,
    }),
	  await createDemoRow({
      weightFunction: hackerWeightFunction,
    }),

// -------------------------------- //

	createTitleRow("... with Custom Fonts!"),
    createDescriptionRow("You can use custom fonts too! Before you get too excited custom fonts require specific setup and are not guarranteed to work. The word cloud algorithm depends on generating word 'hitboxes' to make sure words don't overlap with each other. At this time the hitboxes are generated by rendering the word with Scriptable's WebView tool. Custom fonts aren't referencable from within the tool so they have to be installed on the fly using a CSS stylesheet URL. The word cloud itself is being rendered using Scriptable's DrawContext so the font needs to be installed locally too for the whole thing to work.", 240),
    createDescriptionRow("TL;DR: You need to both install the font locally and provide a reference to the CSS stylesheet hosted somewhere online to use custom fonts. This has currently only been tested with Google fonts. Here's an example:", 100),
    createDescriptionRow(`
// https://fonts.google.com/specimen/Lacquer
  function spookyWeightFunction(wordCloudWord) {
    return new WordCloudProcessedWord({
      word: wordCloudWord.word,
      wordCloudFont: new WordCloudFont({
        fontName: "Lacquer",
        cssUrl: "https://fonts.googleapis.com/css2?family=Lacquer&display=swap"
      }),
      fontSize: (wordCloudWord.weight / 10) * (maxFont - minFont) + minFont,
      color: Color.orange()
    });
  }
`, 240),
    createDescriptionRow(`The fontName is the font family. This article [1] suggests this app [2] is the safest way to download fonts to iOS. Be careful, use at your own risk!`, 100),
    createDescriptionRow(`-> [1] - https://9to5mac.com/2020/06/12/fontcase-open-source-fonts-app-iphone-ipad`, 60, "https://9to5mac.com/2020/06/12/fontcase-open-source-fonts-app-iphone-ipad"),
    createDescriptionRow(`-> [2] - https://apps.apple.com/us/app/fontcase-manage-your-type/id1205074470`, 60, "https://apps.apple.com/us/app/fontcase-manage-your-type/id1205074470"),
    createDescriptionRow(`After all of that hassle I hope you agree the effort is worth it! Once these fonts are installed they will begin working:`, 60),
    createDescriptionRow(`-> https://fonts.google.com/specimen/Lacquer`, 60, "https://fonts.google.com/specimen/Lacquer"),
	  await createDemoRow({
      weightFunction: spookyWeightFunction,
    }),
    createDescriptionRow(`-> https://fonts.google.com/specimen/Cinzel+Decorative`, 60, "https://fonts.google.com/specimen/Cinzel+Decorative"),
	  await createDemoRow({
      weightFunction: customFestiveWeightFunction,
    }),
	  createDescriptionRow(`-> https://fonts.google.com/specimen/Fredericka+the+Great`, 60, "https://fonts.google.com/specimen/Fredericka+the+Great`"),
	  await createDemoRow({
      weightFunction: stencilWeightFunction,
    }),

	  createTitleRow("Thank You!"),
    createDescriptionRow(`If you enjoyed this demo or the scripts please consider buying me a coffee! I'd also love it if you tried out my other scripts on GitHub. Thanks again!`, 60),
    createDescriptionRow("-> https://www.github.com/stanleyrya", 40, "https://www.github.com/stanleyrya"),
    createDescriptionRow("-> https://www.paypal.me/stanleyrya", 40, "https://www.paypal.me/stanleyrya"),
  ];

  rows.forEach((row) => {
  // Device.isUsingDarkAppearance() is slow to update, but seems to be the
  // only way to safely update the background and font color at the same time.
  // This is partly due to Color.dynamic() not working in the Draw Context.
	row.backgroundColor = Device.isUsingDarkAppearance() ? Color.black() : Color.white();
    table.addRow(row);
  });
  return table;
}

await QuickLook.present(await createDemoTable());
