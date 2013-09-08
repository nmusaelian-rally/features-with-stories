Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        Ext.create('Rally.data.WsapiDataStore', {
            model: 'PortfolioItem/Feature',
            fetch: ['FormattedID','Name','UserStories'],
            pageSize: 100,
            autoLoad: true,
            listeners: {
                load: this._onDataLoaded,
                scope: this
            }
        });
    },
    
    _onDataLoaded: function(store, data){
                var features = [];
                var pendingstories = data.length;
                Ext.Array.each(data, function(feature) {
                            var f  = {
                                FormattedID: feature.get('FormattedID'),
                                Name: feature.get('Name'),
                                _ref: feature.get("_ref"),
                                StoryCount: feature.get('UserStories').Count,
                                UserStories: []
                            };
                            
                            var stories = feature.getCollection('UserStories');
                           stories.load({
                                fetch: ['FormattedID','Owner'],
                                callback: function(records, operation, success){
                                    Ext.Array.each(records, function(story){  
                                            f.UserStories.push({_ref: story.get('_ref'),
                                            FormattedID: story.get('FormattedID'),
                                            Owner:  (story.get('Owner') && story.get('Owner')._refObjectName) || 'None'
                                                    });
                                    }, this);
                                    
                                    --pendingstories;
                                    if (pendingstories === 0) {
                                        this._createGrid(features);
                                    }
                                },
                                scope: this
                            });
                            features.push(f);
                }, this);
    },        
    
    _createGrid: function(features) {
         this.add({
            xtype: 'rallygrid',
            store: Ext.create('Rally.data.custom.Store', {
                data: features,
                pageSize: 100
            }),
            
            columnCfgs: [
                {
                   text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name'
                },
                {
                    text: 'Story Count', dataIndex: 'StoryCount'
                },
                {
                    text: 'User Stories', dataIndex: 'UserStories', 
                    renderer: function(value) {
                        var html = [];
                        Ext.Array.each(value, function(userstory){
                            html.push('<a href="' + Rally.nav.Manager.getDetailUrl(userstory) + '">' + userstory.FormattedID + '</a>')
                        });
                        return html.join(', ');
                    }
                },
                {
                    text: 'Owner', dataIndex: 'UserStories', 
                    renderer: function(value) {
                        var html = [];
                        Ext.Array.each(value, function(userstory){
                            html.push(userstory.Owner);
                        });
                        return html.join(', ');
                    }
                }
            ]
            
        });
    },
         
});
