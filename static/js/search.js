function displayResults(results, index, store) {
  const searchResults = document.getElementById("results");
  console.log(results);
  if (results.length) {
    let resultList = "";
    // Iterate and build result list elements
    for (var n = 0; n <= results.length - 1; n++) {
      console.log(n);
      console.log(results[n]);
      idxObject = index.find((e) => e.uri === results[n].ref);
      store.setItem(results[n].ref, "");
      resultList +=
        '<li><p><a href="' +
        results[n].ref +
        '">' +
        idxObject.title +
        "</a></p>";
      resultList +=
        "<p>" +
        (idxObject.content.length > 30
          ? idxObject.content.slice(0, 30) + "...</p></li>"
          : idxObject.content + "</p></li>");
    }
    searchResults.innerHTML = resultList;
  } else {
    searchResults.innerHTML = "No results found.";
  }
}

// Get the query parameter(s)
const params = new URLSearchParams(window.location.search);
const query = params.get("query");

// Perform a search if there is a query
if (query) {
  // Retain the search input in the form when displaying results
  document.getElementById("search-input").setAttribute("value", query);
  var request = new XMLHttpRequest();
  request.open("GET", "/searchData.json", true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      pagesIndex = JSON.parse(request.responseText);
      console.log("index:", pagesIndex);

      // Set up lunrjs by declaring the fields we use
      // Also provide their boost level for the ranking
      const lunrIndex = lunr(function () {
        this.field("title", {
          boost: 10,
        });
        this.field("tags", {
          boost: 5,
        });
        this.field("content");

        // ref is the result item identifier (I chose the page URL)
        this.ref("uri");
        this.add({ field: "test", text: "hello" });
        for (var i = 0; i < pagesIndex.length; ++i) {
          this.add(pagesIndex[i]);
        } // Perform the search
      });
      const results = lunrIndex.search(query);
      // Update the list with results
      displayResults(results, pagesIndex, window.localStorage);
      // Feed lunr with each file and let lunr actually index them
    } else {
      var err = textStatus + ", " + error;
      console.error("Error getting Hugo index flie:", err);
    }
  };

  request.send();
}
