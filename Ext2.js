
/// Before Loader
{
    // Ext.container
    Ext.require('Ext.container.Viewport');
    // Ext.grid
    Ext.require('Ext.grid.plugin.RowEditing');
    Ext.require('Ext.grid.Panel');
    Ext.require('Ext.grid.column.RowNumberer');
    // Ext.form
    Ext.require('Ext.form.field.ComboBox');
    Ext.require('Ext.form.FieldSet');
    // Ext.layout
    Ext.require('Ext.layout.container.*');
    // Ext.tab
    Ext.require('Ext.tab.Panel');
    // Ext.app
    Ext.require('Ext.app.ViewController');
    // Ext.widget
    Ext.require('Ext.menu.ColorPicker');
    // Ext.data
    Ext.require('Ext.data.Store');
}



Ext.onReady(function(){

    /// Setting Panels, Grids and Other...

    //Set Main Tab Panel, Elements, Viewports and other...

    Ext.define('Eureka.Mapping.grid.editing',{//create('Ext.grid.plugin.RowEditing', {
	extend: 'Ext.grid.plugin.RowEditing',
	clicksToEdit: 1,
	autoCancel: false,
	errorSummary: true
    });

        // Organisms Data's Store, Proxy and Grids
    
    Ext.define('Organism_list', {
	extend: 'Ext.data.Model',
	fields:['domain', 'name', 'kingdom', 'Subhylum', 'id'],
	proxy: {
	    type: 'memory'
	}
    });

    var Organisms_Store = Ext.create('Ext.data.Store', {
	model: 'Organism_list',
	autoLoad: true,
	proxy: {
	    type: 'ajax',
	    url: '../Pathway_Projector_ver2/Data/Info/Other/Org_Data.json',
	    readoer: {
		type: 'json'
	    }
	}
    });


    var Organisms_Grid = Ext.create('Ext.grid.Panel', {

	/*columnLines: true,
	viewConfig: {
	    markDirty: false
	},
	autoWidth: true,
	height: 310,
	 */
	height: 480,
	xtype: 'grid',
	//stripeRows: true,
	columnLines: true,

	store: Organisms_Store,

	columns: [
	    {text: 'Name', flex:1, dataIndex:'name', sortable: true},
	    {text: 'Domain', flex: 1, dataIndex: 'domain', sortable: true},
	    {text: 'Kingdom', dataIndex: 'kingdom', sortable: true},
	    {text: 'Subphylum', dataIndex: 'Subphylum', sortable: true}
	],

//	viewConfig: {
//	    forceFit: true
//	},
	autoWidth: true

    });
    //.
    
    
    var CenterPanel = Ext.create('Ext.tab.Panel', {
	region: 'center',
	xtype: 'tabpanel',
	//layoutOnTabChange: true,
	
	items: [{
	    title: 'Reference',
	    html: '<div id="map-canvas"></div>'
	    
	},{
	    title: 'Organism Selection',
	    items: Organisms_Grid
	}]
	
    });

    var NorthPanel = Ext.create('Ext.panel.Panel', {
	region:'north',
	xtype: 'panel',
	bodyStyle: 'background-color:#1b3450;color: gray;',
	height: 40,
	border: false,
	autoHeight: true,
	id: 'north-region-container',
	html: '<div id="hoge" style="float:left;font-size:9px;color:white;"><h1 class="x-panel-header">&nbspPathway&nbspProjector&nbspver&nbsp2</h1></div><div style="position:fixed;top:11px;right:120px"><form id="formid"  onSubmit="Query_Search();return false;"><input type="search" name="query" id="query" placeholder="Search" results="10" size="40" /></form></div>'
    });

    var EastPanel = Ext.create('Ext.panel.Panel', {
	id: 'east-region-container',
	region: 'east',
	title: 'Search Result',
	collapsed: true,
	collapsible: true,
	split: true,
	width: 250,
	layout: 'fit'
    });

    var SouthPanel = Ext.create('Ext.panel.Panel', {
	region: 'south',
	xtype: 'south',
	html: '&nbsp&nbspWelcome to Pathway Projector ver2.0, produced by G-language Project.<br>',
	collapsed: true,
	collapsible: true,
	height: 70,
	minHeight: 10
    });

    Ext.define('Eureka.Viewport', {
	extend: 'Ext.container.Viewport',
	layout: 'border',
	items: [CenterPanel, NorthPanel, EastPanel, SouthPanel],
	renderTo: Ext.getBody()
    });

    //.


    
    
    // Mapping Data's Store, Proxy and Grids
    //Grids ->  (Graph Mapping, Indensity Mapping, Label Mapping)
    
    Ext.define('Mapping_Data', {
	extend: 'Ext.data.Model',
	fields: ['name', 'type', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 'l_color', 'org', 'l_color_size', 'txt', 'txt_size', 'i_color'],
	proxy: {
	    type: 'memory'
	    //LocalStrage ウィンドウ閉じても保存される
	    //SessionStrage そのタブが閉じれば、終わる
	}
    });

    //test
    Ext.define('Eureka.Create.data.Store', {
	extend: 'Ext.data.Store',
	fields: ['year'],
	data: (function(){
	    var data = [];
	    //data.push({});
	    
	    
	    return data;
	})()
    });

    //
    
    var Mapping_Data = Ext.create('Ext.data.Store', {
	autoDestroy: true,
	model:'Mapping_Data',
	data: [
	    { name: 'K03043', type: 'Bar', t1: '10', t2: '49', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '10', 'txt': 'hoge', txt_size: '10', i_color: '' },
	    { name: 'K03046', type: 'Bar', t1: '100',t2: '50', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '70', 'txt': 'hoge1', txt_size: '11', i_color: '' },
	    { name: 'K03040', type: 'Bar', t1: '44', t2: '30', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '80', 'txt': 'hoge1', txt_size: '12', i_color: '' },
	    { name: 'K03060', type: 'Bar', t1: '60', t2: '10',  t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '65', 'txt': 'hogehoge', txt_size: '13', i_color: '' },
	    { name: 'K03017', type: 'Bar', t1: '60', t2: '45', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '66', 'txt': 'perl', txt_size: '10', i_color: '' },
	    { name: 'K03048', type: 'Bar', t1: '60', t2: '10', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '66', 'txt': 'hoge', txt_size: '9', i_color: '' },
	    { name: 'K03011', type: 'Bar', t1: '60', t2: '34', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '66', 'txt': 'per', txt_size: '9.5', i_color: '' },
	    { name: 'C00122', type: 'Bar', t1: '60', t2: '40', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '66', 'txt': 'pf', txt_size: '9', i_color: '' },
	    { name: 'K03014', type: 'Bar', t1: '60', t2: '68', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '66', 'txt': 'fhfh', txt_size: '10', i_color: '' },
	    { name: 'K03000', type: 'Bar', t1: '60', t2: '48', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '66', 'txt': 'fhfh', txt_size: '10', i_color: '' },
	    { name: '', type: 'Bar', t1: '60', t2: '23', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '66', 'txt': 'fhfh', txt_size: '10', i_color: '' },
	    { name: '', type: 'Bar', t1: '60', t2: '86', t3: '10', t4: '49', t5: '10', t6: '49', t7: '10', t8: '49',  t9: '10', t10: '49', l_color:'blue', l_color_size: '66', 'txt': 'fhfh', txt_size: '10', i_color: '' }
	]
    });
    
    var mappingGraph_combo = Ext.create('Ext.form.field.ComboBox', {
	allowBlank: true,
	emptyText: "select",
	editable: false,
	triggerAction: 'all',

	store: [
	    ['Bar','Bar'],
	    ['Line', 'Line'],
	]
	
    });
    
    var mappingGraph_grid =  Ext.create('Ext.grid.Panel',{
	xtype: 'grouped-header-grid',
	store: Mapping_Data,
	columnLines: true,
	viewConfig: {
	    markDirty: false
	},
	autoWidth: true,
	height: 310,

	columns: [
	    {xtype: 'rownumberer'},
	    {
		text: 'ID',
		width: 60,
		sortable: false,
		hideable: false,
		dataIndex: 'name',
		editor:{
		    xtype: 'textfield',
		    allowBlank: true
		}
		
	    },
	    {
		text: 'Type',
		width: 71,
		dataIndex: 'type',
		editor: mappingGraph_combo
		
	    },
	    {
		text: 'Frequency',
		columns: [
		    {
			text: '1',

			sortable: false,
			dataIndex: 't1',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '2',

			sortable: false,
			dataIndex: 't2',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '3',

			sortable: false,
			dataIndex: 't3',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '4',

			sortable: false,
			dataIndex: 't4',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '5',

			sortable: false,
			dataIndex: 't5',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '6',

			sortable: false,
			dataIndex: 't6',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '7',

			sortable: false,
			dataIndex: 't7',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '8',

			sortable: false,
			dataIndex: 't8',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '9',

			sortable: false,
			dataIndex: 't9',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    },{
			text: '10',

			sortable: false,
			dataIndex: 't10',
			width: 57,
			editor:{
			    xtype: 'numberfield',
			    allowBlank: true,
			    minValue: 0,
			    maxValue: 100
			}
		    }]
	    }
	],
	/* Row Editing Mode */
	selModel:{
	    selType: 'rowmodel'
	},

	plugins: [ Ext.create('Eureka.Mapping.grid.editing')]
    });

    var mappingIndensity_grid =  Ext.create('Ext.grid.Panel',{
	xtype: 'grouped-header-grid',
	store: Mapping_Data,
	columnLines: true,
	viewConfig: {
	    markDirty: false
	},
	width: 190,
//	autoWidth: true,
	height: 310,

	columns: [
	    {xtype: 'rownumberer'},
	    {
		text: 'ID',
		width: 70,
		sortable: false,
		hideable: false,
		dataIndex: 'name',
		editor:{
		    xtype: 'textfield',
		    allowBlank: true
		}
		
	    },
	    {
		text: 'Color',
		width: 75,
		sortable: false,
		hideable: false,
		dataIndex: 'i_color',
		editor: {
		    xtype: 'textfield',
		    allowBlank: true
		}

	    }
	    
	],
	/* Row Editing Mode */
	selModel:{
	    selType: 'rowmodel'
	},
	plugins: Ext.create('Eureka.Mapping.grid.editing')

    });

    var mappingLabel_grid =  Ext.create('Ext.grid.Panel',{
	xtype: 'grouped-header-grid',
	store: Mapping_Data,
	width: 413,
	columnLines: true,
	viewConfig: {
	    markDirty: false
	},

	//width: 372,
	autoWidth: true,
	height: 310,

	columns: [
	    {xtype: 'rownumberer'},
	    {
		text: 'ID',
		width: 70,
		sortable: false,
		hideable: false,
		dataIndex: 'name',
		editor:{
		    xtype: 'textfield',
		    allowBlank: true
		}
		
	    },{
		text: 'Color',
		columns: [{
		    text: 'Fill',
		    sortable: false,
		    width: 80,
		    dataIndex: 'l_color',
		    editor: {
			xtype: 'textfield',
			allowBlank: true
		    }
		},{
		    text: 'Size',
		    width: 61,
		    sortable: false,
		    hideable: false,
		    dataIndex: 'l_color_size',
		    editor: {
			xtype: 'numberfield',
			allowBlank: false,
			minValue: 0,
			maxValue: 100
		    }
		}]

	    },{
		text: 'Label',
		columns: [{
		    text: 'Text',
		    width: 100,
		    sortable: false,
		    hideable: false,
		    dataIndex: 'txt',
		    editor: {
			xtype: 'textfield',
			allowBlank: false
		    }
		},{
		    text: 'Size',
		    width: 61,
		    sortable: false,
		    hideable: false,
		    dataIndex: 'txt_size',
		    editor: {
			xtype: 'numberfield',
			allowBlank: false,
			minValue: 5,
			maxValue: 20
		    }
		}]
	    }],

	/* Row Editing Mode */
	selModel:{
	    selType: 'rowmodel'
	},
	
	plugins: Ext.create('Eureka.Mapping.grid.editing')
    });                      

    //.
    
        
    // ViewController for Mapping Window
    
    Ext.define('Eureka.Mapping.view.tab.TabController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.tab-view',

	onTabChange: function(tabs, newTab, oldTab){

	    Ext.suspendLayouts();
	    //newTab.setTitle('Active Tab');
	    //oldTab.setTitle('Inactive Tab');
	    Ext.resumeLayouts(true);
	    
	}
    });
    //.
    
    /*
     var mappingGraph_form =  Ext.create('Ext.form.FormPanel',{
     bodyStyle:{"background-color":"#f4f4f4"},
     //				    defaultType: 'textfield',
     items: [{
     //					allowBlank: false,
     fieldLabel: 'User ID',
     
     items: mappingGraph_grid
     //					name: 'user',
     //					emptyText: 'user id'
	}, {
     allowBlank: false,
     fieldLabel: 'Password',
     xtype: 'textfield',
	    name: 'pass',
     emptyText: 'password',
     inputType: 'password'
     }, {
     xtype:'checkbox',
     fieldLabel: 'Remember me',
     name: 'remember'
     }]
     });
     */

    
    // Mapping Button -(click)> Show Mapping Window 

    var win,
	button = Ext.get('sample_button');    
    Ext.define('Eureka.Button', { 
	extend: 'Ext.Button',
	text: 'Tools',
	scale: 'medium',
	renderTo: 'sample_button',

	// Show Mapping Window
	handler: function(){
	    if(!win) {
		win = Ext.create('widget.window', {
		    title: 'Pathway Mapping',
		    header: {
			titlePosition: 2,
			titleAlign: 'center'
		    },

		    closable: true,
		    modal: true,
		    closeAction: 'hide',
		    //maximizable: true,
		    animateTarget: button,
		    width: 750,
		    height: 550,
		    autoHeight: true,
		    tools: [{type: 'pin'}],
		    layout: 'fit',
		    controler: 'tab-view',		    
		    defaults: {
			autoScroll: true,
			border: 0
		    },

		    items: [{
			xtype: 'tabpanel',
			defaults: {autoWidth: true, autoHeight: true, bodyStyle:{"background-color":"#f4f4f4"},	border: 0 },
			items:[{

			    title: 'Graph Mapping',
			    items: Ext.create('Ext.form.FormPanel',{
				bodyStyle:{"background-color":"#f4f4f4"},
				border: 0,
				items: [{

				    xtype: 'combobox',
				    fieldLabel: 'Organisms type',
				    labelWidth: 300,
				    name: 'org',
				    emptyText: 'Select a organisms...'

				},{

				    xtype: 'combobox',
				    labelWidth: 300,
				    fieldLabel: 'Color for elements (genes/proteins/compounds)',
				    name: 'color',
				    emptyText: 'Select color'

				    
				},{

				    title: 'Input Experimental Data',
				    name: 'data',
				    items: mappingGraph_grid,
				    width: 730

				}]
			    })
			    
									    
			},{
			    title: 'Indensity Mapping',

			    defaults: {autoWidth: true, autoHeight: true, bodyStyle:{"background-color":"#f4f4f4"},	border: 0 },

			    items: Ext.create('Ext.form.FormPanel', {
				border: 0,
				bodyStyle:{"background-color":"#f4f4f4"},
				
				items: [{
				    xtype: 'combobox',
				    fieldLabel: 'Organisms type',
				    labelWidth: 300,
				    name: 'org',
				    emptyText: 'Selecti a organisms...'
				    
				},{
				    xtype: 'combobox',
				    labelWidth: 300,
				    fieldLabel: 'Color for elements (genes/proteins/compounds)',
				    name: 'color',
				    emptyText: 'Select color'
				    
				},{
				    title: 'Input Experimental Data',
				    name: 'data',
				    items: mappingIndensity_grid,
				    width: 180
				  }]
			    })

			},{
			    title: 'Label Mapping',
			    defaults: {autoWidth: true, autoHeight: true, bodyStyle:{"background-color":"#f4f4f4"},	border: 0 },
			    items: mappingLabel_grid

			}]
		    }],
		    listeners: {
			tabchange: 'onTabChange'
		    },
		    
		    buttonAlign: 'center',
		    buttons: [{
			width: 400,
			text: 'Mapping All Grid Data!!',
			scale: 'large',
			layout:{
			    pack: 'start'
			},
			scope: this,
			handler: function(){
			    var records = Mapping_Data.getRange();
			    var submitData = [];

			    Ext.each(records, function(item, idx){
				// id element not necessary
				delete item.data['id'];
				// item.get to access a field in the record
				submitData.push(item.data);
			    });

			    var sendJson = Ext.JSON.encode(submitData);
			    
			    // POST Data to R.cgi for mapping
			    Ext.Ajax.request({
				method: 'POST',
				url: 'R/R.cgi',
				params: {data: sendJson},
				cache: false,
				success:
				function(json){

				    <!-- Mask in White for Mapping -->
				    var Background_Mask = new google.maps.Rectangle({
					strokeWeight: 0,
					fillColor: 'white',
					fillOpacity: 0.35,
					map: map,
					clickable: false,
					bounds: new google.maps.LatLngBounds(
					    new google.maps.LatLng(-90, -180),
					    new google.maps.LatLng(90, 180))

				    });

				    // display Graph image /
				    
				    mappingGraph_Data.overlay = new google.maps.MVCObject();
				    mappingGraph_Data.overlay.set("visible", true);
				    var data = Ext.JSON.decode(json.responseText);
				    
				    mappingGraph_Data.data = data;
				    mappingGraph_Data.id = data.Mapping_ID;
				    
				    mappingGraph_Data.exist = true;
				    
				    for(var i=0; i< mappingGraph_Data.data.Data.map03020.length;i++){
					
					var img = 'R/'+mappingGraph_Data.data.Data.map03020[i].Graph_Path;
					
					var bound = new google.maps.LatLngBounds(
					    new google.maps.LatLng(data.Data.map03020[i].sw_latlng[0], data.Data.map03020[i].sw_latlng[1]),
					    new google.maps.LatLng(data.Data.map03020[i].ne_latlng[0], data.Data.map03020[i].ne_latlng[1])
					);
					
					// Explicitly call setMap on this overlay /
//					mappingGraph_Data.overlay.push( new mappingGraph(bound, img, map).setMap(map) );
					var hoge = new mappingGraph(bound, img, map);

					hoge.setMap(map);
					hoge.bindTo("visible", mappingGraph_Data.overlay, "visible", true);
				    }

				    mappingGraph_Data.overlay.set("visible", false);
				    
				    /*

				    // display Graph image /
				    
				    mappingGraph_Data.overlay = new google.maps.MVCArray();
				    var data = Ext.JSON.decode(json.responseText);
				    
				    mappingGraph_Data.data = data;
				    mappingGraph_Data.id = data.Mapping_ID;
				    
				    mappingGraph_Data.exist = true;
				    
				    for(var i=0; i< mappingGraph_Data.data.Data.map03020.length;i++){
					
					var img = 'R/'+mappingGraph_Data.data.Data.map03020[i].Graph_Path;
					
					var bound = new google.maps.LatLngBounds(
					    new google.maps.LatLng(data.Data.map03020[i].sw_latlng[0], data.Data.map03020[i].sw_latlng[1]),
					    new google.maps.LatLng(data.Data.map03020[i].ne_latlng[0], data.Data.map03020[i].ne_latlng[1])
					);
					
					// Explicitly call setMap on this overlay /
					mappingGraph_Data.overlay.push( new mappingGraph(bound, img, map).setMap(map) );
					
				    }
				    
				    */
				    
				    
				}
			    });
			    //.
			    
			}
		    }]
		});
	
	    }
	    button.dom.disabled = true;

	    if(!win.isVisible()) {
		win.show(this, function() {
		    button.dom.disabled = false;
		});
	    }
	    
	}
    });
    
    
    Ext.create('Eureka.Viewport');
    Ext.create('Eureka.Button');
    
});

function mappingGraph(bounds, image, map) {

    var mappingGraph;
    mappingGraph = new google.maps.OverlayView();


    // Explicitly call setMap on this overlay.
    // this.setMap(map);



    mappingGraph.onAdd = function() {

    // Initialize all properties.
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;
    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div_ = null;


	
    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    // Create the img element and attach it to the div.
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
	var panes = this.getPanes();
	panes.overlayShadow.appendChild(div);//    panes.overlayLayer.appendChild(div);
    };
    // [END region_attachment]
    // [START region_drawing]
mappingGraph.draw = function() {

    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};

mappingGraph.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};
    return mappingGraph;    
}
