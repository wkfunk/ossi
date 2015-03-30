function makeRequest() {
  getTableData();
  getTableRows();
}
function getTableData() {
  var request = gapi.client.fusiontables.table.get({
      'tableId': '1W7qnYSp1PfrnkykTDCwVfTrRn6tukszsrrEhmHY0'
      });
  request.then(function(response) {
      //hide the loading div
      $("#load").hide();
      //then add the data
      appendTableData(response.result);
      }, function(reason) {
      console.log('Error: ' + reason.result.error.message);
      });
}
//note: we can also do this with jquery:
//a = $.post("https://www.googleapis.com/fusiontables/v2/query?sql=SELECT+*+from+1NHYKF3S8G93SZKSyrQyQypMvd6UMPe7XMJSVaHO8&key=AIzaSyA1ZuuXEKbCNmFHb_Tue3Md0S0EZEz5_iM");
// or:
//b = $.get("https://www.googleapis.com/fusiontables/v2/query?sql=SELECT+*+from+1W7qnYSp1PfrnkykTDCwVfTrRn6tukszsrrEhmHY0&key=AIzaSyA1ZuuXEKbCNmFHb_Tue3Md0S0EZEz5_iM");
function getTableRows() {
  var request = gapi.client.fusiontables.query.sql({
      'sql': 'SELECT * FROM 1W7qnYSp1PfrnkykTDCwVfTrRn6tukszsrrEhmHY0'
      });
  request.then(function(response) {
      appendTableRows(response.result);
      startIsotope();
      }, function(reason) {
      console.log('Error: ' + reason.result.error.message);
      });
}
//iso init code
function startIsotope() {
    var qsRegex;
    // init Isotope
    var $container = $('.isotope').isotope({
itemSelector: '.element-item',
    layoutMode: 'packery',
    columnWidth: 300,
    filter: function() {
      return qsRegex ? $(this).text().match( qsRegex ) : true;
    }
  });

  // use value of search field to filter
  var $quicksearch = $('#quicksearch').keyup( debounce( function() {
    qsRegex = new RegExp( $quicksearch.val(), 'gi' );
    $container.isotope();
  }, 200 ) );


  // store filter for each group
  var filters = {};

  $('#filters').on( 'click', '.button', function() {
    var $this = $(this);
    // get group key
    var $buttonGroup = $this.parents('.button-group');
    var filterGroup = $buttonGroup.attr('data-filter-group');
    // set filter for group
    filters[ filterGroup ] = $this.attr('data-filter');
    // combine filters
    var filterValue = '';
    for ( var prop in filters ) {
      filterValue += filters[ prop ];
    }
    // set filter for Isotope
    $container.isotope({ filter: filterValue });
    //clear search
    $("#quicksearch").val("");
  });

  // change is-checked class on buttons
  $('.button-group').each( function( i, buttonGroup ) {
    var $buttonGroup = $( buttonGroup );
    $buttonGroup.on( 'click', 'button', function() {
      $buttonGroup.find('.is-checked').removeClass('is-checked');
      $( this ).addClass('is-checked');
    });
  });

  $container.isotope('bindResize');

  
};

// debounce so filtering doesn't happen every millisecond
function debounce( fn, threshold ) {
  var timeout;
  return function debounced() {
    if ( timeout ) {
      clearTimeout( timeout );
    }
    function delayed() {
      fn();
      timeout = null;
    }
    timeout = setTimeout( delayed, threshold || 100 );
  }
}



function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

function addOptionToSelect(select,optionText){
  opt = document.createElement("option");
  opt.value = optionText;
  optText = document.createTextNode(optionText);
  opt.appendChild(optText);
  select.appendChild(opt)
}

function addSelectToForm(form, selectArr, i, selectText) {
  uniqArr = selectArr.filter(onlyUnique);  

  div = document.createElement("div");
  div.className = "form-group";

  label = document.createElement("label");
  label.setAttribute("for",i);
  labelText = document.createTextNode(selectText);
  label.appendChild(labelText);

  div.appendChild(label);
  
  select = document.createElement("select");
  select.id = i;
  select.className = "form-control selectwidthauto";
  select.setAttribute("name",selectText);
  
  addOptionToSelect(select,"");
  for(var j = 0; j < uniqArr.length; j++) {
    addOptionToSelect(select,uniqArr[j]);
  }

  div.appendChild(select);
  form.appendChild(div);
}

