$(document).ready(function(){

	$("#myTab a").click(function(e){
    	e.preventDefault();
    	$(this).tab('show');
    });

/*
	$('#dialog-form').dialog({
		autoOpen: false,
		title: 'Add component'
	});
	$('#opener').click(function() {
		$('#dialog-form').dialog('open');
});
*/
});


$(function() {
    var dialog, form, distributor_dialog, distributor_form, allFields;
 
    function updateTips( t ) {
      tips
        .text( t )
        .addClass( "ui-state-highlight" );
      setTimeout(function() {
        tips.removeClass( "ui-state-highlight", 1500 );
      }, 500 );
    }
 
    function checkLength( o, n, min, max ) {
      if ( o.val().length > max || o.val().length < min ) {
        o.addClass( "ui-state-error" );
        updateTips( "Length of " + n + " must be between " +
          min + " and " + max + "." );
        return false;
      } else {
        return true;
      }
    }
 
    function checkRegexp( o, regexp, n ) {
      if ( !( regexp.test( o.val() ) ) ) {
        o.addClass( "ui-state-error" );
        updateTips( n );
        return false;
      } else {
        return true;
      }
    }

// Populate the category dropdown
    $.ajax({
      url: '/components',
      method: 'GET',
      contentType: 'application/json',
      success: function(response){
        console.log(response);
        for (var i = 0; i < response.length; i++)
        {
          $('#component-table tr:last').after('<tr><td>' + response[i].component_name + '</td><td>' + response[i].category_name + '</td><td>' + response[i].storage_location + '</td><td></td><td>' + response[i].quantity + '</td><td>' + response[i].component_description + '</td></tr>');
        }
    }
  });


    // Populate the category dropdown
    $.ajax({
      url: '/categories',
      method: 'GET',
      contentType: 'application/json',
      success: function(response){
        console.log(response.multimap);
        $('#category').empty();
        var multimap = response.multimap;
        var parents = multimap[1];
        console.log(parents);
        //for (var i = 0 ; i < parents.length; i++)
        for (var id in parents) {
          var optgroup = $('<optgroup>');
          console.log('parents id: ' + parents[id].id + ' name: ' + parents[id].name);
          var parentId = parents[id].id;

          optgroup.attr('label', parents[id].name);
          optgroup.attr('value', parentId);

          //for (var j = 0; j < multimap[parentId].length; j++)
          for (var child in multimap[parentId])
          {
            var option = $('<option></option>');
            option.val(multimap[parentId][child].id);
            option.text(multimap[parentId][child].name);

            optgroup.append(option);
          }

          $('#category').append(optgroup);
        }
      }
    });

    // Populate the distributor dropdown
    $.ajax({
      url: '/add-distributor',
      method: 'GET',
      contentType: 'application/json',
      success: function(results) {
        var option;
        $('#distributor').html('');
        for (var i = 0; i < results.length; i++) {
          option += '<option value="' + results[i].id + '">' + results[i].name + '</option>';
        }
        $('#distributor').append(option);
      }
    });

    // Populate the manufacturer dropdown
    $.ajax({
      url: '/add-manufacturer',
      method: 'GET',
      contentType: 'application/json',
      success: function(results) {
        var option;
        $('#manufacturer').html('');
        for (var i = 0; i < results.length; i++) {
          option += '<option value="' + results[i].id + '">' + results[i].name + '</option>';
        }
        $('#manufacturer').append(option);
      }
    });

 
    function addComponent() {
      var valid = true;
      
      //TODO validate all fields
      //TODO add to database????
      //

      $('#add-component-form').validator('validate');

      console.log($('#category option:selected').attr('value'));

      if ( $('#componentName').closest('.form-group').hasClass('has-error') )
      {
        valid = false;
         $('#componentName').focus();
      }

      if ( valid ) {
        // call post url to save the new component to the database...
        // probably need to wait for conformation
        var component = {
          generalInformation: {
            componentName: $('#componentName').val(),
            category: $('#category option:selected').attr('value'),
            quantity: $('#quantity').val(),
            storageLocation: $('#storage-location').val(),
            description: $('#description').val(),
            comment: $('#comment').val()
          },
          technicalInformation: {
            width: $('#width').val(),
            height: $('#height').val(),
            depth: $('#depth').val(),
            weight: $('#weight').val(),
            pin: $('#pin').val(),
          },
          distributor: {
          },
          manufacturer: {
          },
          attachments: {
          }
        }
        var distributorData = [];
        $('#table-distributor-parts > tbody > tr').each(function() {
          var cols = {
            id: $(this).find('td:first-child').attr('value'),
            orderNo: $(this).find('td:nth-child(2)').text(),
            packageUnit: $(this).find('td:nth-child(3)').text(),
            packagePrice: $(this).find('td:nth-child(4)').text(),
            pricePerItem: $(this).find('td:nth-child(5)').text(),
            sku: $(this).find('td:nth-child(6)').text()
          };
          distributorData.push(cols);
        });
        component.distributor = distributorData;

        var manufacturerData = [];
        $('#table-manufacturer-parts > tbody > tr').each(function() {
          var cols = {
            id: $(this).find('td:first-child').attr('value'),
            partNumber: $(this).find('td:nth-child(2)').text()
          };
          manufacturerData.push(cols);
        });
        component.manufacturer = manufacturerData;

        console.log(component.manufacturer );

        attachmentsData = [];
        $('#table-attachments > tbody > tr').each(function() {
          var cols = {
            filename: $(this).find('td:first-child').text(),
            size: $(this).find('td:nth-child(2)').text(),
            description: $(this).find('td:nth-child(3)').text()
          };
          attachmentsData.push(cols);
        });
        component.attachments['item'] = attachmentsData;

        console.log(component);


        $.ajax({
          url: '/add-component',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(component),
          success: function(response){
            console.log(response);
            //alert(response);
          }
        });



        //TODO NEED TO ADD THE COMPONENT AND AFTER USE THE COMPONENT_ID TO INSERT THE DISTRIBUTOR PRODUCT
     //  var product = {
     //    distributor_id: $('#distributor').val(),
     //    order_no: $('#order-number').val(),
     //    package_unit: $('#packaging-unit').val(),
     //    package_price: $('#package-price').val(),
     //    price_per_unit: $('#price-per-item').val(),
     //    sku: $('#sku').val()
     //  };

     // $.ajax({
     //    url: '/add-distributor-product',
     //    method: 'POST',
     //    contentType: 'application/json',
     //    data: JSON.stringify(product),
     //    success: function(response){
     //      console.log(response);
     //      alert(response);
     //    }
     //  });



        dialog.dialog( "close" );
      }
      return valid;
    }
 
    dialog = $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 600,
      width: 850,
      modal: true,
      buttons: {
        "Add component": addComponent,
        Cancel: function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        form[ 0 ].reset();
        
      }
    });
 
    form = dialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addComponent();
    });
 
    $( "#add-component" ).button().on( "click", function() {
      dialog.dialog( "open" );
    });

    // Insert the new distributor product in table
    $( "#btn-add-distributor-part" ).button().on( "click", function() {    
      $('#table-distributor-parts > tbody:last-child').append('<tr><td value="' + $('#distributor').val() + '">' + $('#distributor option[value="' + $('#distributor').val() + '"]').text()  + '</td><td>' + $('#order-number').val()  + 
                                                              '</td><td>' + $('#packaging-unit').val() + '</td><td>' + $('#package-price').val() + 
                                                              '</td><td>' + $('#price-per-item').val() + '</td><td>' + $('#sku').val() + '</td></tr>');
    });

    // Use for distributor product row selection
    $('table tbody').on('click', 'tr', function() {
      $(this).toggleClass('row-selected');
      $(this).children().toggleClass('row-selected');
    });

    // Delete product from distributor table
    $("#btn-delete-distributor-part").button().on( 'click', function() {
      $('#table-distributor-parts .row-selected').remove();
    });

    function addDistributor() {
      var valid = true;

      //TODO validate all fields

      var distributor_name = $('#distributor-name').val();

      var distributorInfo = {
        name: distributor_name,
        webSite: $('#distributor-web-site').val()
      };

      if ( valid ) {

        $.ajax({
          url: '/add-distributor',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(distributorInfo),
          success: function(newDistributorId){
  
          $('#distributor').append($('<option/>', {
              value: newDistributorId,
              text: distributor_name
          }));

          $('#distributor option[value=' + newDistributorId + ']').attr('selected', 'selected');
          
          distributor_dialog.dialog( "close" );
          }
        });

      }
      return valid;
    }

    distributor_dialog = $( "#distributor-dialog-form").dialog({
      autoOpen: false,
      height: 300,
      width: 425,
      modal: true,
      buttons: {
        "Add Distributor": addDistributor,
        Cancel: function() {
          distributor_dialog.dialog( "close" );
        }
      },
      close: function() {
        distributor_form[ 0 ].reset();
      }
    });

    distributor_form = dialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addDistributor();
    });

    $( "#btn-new-distributor" ).button().on( "click", function() {
      $('#distributor-name').val("");
      $('#distributor-web-site').val("");
      distributor_dialog.dialog( "open" );
    });



    // Insert the new manufacturer product in table
    $( "#btn-add-manufacturer-part" ).button().on( "click", function() {  
      $('#table-manufacturer-parts > tbody:last-child').append('<tr><td value="' + $('#manufacturer').val() + '">' + $('#manufacturer option[value="' + $('#manufacturer').val() + '"]').text()  + 
                                                              '</td><td>' + $('#part-number').val()) + '</td></tr>';
    });

    // Use for distributor product row selection
    // $('table tbody').on('click', 'tr', function() {
    //   $(this).toggleClass('row-selected');
    //   $(this).children().toggleClass('row-selected');
    // });

    // Delete product from distributor table
    $("#btn-delete-manufacturer-part").button().on( 'click', function() {
      $('#table-manufacturer-parts .row-selected').remove();
    });

    function addManufacturer() {
      var valid = true;

      //TODO validate all fields

      var manufacturer_name = $('#manufacturer-name').val();

      var manufacturerInfo = {
        name: manufacturer_name,
        webSite: $('#manufacturer-web-site').val()
      };

      if ( valid ) {

        $.ajax({
          url: '/add-manufacturer',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(manufacturerInfo),
          success: function(newManufacturerId){

          $('#manufacturer').append($('<option/>', {
              value: newManufacturerId,
              text: manufacturer_name
          }));

          $('#manufacturer option[value=' + newManufacturerId + ']').attr('selected', 'selected');

          manufacturer_dialog.dialog( "close" );

          }
        });

      }
      return valid;
    }

    manufacturer_dialog = $( "#manufacturer-dialog-form").dialog({
      autoOpen: false,
      height: 300,
      width: 425,
      modal: true,
      buttons: {
        "Add Manufacturer": addManufacturer,
        Cancel: function() {
          manufacturer_dialog.dialog( "close" );
        }
      },
      close: function() {
        manufacturer_form[ 0 ].reset();
      }
    });

    manufacturer_form = dialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addManufacturer();
    });

    $( "#btn-new-manufacturer" ).button().on( "click", function() {
      $('#manufacturer-name').val("");
      $('#manufacturer-web-site').val("");
      manufacturer_dialog.dialog( "open" );
    });

  });