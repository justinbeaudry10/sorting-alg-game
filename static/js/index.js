// reduce global variables after fin
let splitOrder = [];
let splitTree;
let mergeOrder = [];
let curStep = 0;
const boxSize = 45; // size of a single box within a display array (px)

function getRandArr() {
  //used after start btn once
  $(".start-btn").remove();

  let data = {};

  let xReq = new XMLHttpRequest();
  //xReq.onreadystatechange = displayNewRow;
  xReq.onreadystatechange = sorter;

  xReq.open("POST", window.location.pathname + "/get_arr", true);
  xReq.setRequestHeader("data", JSON.stringify(data));
  xReq.send();
}

function sorter() {
  if (this.readyState == 4 && this.status == 200) {
    let origArr = JSON.parse(this.responseText).arr; // Gets the original array of random numbers

    maxDepth = Math.ceil(Math.log(origArr.length) / Math.log(2)); // Finds the max depth of the tree

    fillGameBoard(origArr, maxDepth);

    // Creates tree for the splitting steps
    splitTree = new BinaryTree(0, [...origArr]);
    // Gets the final merged result
    mergeSort(splitTree, [...origArr], 0, 0, getEmptyArr(maxDepth)); //CHANGE TO SOMETHING ABOUT POPULATING TREE

    // Order of steps
    splitOrder = [...splitTree.preOrderTraversal()].map((n) => n.key);

    // Creates tree for the merging steps
    mergeOrder = [...splitTree.postOrderTraversal()].map((n) => n.key);

    console.log(splitOrder);
    console.log(mergeOrder);
  }
}

function fillGameBoard(startArray, maxDepth) {
  let rowSize = startArray.length * boxSize;

  let dom =
    `<div class="arr-holder" id="dom-hold" style="order: 0"><div class="arr-row" id="arr-row-0-a">` +
    formatRow(startArray, "0") +
    `</div></div>`;
  let sub = `<div class="arr-holder" id="sub-hold" style="order: ${
    maxDepth * 3
  }"><div class="arr-row" id="arr-row-0-b"></div></div>`;
  let split = ``;
  let sort = ``;
  for (i = 1; i < maxDepth + 1; i++) {
    rowSize = Math.ceil(startArray.length / (i * 2)) * boxSize;
    split += `<div class="arr-holder" id="arr-holder-${i}-a" style="order: ${i}">`;
    sort += `<div class="arr-holder" id="arr-holder-${i}-b" style="order: ${
      maxDepth * 2 - i
    }">`;

    if (i < maxDepth) {
      for (j = 0; j < Math.pow(2, i); j++) {
        split += `<div class="arr-row" id="arr-row-${i}-${j}-a" style="width: ${rowSize}px;"></div>`;
        sort += `<div class="arr-row" id="arr-row-${i}-${j}-b" style="width: ${rowSize}px"></div>`;
      }

      split += `</div>`;
      sort += `</div>`;
    } else {
      split += `<div class="arr-row" id="arr-row-${maxDepth}-0-a" style="width: ${rowSize}px"></div>`;
      split += `<div class="arr-row" id="arr-row-${maxDepth}-1-a" style="width: ${rowSize}px"></div>`;

      sort += `<div class="arr-row" id="arr-row-${maxDepth}-0-b" style="width: ${rowSize}px"></div>`;
      sort += `<div class="arr-row" id="arr-row-${maxDepth}-1-b" style="width: ${rowSize}px"></div>`;

      for (j = 2; j < Math.pow(2, i - 1); j++) {
        split += `<div class="arr-row" style="width: ${rowSize}px"></div>`;
        sort += `<div class="arr-row" style="width: ${rowSize}px"></div>`;
      }
      split += `<div class="arr-row" id="arr-row-${maxDepth}-2-a" style="width: ${rowSize}px"></div>`;
      split += `<div class="arr-row" id="arr-row-${maxDepth}-3-a" style="width: ${rowSize}px"></div>`;

      sort += `<div class="arr-row" id="arr-row-${maxDepth}-2-b" style="width: ${rowSize}px"></div>`;
      sort += `<div class="arr-row" id="arr-row-${maxDepth}-3-b" style="width: ${rowSize}px"></div>`;

      for (j = 2; j < Math.pow(2, i - 1); j++) {
        split += `<div class="arr-row" style="width: ${rowSize}px"></div>`;
        sort += `<div class="arr-row" style="width: ${rowSize}px"></div>`;
      }

      split += `</div>`;
      sort += `</div>`;
    }
  }

  $("#gameboard").append(dom + split + sort + sub); // Append markup to the end of the gameboard
}

// Merge sort algorithm
function mergeSort(tree, arr, parentKey, depth, keys) {
  // Gets the length of half the array (rounding up)
  const half = Math.ceil(arr.length / 2);

  // Base case
  if (arr.length < 2) return arr;

  // Left side of the array, right side will be stored in "arr" since splice removes these values from original arr
  const left = arr.splice(0, half);

  // Sets the key for the left side of the array, and inserts it into the tree
  const leftKey = (depth + 1).toString() + `-` + keys[depth].length;
  tree.insert(parentKey, leftKey, [...left]);

  let curKey = keys[depth].length;
  keys[depth].push(curKey);

  // Sets the key for the right side of the array, and inserts it into the tree
  const rightKey = (depth + 1).toString() + `-` + keys[depth].length;
  tree.insert(parentKey, rightKey, [...arr]);

  curKey = keys[depth].length;
  keys[depth].push(curKey);

  return merge(
    mergeSort(tree, left, leftKey, depth + 1, keys),
    mergeSort(tree, arr, rightKey, depth + 1, keys),
    depth
  );
}
// Merge two arrays
function merge(left, right, depth) {
  let arr = [];

  // Break if any of the arrays are empty
  while (left.length && right.length) {
    // Pushes the lowest of the two values (first value from each array)
    if (left[0] < right[0]) arr.push(left.shift());
    else arr.push(right.shift());
  }

  // Concatenating leftover elements
  return [...arr, ...left, ...right];
}

