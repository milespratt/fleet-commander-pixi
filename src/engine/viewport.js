// DEPENDENCIES
import { Viewport } from "pixi-viewport";

// CONFIG
import { screenHeight, screenWidth, generationParameters } from "../config";

const storedGenerationParameters = localStorage.getItem(
  "generation_parameters"
);
if (storedGenerationParameters) {
  const parsedGenerationParameters = JSON.parse(storedGenerationParameters);
  generationParameters.size = parsedGenerationParameters.size;
  generationParameters.maxStars = parsedGenerationParameters.maxStars;
  generationParameters.minimumStarDistance =
    parsedGenerationParameters.minimumStarDistance;
  generationParameters.edgeDistance = parsedGenerationParameters.edgeDistance;
  generationParameters.radial = parsedGenerationParameters.radial;
}

function snapTo(viewport, scaleX, position) {
  viewport.animate({
    time: 500 / scaleX,
    position: { x: position.x, y: position.y },
    scale: 1,
    removeOnInterrupt: true,
    ease: "easeInOutCubic",
  });
}

// create viewport
export function createViewport(app, options, clamps) {
  const viewportOptions = options || {
    worldHeight: generationParameters.size,
    worldWidth: generationParameters.size,
    screenHeight,
    screenWidth,
    divWheel: document.getElementById("view"),
  };
  viewportOptions.interaction = app.renderer.plugins.interaction;
  const newViewport = new Viewport(viewportOptions).moveCenter(
    generationParameters.size / 2,
    generationParameters.size / 2
  );
  // .clamp({ direction: "all", underflow: "center" });

  if (clamps) {
    newViewport
      .clamp({
        direction: "all",
        underflow: "center",
      })
      // .bounce({ sides: "all", underflow: "center", time: 50, friction: 0.1 })
      .clampZoom(clamps)
      .drag({ clampWheel: true })
      .pinch()
      .wheel()
      .decelerate();
  }

  // set viewport parameters for use later
  newViewport.initialWidth = newViewport.screenWidth; // for snapZoom

  // add viewport to app stage
  app.stage.addChild(newViewport);

  newViewport.snapTo = snapTo;

  // return viewport
  return newViewport;
}
