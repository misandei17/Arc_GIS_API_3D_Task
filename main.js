import SceneView from "@arcgis/core/views/SceneView.js";
import Map from "@arcgis/core/Map.js";
import Mesh from "@arcgis/core/geometry/Mesh.js";
import Graphic from "@arcgis/core/Graphic.js";

const map = new Map({
  basemap: "satellite",
  ground: "world-elevation",
});

const view = new SceneView({
  container: "viewDiv",
  map: map,
  camera: {
    position: [19.93538, 50.04638, 900],
    heading: 0,
    tilt: 50,
  },
  qualityProfile: "high",
});

let rect = new Mesh({
  vertexAttributes: {
    // prettier-ignore
    position: [
      19.93455, 50.05371, 230,
      19.93455, 50.05401, 230,
      19.93534, 50.05371, 230,
      19.93534, 50.05401, 230,
      19.93455, 50.05371, 250,
      19.93455, 50.05401, 250,
      19.93534, 50.05371, 250,
      19.93534, 50.05401, 250,
    ],
  },

  // ! Wskazówka, każda powierzchnia jest trójkątna
  components: [
    {
      // prettier-ignore
      faces: [
        0, 1, 2,
        2, 1, 3,
        0, 1, 4,
        5, 4, 1,
        0, 2, 6,
        6, 4, 0,
        6, 7, 2,
        7, 3, 2,
        7, 3, 1,
        1, 5, 7,
        5, 4, 6,
        5, 7, 6
      ],
    },
  ],
});

let graphic = new Graphic({
  geometry: rect,
  symbol: {
    type: "mesh-3d",
    symbolLayers: [{ type: "fill" }],
  },
});

view.graphics.add(graphic);

let selectedVertexIndex = 0; // The index of the selected vertex

// Event listener for the "Update Vertex" button
document.getElementById("updateBtn").addEventListener("click", updateVertex);

// Event listeners for number inputs
document.getElementById("x").addEventListener("input", handleInputChange);
document.getElementById("y").addEventListener("input", handleInputChange);
document.getElementById("z").addEventListener("input", handleInputChange);

function updateVertex() {
  const x = parseFloat(document.getElementById("x").value);
  const y = parseFloat(document.getElementById("y").value);
  const z = parseFloat(document.getElementById("z").value);

  // Update the vertex position in the mesh
  rect.vertexAttributes.position[selectedVertexIndex * 3] = x;
  rect.vertexAttributes.position[selectedVertexIndex * 3 + 1] = y;
  rect.vertexAttributes.position[selectedVertexIndex * 3 + 2] = z;
  rect.geometryChanged();

  // Redraw the graphic
  view.graphics.remove(graphic);
  graphic = new Graphic({
    geometry: rect,
    symbol: {
      type: "mesh-3d",
      symbolLayers: [{ type: "fill" }],
    },
  });
  view.graphics.add(graphic);
}

function handleInputChange(event) {
  const inputId = event.target.id;
  const inputValue = parseFloat(event.target.value);

  // Update the corresponding coordinate based on the input
  if (inputId === "x") {
    rect.vertexAttributes.position[selectedVertexIndex * 3] = inputValue;
  } else if (inputId === "y") {
    rect.vertexAttributes.position[selectedVertexIndex * 3 + 1] = inputValue;
  } else if (inputId === "z") {
    rect.vertexAttributes.position[selectedVertexIndex * 3 + 2] = inputValue;
  }

  // Redraw the graphic with the updated vertex position
  view.graphics.remove(graphic);
  graphic = new Graphic({
    geometry: rect,
    symbol: {
      type: "mesh-3d",
      symbolLayers: [{ type: "fill" }],
    },
  });
  view.graphics.add(graphic);
}

view.on("click", (event) => {
  const screenPoint = {
    x: event.x,
    y: event.y,
  };

  // Get the 3D coordinates from the click event
  view.hitTest(screenPoint).then((response) => {
    const result = response.results[0];
    if (result && result.graphic === graphic) {
      // Highlight the selected vertex with a different color
      selectedVertexIndex = Math.floor(result.vertexIndex / 4);
      const selectedColor = [1, 0, 0, 1]; // Red color
      rect.attributes.color = rect.vertexAttributes.position.map((_, index) =>
        index === selectedVertexIndex * 3 ? selectedColor[0] : rect.attributes.color[index]
      );
      rect.geometryChanged();

      // Update the input values with the selected vertex coordinates
      document.getElementById("x").value = rect.vertexAttributes.position[selectedVertexIndex * 3].toFixed(2);
      document.getElementById("y").value = rect.vertexAttributes.position[selectedVertexIndex * 3 + 1].toFixed(2);
      document.getElementById("z").value = rect.vertexAttributes.position[selectedVertexIndex * 3 + 2].toFixed(2);
    }
  });
});
