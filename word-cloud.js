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
 * This is the full version to make the script easier to edit,
 * but a minified version (MUCH easier to read) along with a demo can be found here:
 * https://github.com/stanleyrya/scriptable-word-cloud
 *
 * Advanced features (explained in the comments and demo):
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
 */

/******************************
 ***** WORD CLOUD OBJECTS *****
 ******************************/

/**
 * A word that can be used by the WordCloud.
 */
class WordCloudWord {
  constructor({ word, weight }) {
    if (!word) {
      throw ("word is required!");
    }
    if (!weight) {
      throw ("weight is required!");
    }
    this.word = word;
    this.weight = weight;
  }
}

/**
 * A font that can be used in a WordCloud.
 *
 * Please note that pre-installed fonts need to use
 * the name provieded here: http://iosfonts.com
 * For example: TrebuchetMS-Bold
 *
 * Custom fonts such as google's fonts need to use
 * the name of their font family and the URL to
 * their css stylesheet. Here's an example for
 * google:
 * https://fonts.google.com/specimen/Fredericka+the+Great?sidebar.open=true&selection.family=Fredericka+the+Great#about
 * -> fontName: Fredericka the Great
 * -> cssUrl: https://fonts.googleapis.com/css2?family=Fredericka+the+Great&display=swap
 */
class WordCloudFont {
  constructor({ fontName, cssUrl }) {
    if (!fontName) {
      throw ("fontName is required!");
    }
    this.fontName = fontName;
    this.cssURL = cssUrl; // only for custom fonts
  }
}

/**
 * A word after processing from a weight function.
 * All weight functions, including the default, must
 * return WordCloudProcessedWords.
 */
class WordCloudProcessedWord {
  constructor({ word, wordCloudFont, fontSize, color }) {
    if (!word) {
      throw ("word is required!");
    }
    if (!wordCloudFont) {
      throw ("wordCloudFont is required!");
    }
    if (!(wordCloudFont instanceof WordCloudFont)) {
      throw ("wordCloudFont must be a WordCloudFont object!");
    }
    if (!fontSize) {
      throw ("fontSize is required!");
    }
    if (!color) {
      throw ("color is required!");
    }
    this.word = word;
    this.wordCloudFont = wordCloudFont;
    this.fontSize = fontSize;
    this.color = color;
  }
}

/**
 * A word cloud.
 */
class WordCloud {

  /**
   * Required:
   *
   * @param {number} width
   *   - The width of the canvas.
   * @param {number} height
   *   - The height of the canvas.
   * @param {WordCloudWord[]} wordData
   *   - The words that will be displayed on the
   *     canvas.
   *
   * Optional:
   *
   * @param {weightFunction}
   *   [weightFunction=this._defaultWeightFunction]
   *   - A function that processes words before they
   *     are placed on the canvas.
   * @param {placementFunction}
   *   [placementFunction=this._defaultPlacementFunction]
   *   - A function that decides where the next word
   *     should attempt to be placed.
   * @param {boolean} [growToFit=true]
   *   - A boolean that determines if the word cloud
   *     should expand the canvas to fit all of the
   *     provided words.
   * @param {growthFunction}
   *   [growthFunction=this._defaultGrowthFunction]
   *   - A function that determines how the canvas
   *     should grow if growToFit is true.
   * @param {boolean} [respectScreenScale=true]
   *   - A boolean that modifies the
   *     "respectScreenScale" feature in the
   *     DrawContext. Turning it off may help
   *     performance and memory issues on the
   *     homescreen.
   * @param {boolean} [debug=false]
   *   - A boolean that writes additional context to
   *     the canvas for debugging.
   */
  constructor({
    width,
    height,
    wordCloudWords,
    weightFunction = this._defaultWeightFunction,
    placementFunction = this._defaultPlacementFunction,
    growToFit = true,
    growthFunction = this._defaultGrowthFunction,
    respectScreenScale = true,
    debug = false
  }) {
    if (!width || !height || !wordCloudWords) {
      throw ("Could not get width, height, and wordCloudWords from input. Please see documentation.");
    }

    this.providedWidth = width;
    this.providedHeight = height;
    this.placementFunction = placementFunction;
    this.weightFunction = weightFunction;
    this.growToFit = !!growToFit;
    this.growthFunction = growthFunction;
    this.respectScreenScale = !!respectScreenScale;
    this.debug = !!debug;

    this.processedWords = wordCloudWords.map(wordCloudWord => this.weightFunction(wordCloudWord));
    this.wordsToPlace = [...this.processedWords];
    this.placedWords = [];

    this.webView = new WebView();
    this.loadedCssUrls = {};
    this.textDimensionsMap = {};

    // Controls buffer around words and border
    this.bufferRoom = 10;

    // Can be used to stretch the placementFunction
    const biggestSide = width > height ? width : height;
    this.xRatio = width / biggestSide;
    this.yRatio = height / biggestSide;
  }

