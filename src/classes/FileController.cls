public with sharing class FileController {
	private static Folder getFolder() {
    	PicsSetting__c picsSettings = PicsSetting__c.getValues('Folder');
    	String folderName = picsSettings.FolderName__c;
        Folder folder = [SELECT Id FROM Folder WHERE Name = :folderName LIMIT 1];
        return folder;
    }
	
	@AuraEnabled
	public static List<ReturnedPicture> loadAllPictures() {
		Folder folder = getFolder();
		Document[] pictures = [SELECT Id, Name, Body, ContentType FROM Document 
				WHERE FolderId = :folder.Id AND (Name LIKE '%.jpg' OR Name LIKE '%.png' OR Name LIKE '%.gif')];
		
		List<ReturnedPicture> resultList = new List<ReturnedPicture>();
		
		for (Document pic : pictures) {
			ReturnedPicture rp = new ReturnedPicture();
			rp.id = pic.Id;
			rp.name = pic.Name.substring(0, pic.Name.lastIndexOf('.'));
			rp.body = 'data:' + pic.ContentType + ';base64,' + EncodingUtil.urlEncode(EncodingUtil.base64Encode(pic.Body), 'UTF-8');
			resultList.add(rp);
		}
		return resultList;
	}
	
    @AuraEnabled
    public static ReturnedPicture saveMyFile(String fileName, String base64Data, String contentType) {
    	PicsSetting__c picsSettings = PicsSetting__c.getValues('Folder');
    	String folderName = picsSettings.FolderName__c;
        Folder folder = getFolder();
        
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        Document pic = new Document();
        
        pic.AuthorId = UserInfo.getUserId();
        pic.FolderId = folder.Id;
        pic.Body = EncodingUtil.base64Decode(base64Data);
        pic.Name = fileName;
        pic.ContentType = contentType;
        
        try {
        	insert pic;
        	ReturnedPicture rp = new ReturnedPicture();
        	rp.id = pic.Id;
			rp.name = pic.Name.substring(0, pic.Name.lastIndexOf('.'));
			rp.body = 'data:' + pic.ContentType + ';base64,' + EncodingUtil.urlEncode(EncodingUtil.base64Encode(pic.Body), 'UTF-8');
			return rp;
        } catch (DmlException e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}