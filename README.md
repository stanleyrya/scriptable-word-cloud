# Dynamic Scriptable Word Cloud!

This demo shows off a dynamic word cloud class that can be copy-pasted to your own script! Throughout the demo simply press on an example row to copy a full-working Scriptable script. These examples use a minified version of the word cloud classes which are easier to read. You can also cut to the chase and use either the normal [1] or minified [2] versions on Github. I strongly recommend using the minified version to start.
    createDescriptionRow(`-> [1] - https://github.com/stanleyrya/scriptable-playground/blob/main/word-cloud/word-cloud.js`, 60, "https://github.com/stanleyrya/scriptable-playground/blob/main/word-cloud/word-cloud.js"),
    createDescriptionRow(`-> [2] - https://github.com/stanleyrya/scriptable-playground/blob/main/word-cloud/minified-word-cloud.js`, 60, "https://github.com/stanleyrya/scriptable-playground/blob/main/word-cloud/minified-word-cloud.js"),

There are only three required fields: Width, Height, and WordCloudWords. WordCloudWords are objects with two properties: Word (string) and Weight (number). Here's an example of a WordCloudWords array:
    createDescriptionRow(JSON.stringify(wordCloudWords, undefined, "\t"), 300),
This object could be static or you could code something to generate it. I recommend calculating a word's weight by it's frequency in a dataset (Calendar events, weather, etc.), but you could use whatever you want!

Next is Width and Height. These are pretty simple to work with. Here are some examples:
	  await createDemoRow({ width: 250, height: 250 }),
	  await createDemoRow({ width: 530, height: 250 }),
The word cloud is generated dynamically so it can fit different widget sizes. It will also work with weirder sizes like long ones. Get creative!
	  await createDemoRow({ width: 200, height: 600 }),
The next sections will use the sample WordCloudWords object and a Width and Height of 250 each. Remember you can press any example row to get a working script example. Have fun!


## Flags!
Now we get to the fun stuff. Here are some flags that you can pass in to modify the word cloud's behavior. When debug is set to true it will display the 'hitboxes' used in the placement algorithm for each word. it will also display the placement algorithm's path:
	  await createDemoRow({ debug: true }),
The growToFit flag determines whether or not the canvas will 'grow' to fit all of the words provided. When set to true (default) it will continuously increase the size of the canvas until all of the provided words can be placed. If it is set to false it will simply try to place words as best it can:
    await createDemoRow({ growToFit: false }),

## Placement Functions!
Placement functions are plotting functions that return (x,y) coordinates. They are called continuously until all of the words can be plotted with their center on a coordinate (or there is no more space if growToFit is false). They can be confusing at first but they are very powerful. Before we get into it, here's an example:

```
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
```

The inputs width, height, centerX, and centerY are pretty straightforward. xRatio and yRatio are the ratio of the side compared to the largest side and can be useful when scaling the algorithm for different input parameters. PreviousResult contains the results from the last iteration of the algorithm, which at a minimum includes the last x and y values. If it's helpful you can pass additional values in the result and use it in the next iteration, like radius and angle in the example.
I recommend reading the example functions and modifying them to understand how they work. I also recommend googling some cool (x,y) plots and converting them to placement functions. For investigation you could modify my script here:
-> https://github.com/stanleyrya/scriptable-playground/blob/main/word-cloud/experiments/draw-spiral.js", 60, 'https://github.com/stanleyrya/scriptable-playground/blob/main/word-cloud/experiments/draw-spiral.js'),

Here are some placement algorithms I created that are different than the provided spiral one. When the debug parameter is set to true you can see what the algorithm is plotting:
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

## Weight Functions!
Word clouds aren't complete without modifying the font! A weight function can be provided to modify how the words are displayed. You can use this function to convert weight to size, font type, opacity, color, and more! Here's the default method for context:

```
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
```

Just as I mentioned above, I recommend playing with the functions provided and getting creative. Here are some examples using built-in fonts:
	  await createDemoRow({
      weightFunction: builtInFestiveWeightFunction,
    }),
	  await createDemoRow({
      weightFunction: hackerWeightFunction,
    }),

## ... with Custom Fonts!
You can use custom fonts too! Before you get too excited custom fonts require specific setup and are not guarranteed to work. The word cloud algorithm depends on generating word 'hitboxes' to make sure words don't overlap with each other. At this time the hitboxes are generated by rendering the word with Scriptable's WebView tool. Custom fonts aren't referencable from within the tool so they have to be installed on the fly using a CSS stylesheet URL. The word cloud itself is being rendered using Scriptable's DrawContext so the font needs to be installed locally too for the whole thing to work.
TL;DR: You need to both install the font locally and provide a reference to the CSS stylesheet hosted somewhere online to use custom fonts. This has currently only been tested with Google fonts. Here's an example:

```
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
```

The fontName is the font family. This article [1] suggests this app [2] is the safest way to download fonts to iOS. Be careful, use at your own risk!
    createDescriptionRow(`-> [1] - https://9to5mac.com/2020/06/12/fontcase-open-source-fonts-app-iphone-ipad`, 60, "https://9to5mac.com/2020/06/12/fontcase-open-source-fonts-app-iphone-ipad"),
    createDescriptionRow(`-> [2] - https://apps.apple.com/us/app/fontcase-manage-your-type/id1205074470`, 60, "https://apps.apple.com/us/app/fontcase-manage-your-type/id1205074470"),\

After all of that hassle I hope you agree the effort is worth it! Once these fonts are installed they will begin working:
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


## Thank You!

If you enjoyed this demo or the scripts please consider buying me a coffee! I'd also love it if you tried out my other scripts on GitHub. Thanks again!
* https://www.github.com/stanleyrya
* https://www.paypal.me/stanleyrya