  /**
   * This is the default weight function that gets
   * included with the WordCloud class.
   * Please use it as an example!
   *
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

  /**
   * This is the default placement function that gets
   * included with the WordCloud class.
   * Please use it as an example!
   *
   * @param {number} width - of the Canvas (after growth if applicable)
   * @param {number} height - of the Canvas (after growth if applicable)
   * @param {number} centerX - center X value
   * @param {number} centerY - center Y value
   * @param {number} xRatio - (width / biggestSide) - useful for scaling
   * @param {number} yRatio - (height / biggestSide) - useful for scaling
   * @param {Object} previousResult
   *  - The previously returned object. Useful to
   *    store state.
   * @return { number, number, ... } { x, y, ... }
   *  - The new x and y after processing. Return
   *    any other information you may find useful!
   */
  _defaultPlacementFunction(width, height, centerX, centerY, xRatio, yRatio, previousResult) {
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
    return { x, y, radius, angle, radiusDirection, angleDirection };
  }

  /**
   * This is the default growth function that gets
   * included with the WordCloud class.
   * Please use it as an example!
   *
   * @param {number} currentWidth
   * @param {number} currentHeight
   * @param {number} originalWidth
   * @param {number} originalHeight
   * @return { number, number } { width, height }
   *   - The new width and height after processing.
   */
  _defaultGrowthFunction(currentWidth, currentHeight, originalWidth, originalHeight) {
    return {
      width: currentWidth + currentWidth * 0.1,
      height: currentHeight + currentHeight * 0.1
    };
  }

  /**
   * Uses Scriptable's WebView to load a custom font.
   * iOS custom fonts aren't loaded on the HTML
   * document canvas so they have to be loaded using
   * their css stylesheet.
   *
   * @param {string} fontFamily
   *  - The font family being loaded.
   * @param {string} fontCssUrl
   *  - The css url that will be loaded.
   * @return {Promise}
   *  - A promise that the font was loaded.
   */
  _loadFontToWebView(fontFamily, fontCssUrl) {
    const html = `
      // Preconnecting could decrease load time if using a Google font
      // https://www.cdnplanet.com/blog/faster-google-webfonts-preconnect/
      <link rel="preconnect" href="https://fonts.gstatic.com">

      <link href="REPLACE_HREF" rel="stylesheet">

      // Load the font so its available in the canvas
      <div style="font-family: REPLACE_FONT_FAMILY;">.</div>
`
      .replace("REPLACE_HREF", fontCssUrl)
      .replace("REPLACE_FONT_FAMILY", fontFamily);

    return this.webView.loadHTML(html);
  }

  /**
   * Uses Scriptable's WebView to call
   * canvas.measureText on the given text of given
   * font in pixels.
   *
   * @param {string} text
   *  - The text to be rendered.
   * @param {string} font
   *  - The css font descriptor that text is to be
   *    rendered with (e.g. "bold 14px verdana").
   * @return { number, number } { width, height }
   *  - The width and height of the text.
   *
   * @see Inspired from: https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
   */
  _getTextDimensionsUsingWebView(text, cssFont) {
    const javascript = `
      function getTextDimensions(text, font) {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          context.font = font;
          const metrics = context.measureText(text);
          return {
              // I'm not sure why yet but 3/4 is perfect for Scriptable's DrawContext
              width: metrics.width * 3/4,
              height: (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 3/4
          };
      }

      getTextDimensions("REPLACE_TEXT", "REPLACE_FONT");
`
      .replace("REPLACE_TEXT", text)
      .replace("REPLACE_FONT", cssFont);

    return this.webView.evaluateJavaScript(javascript);
  }

