
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
    Ext.require('Ext.form.RadioGroup');
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


    var loadingMask = Ext.get('loading-mask');
    var loading = Ext.get('loading');
    setTimeout(function(){
	    // Hide loading message
	    loading.fadeOut({duration:0.2, remove: true});
	    
	    // Hide loading mask
	    loadingMask.setOpacity(0.9);

	    loadingMask.animate({
	        xy: loading.getXY(),
	        width: loading.getWidth(),
	        height: loading.getHeight(),
	        remove: true,
	        duration: 1,
	        opacity: 0.1,
	        easing: 'bounceOut'
	    });

    }, 300);

    
    
    /// Setting Panels, Grids and Other...

    //Set Main Tab Panel, Elements, Viewports and other...
    
    Ext.define('Eureka.Mapping.grid.editing',{
	    extend: 'Ext.grid.plugin.RowEditing',
	    id: 'edit',
	    clicksToEdit: 1,
	    autoCancel: false,
	    errorSummary: true
    });
    
    var RowEditing = {
	    Graph_Mapping: Ext.create(Eureka.Mapping.grid.editing),
	    Intensity_Mapping: Ext.create(Eureka.Mapping.grid.editing),
	    Label_Mapping: Ext.create(Eureka.Mapping.grid.editing)
    };

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

	    height: 480,
	    xtype: 'grid',
	    columnLines: true,

	    store: Organisms_Store,

	    columns: [
	        {text: 'Name', flex:1, dataIndex:'name', sortable: true},
	        {text: 'Domain', flex: 1, dataIndex: 'domain', sortable: true},
	        {text: 'Kingdom', dataIndex: 'kingdom', sortable: true},
	        {text: 'Subphylum', dataIndex: 'Subphylum', sortable: true}
	    ],
        
	    autoWidth: true

    });
    //.
    
    
    var CenterPanel = Ext.create('Ext.tab.Panel', {
	    region: 'center',
	    xtype: 'tabpanel',
	    //layoutOnTabChange: true,
	    id: 'MainPanel',
	    items: [{
	        title: 'Reference',
	        html: '<div id="map-canvas" style="margin: 0; padding: 0; height: 100%;"></div>'
	        
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

    Ext.define('Eureka.Viewport', {
	    extend: 'Ext.container.Viewport',
	    layout: 'border',
	    items: [CenterPanel, NorthPanel, EastPanel],
	    renderTo: Ext.getBody()
    });

    //.

    
    // Mapping Data's Store, Proxy and Grids
    //Grids ->  (Graph Mapping, Intensity Mapping, Label Mapping)
    
    Ext.define('Model.Graph_Mapping', {
	    extend: 'Ext.data.Model',
	    fields: ['name', 'type', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 'l_color', 'org', 'l_color_size', 'txt', 'txt_size', 'sample_data',],
	    proxy: {
	        type: 'memory'
	        //LocalStrage ウィンドウ閉じても保存される
	        //SessionStrage そのタブが閉じれば、終わる
	    }
    });
    Ext.define('Model.Comparison_Mapping', {
	    extend: 'Ext.data.Model',
	    fields: ['name', 'd1', 'd2', 'd3'],
	    proxy: {
	        type: 'memory'
	    }
	    
    });


    var Store_ComparisonMapping = Ext.create('Ext.data.Store', {
	    autoDestroy: true,
	    model: 'Model.Comparison_Mapping',
	    data: [
	        {name: 'C00160', d1: '141.8909007', d2: '136.1222015', d3: ''},
	        {name: 'C00022', d1: '303.9381533', d2: '449.8584867', d3: ''},
	        {name: 'C00186', d1: '9618.045089', d2: '4837.15842', d3: ''},
	        {name: 'C01089', d1: '272.4729123', d2: '164.3975999', d3: ''},
	        {name: 'C05984', d1: '12.90675905', d2: '10.20320348', d3: ''},
	        {name: 'C00122', d1: '24.36531939', d2: '21.82358637', d3: ''},
	        {name: 'C00042', d1: '68.51417566', d2: '52.71919963', d3: ''},
	        {name: 'C05123', d1: '5.785689302', d2: '4.236823234', d3: ''},
	        {name: 'C01879', d1: '59.39798164', d2: '76.23664497', d3: ''},
	        {name: 'C00233', d1: '14.36023289', d2: '20.81370041', d3: ''},
	        {name: 'C00489', d1: '11.81170265', d2: '9.984701673', d3: ''},
	        {name: 'C00049', d1: '48.76429619', d2: '32.51665661', d3: ''},
	        {name: 'C00149', d1: '76.62489568', d2: '70.46005558', d3: ''}
	    ]
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
    
    var Store_GraphMapping = Ext.create('Ext.data.Store', {
	    autoDestroy: true,
	    model:'Model.Graph_Mapping',
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
	    store: Store_GraphMapping,
	    coplumnLines: true,
	    autoScroll: false,
	    viewConfig: {
	        markDirty: false
	    },
	    //	autoWidth: true,
	    width: 665,
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
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'

			            }
		            },{
			            text: '2',

			            sortable: false,
			            dataIndex: 't2',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'
			            }
		            },{
			            text: '3',

			            sortable: false,
			            dataIndex: 't3',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'

			            }
		            },{
			            text: '4',

			            sortable: false,
			            dataIndex: 't4',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'
			            }
		            },{
			            text: '5',

			            sortable: false,
			            dataIndex: 't5',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'
			            }
		            },{
			            text: '6',

			            sortable: false,
			            dataIndex: 't6',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'
			            }
		            },{
			            text: '7',

			            sortable: false,
			            dataIndex: 't7',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'
			            }
		            },{
			            text: '8',

			            sortable: false,
			            dataIndex: 't8',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'
			            }
		            },{
			            text: '9',

			            sortable: false,
			            dataIndex: 't9',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'
			            }
		            },{
			            text: '10',

			            sortable: false,
			            dataIndex: 't10',
			            width: 50,
			            editor:{
			                xtype: 'textfield',
			                allowBlank: true,
			                regex: /[0-9]+/,
			                regexText: 'This field allow only Numeric input'
			            }
		            }]
	        }
	    ],
	    /* Row Editing Mode */
	    selModel:{
	        selType: 'rowmodel'
	    },

	    plugins: [ RowEditing.Graph_Mapping ]
    });



    
    var mappingIntensity_grid =  Ext.create('Ext.grid.Panel',{
	    xtype: 'grouped-header-grid',	
	    store: Store_ComparisonMapping,
	    
	    columnLines: true,
	    autoScroll: false,

	    width: 340,
	    height: 390,

	    viewConfig: {
	        markDirty: false
	    },


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
		        text: 'Sample',

		        columns: [{

		            sortable: false,
		            width: 80,
		            dataIndex: 'd1',
		            editor: {
			            xtype: 'textfield',
			            allowBlank: true,
			            regex: /[0-9]+/,
			            regexText: 'This field allow only Numeric input'

		            },
		            items: {
			            xtype: 'textfield',
			            flex: 1,
			            margin: 2
		            }
		            

		        },{

		            width: 80,
		            sortable: false,
		            hideable: false,
		            dataIndex: 'd2',
		            editor: {
			            xtype: 'textfield',
			            allowBlank: true,
			            regex: /[0-9]+/,
			            regexText: 'This field allow only Numeric input'

		            },
		            items: {

			            xtype: 'textfield',
			            autoWidth: true,
			            flex: 1,
			            margin: 2
		            }
		            

		        },{
		            width: 80,
		            sortable: false,
		            hideable: false,
		            dataIndex: 'd3',
		            editor: {
			            xtype: 'textfield',
			            allowBlank: true,
			            regex: /[0-9]+/,
			            regexText: 'This field allow only Numeric input'
		            },
		            items: {
			            xtype: 'textfield',
			            flex: 1,
			            margin: 2
		            }
		            

		        }]

	        }
	        
	    ],
	    /* Row Editing Mode */
	    selModel:{
	        selType: 'rowmodel'
	    },
	    plugins: [ RowEditing.Intensity_Mapping ]

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
	    
	    plugins: [ RowEditing.Label_Mapping ]
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
	        
	        /*if(!win.isVisible()) {
		      win.show(this, function() {
		      button.dom.disabled = false;
		      });
	          }*/
	        
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

		            tools: [{type: 'pin'}],
		            layout: 'fit',
		            controller: 'tab-view',
		            defaults: {
			            border: 0
		            },
		            
		            items: [{
			            xtype: 'tabpanel',
			            defaults: {autoWidth: true,
			                       autoHeight: false,
			                       autoScroll: true,
				                   bodyStyle:{"background-color":"#f4f4f4"},	border: 0 },
			            items:[{
			                
			                title: 'Intensity Mapping',
			                items: Ext.create('Ext.form.FormPanel',{
				                id: 'GraphMapping_Form',
				                bodyStyle:{"background-color":"#f4f4f4"},
				                border: 0,
				                items: [{
				                    margin: '10 15 10 10',
				                    xtype: 'combobox',
				                    fieldLabel: 'Organisms type',
				                    labelWidth: 150,
				                    name: 'org',
				                    emptyText: 'Select the organism '
				                    
				                },{
				                    xtype: 'fieldset',
				                    title: 'Color Options',
				                    layout: 'anchor',
                                    hideable: true,
				                    defaults: {
					                    anchor: '100%'
				                    },

				                    items: [{
					                    xtype: 'checkbox',
					                    name: 'color',
					                    boxLabel: 'Enabled fill color',
					                    hideLabel: true,
					                    checked: false,
					                    margin: '0 0 10 0',
					                    scope: this,
					                    handler: function(box, checked){
					                        
					                        var fieldset = box.ownerCt;
					                        Ext.Array.forEach(fieldset.query('radiogroup'), function(field) {
						                        
						                        field.setVisible(checked);
						                        if(checked === true){
						                            field.setDisabled(false);
						                            field.el.animate({opacity: false ? 0.3 : 1});
						                        }else{
						                            field.setDisabled(true);
						                            field.el.animate({opacity: true ? 0.3 : 1});
						                        }
					                        }); 
					                    }
				                    },{

					                    xtype: 'container',
					                    layout: 'hbox',

					                    items: [
					                        {
						                        xtype: 'radiogroup',
						                        width: 350,
                                                hidden:true,
						                        layout: {
						                            autoFlex: false
						                        },
						                        fieldLabel: 'Method',
						                        defaults: {
						                            name: 'method',
						                            margin: '0 15 0 0'
						                        },
						                        style: 'opacity:.3',
						                        disabled: true,
						                        items: [{
						                            inputValue: 'median',
						                            boxLabel: 'Median',
						                            checked: true
						                        },{
						                            inputValue: 'mean',
						                            boxLabel: 'Mean'
						                            
						                        },{
						                            inputValue: 'grad',
						                            boxLabel: 'Gradient'
						                        }]
					                        },{
						                        xtype: 'radiogroup',
                                                hidden:true,
						                        layout: {
						                            autoFlex: false
						                        },
						                        fieldLabel: 'Fill to ',
						                        defaults: {
						                            name: 'fillto',
						                            margin: '0 15 0 0'
						                        },

						                        style: 'opacity:.3',
						                        disabled: true,
						                        
						                        items: [{
						                            inputValue: 'graph',
						                            boxLabel: 'Graph',
						                        },{
						                            inputValue: 'element',
						                            boxLabel: 'Element',
                                                    checked: true
						                        }]
						                        
						                        //				    labelWidth: 300,
						                        //				    fieldLabel: 'Color for elements (genes/proteins/compounds)',
					                        }]
					                    //				    emptyText: 'Select color'
				                    },{
					                    xtype: 'radiogroup',
					                    labelWidth: 150,
                                        hidden:true,
					                    layout: {
					                        autoFlex: false
					                    },
					                    fieldLabel: 'Color for Genes/Proteins ',
					                    defaults: {
					                        name: 'gene_color',
					                        margin: '0 15 0 0'
					                    },
					                    
					                    style: 'opacity:.3',
					                    disabled: true,
										
					                    items: [{
					                        inputValue: 'red2green',
					                        boxLabel: 'Red to Green',
					                        checked: true
					                    },{
					                        inputValue: 'blue2yellow',
					                        boxLabel: 'Blue to Yellow'

					                    }]
				                    },{

					                    xtype: 'radiogroup',
					                    labelWidth: 150,
                                        hidden:true,
					                    layout: {
					                        autoFlex: false
					                    },
					                    fieldLabel: 'Color for Compounds ',
					                    defaults: {
					                        name: 'compound_color',
					                        margin: '0 15 0 0'
					                    },
					                    
					                    style: 'opacity:.3',
					                    disabled: true,

					                    items: [{
					                        inputValue: 'red2green',
					                        boxLabel: 'Red to Green'
					                        
					                    },{
					                        inputValue: 'blue2yellow',
					                        boxLabel: 'Blue to Yellow',
					                        checked: true
					                    }]
					                    
				                    }]				
				                    
				                },{
				                    title: 'Input Experimental Data',
				                    name: 'data',
				                    items: mappingGraph_grid,
				                    width: 665
				                }]
				                
			                })
			                
			            },{
			                title: 'Comparison Mapping',
			                
			                defaults: {autoWidth: true, autoHeight: true, bodyStyle:{"background-color":"#f4f4f4"},	border: 0 },
			                
			                items: Ext.create('Ext.form.FormPanel', {
				                id: 'IntensityMapping_Form',
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
				                    items: mappingIntensity_grid,
				                    width: 340
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
			            //			listeners: {
                        //			    click: 'submitMappingData'
                        //			},
			            handler: function(){
			                
			                var editing =  {
				                state: false,
				                txt: String()
			                };
			                

			                Object.keys(RowEditing).forEach (function(key){
				                if(eval('RowEditing.'+key+'.editing') === true ){
				                    
				                    editing.state = true;
				                    editing.txt = editing.txt+ '<li>' + key.replace('_', ' ') + '</li>';

				                    console.log('error');
				                }
			                });
			                if(editing.state === true){
								
				                Ext.MessageBox.show({
					                title: 'Spreadsheet Error',
					                message: 'Row editing should be update and close.<br>Please check below tabpanels...<br><span style="font-weight: bolder">Tab: </span>' + '<blockquote><div style="background-color:#f5f5f5;font-family:\'sans-serif\';">' + editing.txt + '</div></blockquote>',
					                buttons: Ext.MessageBox.OK,
					                icon: Ext.MessageBox.ERROR

				                });
			                }else if(editing.state === false){

				                Ext.MessageBox.confirm('Confirm', 'Are you Ready to Mapping?', function(btn){

				                    if(btn == 'yes'){
					                    
					                    var submitOption = {};

					                    /** Get form value **/
					                    var graph_form = Ext.getCmp('GraphMapping_Form').getForm();
					                    
					                    if(graph_form.isValid()){

					                        Ext.Object.each(graph_form.getValues(), function(key, value){
						                        submitOption[key] = value;
					                        });
					                        
					                    }
					                    var optionJson = Ext.JSON.encode(submitOption);
					                    //.
					                    
					                    /** GraphMapping_grid **/
					                    var submitData = [];
					                    var records = Store_GraphMapping.getRange();
					                    Ext.each(records, function(item, idx){
					                        // id element not necessary
					                        delete item.data.id;
					                        // item.get to access a field in the record
					                        submitData.push(item.data);
					                    });
					                    var sendJson = Ext.JSON.encode(submitData);
					                    //.

					                    /** ComparisonMapping_grid **/
					                    var c_submitData = [];
					                    var c_records = Store_ComparisonMapping.getRange();
					                    Ext.each(c_records, function(item, idx){
					                        delete item.data.id;
					                        c_submitData.push(item.data);
					                    });
					                    var c_sendJson = Ext.JSON.encode(c_submitData);
					                    //.
					                    
					                    win.close();
					                    Ext.get('MainPanel').mask('Create Mapping Data...', 'x-mask-loading');
			    		                
					                    // POST Data to R.cgi for mapping
					                    Ext.Ajax.request({
					                        method: 'POST',
					                        url: 'R/R.cgi',
					                        params: {data: sendJson, c_data: c_sendJson, option: optionJson},
					                        cache: false,
					                        success:
					                        function(json){
						                        
						                        if(mappingGraph_Data.exist === true){
						                            /** Delete Graph Images **/
						                            mappingGraph_Data.overlay.forEach(function(data,idx){
							                            data.setMap(null);
						                            });
						                            mappingGraph_Data.overlay.clear();
						                            mappingGraph_Data.mask.setMap(null);
						                        }
						                        if(mappingComparison.exist === true){
						                            /** Delete Graph Images **/
						                            mappingComparison.overlay.forEach(function(data,idx){
							                            data.setMap(null);
						                            });
						                            mappingComparison.overlay.clear();
						                            
						                        }
                                                
						                        /** Mask in White for Mapping **/
						                        mappingGraph_Data.mask = new google.maps.Rectangle({
						                            strokeWeight: 0,
						                            fillColor: 'white',
						                            fillOpacivty: 0.9,
						                            map: map,
						                            clickable: false,
						                            bounds: new google.maps.LatLngBounds(
							                            new google.maps.LatLng(-90, -180),
							                            new google.maps.LatLng(90, 180))
						                            
						                        });
						                        mappingGraph_Data.mask.setMap(null);
						                        
						                        /** Setting Graph image & Intensity rectangle **/
						                        /** Graph is only show in PATHWAY Layers **/
						                        mappingGraph_Data.overlay = new google.maps.MVCArray();
						                        mappingGraph_Data.data = Ext.JSON.decode(json.responseText);
						                        mappingComparison.data = Ext.JSON.decode(json.responseText);
                                                
						                        map.controls[google.maps.ControlPosition.TOP_RIGHT].clear(); // init

						                        var MapControlDiv,
						                            MapControlLabel,
						                            MapControl;
						                        
						                        if(mappingComparison.data.hasOwnProperty('Comparison')){
						                            Mapping_mode = 'Comparison';
						                            
						                            /** Set type controller on the map **/
						                            MapControlDiv = document.createElement('div');
						                            MapControlLabel = 'Comparison';
						                            MapControl = new Mapping_Selection(MapControlDiv, MapControlLabel, map);
						                            MapControlDiv.index = 1;
						                            map.controls[google.maps.ControlPosition.TOP_RIGHT].push(MapControlDiv);
						                            //.
						                        }
						                        
						                        if(mappingGraph_Data.data.hasOwnProperty('Graph')){
						                            mappingGraph_Data.exist = true;
						                            Mapping_mode ='Graph';
						                            
						                            
						                            /** Set type controller on the map **/
						                            MapControlDiv = document.createElement('div');
						                            MapControlLabel = 'Intensity';
						                            MapControl = new Mapping_Selection(MapControlDiv, MapControlLabel, map);
						                            MapControlDiv.index = 1;
						                            
						                            
						                            map.controls[google.maps.ControlPosition.TOP_RIGHT].push(MapControlDiv);
						                            //.

						                        }
						                        
						                        Change_Hierarchy( Hierarchy, Subcategory, Tile_Type, Map_ID, Mapping_mode );
						                        
						                        
						                        Ext.get('MainPanel').unmask();
					                        }
					                    });	    
				                    }else{
				                    }
				                    
				                });
			                }
			            }
		            }]
		        });
		        
		        win.show(this, function(){
		            button.dom.disabled = false;
		        });
		        
	        }else{
		        
		        if(!win.isVisible()) {
		            win.show(this, function() {
			            button.dom.disabled = false;
		            });
		        }
		        
	        }
	        
	        
	        
	    }
    });
    
    Ext.create('Eureka.Viewport');
    Ext.create('Eureka.Button');

});