// dont need to sdn stuff as post due to cookies
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
    //If Current Node is the root
    if (curNode.key === 0) {
      $("#msg").text("Algorithm Complete!"); // Updates Message div to say "Algorithm Complete"
    }
    //Updating msg div to notify the merge
    else {
      $("#msg").text(
        "[Merging] @ Tree Row: " +
          (Number(curNode.key.slice(0, 1)) + 1) +
          ", Tree Node: " +
          (Number(curNode.key.slice(2, 3)) + 1)
      );
    }
    if (curNode.value.length <= 1) {
      return getNextRow();
    }
  }
  //Using splitOrder
  else if (curStep < splitOrder.length) {
    curNode = splitTree.find(splitOrder[curStep]);
    val = curNode.value;

    //Updating msg div to notify user a split is occurring
    $("#msg").text(
      "[Splitting] @ Tree Row: " +
        (Number(curNode.key.slice(0, 1)) + 1) +
        ", Tree Node: " +
        (Number(curNode.key.slice(2, 3)) + 1)
    );
  } else {
    console.log("Error. Algorithm complete, no more steps");
    return;
  }

  $(`#arr-row-${curNode.key}-a`).html(formatRow(val, curNode.key));
  $("#next-btn").blur();

  //changes the colour when the "next button" is pressed
  $("#next-btn").on("click", updateColour(curNode.key));

  console.log(
    splitTree.find(curNode.parent.key).left.key == curNode.key
      ? "left"
      : "right"
  );

  if (splitTree.find(curNode.parent.key).left.key != curNode.key) {
    document.documentElement.style.setProperty(
      "--animation-translatex",
      "-50%"
    );
  } else {
    document.documentElement.style.setProperty("--animation-translatex", "50%");
  }

  $(`#arr-row-${curNode.key}-a`).html(formatRow(val, curNode.key));
  $("#next-btn").blur();
}

function updateColour(val) {
  //sets intial element colour to green
  $(`#arr-row-${val}-a`).css("background-color", "lime");
  //timer set to keep element green for 1sec
  setTimeout(function () {
    revertColour(val);
  }, 1000);
}

function revertColour(val) {
  //removes green background
  $(`#arr-row-${val}-a`).css("background-color", "");
}

function getPrevRow() {
  let curNode, val;

  if (curStep == 0) {
    return;
  }

  //Using mergeOrder
  if (
    curStep >= splitOrder.length &&
    curStep < splitOrder.length + mergeOrder.length
  ) {
    curNode = splitTree.find(mergeOrder[curStep - mergeOrder.length]);
    val = formatRow(curNode.value, curNode.key);

    //If Current Node is the root
    if (curNode.key === 0) {
      $("#msg").text("Algorithm Complete!"); // Updates Message div to say "Algorithm Complete"
    }
    //Updating msg div to notify the merge
    else {
      $("#msg").text(
        "[Merging] @ Tree Row: " +
          (Number(curNode.key.slice(0, 1)) + 1) +
          ", Tree Node: " +
          (Number(curNode.key.slice(2, 3)) + 1)
      );
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
    //Updating msg div to notify user a split is occurring
    $("#msg").text(
      "[Splitting] @ Tree Row: " +
        (Number(curNode.key.slice(0, 1)) + 1) +
        ", Tree Node: " +
        (Number(curNode.key.slice(2, 3)) + 1)
    );
  } else {
    console.log("Error. Algorithm complete, no more steps");
    return;
  }

  $(`#arr-row-${curNode.key}-a`).html(val);
  curStep--;
  $("#prev-btn").blur();
}

// Formats the displayed rows accordingly (move from index but put in game index)
function formatRow(arr, key) {
  let n;
  let html = ``;

  if (arr.length == 1) {
    html += `<div class="arr arr-single" id="arr-box-${key}-${0}"exp-val=${
      arr[0]
    }><div class="num-slot">${arr[0]}</div></div>`;
  } else {
    for (var i = 0; i < arr.length; i++) {
      n = arr[i];
      if (i == 0) {
        html += `<div class="arr arr-start" id="arr-box-${key}-${i}"exp-val=${n}><div class="num-slot">${n}</div></div>`;
      } else if (i + 1 == arr.length) {
        html += `<div class="arr arr-end" id="arr-box-${key}-${i}" exp-val=${n}><div class="num-slot">${n}</div></div>`;
      } else {
        html += `<div class="arr" id="arr-box-${key}-${i}" exp-val=${n}><div class="num-slot">${n}</div></div>`;
      }
    }
  }

  return html;
}

function getEmptyArr(size) {
  let arr = [];
  for (i = 0; i < size; i++) {
    arr.push([]);
  }
  return arr;
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