  /**
   * The Scriptable WebView can use the HTML document
   * canvas to measure a word's width and height. It
   * can't return an image file so the rest of the
   * script uses the Scriptable DrawContext to create
   * the image.
   *
   * Custom fonts aren't loaded on the HTML document
   * canvas so they have to be loaded using their css
   * stylesheet.
   */
  async _getTextDimensions(text, wordCloudFont, fontSize) {
    const cssFont = fontSize + "pt " + wordCloudFont.fontName;
    const key = text + " " + cssFont;

    if (this.textDimensionsMap[key]) {
      return this.textDimensionsMap[key];
    } else {
      // If we are using a custom font and it hasn't
      // been loaded before, load it to the WebView.
      if (wordCloudFont.cssURL) {
        if (!this.loadedCssUrls[wordCloudFont.cssURL]) {
          await this._loadFontToWebView(wordCloudFont.fontName, wordCloudFont.cssURL);
          this.loadedCssUrls[wordCloudFont.cssURL] = true;
        }
      }

      const value = await this._getTextDimensionsUsingWebView(text, cssFont);
      this.textDimensionsMap[key] = value;
      return value;
    }
  }

  /**
   * Does the new rectangle hit any of the existing
   * ones?
   *
   * if (RectA.Left < RectB.Right &&
   *     RectA.Right > RectB.Left &&
   *     RectA.Top < RectB.Bottom &&
   *     RectA.Bottom > RectB.Top)
   *
   * https://stackoverflow.com/a/306332
   */
  _checkRectCollision(newRect) {
    for (const placedRect of this.hitBoxes) {
      if (newRect.minX < placedRect.maxX + this.bufferRoom &&
        newRect.maxX > placedRect.minX - this.bufferRoom &&
        newRect.minY < placedRect.maxY + this.bufferRoom &&
        newRect.maxY > placedRect.minY - this.bufferRoom) {
        return true;
      }
    }
    return false;
  }

  /**
   * Does the new rectangle hit any of the sides?
   */
  _checkRectOutsideBorders(newRect) {
    if (newRect.minX < 0 + this.bufferRoom ||
      newRect.maxX > this.width - this.bufferRoom ||
      newRect.minY < 0 + this.bufferRoom ||
      newRect.maxY > this.height - this.bufferRoom) {
      return true;
    }
    return false;
  }

  /**
   * Does the point hit any of the existing
   * rectangles?
   */
  _checkPointCollision(x, y) {
    for (const placedRect of this.hitBoxes) {
      if (x < placedRect.maxX + this.bufferRoom &&
        x > placedRect.minX - this.bufferRoom &&
        y < placedRect.maxY + this.bufferRoom &&
        y > placedRect.minY - this.bufferRoom) {
        return true;
      }
    }
    return false;
  }

  async _addTextCentered({ x, y, processedWord, shouldDraw, checkHitboxes }) {
    const { word, wordCloudFont, fontSize, color } = processedWord;
    const dimensions = await this._getTextDimensions(word, wordCloudFont, fontSize);
    const topLeftX = x - (dimensions.width / 2);
    const topLeftY = y - (dimensions.height / 2);
    const rect = new Rect(
      topLeftX,
      topLeftY,
      dimensions.width,
      dimensions.height
    );

    if (checkHitboxes && this._checkRectCollision(rect)) {
      return {
        textPlaced: false,
        rectCollision: true,
        outsideBorders: false
      };
    }
    if (this._checkRectOutsideBorders(rect)) {
      return {
        textPlaced: false,
        rectCollision: false,
        outsideBorders: true
      };
    }

    if (this.debug) {
      console.log("writing " + word);
    }
    this.hitBoxes.push(rect);

    if (shouldDraw) {
      if (this.debug) {
        this.ctx.setLineWidth(5);
        this.ctx.setStrokeColor(Color.red());
        this.ctx.strokeRect(rect);
      }

      // I'm not sure why, but the text is a quarter off from the box.
      const quarterHeight = dimensions.height / 4;
      this.ctx.setTextColor(color);
      this.ctx.setFont(new Font(wordCloudFont.fontName, fontSize));
      this.ctx.drawText(word, new Point(topLeftX, topLeftY - quarterHeight));
    }
    return {
      textPlaced: true,
      rectCollision: false,
      outsideBorders: false
    };
  }