function Change_Hierarchy(hie, subcat, tile, pathw, Mapping_mode){

    
    /** Graph mapping **/
    // mappingGraph_Data.overlay is MVCArray class. MVCArray has graphs data 
    if(mappingGraph_Data.exist === true){
	    
	    if( hie === 'Category' ){
	        /** Delete Graph Images **/
	        mappingGraph_Data.overlay.forEach(function(data,idx){
		        data.setMap(null);
	        });
	        mappingGraph_Data.overlay.clear();
	        mappingGraph_Data.mask.setMap(null);

            if(mappingGraph_Data.overlay.getArray() == 0 && eval('mappingGraph_Data.data.Graph').hasOwnProperty('Category')){
                mappingGraph_Data.mask.setMap(map);
                    var bound_down,
                        bound_up;
		            for(var i=0; i< eval('mappingGraph_Data.data.Graph.Category.length');i++){
                        var down_coords = [
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.ne_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.ne_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lng')
                            )

                        ];

                        var up_coords = [
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Category[i].latlng.ne_lng')
                            )
                        ];
                        
                        mappingGraph_Data.overlay.push( new google.maps.Polygon({
                            paths: up_coords,
                            map: map,
                            strokeColor:'white',
                            strokeOpacity: 0.9,
                            strokeWeight:0.3,
                            fillColor: eval('mappingGraph_Data.data.Graph.Category[i].upcolor'),
				            fillOpacity: 0.85,
                            clickable: false
                        }));
                        mappingGraph_Data.overlay.push( new google.maps.Polygon({
                            paths: down_coords,
                            map: map,
                            strokeColor:'white',
                            strokeOpacity: 0.9,
                            strokeWeight:0.3,
                            fillColor: eval('mappingGraph_Data.data.Graph.Category[i].downcolor'),
				            fillOpacity: 0.85,
                            clickable: false
                        }));

                        
			            var proj = map.getProjection();
                                                
                        var cw_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Category[i].latlng.cn_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lng')
						                                                         ));
                        var cc_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Category[i].latlng.cn_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Category[i].latlng.cn_lng')
						                                                         ));
                        var cs_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Category[i].latlng.cn_lng')
						                                                         ));

                        var img_width = (cc_xy.x - cw_xy.x) * 0.4;
                        var img_height = (cs_xy.y - cc_xy.y) * 0.4;
                        var sw_xy = {};
                        var ne_xy = {};
                        sw_xy.x = cc_xy.x - img_width;
                        sw_xy.y = cc_xy.y + img_height;
                        
                        ne_xy.x = cc_xy.x + img_width;
                        ne_xy.y = cc_xy.y - img_height;
                        
                        var sw = proj.fromPointToLatLng(sw_xy);
                        var ne = proj.fromPointToLatLng(ne_xy);
                        
                        // Genetic_Information_Processing
                        
                        var bound = new google.maps.LatLngBounds(sw, ne);
                        var img = 'Data/Img/Mapping/Marker/num'+eval('mappingGraph_Data.data.Graph.Category[i].total')+'.png';
                        
			            mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );


                        if( eval('mappingGraph_Data.data.Graph.Category[i].up') !== 0  ||  eval('mappingGraph_Data.data.Graph.Category[i].down') !== 0 ){

                            if( eval('mappingGraph_Data.data.Graph.Category[i].up') !== 0  ){
                                var nw_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Category[i].latlng.ne_lat'),
						                                                                  eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lng')
						                                                                 ));
                        
                                sw_xy.x = nw_xy.x + (img_width/2.5);
                                sw_xy.y = nw_xy.y + (img_height*1.2);
                                
                                ne_xy.x = nw_xy.x + (img_width*2);
                                ne_xy.y = nw_xy.y + (img_height*0.2);
                                
                                sw = proj.fromPointToLatLng(sw_xy);
                                ne = proj.fromPointToLatLng(ne_xy);
                                                
                                bound = new google.maps.LatLngBounds(sw, ne);
                                img = 'Data/Img/Mapping/number/num'+eval('mappingGraph_Data.data.Graph.Category[i].up')+'.png';
                                mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );
                            }

                            if( eval('mappingGraph_Data.data.Graph.Category[i].down') !== 0  ){
                                var se_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Category[i].latlng.sw_lat'),
						                                                                  eval('mappingGraph_Data.data.Graph.Category[i].latlng.ne_lng')
						                                                                 ));
                                sw_xy.x = se_xy.x - (img_width);
                                sw_xy.y = se_xy.y - (img_height*0.2);

                                ne_xy.x = se_xy.x + img_width;
                                ne_xy.y = se_xy.y - (img_height*1.2);
                                
                                sw = proj.fromPointToLatLng(sw_xy);
                                ne = proj.fromPointToLatLng(ne_xy);
                                                
                                bound = new google.maps.LatLngBounds(sw, ne);
                                img = 'Data/Img/Mapping/number/num'+eval('mappingGraph_Data.data.Graph.Category[i].down')+'.png';
                                mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );
                            }
                            
                        }

                        mappingGraph_Data.overlay.forEach(function(data,idx){
			                data.setMap(map);
			            });
                    }
                
            }
                       
	    }else if( hie === 'Subcategory' ){
	        /** Delete Graph Images **/
	        mappingGraph_Data.overlay.forEach(function(data,idx){
		        data.setMap(null);
	        });
	        mappingGraph_Data.overlay.clear();
	        mappingGraph_Data.mask.setMap(null);
            if(mappingGraph_Data.overlay.getArray() == 0 && eval('mappingGraph_Data.data.Graph').hasOwnProperty('Subcategory')){
                mappingGraph_Data.mask.setMap(map);
    var bound_down,
                        bound_up;
		            for(var i=0; i< eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'.length');i++){
                        var down_coords = [
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.ne_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.ne_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lng')
                            )

                        ];

                        var up_coords = [
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.ne_lng')
                            )
                        ];
                        
                        mappingGraph_Data.overlay.push( new google.maps.Polygon({
                            paths: up_coords,
                            map: map,
                            strokeColor:'white',
                            strokeOpacity: 0.9,
                            strokeWeight:0.3,
                            fillColor: eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].upcolor'),
				            fillOpacity: 0.85,
                            clickable: false
                        }));
                        mappingGraph_Data.overlay.push( new google.maps.Polygon({
                            paths: down_coords,
                            map: map,
                            strokeColor:'white',
                            strokeOpacity: 0.9,
                            strokeWeight:0.3,
                            fillColor: eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].downcolor'),
				            fillOpacity: 0.85,
                            clickable: false
                        }));

                        
			            var proj = map.getProjection();
                                                
                        var cw_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.cn_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lng')
						                                                         ));
                        var cc_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.cn_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.cn_lng')
						                                                         ));
                        var cs_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.cn_lng')
						                                                         ));

                        var img_width = (cc_xy.x - cw_xy.x) * 0.4;
                        var img_height = (cs_xy.y - cc_xy.y) * 0.4;
                        var sw_xy = {};
                        var ne_xy = {};
                        sw_xy.x = cc_xy.x - img_width;
                        sw_xy.y = cc_xy.y + img_height;
                        
                        ne_xy.x = cc_xy.x + img_width;
                        ne_xy.y = cc_xy.y - img_height;
                        
                        var sw = proj.fromPointToLatLng(sw_xy);
                        var ne = proj.fromPointToLatLng(ne_xy);
                        
                        // Genetic_Information_Processing
                        
                        var bound = new google.maps.LatLngBounds(sw, ne);
                        var img = 'Data/Img/Mapping/Marker/num'+eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].total')+'.png';
                        
			            mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );


                        if( eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].up') !== 0  ||  eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].down') !== 0 ){

                            if( eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].up') !== 0  ){
                                var nw_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.ne_lat'),
						                                                                  eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lng')
						                                                                 ));
                        
                                sw_xy.x = nw_xy.x + (img_width/2.5);
                                sw_xy.y = nw_xy.y + (img_height*1.2);
                                
                                ne_xy.x = nw_xy.x + (img_width*2);
                                ne_xy.y = nw_xy.y + (img_height*0.2);
                                
                                sw = proj.fromPointToLatLng(sw_xy);
                                ne = proj.fromPointToLatLng(ne_xy);
                                                
                                bound = new google.maps.LatLngBounds(sw, ne);
                                img = 'Data/Img/Mapping/number/num'+eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].up')+'.png';
                                mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );
                            }

                            if( eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].down') !== 0  ){
                                var se_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.sw_lat'),
						                                                                  eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].latlng.ne_lng')
						                                                                 ));
                                sw_xy.x = se_xy.x - (img_width);
                                sw_xy.y = se_xy.y - (img_height*0.2);

                                ne_xy.x = se_xy.x + img_width;
                                ne_xy.y = se_xy.y - (img_height*1.2);
                                
                                sw = proj.fromPointToLatLng(sw_xy);
                                ne = proj.fromPointToLatLng(ne_xy);
                                                
                                bound = new google.maps.LatLngBounds(sw, ne);
                                img = 'Data/Img/Mapping/number/num'+eval('mappingGraph_Data.data.Graph.Subcategory.'+tile+'[i].down')+'.png';
                                mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );
                            }
                            
                        }

                        mappingGraph_Data.overlay.forEach(function(data,idx){
			                data.setMap(map);
			            });
                    }
                
                
            }
            
            
	    }else if( hie === 'Tile' ){
	        /** Delete Graph Images **/
	        mappingGraph_Data.overlay.forEach(function(data,idx){
		        data.setMap(null);
	        });
	        mappingGraph_Data.overlay.clear();
	        mappingGraph_Data.mask.setMap(null);

            if(mappingGraph_Data.overlay.getArray() == 0 && eval('mappingGraph_Data.data.Graph.Tile').hasOwnProperty(tile)){

                subcat = subcat.replace('/','');
                
                if(tile === 'Metabolism' && eval('mappingGraph_Data.data.Graph.Tile.'+tile).hasOwnProperty(subcat)){
                    subcat = '.' + subcat;
                    mappingGraph_Data.mask.setMap(map);
                    
                    var bound_down,
                        bound_up;
		            for(var i=0; i< eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'.length');i++){
                                                var down_coords = [
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.ne_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.ne_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lng')
                            )

                        ];

                        var up_coords = [
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.ne_lng')
                            )
                        ];
                        
                        mappingGraph_Data.overlay.push( new google.maps.Polygon({
                            paths: up_coords,
                            map: map,
                            strokeColor:'white',
                            strokeOpacity: 0.9,
                            strokeWeight:0.3,
                            fillColor: eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].upcolor'),
				            fillOpacity: 0.85,
                            clickable: false
                        }));
                        mappingGraph_Data.overlay.push( new google.maps.Polygon({
                            paths: down_coords,
                            map: map,
                            strokeColor:'white',
                            strokeOpacity: 0.9,
                            strokeWeight:0.3,
                            fillColor: eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].downcolor'),
				            fillOpacity: 0.85,
                            clickable: false
                        }));

                        
			            var proj = map.getProjection();
                                                
                        var cw_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.cn_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lng')
						                                                         ));
                        var cc_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.cn_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.cn_lng')
						                                                         ));
                        var cs_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.cn_lng')
						                                                         ));

                        var img_width = (cc_xy.x - cw_xy.x) * 0.55;
                        var img_height = (cs_xy.y - cc_xy.y) * 0.4;
                        var sw_xy = {};
                        var ne_xy = {};
                        sw_xy.x = cc_xy.x - img_width;
                        sw_xy.y = cc_xy.y + img_height;
                        
                        ne_xy.x = cc_xy.x + img_width;
                        ne_xy.y = cc_xy.y - img_height;
                        
                        var sw = proj.fromPointToLatLng(sw_xy);
                        var ne = proj.fromPointToLatLng(ne_xy);
                        
                        // Genetic_Information_Processing
                        /** marker_length= 525392.902968137maps_length= 2680227.962480968ratio= 0.19602545392512213 **/
                        
                        var bound = new google.maps.LatLngBounds(sw, ne);
                        var img = 'Data/Img/Mapping/Marker/num'+eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].total')+'.png';
                        
			            mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );


                        if( eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].up') !== 0  ||  eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].down') !== 0 ){

                            if( eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].up') !== 0  ){
                                var nw_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.ne_lat'),
						                                                                  eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lng')
						                                                                 ));
                        
                                sw_xy.x = nw_xy.x + (img_width/2.5);
                                sw_xy.y = nw_xy.y + (img_height*1.2);
                                
                                ne_xy.x = nw_xy.x + (img_width*2);
                                ne_xy.y = nw_xy.y + (img_height*0.2);
                                
                                sw = proj.fromPointToLatLng(sw_xy);
                                ne = proj.fromPointToLatLng(ne_xy);
                                                
                                bound = new google.maps.LatLngBounds(sw, ne);
                                img = 'Data/Img/Mapping/number/num'+eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].up')+'.png';
                                mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );
                            }

                            if( eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].down') !== 0  ){
                                var se_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.sw_lat'),
						                                                                  eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].latlng.ne_lng')
						                                                                 ));
                                sw_xy.x = se_xy.x - (img_width);
                                sw_xy.y = se_xy.y - (img_height*0.2);

                                ne_xy.x = se_xy.x + img_width;
                                ne_xy.y = se_xy.y - (img_height*1.2);
                                
                                sw = proj.fromPointToLatLng(sw_xy);
                                ne = proj.fromPointToLatLng(ne_xy);
                                                
                                bound = new google.maps.LatLngBounds(sw, ne);
                                img = 'Data/Img/Mapping/number/num'+eval('mappingGraph_Data.data.Graph.Tile.'+tile+subcat+'[i].down')+'.png';
                                mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );
                            }

                            
                        }


                        mappingGraph_Data.overlay.forEach(function(data,idx){
			                data.setMap(map);
			            });
                    }
                    
                }else{
    
                    mappingGraph_Data.mask.setMap(map);
                                
		            for(var i=0; i< eval('mappingGraph_Data.data.Graph.Tile.'+tile+'.length');i++){
                        var down_coords = [
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.ne_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.ne_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lng')
                            )

                        ];

                        var up_coords = [
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lng')
                            ),
                            new google.maps.LatLng(
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.ne_lat'),
                                eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.ne_lng')
                            )

                        ];
                        mappingGraph_Data.overlay.push( new google.maps.Polygon({
                            paths: up_coords,
                            map: map,
                            strokeColor:'white',
                            strokeOpacity: 0.9,
                            strokeWeight:0.3,
                            fillColor: eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].upcolor'),
				            fillOpacity: 0.85,
                            clickable: false
                           
                        }));
                        mappingGraph_Data.overlay.push( new google.maps.Polygon({
                            paths: down_coords,
                            map: map,
                            strokeColor:'white',
                            strokeOpacity: 0.9,
                            strokeWeight:0.3,
                            fillColor: eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].downcolor'),
				            fillOpacity: 0.85,
                            clickable: false
                           
                        }));


                        /** **/
                        
			            var proj = map.getProjection();
                                                
                        var cw_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.cn_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lng')
						                                                         ));
                        var cc_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.cn_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.cn_lng')
						                                                         ));
                        var cs_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lat'),
						                                                          eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.cn_lng')
						                                                         ));

                        var img_width = (cc_xy.x - cw_xy.x) * 0.55;
                        var img_height = (cs_xy.y - cc_xy.y) * 0.4;
                        var sw_xy = {};
                        var ne_xy = {};
                        sw_xy.x = cc_xy.x - img_width;
                        sw_xy.y = cc_xy.y + img_height;
                        
                        ne_xy.x = cc_xy.x + img_width;
                        ne_xy.y = cc_xy.y - img_height;
                        
                        var sw = proj.fromPointToLatLng(sw_xy);
                        var ne = proj.fromPointToLatLng(ne_xy);
                        
                        // Genetic_Information_Processing
                        /** marker_length= 525392.902968137maps_length= 2680227.962480968ratio= 0.19602545392512213 **/
                        
                        var bound = new google.maps.LatLngBounds(sw, ne);
                        var img = 'Data/Img/Mapping/Marker/num'+eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].total')+'.png';
                        
			            mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );

                        if( eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].up') !== 0  ||  eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].down') !== 0 ){

                            if( eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].up') !== 0  ){
                                var nw_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.ne_lat'),
						                                                                  eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lng')
						                                                                 ));
                        
                                sw_xy.x = nw_xy.x + (img_width/2.5);
                                sw_xy.y = nw_xy.y + (img_height*1.2);
                                
                                ne_xy.x = nw_xy.x + (img_width*2);
                                ne_xy.y = nw_xy.y + (img_height*0.2);
                                
                                sw = proj.fromPointToLatLng(sw_xy);
                                ne = proj.fromPointToLatLng(ne_xy);
                                                
                                bound = new google.maps.LatLngBounds(sw, ne);
                                img = 'Data/Img/Mapping/number/num'+eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].up')+'.png';
                                mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );
                            }

                            if( eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].down') !== 0  ){
                                var se_xy = proj.fromLatLngToPoint(new google.maps.LatLng(eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.sw_lat'),
						                                                                  eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].latlng.ne_lng')
						                                                                 ));
                                sw_xy.x = se_xy.x - (img_width);
                                sw_xy.y = se_xy.y - (img_height*0.2);

                                ne_xy.x = se_xy.x + img_width;
                                ne_xy.y = se_xy.y - (img_height*1.2);
                                
                                sw = proj.fromPointToLatLng(sw_xy);
                                ne = proj.fromPointToLatLng(ne_xy);
                                                
                                bound = new google.maps.LatLngBounds(sw, ne);
                                img = 'Data/Img/Mapping/number/num'+eval('mappingGraph_Data.data.Graph.Tile.'+tile+'[i].down')+'.png';
                                mappingGraph_Data.overlay.push( new  mappingGraph(bound, img, map) );
                            }

                            
                        }

                        mappingGraph_Data.overlay.forEach(function(data,idx){
			                data.setMap(map);
			            });

                    }
                }
            }
	    }else if( hie === 'Pathway'){

	        /** Delete Graph Images **/
	        mappingGraph_Data.overlay.forEach(function(data,idx){
		        data.setMap(null);
	        });
	        mappingGraph_Data.overlay.clear();
	        mappingGraph_Data.mask.setMap(null);

            /** display graphs onto pathway. Occurs when user in Pathway hierarchy **/	    

	        if(mappingGraph_Data.overlay.getArray() == 0 &&  eval('mappingGraph_Data.data.'+Mapping_mode).hasOwnProperty('map'+pathw)){

		        mappingGraph_Data.mask.setMap(map);

		        var bound;
		        
		        for(var i=0; i< eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'.length');i++){
		            
		            /** Graph Mapping : Display Objects **/
		            if( eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i]').hasOwnProperty('Graph_Path') === true ){
			            
			            bound = new google.maps.LatLngBounds(
			                new google.maps.LatLng(eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].sw_latlng[0]'),
						                           eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].sw_latlng[1]')
						                          ),
			                new google.maps.LatLng(eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].ne_latlng[0]'),
						                           eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].ne_latlng[1]')
						                          )
			            );
			            
			            var img = 'R/'+ eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].Graph_Path');
			            mappingGraph_Data.overlay.push( new mappingGraph(bound, img, map) );
			            
			            /** Explicitly call setMap on this overlay **/
			            mappingGraph_Data.overlay.forEach(function(data,idx){
			                data.setMap(map);
			            });
			            
		            }
		            
		            /** Intensity Mapping (Intensity Mapping) : Display Objects **/
		            if( eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i]').hasOwnProperty('i_color') ){

			            if ( eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng').hasOwnProperty('sw_latlng') ){

			                bound = new google.maps.LatLngBounds(
				                new google.maps.LatLng(eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng.sw_latlng[0]'),
						                               eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng.sw_latlng[1]')
						                              ),
				                new google.maps.LatLng(eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng.ne_latlng[0]'),
						                               eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng.ne_latlng[1]')
						                              )
			                );
			                
			                mappingGraph_Data.overlay.push( new google.maps.Rectangle({
				                bounds: bound,
				                map: map,
				                fillColor: eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_color'),
				                fillOpacity: 0.8,
				                strokeColor: 'black',
				                strokeOpacity: 0.9,
				                strokeWeight: 1,
				                clickable: false
				                
			                }));
			            }else{
			                
			                var [center_lat, center_lng, perimeter_lat, perimeter_lng] = [
				                eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng.center_latlng[0]'),
				                eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng.center_latlng[1]'),
				                eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng.perimeter_latlng[0]'),
				                eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_LatLng.perimeter_latlng[1]')
			                ];
                            
			                /** calculate distance between Compound center  **/
			                /** calculate length of a line segment from circle(Compound) center to circle(Compound) perimeter. **/
			                
			                var radius = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(center_lat, center_lng), new google.maps.LatLng(perimeter_lat, perimeter_lng));
                            
			                mappingGraph_Data.overlay.push( new google.maps.Circle({
				                strokeColor: 'black',
				                strokeOpacity: 0.8,
				                strokeWeight: 1,
				                fillColor: eval('mappingGraph_Data.data.'+Mapping_mode+'.map'+pathw+'[i].i_color'),
				                fillOpacity: 0.8,
				                map: map,
				                clickable: false,
				                center:  new google.maps.LatLng(center_lat, center_lng),
				                radius: radius
			                }));


			            }
		            }
		        }
		        
	        }
	        
	        
	    }
	    
    }
    
}




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
    
    mappingGraph.onRemove = function(){
	    this.div_.parentNode.removeChild(this.div_);
	    this.div_ = null;
    };
    return mappingGraph;
}


