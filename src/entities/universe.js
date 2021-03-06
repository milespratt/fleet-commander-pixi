import * as PIXI from "pixi.js";

import {
  randomIntFromInterval,
  getDistanceAndAngleBetweenTwoPoints,
  generateStarName,
  getRandomArrayElement,
  randomFloatFromInterval,
} from "../helpers";

import { colors } from "../config";

import Star from "./star";

import ringPNG from "../assets/images/star-selection-ring.png";
import hoverRingPNG from "../assets/images/star-hover-ring.png";

const hoverRingTexture = PIXI.Texture.from(hoverRingPNG);
const hoverRingSprite = new PIXI.Sprite(hoverRingTexture);
hoverRingSprite.anchor.set(0.5);
hoverRingSprite.height = 50;
hoverRingSprite.interactive = false;
hoverRingSprite.tint = colors.yellow;
hoverRingSprite.visible = false;
hoverRingSprite.width = 50;

// create star selection ring sprite
const selectionRingTexture = PIXI.Texture.from(ringPNG);
const selectionRingSprite = new PIXI.Sprite(selectionRingTexture);
selectionRingSprite.anchor.set(0.5);
selectionRingSprite.height = 30;
selectionRingSprite.interactive = false;
selectionRingSprite.tint = colors.yellow;
selectionRingSprite.visible = false;
selectionRingSprite.width = 30;

class Universe {
  constructor() {
    this.selectionRingSprite = selectionRingSprite;
    this.hoverRingSprite = hoverRingSprite;
    this.starCoordinates = [];
    this.stars = [];
    this.sectorGrid = {};
    this.size = null;
    this.generationTime = null;
    this.extraGenerationLoops = null;
    this.starStats = {
      O: { count: 0, type: "O" },
      B: { count: 0, type: "B" },
      A: { count: 0, type: "A" },
      F: { count: 0, type: "F" },
      G: { count: 0, type: "G" },
      K: { count: 0, type: "K" },
      M: { count: 0, type: "M" },
    };
    this.biggestStar = 0;
    this.selectedStar = null;
    this.hoveredStar = null;
  }
  checkStarEqual(star1, star2) {
    return star1.id === star2.id;
  }
  showSelectionRing(coordinates, size) {
    this.selectionRingSprite.visible = true;
    this.selectionRingSprite.height = size - 14;
    this.selectionRingSprite.width = size - 14;
    this.selectionRingSprite.position.set(coordinates.x, coordinates.y);
  }