  async _writeWithPlacementFunction(processedWord, shouldDraw) {
    let breachedLeft = false;
    let breachedRight = false;
    let breachedTop = false;
    let breachedBottom = false;
    let previousResult, x, y;

    const path = new Path();
    path.move(new Point(this.centerX, this.centerY));

    let placed = false;
    while (!(breachedLeft && breachedRight && breachedTop && breachedBottom)) {
      previousResult = this.placementFunction(
        this.width,
        this.height,
        this.centerX,
        this.centerY,
        this.xRatio,
        this.yRatio,
        previousResult
      );
      ({ x, y } = previousResult);

      if (this.debug && shouldDraw) {
        path.addLine(new Point(x, y));
      }
      // TODO: Check point outside borders?
      if (this._checkPointCollision(x, y)) {
        continue;
      }

      if (processedWord) {
        const { textPlaced, rectCollision, outsideBorders } = await this._addTextCentered({
          x,
          y,
          processedWord,
          shouldDraw,
          checkHitboxes: true
        });
        if (textPlaced) {
          this.placedWords.push({
            xFromCenter: x - this.centerX,
            yFromCenter: y - this.centerY,
            processedWord
          });
          this.wordsToPlace.shift();
          placed = true;
          break;
        }
        // If we're growing to fit, break out so the word cloud is tightly packed
        if (outsideBorders && this.growToFit) {
          break;
        }
      }

      if (x < 0) {
        breachedLeft = true;
      }
      if (x > this.width) {
        breachedRight = true;
      }
      if (y < 0) {
        breachedTop = true;
      }
      if (y > this.height) {
        breachedBottom = true;
      }
    }

    if (this.debug && shouldDraw) {
      this.ctx.setLineWidth(1);
      this.ctx.addPath(path);
      this.ctx.setStrokeColor(new Color("6693F5"));
      this.ctx.strokePath();
    }
    return placed;
  }

  async _writePendingWords(shouldDraw) {
    if (this.debug) {
      console.log("writing pending words");
    }
    let placedAll = true;
    // this.wordsToPlace is edited as words are placed
    // To be safe, copy it locally first
    const copiedWordsToPlace = [...this.wordsToPlace];
    for (const processedWord of copiedWordsToPlace) {
      if (!(await this._writeWithPlacementFunction(processedWord, shouldDraw))) {
        placedAll = false;
        // Stop trying to place words if growToFit
        if (this.growToFit) {
          return false;
        }
      }
    }
    return placedAll;
  }

  async _writeAlreadyPlacedWords(shouldDraw) {
    if (this.debug) {
      console.log("writing already placed words");
    }
    for (const placedWord of this.placedWords) {
      await this._addTextCentered({
        x: placedWord.xFromCenter + this.centerX,
        y: placedWord.yFromCenter + this.centerY,
        processedWord: placedWord.processedWord,
        shouldDraw,
        checkHitboxes: false
      });
    }
  }

  /**
   * Returns some statistics about the words provided
   * so the DrawContext can be adjusted to fit them.
   *
   * @return { number, number, number }
   *         { minWidth, minHeight, minArea }
   *  - The minimum width, height, and area that the
   *    canvas needs to fit the words.
   */
  async _getWordStats() {
    let minWidth = 0;
    let minHeight = 0;
    let minArea = 0;
    for (const processedWord of this.processedWords) {
      const { word, wordCloudFont, fontSize, color } = processedWord;
      const dimensions = await this._getTextDimensions(word, wordCloudFont, fontSize);

      if (minWidth < dimensions.width) {
        minWidth = dimensions.width;
      }
      if (minHeight < dimensions.height) {
        minHeight = dimensions.height;
      }

      minArea += dimensions.width * dimensions.height;
    }
    return { minWidth, minHeight, minArea };
  }

  /**
   * All words that are more than half of the width
   * can't be placed next to each other. This means
   * they have to be stacked and their combined
   * height needs to be at least as long as the draw
   * context. The same can be said about words that
   * are larger than half of the height.
   *
   * Unlike the _getWordStats() function, this
   * function will return a different result
   * depending on the current width and height.
   *
   * @param {number} ctxWidth
   *  - The width the words are being checked
   *    against.
   * @param {number} ctxHeight
   *  - The height the words are being checked
   *    against.
   * @return { number, number }
   *         { stackedMinWidth, stackedMinHeight }
   *  - The minimum width and height the canvas needs
   *    to fit the words.
   */
  async _getStackedMinDimensions(ctxWidth, ctxHeight) {
    let stackedMinHeight = 0;
    let stackedMinWidth = 0;
    for (const processedWord of this.processedWords) {
      const { word, wordCloudFont, fontSize, color } = processedWord;
      const dimensions = await this._getTextDimensions(word, wordCloudFont, fontSize);

      if (dimensions.width > ctxWidth / 2) {
        stackedMinHeight += dimensions.height;
      }
      if (dimensions.height > ctxHeight / 2) {
        stackedMinWidth += dimensions.width;
      }
    }
    return { stackedMinWidth, stackedMinHeight };
  }

