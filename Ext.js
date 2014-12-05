Ext.require('Ext.*');

Ext.onReady(function(){
    Ext.Ajax.timeout = 120 *1000;
    
    Ext.define('Organism_list',{
	extend: 'Ext.data.Model',
	fields: ['domain', 'name', 'kingdom', 'Subphylum', 'id']
    });
    var store = Ext.create('Ext.data.Store', {
	model: 'Organism_list',
	url: './Data/Info/Other/Org_Data.json',
	proxy: {
	    type: 'ajax',
	    url: './Data/Info/Other/Org_Data.json',
	    reader: {
		type: 'json'
	    }
	}
    });
    
    store.load();
    //mask.show();
    
    var grid = Ext.create('Ext.grid.Panel', {
	
	xtype: 'grid',
	stripeRows: true,
	columnLines: true,
	store: store,
	
	columns: [
	    {text: "Name",flex: 1, dataIndex: 'name', sortable:true},
	    {text:"Domain",flex: 1, dataIndex: 'domain', sortable: true},
	    {text:"Kingdom", dataIndex: 'kingdom', sortable: true},
	    {text:"Subphylum", dataIndex: 'Subphylum', sortable: true}
	],
	
	viewConfig: {
	    forceFit: true
	},
	// height: 550,
	autoWidth: true,
	//autoHeight: true,
    
    });
    
    Ext.application({
    name: 'Eureka',
	launch: function(){
	    
	    Ext.create('Ext.container.Viewport', {
		xtype: 'layout-border',
		layout: 'border',
		bodyBorder:false,
		
		
		id: 'Projector_Framework',
		renderTo: Ext.getBody(),
		items: [{
		    xtype: 'panel',
		    region: 'north',
		    bodyStyle: 'background-color:#1b3450;color: gray;',
		    height:50,
		    border: false,
		    autoHeight: true,
		    
		    id: 'north',
		    html: '<div id="hoge" style="float:left;font-size:9px;color:white;"><h1 class="x-panel-header">&nbspPathway&nbspProjector&nbspver&nbsp2</h1></div><div style="position:fixed;top:16px;right:20px"><form id="formid"  onSubmit="Query_Search();return false;"><input type="search" name="query" id="query" placeholder="Search" results="10" size="25" /></form></div>'
		},{
		    region: 'south',
		    xtype: 'panel',
		    collapsed: true,
		    collapsible: true,
		    html: 'Welcome to Pathway Projector, produced by G-language Project.<br>',
		    height: 70,
		    minHeight: 10
		},{
		    region: 'east',
		    title: 'Search Result',
		    collapsed: true,
		    collapsible: true,
		    split: true,
		    width: 250,
		    minWidth: 250,
		    maxWidth: 400,
		    layout: 'accordion',
		    items:[{
			autoScroll: true,
			title: 'Genes',
			html: '<div height="100%" width="100%" width="250" id="SearchResult_Gene"></div>',
		    },{
			autoScroll: true,
			title: 'Compounds',
			html: '<div height="100%" width="100%" id="SearchResult_Compound"></div>'
		    }]
		},{
		    region: 'center',
		    xtype: 'tabpanel',
		    id: 'Projector_Center',
		    layoutOnTabChange: true,
		    //   items:[grid],
		    
		    items: [{
			title: 'Reference',
			html: '<div id="map-canvas"></div>',
			autoWidth: true,
		    },{
			items:[grid],
			title: 'Organism Selection',
			//autoHeight: true,
			//autoWidth: true,
			//autoScroll: true,
			id: 'Selection'
		    }]
		}]
	    });
	}
    });
    
    function Generate_Marker(json,hierarchy,tile_type,map_id){
	
	if(hierarchy == 'Category'){
	    
	    for(var i=0; i<json.category.length;i++){
		if(  json.category[i][2] != ''){
		    
		    var text_color = 'white';
		    Marker_txt_num = json.category[i][2];
		    
		    //Select Marker Color depends on Hierarchy
		    var tile_type = json.category[i][3];
		    //.
		    
		    //Select Marker Size depends on Hit num
		    var icon_size;
		    if(Marker_txt_num >= 1000){
			icon_size = "Data/Img/Marker/Marker1K.png";
		    }else if(Marker_txt_num >= 100 && Marker_txt_num < 1000){
			icon_size = "Data/Img/Marker/Marker1H.png";
		    }else if(Marker_txt_num >= 10 && Marker_txt_num < 100){
			icon_size = "Data/Img/Marker/Marker1DA.png";
		    }else if(Marker_txt_num >= 1 && Marker_txt_num < 10){
			icon_size = "Data/Img/Marker/Marker1B.png";
		    }
		    //.
		    
		    Marker_Cluster = new google.maps.Marker({
			position: new google.maps.LatLng(json.category[i][0], json.category[i][1]),
			map: map,
			icon: icon_size
		    });
		    
		    
		    Marker_Num = new Marker_Text(map, json.category[i][0],json.category[i][1], Marker_txt_num, text_color);
		    marker_list.push(Marker_Cluster);
		    num_list.push(Marker_Num);
		}
	    }
	    
	
	}else if(hierarchy == 'Tile' && eval('json.tile.'+tile_type) ){
	    for(var i=0; i< eval('json.tile.'+tile_type+'.length');i++){
		if(  eval('json.tile.'+tile_type+'[i][2]') != ''){
		    
		    //Select Marker Size depends on Hit num
		    var icon_size;
		    Marker_txt_num = eval('json.tile.'+Tile_Type+'[i][2]');
		    var num = Number(Marker_txt_num);
		    if(num >= 1000){
			//icon_size = "Data/Img/Marker/"+tile_type+"/1K.png";
			icon_size = "Data/Img/Marker/Marker1K.png";
		    }else if(num >= 100 && num < 1000){
			//icon_size = "Data/Img/Marker/"+tile_type+"/1H.png";
	   		icon_size = "Data/Img/Marker/Marker1H.png";
		    }else if(num >= 10 && num < 100){
			icon_size = "Data/Img/Marker/Marker1DA.png";
			//icon_size = "Data/Img/Marker/"+tile_type+"/1DA.png";
		    }else if(num >= 1 && num < 10){
			icon_size = "Data/Img/Marker/Marker1B.png";
			//icon_size = "Data/Img/Marker/"+tile_type+"/1B.png";
		    }
		    //.
		    
		    var cluster_img;
		    var text_color;
		    //			cluster_img = "Data/Img/Marker/markercluster/m1.png";
		    text_color = 'white';
		    
		    Marker_Cluster = new google.maps.Marker({
			position: new google.maps.LatLng(eval('json.tile.'+tile_type+'[i][0]'), eval('json.tile.'+tile_type+'[i][1]')),
			map: map,
			icon: icon_size,//cluster_img,
		    });
		    
		    
		    
		    Marker_Num = new Marker_Text(map, eval('json.tile.'+Tile_Type+'[i][0]'),eval('json.tile.'+Tile_Type+'[i][1]'), Marker_txt_num, text_color);
		    marker_list.push(Marker_Cluster);//?
		    num_list.push(Marker_Num);		
		}
		
	    }
	    
	}else if(hierarchy == 'Pathway' && eval('json.pathway.map'+map_id) ){
	    
	    for(var i=0; i< eval('json.pathway.map'+map_id+'.length');i++){
		if(  eval('json.pathway.map'+map_id+'[i][2]') != ''){
		    var cluster_img;
		    var text_color;
		    cluster_img = "Data/Img/Marker/markercluster/m1.png";
		    text_color = 'white';
		    
		    Marker_Cluster = new google.maps.Marker({
			position: new google.maps.LatLng(eval('json.pathway.map'+map_id+'[i][0]'), eval('json.pathway.map'+map_id+'[i][1]')),
			map: map,
			icon: 'Data/Img/Marker/Pathway/iPhonePin.png',
			shadow: 'Data/Img/Marker/Pathway/shadow-iPhonePin.png'
		});
		    
		    marker_list.push(Marker_Cluster);
		    num_list.push(Marker_Num);		
		}
		
	    }
	    
	}
	
    }
    
    function Query_Search(){
	
	
	var HeatMap_Data = {};
	
	HeatMap_Data['東京都'] = { pos: [-21.0065030199706, -139.7542997543], num: 60 };
	HeatMap_Data['神奈川県'] = { pos: [-27.8462366447398, -139.7542997543], num: 50 };
	HeatMap_Data['大阪府'] = { pos: [-25.0751350097338, -119.41031941032], num: 70 };
	HeatMap_Data['愛知県'] = { pos: [-25.0751350097338, -99.066339066339], num: 80 };
	HeatMap_Data['埼玉県'] = { pos: [-54.7623277651706, -139.7542997543], num: 100 };
	HeatMap_Data['hogen'] = { pos: [-54.7623277651706, -139.7542997543], num: 100 };
	HeatMap_Data['hoge'] = { pos: [-54.7623277651706, -139.7542997543], num: 100 };
	
	var key, pos, populations = [];
	for (key in HeatMap_Data){
	    pos = new google.maps.LatLng(HeatMap_Data[key].pos[0], HeatMap_Data[key].pos[1]);
	    populations.push({
		location : pos,
		weight : HeatMap_Data[key].num
	    });
	    
	} 
	var heatmapOpts ={
	    radius:10,
	    dissipating:false,
	    gradient:['white','red', 'blue']
	};
	
	
	var heatmap = new google.maps.visualization.HeatmapLayer(heatmapOpts);
	heatmap.setData(populations);
	heatmap.setMap(map);
	
	
	
	
	Ext.Ajax.request({
            method: 'POST',
            url: './R/R.cgi',
            cache: false,
            success:
            function(json){
		// All overlay images pushed in "mapping_list" array;
		mapping_list = new google.maps.MVCArray();
		
		var data = Ext.decode(json.responseText);
		
		Mapping_result_json = data;
		
		Mapping_ID = data.Mapping_ID;
		
		for(var i=0; i< data.Data.map03020.length;i++){
		    
                    var img = 'R/'+data.Data.map03020[i].Graph_Path;
                    var sw = new google.maps.LatLng(data.Data.map03020[i].sw_latlng[0], data.Data.map03020[i].sw_latlng[1]);
                    var ne = new google.maps.LatLng(data.Data.map03020[i].ne_latlng[0], data.Data.map03020[i].ne_latlng[1]);
                    var bound = new google.maps.LatLngBounds(sw, ne);
		    
                    Mapping_Data = new USGSOverlay(bound, img, map);
                    mapping_list.push(Mapping_Data);
		    
		    
		}
		
            }
	});
	
	return 1;
	
    
	
	// Mapping Overlay
	//   var neBound = new google.maps.LatLng(-25.0751350097338,-119.41031941032);
    //    var swBound = new google.maps.LatLng(-31.6841666146484,-99.066339066339);
    //    var bounds = new google.maps.LatLngBounds(swBound, neBound);
    //var srcImage;
    //overlay = new MappingOverlay(bounds,srcImage, map);
    //.
    
	
	//Object remove and Search_result_json = ''
	Marker_Remove();Search_result_json = null;
	
	// tabPanel add function
	//    Ext.ComponentManager.get('Projector_Center').add({
	//title: 'Tab',
	//   });
	
	var formtext = Ext.get('query').dom.value;
	
	
	Ext.Ajax.request({
	    method: 'POST',
	    url: 'info.cgi',
	    params: {
		query : formtext,
		mapID: Organism_ID,
		task: 'query_search',
	    },
	success:
	    function(result){
		var json = Ext.decode(result.responseText);
		if(json.gene){
		    $('#SearchResult_Gene').html(json.gene);
		}else{
		    $('#SearchResult_Gene').html('Not found');
		}
		if(json.comp){
		    $('#SearchResult_Compound').html(json.comp);
		}else{
		    $('#SearchResult_Compound').html('Not found');
		}
		
		marker_list = new google.maps.MVCArray();
		num_list = new google.maps.MVCArray();
		
		if(json.category != null){
		    Search_result_json = json;
		    Generate_Marker(json, Hierarchy, Tile_Type, Map_ID);
		}
		
	    }
	    
	});
	
    }
});
