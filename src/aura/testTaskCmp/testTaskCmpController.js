({
	doinit : function(cmp, event, helper) {
		var initAction = cmp.get('c.loadAllPictures');
		initAction.setCallback(this, function(response) {
			var state = response.getState();
			if (state === 'SUCCESS') {
				if (null != response.getReturnValue()) {
					cmp.set('v.allPictures', response.getReturnValue());
					cmp.set('v.pictures', response.getReturnValue());
				} else {
					console.log('there are no pictures available');
				}
			} else {
				console.error('something wrong with initial loading pictures from server');
			}
		});
		
		$A.enqueueAction(initAction);
	},
	
	showSpinner : function(cmp, event, helper) {
		var spinner = cmp.find('spinner');
		var evt = spinner.get('e.toggle');
		evt.setParams({isVisible: true});
		evt.fire();
	},
	
	hideSpinner : function(cmp, event, helper) {
		var spinner = cmp.find('spinner');
		var evt = spinner.get('e.toggle');
		evt.setParams({isVisible: false});
		evt.fire();
	},
	
    loadFile : function(cmp, event, helper) {
        var fileInputResult = cmp.find('hiddenFile').getElement();
        var file = fileInputResult.files[0];
        if (!file.name.toLowerCase().endsWith('.jpg') && !file.name.toLowerCase().endsWith('.png') && !file.name.toLowerCase().endsWith('.gif')) {
        	console.log('wrong extension');
        	cmp.set('v.uploadError', 'true');
        	fileInputResult.value = null;
        } else if (file.size > 700000) {
        	console.log('too big file');
        	cmp.set('v.bigFile', 'true');
        	fileInputResult.value = null;
        } else {
	        console.log('File size: ' + file.size);
	        var fileReader = new FileReader();
	        
	        var self = this;
	        fileReader.onload = function() {
	            var fileContents = fileReader.result;
	            var base64Mark = 'base64,';
	            fileContents = fileContents.substring(fileContents.indexOf(base64Mark) + base64Mark.length);
	            console.log('upload start');
	            
	            var action = cmp.get('c.saveMyFile');
	        
		    	action.setParams({
		        	fileName: file.name,
		        	base64Data: encodeURIComponent(fileContents),
		        	contentType: file.type
		    	});
		    
		    	action.setCallback(this, function(response) {
		            var state = response.getState();
		            if (state === 'SUCCESS') {
		                var uploadedPic = response.getReturnValue();
		                console.log('Operation complete.\nNew picture Id: ' + uploadedPic.id);
		                var allPics = cmp.get('v.pictures');
		                allPics.push(uploadedPic);
		                cmp.set('v.allPictures', allPics);
		                cmp.set('v.pictures', allPics);
		                cmp.set('v.insertPicture', uploadedPic.body);
		            } else if (state === 'ERROR') {
		                console.log('ERROR handled!!!');
		                var errors = response.getError();
		                if (errors) {
		                    if (errors[0] && errors[0].message) {
		                    	console.log('Error message: ' + errors[0].message);
		                	}
		                }
		            }
		            cmp.find('hiddenFile').getElement().value = null;
		            
		    	});
		        
		        $A.run(function(){
		        	$A.enqueueAction(action);
		        });
	        };
	        fileReader.readAsDataURL(file);
        }
    },
    
    selectPic : function(cmp, event, helper) {
    	var allItems = document.getElementsByClassName('singleImg');
    	for (var i = 0; i < allItems.length; i++) {
    		allItems[i].style.borderColor = '#383838';
    	}
    	var item = event.currentTarget;
    	item.style.borderColor = '#FF822E';
    	var img = item.getElementsByTagName('img')[0];
    	cmp.set('v.insertPictureSource', img.getAttribute('src'));
    },
    
    insertPic : function(cmp, event, helper) {
    	cmp.set('v.insertPicture', cmp.get('v.insertPictureSource'));
    	var allItems = document.getElementsByClassName('singleImg');
    	for (var i = 0; i < allItems.length; i++) {
    		allItems[i].style.borderColor = '#383838';
    	}
    	cmp.set('v.pictures', cmp.get('v.allPictures'));
    	cmp.find('searchString').set('v.value', '');
    },
    
    search : function(cmp, event, helper) {
    	var searchStr = cmp.find('searchString').get('v.value');
    	if (searchStr == null || searchStr.trim() === "") {
    		cmp.set('v.pictures', cmp.get('v.allPictures'));
    		cmp.find('searchString').set('v.value', null);
    		return;
    	}
    	var searchResult = new Array();
    	var allPics = cmp.get('v.allPictures');
    	var searchStr = cmp.find('searchString').get('v.value');
    	for (var i = 0; i < allPics.length; i++) {
    		if (allPics[i].name.toLowerCase().includes(searchStr.toLowerCase())) {
    			searchResult.push(allPics[i]);
    		}
    	}
    	cmp.set('v.pictures', searchResult);
    },
    
    closeErrorMsg : function(cmp, event, helper) {
    	cmp.set('v.uploadError', 'false');
    },
    
    closeErrorBigFileMsg : function(cmp, event, helper) {
    	cmp.set('v.bigFile', 'false');
    }
})