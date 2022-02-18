// reduce global variables after fin
let splitOrder = [];
let splitTree;
let mergeOrder = [];
let curStep = 0;
const boxSize = 45; // size of a single box within a display array (px)

// On start button click, remove start btn and get the random array from the server, and call sorter fn
$(() => {
  $.post(`${window.location.href}/get_arr`, (res) => {
    // Sends array from server to the sorter fn
    sorter(res.arr);
  });
});

// Sorts the array and keeps track of the order of the algorithm steps
function sorter(origArr) {
  maxDepth = Math.ceil(Math.log(origArr.length) / Math.log(2)); // Finds the max depth of the tree

  fillGameBoard(origArr, maxDepth);

  // Creates tree for the splitting steps
  splitTree = new BinaryTree(0, [...origArr]);
  // Gets the final merged result
  mergeSort(splitTree, [...origArr]); // Calls the mergesort alg function

  // Order of steps
  splitOrder = [...splitTree.preOrderTraversal()].map((n) => n.key);

  // Creates tree for the merging steps
  mergeOrder = [...splitTree.postOrderTraversal()].map((n) => n.key);

  //disabling the next level button
  document.getElementById("nextLvl-btn").disabled = true;

  //Disabling the previous step button
  document.getElementById("prev-btn").disabled = true;
}

// Gets the next step in the sorting algorithm
function getNextRow() {
  let curNode, val;

  // Increment current step
  curStep++;

  //Using mergeOrder
  if (
    curStep >= splitOrder.length &&
    curStep < splitOrder.length + mergeOrder.length
  ) {
    curNode = splitTree.find(mergeOrder[curStep - mergeOrder.length]);
    val = curNode.getSortedValue;

    //During merge, if node key is 0 (mergeSort is done)
    if (curNode.key == 0) {
      //Disable the next button
      document.getElementById("next-btn").disabled = true;
      document.getElementById("nextLvl-btn").disabled = false;
    }

    feedbackText(curNode.key, "Merging"); //Updating msg div to notify the merge

    if (curNode.value.length <= 1) {
      return getNextRow();
    }
  }
  //Using splitOrder
  else if (curStep < splitOrder.length) {
    curNode = splitTree.find(splitOrder[curStep]);
    val = curNode.value;

    feedbackText(curNode.key, "Splitting"); //Updating msg div to notify user a split is occurring
    animateSplit(curNode); //Animates the splitting arrays action
  } else {
    console.log("Error. Algorithm complete, no more steps");
    //making the next level button appear only when the algorithm is complete

    return;
  }

  $(`#arr-row-${curNode.key}`).html(formatRow(val, curNode.key));
  updateColour(curNode.key);

  // Remove focus from the next button
  $("#next-btn").blur();

  if ((document.getElementById("prev-btn").disabled = true)) {
    document.getElementById("prev-btn").disabled = false;
  }
}

function getPrevRow() {
  let curNode, val;

  if (curStep == 0) {
    $("#prev-btn").blur();
    return;
  }

  //Using mergeOrder
  if (
    curStep >= splitOrder.length &&
    curStep < splitOrder.length + mergeOrder.length
  ) {
    curNode = splitTree.find(mergeOrder[curStep - mergeOrder.length]);
    val = formatRow(curNode.value, curNode.key);

    feedbackText(curNode.key, "Merging");

    if (curNode.key === 0) {
      document.getElementById("next-btn").disabled = false;
      document.getElementById("nextLvl-btn").disabled = true;
    }

    if (curNode.value.length <= 1) {
      curStep--;
      return getPrevRow();
    }
  }
  //Using splitOrder
  else if (curStep < splitOrder.length) {
    curNode = splitTree.find(splitOrder[curStep]);
    val = "";

    //If the current node key is '1-0' (on first row)
    if (curNode.key == "1-0") {
      //Disable the prev step button since user is now at start
      document.getElementById("prev-btn").disabled = true;
    }

    //Updating msg div to notify user a split is occurring
    feedbackText(curNode.key, "Splitting");
  } else {
    console.log("Error. Algorithm complete, no more steps");
    return;
  }

  $(`#arr-row-${curNode.key}`).html(val);
  curStep--;
  $("#prev-btn").blur();
}

function confirmQuit() {
  //creates a confirmation box
  let confirmAction = confirm("Are you sure you want to quit the game?"); //asks the user if they're sure they want to quit
  if (confirmAction) {
    //if they click the yes button this returns true and redirects them to the home page
    window.location = "/";
  } //if the user clicks cancel they get a message to continue the game
  else {
    alert("Continue Game!");
  }
}

function fillGameBoard(startArray, maxDepth) {
  let rowSize = startArray.length * boxSize;

  let dom =
    `<div class="arr-holder" id="dom-hold" style="order: 0"><div class="arr-row" id="arr-row-0">` +
    formatRow(startArray, "0") +
    `</div></div>`;
  let split = ``;
  for (i = 1; i < maxDepth + 1; i++) {
    rowSize = Math.ceil(startArray.length / (i * 2)) * boxSize;
    split += `<div class="arr-holder" id="arr-holder-${i}" style="order: ${i}">`;

    if (i < maxDepth) {
      for (j = 0; j < Math.pow(2, i); j++) {
        split += `<div class="arr-row" id="arr-row-${i}-${j}" style="width: ${rowSize}px;"></div>`;
      }

      split += `</div>`;
    } else {
      split += `<div class="arr-row" id="arr-row-${maxDepth}-0" style="width: ${rowSize}px"></div>`;
      split += `<div class="arr-row" id="arr-row-${maxDepth}-1" style="width: ${rowSize}px"></div>`;

      for (j = 2; j < Math.pow(2, i - 1); j++) {
        split += `<div class="arr-row" style="width: ${rowSize}px"></div>`;
      }
      split += `<div class="arr-row" id="arr-row-${maxDepth}-2" style="width: ${rowSize}px"></div>`;
      split += `<div class="arr-row" id="arr-row-${maxDepth}-3" style="width: ${rowSize}px"></div>`;

      for (j = 2; j < Math.pow(2, i - 1); j++) {
        split += `<div class="arr-row" style="width: ${rowSize}px"></div>`;
      }

      split += `</div>`;
    }
  }

  $("#gameboard").append(dom + split); // Append markup to the end of the gameboard
}

function animateSplit(node) {
  // If the current node is a to the left of its parent animate going left, else animate going right
  if (node.key === 0) {
    document.documentElement.style.setProperty("--animation-translatex", "0%");
  } else if (splitTree.find(node.parent.key).left.key != node.key) {
    document.documentElement.style.setProperty(
      "--animation-translatex",
      "-50%"
    );
  } else {
    document.documentElement.style.setProperty("--animation-translatex", "50%");
  }
}

function feedbackText(key, dir) {
  $("#msg").text(
    key == 0
      ? "Algorithm Complete!"
      : "[" +
          dir +
          "] @ Tree Row: " +
          (Number(key.slice(0, 1)) + 1) +
          ", Tree Node: " +
          (Number(key.slice(2, 3)) + 1)
  );
}

function updateColour(val) {
  let el = $(`#arr-row-${val}`).children();

  //sets intial element colour to green
  el.css("background-color", "lime");

  //timer set to keep element green for 1sec
  setTimeout(() => {
    el.css("background-color", "");
  }, 1000);
}

function nextLevel() {
  //redirecting user to the next level
  window.location = "/merge_sort/2";
}