function mappingNumber(bounds, image, position, map) {

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

        /*
        if(position === 'center'){
            sw.x -= 16.5;
            sw.y += 16.25;
            ne.x += 16.5;
            ne.y -= 16.25;
        }*/

	    div.style.left = sw.x + 'px';
	    div.style.top = ne.y + 'px';
	    div.style.width = (ne.x - sw.x) + 'px';
	    div.style.height = (sw.y - ne.y) + 'px';
    };
    
    mappingGraph.onRemove = function(){
	    this.div_.parentNode.removeChild(this.div_);
	    this.div_ = null;
    };
    return mappingGraph;
}



function Mapping_Selection(controlDiv, controlLabel , map){
    
    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map.
    controlDiv.style.padding = '5px';

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = 'white';
    controlUI.style.borderStyle = 'solid';
    controlUI.style.borderWidth = '2px';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to change the mapping style';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.fontFamily = 'Arial,sans-serif';
    controlText.style.fontSize = '12px';
    controlText.style.paddingLeft = '4px';
    controlText.style.paddingRight = '4px';
    controlText.innerHTML = '<strong>'+controlLabel+'</strong>';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    google.maps.event.addDomListener(controlUI, 'click', function() {

	    if(Mapping_mode == controlLabel ){
	        
	    }else if(Mapping_mode == 'Graph' && controlLabel == 'Intensity'){
	        
	    }else{
	        if(controlLabel == 'Intensity'){
		        /** Delete Graph Images **/
		        mappingGraph_Data.overlay.forEach(function(data,idx){
		            data.setMap(null);
		        });
		        mappingGraph_Data.overlay.clear();
		        mappingGraph_Data.mask.setMap(null);

		        Mapping_mode = 'Graph';

	        }else{

		        /** Delete Graph Images **/
		        mappingGraph_Data.overlay.forEach(function(data,idx){
		            data.setMap(null);
		        });
		        mappingGraph_Data.overlay.clear();
		        mappingGraph_Data.mask.setMap(null);
	            
		        Mapping_mode = controlLabel;		

	        }

	        
	        Change_Hierarchy( Hierarchy, Subcategory, Tile_Type, Map_ID, Mapping_mode );

	    }
	    
    });
    
}
