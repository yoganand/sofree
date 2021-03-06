import logging
import datetime

import pytz
utc = pytz.utc

from tornado.escape import json_encode

from couchdbkit import Server
from couchdbkit.schema import Document, StringProperty, \
                                         DateTimeProperty, \
                                         ListProperty

from newebe.settings import COUCHDB_DB_NAME

from newebe.lib.date_util import get_date_from_db_date, \
                                 get_db_date_from_date, \
                                 convert_utc_date_to_timezone

logger = logging.getLogger("newebe.core")
server = Server()

# Base document 

class NewebeDocument(Document):
    '''
    Base class for document used by newebe apps. Contains some utility methods.
    '''

    authorKey = StringProperty()
    date = DateTimeProperty(required=True)
    attachments = ListProperty()
     

    def toDict(self, localized=True):
        '''
        Return a dict representation of the document (copy).

        Removes _rev key and convert date field to local timezone 
        if *localized* is set to True.
        '''

        docDict = self.__dict__["_doc"].copy()

        if "_rev" in docDict:
            del docDict["_rev"]

        if localized and docDict.get("date", None):
            
            utc_date = get_date_from_db_date(docDict.get("date"))
            date = convert_utc_date_to_timezone(utc_date)
            docDict["date"] = get_db_date_from_date(date)

        return docDict


    def toDictForAttachment(self, localized=True):
        '''
        Transform doc to dictionary. Removes all fields that are not useful
        for attachments
        '''

        docDict = self.toDict(localized)
        del docDict["attachments"]
        del docDict["isMine"]
        #del docDict["authorKey"]
        del docDict["_id"]
        if "_attachments" in docDict:
            del docDict["_attachments"]

        return docDict

    
    def toJson(self, localized=True):
        '''
        Return json representation of the document.
        '''

        docDict = self.toDict(localized)
        return json_encode(docDict)


    def save(self):
        '''
        When document is saved if its date is null, it is set to now. 
        '''

        if self.date is None:        
            self.date = datetime.datetime.utcnow()
        super(Document, self).save()


    @classmethod
    def get_db(cls):
        '''
        Set DB for each class
        '''
        db = getattr(cls, '_db', None)
        if db is None:
            db = server.get_or_create_db(COUCHDB_DB_NAME)
            cls._db = db
        return db



class DocumentManager():
    '''
    Utility class to grab documents easier than with standard couchdbkit 
    methods (adapted for Newebe use cases).
    '''

    @staticmethod
    def get_documents(docType, view, startKey=None, endKey=None, 
                      skip=0, limit=10):

        '''
        Returns documents of which type is *docType* from given *view*.
        
        By default 10 documents are returned but *limit* could be changed.
        
        *startKey* and *endKey* allows to set boundaries ont what is returned.

        Finally, you can *skip* results. This one is discouraged because
        CouchDB has bad performance when skipping is too high.
        '''

        if startKey:
           documents = docType.view(view, 
                                 startkey = startKey, 
                                 descending = True, 
                                 limit = limit+1,
                                 endKey = endKey, 
                                 skip = 0)
        else:
          documents = docType.view(view, descending = True, limit = limit)

        return documents


    @staticmethod
    def get_document(docType, view, key):
        '''
        Returns documents of which type is *docType* from given *view* and 
        which view key is equal to *key*. 
        '''

        documents = docType.view(view, key=key)

        document = None
        if documents:        
            document = documents.first()

        return document

