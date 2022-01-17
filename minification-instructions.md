# Minification Instructions

In order to minify the WordCloud class, you must first minify the HTML and Javascript text blobs. The two functions are called `_loadFontToWebView` and `_getTextDimensionsUsingWebView`.

Once both of these functions are minified, you can minify the Word Cloud class as a whole.

## _loadFontToWebView before and after
```
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
```
```
  _loadFontToWebView(fontFamily, fontCssUrl) {
    const html = `<link rel="preconnect" href="https://fonts.gstatic.com"> <link href="REPLACE_HREF" rel="stylesheet"> <div style="font-family: REPLACE_FONT_FAMILY;">.</div>`
      .replace("REPLACE_HREF", fontCssUrl)
      .replace("REPLACE_FONT_FAMILY", fontFamily);

    return this.webView.loadHTML(html);
  }
```

## _getTextDimensionsUsingWebView before and after
```
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
```
```
  _getTextDimensionsUsingWebView(text, cssFont) {
    const javascript = `function getTextDimensions(t,e){const n=document.createElement("canvas").getContext("2d");n.font=e;const o=n.measureText(t);return{width:3*o.width/4,height:3*(o.actualBoundingBoxAscent+o.actualBoundingBoxDescent)/4}}getTextDimensions("REPLACE_TEXT","REPLACE_FONT");`
      .replace("REPLACE_TEXT", text)
      .replace("REPLACE_FONT", cssFont);

    return this.webView.evaluateJavaScript(javascript);
  }
```