  showHoverRing(coordinates, size) {
    this.hoverRingSprite.visible = true;
    this.hoverRingSprite.height = size - 14;
    this.hoverRingSprite.width = size - 14;
    this.hoverRingSprite.position.set(coordinates.x, coordinates.y);
  }
  setSelectedStar(star) {
    if (!this.selectedStar || !this.checkStarEqual(star, this.selectedStar)) {
      this.selectedStar = star;
      const hitAreaSize = star.hitAreaSize * (star.size / 72);
      this.showSelectionRing(
        { x: star.position.x, y: star.position.y },
        hitAreaSize
      );
    }
  }
  setHoveredStar(star) {
    if (!star) {
      this.hoveredStar = null;
      this.hoverRingSprite.visible = false;
    } else if (
      !this.hoveredStar ||
      !this.checkStarEqual(star, this.hoveredStar)
    ) {
      this.hoveredStar = star;
      const hitAreaSize = star.hitAreaSize * (star.size / 72);
      this.showHoverRing(
        { x: star.position.x, y: star.position.y },
        hitAreaSize
      );
    }
  }
  // return sector grid row from y coordinate
  getGridRow(y) {
    const row = String.fromCharCode(
      65 +
        Math.floor(
          (this.sectorGrid.size - (this.sectorGrid.size - y)) /
            this.sectorGrid.delimiter
        )
    );
    return row;
  }
  // return sector grid column from x coordinate
  getGridColumn(x) {
    const column =
      Math.floor(
        (this.sectorGrid.size - (this.sectorGrid.size - x)) /
          this.sectorGrid.delimiter
      ) + 1;
    return column;
  }
  // return sector grid sector from x and y coordinates
  getGridSector(x, y) {
    const row = this.getGridRow(y);
    const column = this.getGridColumn(x);
    return `${row}${column}`;
  }
  // return an array of all grid sectors adjacent to supplied sector (optionally include supplied sector)
  getAdjacentSectors(sector, includeSector = false) {
    const { sectors, rows, columns } = this.sectorGrid;
    const row = sector.substring(0, 1);
    const rowsToCapture =
      row === this.sectorGrid.firstRow
        ? [row, String.fromCharCode(this.sectorGrid.firstRow.charCodeAt(0) + 1)]
        : row === this.sectorGrid.lastRow
        ? [String.fromCharCode(this.sectorGrid.lastRow.charCodeAt(0) - 1), row]
        : [
            String.fromCharCode(row.charCodeAt(0) - 1),
            row,
            String.fromCharCode(row.charCodeAt(0) + 1),
          ];
    const column = parseInt(sector.substring(1));
    const columnsToCapture =
      column === 1
        ? [column, 2]
        : column === columns
        ? [column - 1, column]
        : [column - 1, column, column + 1];
    const adjacentSectors = [];
    for (let r = 0; r < rowsToCapture.length; r++) {
      for (let c = 0; c < columnsToCapture.length; c++) {
        adjacentSectors.push(`${rowsToCapture[r]}${columnsToCapture[c]}`);
      }
    }
    if (!includeSector) {
      const filteredAdjacentSectors = adjacentSectors.filter(
        (e) => e !== sector
      );
      return filteredAdjacentSectors;
    } else {
      return adjacentSectors;
    }
  }
  // return array of all stars in supplied sector
  getStarsInSector(sector) {
    return this.sectorGrid.sectors[sector].stars;
  }
  // return an array of all stars from supplied array of sectors
  getStarsFromSectorArray(sectors) {
    const stars = [];
    sectors.forEach((sector) => {
      this.sectorGrid.sectors[sector].stars.forEach((star) => stars.push(star));
    });
    return stars;
  }
  // return array of all stars in this sector and adjacent sector from x and y coordinate
  getStarsInThisAndAdjacentSectors(x, y) {
    const sector = this.getGridSector(x, y);
    const adjacentSectors = this.getAdjacentSectors(sector, true);
    const starsInThisAndAdjacentSectors = [];
    adjacentSectors.forEach((sector) => {
      this.sectorGrid.sectors[sector].stars.forEach((star) =>
        starsInThisAndAdjacentSectors.push(star)
      );
    });
    return starsInThisAndAdjacentSectors;
  }
  // get a random star, optionally supply a limit (pixel distance)
  getRandomStar(limit) {
    let randomStar;
    if (limit && limit.distance > 0) {
      const sectorScan = limit.distance / this.sectorGrid.delimiter;
      const sectorDistance = Math.ceil(sectorScan);
      const limitSector = this.getGridSector(
        limit.origin.position.x,
        limit.origin.position.y
      );
      const adjacentSectors = this.getAdjacentSectors(limitSector, true);
      for (let s = 1; s < sectorDistance; s++) {
        adjacentSectors.forEach((adjacentSector) => {
          this.getAdjacentSectors(adjacentSector).forEach((loopedSector) => {
            if (!adjacentSectors.includes(loopedSector)) {
              adjacentSectors.push(loopedSector);
            }
          });
        });
      }

      const limitedStars = this.getStarsFromSectorArray(adjacentSectors);

      // const limitedStars = this.getStarsInThisAndAdjacentSectors(
      //   limit.origin.position.x,
      //   limit.origin.position.y
      // );
      // const limitedStars = starArray
      const closeStars = limitedStars.filter((limitStar, index) => {
        const starDistance = getDistanceAndAngleBetweenTwoPoints(
          { x: limitStar.position.x, y: limitStar.position.y },
          limit.origin.position
        ).distance;
        return starDistance <= limit.distance;
      });
      randomStar = getRandomArrayElement(closeStars);
    } else {
      randomStar = getRandomArrayElement(this.stars);
    }
    return randomStar;
  }
  // generate universe sector grid
  generateSectorGrid(delimiter) {
    const rowsAndColumns = Math.ceil(this.size / delimiter);
    const sectorGrid = {
      delimiter,
      size: this.size,
      firstRow: "A",
      firstColumn: 1,
      lastColumn: rowsAndColumns,
      rows: rowsAndColumns,
      columns: rowsAndColumns,
      totalSectors: rowsAndColumns * rowsAndColumns,
      sectors: {},
    };
    for (let r = 0; r < rowsAndColumns; r++) {
      for (let c = 1; c <= rowsAndColumns; c++) {
        const row = String.fromCharCode(65 + r);
        if (c === rowsAndColumns) {
          sectorGrid.lastRow = row;
        }
        sectorGrid.sectors[`${row}${c}`] = {
          center: {
            x: c * delimiter + delimiter / 2,
            y: r * delimiter + delimiter / 2,
          },
          starCoordinates: [],
          stars: [],
        };
      }
    }
    this.sectorGrid = sectorGrid;
  }
  getStarsInRange(range, origin) {
    const sectorScan = range / this.sectorGrid.delimiter;
    const sectorDistance = Math.ceil(sectorScan);
    const limitSector = this.getGridSector(
      origin.position.x,
      origin.position.y
    );
    const adjacentSectors = this.getAdjacentSectors(limitSector, true);
    for (let s = 1; s < sectorDistance; s++) {
      adjacentSectors.forEach((adjacentSector) => {
        this.getAdjacentSectors(adjacentSector).forEach((loopedSector) => {
          if (!adjacentSectors.includes(loopedSector)) {
            adjacentSectors.push(loopedSector);
          }
        });
      });
    }

    const limitedStars = this.getStarsFromSectorArray(adjacentSectors);

    // const limitedStars = this.universe.getStarsInThisAndAdjacentSectors(
    //   this.position.x,
    //   this.position.y
    // );
    const starsInRange = limitedStars.filter((limitStar) => {
      const starDistance = getDistanceAndAngleBetweenTwoPoints(
        { x: limitStar.position.x, y: limitStar.position.y },
        origin.position
      ).distance;
      return starDistance <= range;
    });
    return starsInRange.filter((star) => star.id !== origin.id);
    // if (includeOrigin && includeDestination) {
    //   return starsInRange;
    // } else if (!includeOrigin && !includeDestination) {
    //   return starsInRange.filter(
    //     (star) => star.id !== this.origin.id && star.id !== this.destination.id
    //   );
    // } else if (includeOrigin && !includeDestination) {
    //   return starsInRange.filter((star) => star.id !== this.destination.id);
    // } else if (!includeOrigin && includeDestination) {
    //   return starsInRange.filter((star) => star.id !== this.origin.id);
    // }
    return starsInRange;
  }
  getRoute(origin, destination, range) {
    console.log(origin);
    console.log(destination);
    console.log(range);

    const distance = getDistanceAndAngleBetweenTwoPoints(
      origin.position,
      destination.position
    ).distance;
    console.log(distance);
    const route = [];
    if (distance > range) {
      let routing = true;
      let nextOrigin = origin;
      let nextLegDestination = null;
      let destinationDistance = null;
      console.log("too far!");
      let loops = 0;
      while (routing) {
        loops++;
        // get stars in range of next origin
        const inRangeStars = this.getStarsInRange(range, nextOrigin);
        // loop through the in range stars and find the one closest to destination
        // inRangeStars.forEach((rangeStar) => {
        for (let s = 0; s < inRangeStars.length; s++) {
          const { distance } = getDistanceAndAngleBetweenTwoPoints(
            inRangeStars[s].position,
            destination.position
          );
          if (inRangeStars[s].id === destination.id) {
            nextLegDestination = inRangeStars[s];
            break;
          } else if (!destinationDistance || destinationDistance > distance) {
            destinationDistance = distance;
            nextLegDestination = inRangeStars[s];
          }
        }
        // });
        route.push({
          start: nextOrigin,
          end: nextLegDestination,
        });
        if (nextLegDestination.id === destination.id || loops > 1000) {
          routing = false;
        } else {
          nextOrigin = nextLegDestination;
          nextLegDestination = null;
        }
      }
      return route;
    } else {
      route.push({
        start: origin,
        end: destination,
      });
      return route;
    }
  }
  // generate universe
  generate(options) {
    console.log(``);
    console.log("Generating universe...");
    // get start time to measure performance
    const start = performance.now();

    // options
    const {
      maxExtraGenerationLoops,
      maxStars,
      edgeDistance,
      size,
      minimumStarDistance,
      maxGenTime,
      radial,
    } = options;

    if (size % 26 === 0) {
      this.size = size;
    } else {
      this.size = size - (size % 26);
    }

    // center center of universe
    const center = {
      x: this.size / 2,
      y: this.size / 2,
    };

    // create sector grid
    // this.generateSectorGrid(2000);
    this.generateSectorGrid(Math.floor(this.size / 26));
    const sectorScan = minimumStarDistance / this.sectorGrid.delimiter;
    const sectorDistance = Math.ceil(sectorScan);
    console.log(`Scan at ${sectorDistance} sector depth`);

    // generation loop
    // keep generating until one threshold is hit
    this.extraGenerationLoops = 0;
    let proximityMax = 0;
    while (
      this.starCoordinates.length < maxStars &&
      this.extraGenerationLoops < maxExtraGenerationLoops &&
      performance.now() - start < maxGenTime
    ) {
      // create a random star coordinate

      let newStarCoordinate = {
        x: randomIntFromInterval(0 + edgeDistance, this.size - edgeDistance),
        y: randomIntFromInterval(0 + edgeDistance, this.size - edgeDistance),
      };

      // get the new coordinate sector
      let coordinateSector = this.getGridSector(
        newStarCoordinate.x,
        newStarCoordinate.y
      );

      // const sectorDistance = 1;
      const adjacentSectors = this.getAdjacentSectors(coordinateSector, true);
      for (let s = 1; s < sectorDistance; s++) {
        adjacentSectors.forEach((adjacentSector) => {
          this.getAdjacentSectors(adjacentSector).forEach((loopedSector) => {
            if (!adjacentSectors.includes(loopedSector)) {
              adjacentSectors.push(loopedSector);
            }
          });
        });
      }

      const closeStars = this.getStarsFromSectorArray(adjacentSectors);
      proximityMax =
        proximityMax > closeStars.length ? proximityMax : closeStars.length;

      // variables for radial generation
      const maxDistanceFromCenter = this.size / 2;
      const distanceFromCenter = getDistanceAndAngleBetweenTwoPoints(
        newStarCoordinate,
        center
      ).distance;
      const percentOfMaxDistance = distanceFromCenter / maxDistanceFromCenter;

      // minimum distance from other existing coordinates
      // calculated if radial
      // fixed for non-radial
      const minimumAdjacentDistance = radial
        ? minimumStarDistance * percentOfMaxDistance
        : minimumStarDistance;

      if (radial && percentOfMaxDistance > 1) {
        // throw away coordinates that are outside the radial limit
        newStarCoordinate = null;
        // } else if (this.starCoordinates.length === 0) {
      } else if (false) {
        // place first coordinate at the center
        newStarCoordinate = center;
        coordinateSector = this.getGridSector(
          newStarCoordinate.x,
          newStarCoordinate.y
        );
      } else {
        // loop over existing coordinates to check minimum distance
        // for (let s = 0; s < starCoordinates.length; s++) {
        for (let s = 0; s < closeStars.length; s++) {
          // get distance between new and existing coordinates
          const coordinateDistance = getDistanceAndAngleBetweenTwoPoints(
            newStarCoordinate,
            // starCoordinates[s]
            closeStars[s].position
          ).distance;

          // throw out the new coordinate and break the loop if a close neighbor is found
          if (coordinateDistance < minimumAdjacentDistance) {
            this.extraGenerationLoops++;
            newStarCoordinate = null;
            break;
          }
        }
      }

      // finalize the coordinate if it didn't get thrown out
      if (newStarCoordinate !== null) {
        const sectorStarCount = this.sectorGrid.sectors[coordinateSector].stars
          .length;
        // assign it to a sector
        newStarCoordinate.sector = coordinateSector;
        // give it a name
        newStarCoordinate.name = generateStarName(
          coordinateSector,
          sectorStarCount
        );
        const starTypePercentages = {
          O: [0, 1],
          B: [1, 3],
          A: [3, 6],
          F: [6, 11],
          G: [11, 19],
          K: [19, 32],
        };
        // GET STAR TYPE

        let type = null;
        const starRand = randomIntFromInterval(1, 100);
        if (
          starRand >= starTypePercentages.O[0] &&
          starRand <= starTypePercentages.O[1]
        ) {
          type = "O";
        } else if (
          starRand > starTypePercentages.B[0] &&
          starRand <= starTypePercentages.B[1]
        ) {
          type = "B";
        } else if (
          starRand > starTypePercentages.A[0] &&
          starRand <= starTypePercentages.A[1]
        ) {
          type = "A";
        } else if (
          starRand > starTypePercentages.F[0] &&
          starRand <= starTypePercentages.F[1]
        ) {
          type = "F";
        } else if (
          starRand > starTypePercentages.G[0] &&
          starRand <= starTypePercentages.G[1]
        ) {
          type = "G";
        } else if (
          starRand > starTypePercentages.K[0] &&
          starRand <= starTypePercentages.K[1]
        ) {
          type = "K";
        } else {
          type = "M";
        }
        this.starStats[type].count += 1;
        // if (this.stars.length <= 25) {
        //   type = "O";
        // } else if (this.stars.length <= 100) {
        //   type = "B";
        // } else if (this.stars.length <= 300) {
        //   type = "A";
        // } else if (this.stars.length <= 1500) {
        //   type = "F";
        // } else if (this.stars.length <= 3800) {
        //   type = "G";
        // } else if (this.stars.length <= 6050) {
        //   type = "K";
        // } else {
        //   type = "M";
        // }
        // if (this.stars.length < maxStars * starTypePercentages.O) {
        //   type = "O";
        // } else if (this.stars.length < maxStars * starTypePercentages.B) {
        //   type = "B";
        // } else if (this.stars.length < maxStars * starTypePercentages.A) {
        //   type = "A";
        // } else if (this.stars.length < maxStars * starTypePercentages.F) {
        //   type = "F";
        // } else if (this.stars.length < maxStars * starTypePercentages.G) {
        //   type = "G";
        // } else if (this.stars.length < maxStars * starTypePercentages.K) {
        //   type = "K";
        // } else {
        //   type = "M";
        // }

        // else if (classNumber > 7645) {
        // }
        // GET STAR TYPE
        // create a Star object
        const newStar = new Star(
          newStarCoordinate.x,
          newStarCoordinate.y,
          newStarCoordinate.name,
          newStarCoordinate._id || newStarCoordinate.name,
          newStarCoordinate.sector,
          type,
          this
        );
        this.biggestStar =
          newStar.size > this.biggestStar ? newStar.size : this.biggestStar;

        // push the coordinate to the list
        this.starCoordinates.push(newStarCoordinate);
        this.stars.push(newStar);
        // push the coordinate to it's sector
        this.sectorGrid.sectors[coordinateSector].starCoordinates.push(
          newStarCoordinate
        );
        this.sectorGrid.sectors[coordinateSector].stars.push(newStar);
      }
    }
    // calculate the generation time
    this.generationTime = performance.now() - start;
    // log if loop limit is hit
    if (this.extraGenerationLoops >= maxExtraGenerationLoops) {
      console.log(
        `Generation stopped. Hit loop limit of ${maxExtraGenerationLoops.toLocaleString()}.`
      );
    }
    // log if max star limit is hit
    if (this.starCoordinates.length >= maxStars) {
      console.log(
        `Generation stopped. Hit star limit of ${maxStars.toLocaleString()}.`
      );
    }
    // log if max generation time is hit
    if (this.generationTime >= maxGenTime) {
      console.log(
        `Generation stopped. Hit max gen time of ${maxGenTime.toLocaleString()}ms.`
      );
    }
    // log generation time
    console.log(
      `${this.starCoordinates.length.toLocaleString()} stars generated in ${this.generationTime.toLocaleString()}ms.`
    );
    // log number of loops required
    console.log(
      `It took ${this.extraGenerationLoops.toLocaleString()} extra generation loops to meet the ${minimumStarDistance.toLocaleString()} pixel star distance criteria.`
    );
    // log max proximity loop
    console.log(
      `Max of ${proximityMax.toLocaleString()} calculations per star coordinate reached to verify minimum distance of ${minimumStarDistance.toLocaleString()}`
    );

    console.log(``);
  }
}

export default Universe;
