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

function makeRowDiv(result, idx) {
  div = document.createElement("div");
  div.id = idx;
  div.className = "table_rows";

  header = document.createElement("H4");
  headerText = document.createTextNode(result["Variety Name"][idx]);
  header.appendChild(headerText);

  img = document.createElement("IMG");
  img.setAttribute("src",result["Image URL"][idx]);
  img.setAttribute("height","150");

  p = document.createElement("p");
  pText = document.createTextNode(
    result["Crop"][idx] + " | " + 
    result["Breeder/company"][idx] + " | " + 
    result["Breeder Affiliation"][idx] 
  );
  p.appendChild(pText);
  div.appendChild(header);
  if( result["Image URL"][idx] ){
    div.appendChild(img);
  }
  div.appendChild(p);

  return(div);
}

function appendTableRows(result) {
  //restructure JSON
  rows = simplifyResult(result);
  populateSelects(rows);
  table_rows = document.getElementById('table_rows');
 
  for( var i = 0; i < rows["Variety Name"].length; i++) {
    /*
    div = document.createElement("div");
    div.id = i;
    div.className = "table_rows";
    text = document.createTextNode(
      rows["Variety Name"][i] + "; " + 
      rows["Crop"][i] + "; " + 
      rows["Breeder/company"][i] + "; " + 
      rows["Breeder Affiliation"][i] 
    );
    div.appendChild(text);
    table_rows.appendChild(div);
    */

    table_rows.appendChild(makeRowDiv(rows, i));
  }
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
      }, function(reason) {
      console.log('Error: ' + reason.result.error.message);
      });
}
function makeRequest() {
  getTableData();
  getTableRows();
}
