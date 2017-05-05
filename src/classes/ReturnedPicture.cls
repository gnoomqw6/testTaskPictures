public with sharing class ReturnedPicture {
    public String id;
    public String name;
    public String body;
    
    @AuraEnabled
    public String getId() {
    	return id;
    }
    
    @AuraEnabled
    public String getName() {
    	return name;
    }
    
    @AuraEnabled
    public String getBody() {
    	return body;
    }
}