  /**
   * Before words are placed on the spiral it's
   * possible to grow the canvas using information
   * we know about the words. This is faster than
   * placing all of the words on the spiral and
   * iterating so it's preferred to run this function
   * first.
   *
   * @param {number} ctxWidth
   *  - The current width of the canvas.
   * @param {number} ctxHeight
   *  - The current height of the canvas.
   * @return { number, number } { width, height }
   *  - The new width and height for the canvas.
   */
  async _preflightGrow(ctxWidth, ctxHeight) {
    let width = ctxWidth;
    let height = ctxHeight;
    const { minWidth, minHeight, minArea } = await this._getWordStats();

    // The biggest height and width of the words have
    // to fit the DrawContext
    while (minWidth > width || minHeight > height) {
      console.log("increasing because of min width or height");
      ({ width, height } = this.growthFunction(width, height, this.providedWidth, this.providedHeight));
    }

    // The area of the words have to fit the area of
    // the DrawContext
    while (minArea > (width * height)) {
      console.log("increasing because of min area");
      ({ width, height } = this.growthFunction(width, height, this.providedWidth, this.providedHeight));
    }

    // All words that are more than half of the width
    // can't be placed next to each other. This means
    // they have to be stacked and their combined
    // height needs to be at least as long as the
    // draw context. The same can be said about words
    // that are larger than half of the height.
    let { stackedMinWidth, stackedMinHeight } = await this._getStackedMinDimensions(width, height);
    while (stackedMinWidth > width || stackedMinHeight > height) {
      console.log("increasing because of stacked width or height");
      ({ width, height } = this.growthFunction(width, height, this.providedWidth, this.providedHeight));
      ({ stackedMinWidth, stackedMinHeight } = await this._getStackedMinDimensions(width, height));
    }

    return { width, height };
  }

  /**
   * If growToFit is true, the canvas will grow until
   * all of the words fit on the canvas. This is done
   * using the following algorithm:
   *
   * 1. "Preflight": The words are analyzed to see
   *    if the canvas needs growing before anything
   *    is written to the canvas.
   * 2. "Placement": The words are placed on the
   *    canvas until either:
   *    A) a word can't be placed anymore or
   *    B) a word overlaps with the outside of the
   *       canvas. We check for B so the result stays
   *       "tight". Skipping this step usually
   *       results in "tall" word clouds.
   * 3. "Grow and Repeat": The canvas is grown, the
   *    words that have already been placed before
   *    are placed in their last positions, and the
   *    "Placement" step starts over again. This
   *    repeats until all of the words are placed on
   *    the canvas.
   *
   * @return { Image } - The image of the WordCloud!
   */
  async getImage() {
    let width = this.providedWidth;
    let height = this.providedHeight;
    if (this.growToFit) {
      ({ width, height } = await this._preflightGrow(width, height));
    }

    let placedAll = false;
    while (!placedAll) {
      this.width = width;
      this.height = height;
      this.centerX = width / 2;
      this.centerY = height / 2;
      this.hitBoxes = [];

      await this._writeAlreadyPlacedWords(false);
      placedAll = await this._writePendingWords(false);

      if (!this.growToFit) {
        break;
      }

      if (!placedAll) {
        console.log("increasing because words couldn't fit area");
        ({ width, height } = this.growthFunction(width, height, this.providedWidth, this.providedHeight));
      }
    }

    this.ctx = new DrawContext();
    this.ctx.opaque = false;
    this.ctx.respectScreenScale = this.respectScreenScale;
    this.ctx.size = new Size(width, height);

    // If debug is on, run the placement function one
    // last time to display how the function works.
    if (this.debug) {
      this.ctx.setLineWidth(5);
      this.ctx.setStrokeColor(Color.red());
      this.ctx.strokeRect(new Rect(0, 0, width, height));
      await this._writeWithPlacementFunction(null, true);
    }

    await this._writeAlreadyPlacedWords(true);
    return this.ctx.getImage();
  }

}

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
    color: Math.random() < 0.5 ? Color.red() : new Color('#1E792C')
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

function celestialWeightFunction(wordCloudWord) {
  const max = 60;
  const min = 10;
  return new WordCloudProcessedWord({
    word: wordCloudWord.word,
    wordCloudFont: new WordCloudFont({
      fontName: 'GillSans-LightItalic'
    }),
    fontSize: (wordCloudWord.weight / 10) * (max - min) + min,
    color: Color.lightGray()
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
    color: Math.random() < 0.5 ? Color.red() : new Color('#1E792C')
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

/************************
 ***** SAMPLE LOGIC *****
 ************************/

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

// Alternatively, consider adding an image as the background :)
// widget.backgroundImage = await new Request('YOUR IMAGE URL').loadImage();

if (config.runsInWidget) {
  Script.setWidget(widget);
  Script.complete();
} else {
  widget.presentLarge();
}