function appendTableData(result) {
  var table_data = document.getElementById('table_data');
  header = document.createElement('H3');
  header.appendChild(
      document.createTextNode(result.name)
      );
  table_data.appendChild(header);
}

function indicesNotOf(arr, toFind) {
  var indices = [];
  for(var idx = 0; idx< arr.length; idx++) {
    if (arr[idx] !== toFind) {
      indices.push(idx);
    }
  }
  return(indices);
}

function indicesOf(arr,toFind) {
  var indices = [];
  var idx = arr.indexOf(toFind);
  while (idx != -1) {
      indices.push(idx);
      idx = arr.indexOf(toFind, idx + 1);
  }
  return(indices);
}

function simplifyResult(result) {
  var res = {};
  for (var i = 0; i < result.columns.length; i++) {
    res[result.columns[i]] = [];
    for (var j = 0; j < result.rows.length; j++) {
      res[result.columns[i]][j] = result.rows[j][i];
    }
  }
  return(res);
}

//return an array of <div> id's that should be shown
function refreshFilters() {
  //<select> names
  selects = $("option:selected").parent().map(function() { return this.name; } );
  //<option>s which are selected
  selected = $("option:selected").map(function() { return this.value; });

  //this is the containing div
  $("#table_rows").hide();
  $("#load").show();
  //these are the seed divs
  $(".table_rows").show();

  for(var i = 0; i < selects.length; i++) {
    if( selected[i] != "" ){
      toHide = indicesNotOf(rows[selects[i]], selected[i]);
      for( var j = 0; j < toHide.length; j++) {
        $('div[id="' + toHide[j] + '"]').hide();
      }
    }
  }

  $("#load").hide();
  $("#table_rows").show();
  
}

function populateSelects(rows) {
  selects = [
    "Breeder Affiliation",
    "Breeder/company",
    "Crop"
  ];

  form = document.getElementById('selectors');

  for( var i = 0; i < selects.length; i++) {
    addSelectToForm(form,rows[selects[i]],i, selects[i]);
  }

  //bind select change to refresh
  $("select").change(refreshFilters);
}

function createP(className, text) {
  p = document.createElement("p");
  p.className=className;
  pText = document.createTextNode(text);
  p.appendChild(pText);
  return(p);
}

function escapeClassName(className) {
  className = className.replace(/ /g, "_");
  return( className.replace(/,/g, "_") );
}

function makeRowDiv(result, idx) {
  //init vals
  variety = result["Variety Name"][idx];
  imgURL = result["Image URL"][idx];
  crop = result["Crop"][idx];
  breedAff = result["Breeder Affiliation"][idx];
  breedComp  = result["Breeder/company"][idx];

  div = document.createElement("div");
  //div.id = idx;
  div.className = "element-item";

  header = document.createElement("H4");
  header.className="Variety_Name";
  headerText = document.createTextNode(variety);
  header.appendChild(headerText);

  img = document.createElement("IMG");
  img.className="Image_URL";
  img.setAttribute("src",imgURL);
  img.setAttribute("height","150");

  p1 = createP("Crop",crop);
  p2 = createP("Breeder/company",breedComp);
  p3 = createP("Breeder Affiliation",breedAff);

  div.appendChild(header);
  if( imgURL ){
    div.appendChild(img);
  }
  div.appendChild(p1);
  div.appendChild(p2);
  div.appendChild(p3);

  div.classList.add(
      escapeClassName(crop),
      escapeClassName(breedComp),
      escapeClassName(breedAff )
      );


  return(div);
}

function appendTableRows(result) {
  //restructure JSON
  rows = simplifyResult(result);
  //populateSelects(rows);
  table_rows = document.getElementById('table_rows');
 
  for( var i = 0; i < rows["Variety Name"].length; i++) {
    table_rows.appendChild(makeRowDiv(rows, i));
  }
}

